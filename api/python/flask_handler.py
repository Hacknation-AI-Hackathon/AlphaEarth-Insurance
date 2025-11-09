# Flask app handler for Vercel Python serverless functions
# This wraps the Flask app to work with Vercel's serverless environment

import sys
import os
import json

# Add python-service to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
python_service_dir = os.path.join(project_root, 'backend/python-service')

# Add to path
if python_service_dir not in sys.path:
    sys.path.insert(0, python_service_dir)

# Change to python-service directory for relative imports
original_cwd = os.getcwd()
try:
    if os.path.exists(python_service_dir):
        os.chdir(python_service_dir)
    
    # Import Flask app
    from earth_engine_service import app
    print(f"✅ Flask app imported successfully from {python_service_dir}")
except Exception as e:
    print(f"❌ Error importing Flask app: {e}")
    import traceback
    traceback.print_exc()
    app = None
finally:
    os.chdir(original_cwd)

def handler(request):
    """
    Vercel Python serverless function handler
    Wraps Flask app to handle requests
    """
    if app is None:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Flask app not initialized'})
        }
    
    # Vercel provides request as a dictionary-like object
    # Extract request information
    method = request.get('method', 'GET')
    url = request.get('url', '/')
    headers = request.get('headers', {})
    body = request.get('body', '')
    query = request.get('queryStringParameters', {}) or {}
    
    # Parse URL to get path
    from urllib.parse import urlparse
    parsed_url = urlparse(url if url else '/')
    path = parsed_url.path
    
    # Remove /api/python prefix if present
    if path.startswith('/api/python'):
        path = path[len('/api/python'):] or '/'
    
    # Build query string
    query_string = '&'.join([f"{k}={v}" for k, v in query.items()])
    
    # Create WSGI environ
    environ = {
        'REQUEST_METHOD': method,
        'PATH_INFO': path,
        'SCRIPT_NAME': '',
        'QUERY_STRING': query_string,
        'CONTENT_TYPE': headers.get('content-type', headers.get('Content-Type', 'application/json')),
        'CONTENT_LENGTH': str(len(body) if body else 0),
        'SERVER_NAME': 'localhost',
        'SERVER_PORT': '443',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': None,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False,
    }
    
    # Handle request body
    if body:
        from io import BytesIO
        body_bytes = body.encode('utf-8') if isinstance(body, str) else body
        environ['wsgi.input'] = BytesIO(body_bytes)
        environ['CONTENT_LENGTH'] = str(len(body_bytes))
    
    # Add HTTP headers
    for key, value in headers.items():
        http_key = 'HTTP_' + key.upper().replace('-', '_')
        environ[http_key] = value
    
    # Response storage
    status_code = [200]
    response_headers = []
    
    def start_response(status, headers_list, exc_info=None):
        status_code[0] = int(status.split(' ')[0])
        response_headers[:] = headers_list
    
    # Call Flask app
    try:
        result = app(environ, start_response)
        
        # Collect response body
        response_body_parts = []
        for chunk in result:
            if chunk:
                response_body_parts.append(chunk if isinstance(chunk, bytes) else chunk.encode('utf-8'))
        
        if hasattr(result, 'close'):
            result.close()
        
        response_body = b''.join(response_body_parts).decode('utf-8')
        
        # Build response headers dict
        headers_dict = {}
        for header_name, header_value in response_headers:
            headers_dict[header_name] = header_value
        
        # Add CORS if not present
        if 'Access-Control-Allow-Origin' not in headers_dict:
            headers_dict['Access-Control-Allow-Origin'] = '*'
        
        return {
            'statusCode': status_code[0],
            'headers': headers_dict,
            'body': response_body
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in Flask handler: {error_trace}")
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            })
        }

