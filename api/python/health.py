# Health check endpoint for Python service

def handler(request):
    import json
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'ok',
            'service': 'earth_engine_python_service',
            'earth_engine': 'initialized'
        })
    }

