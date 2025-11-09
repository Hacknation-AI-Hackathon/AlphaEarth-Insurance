# Vercel Python serverless function - Health check endpoint
# This is a simple test endpoint

def handler(request):
    """
    Simple health check handler for Python service
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': '{"status": "ok", "service": "python", "message": "Python service is running"}'
    }
