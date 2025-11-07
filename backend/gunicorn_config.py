# Gunicorn configuration for Render deployment
# Increases timeout to allow long-running SSE streams

# Worker timeout - set to 300 seconds (5 minutes) to allow full match simulation
timeout = 300

# Keep-alive timeout
keepalive = 5

# Worker class for async/streaming support
worker_class = 'sync'

# Number of workers
workers = 1

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
