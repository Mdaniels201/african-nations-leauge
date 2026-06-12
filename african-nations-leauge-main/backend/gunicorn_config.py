# Gunicorn configuration for Render deployment
# Increases timeout to allow long-running SSE streams

# Worker timeout - set to 300 seconds (5 minutes) to allow full match simulation
timeout = 300

# Keep-alive timeout
keepalive = 5

# THE FIX: Switch worker class to gevent for async/streaming support
worker_class = 'gevent'

# Increase workers slightly to handle concurrent traffic
workers = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'