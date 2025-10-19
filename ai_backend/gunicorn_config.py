# Gunicorn configuration file
import os

# Bind to the port provided by Render
port = os.environ.get('PORT', '10000')
bind = f"0.0.0.0:{port}"

# Number of worker processes
workers = 2

# Worker class
worker_class = "sync"

# Timeout for requests
timeout = 120

# Access log
accesslog = "-"

# Error log
errorlog = "-"

# Log level
loglevel = "info"

# Don't preload app to avoid port binding issues
preload_app = False

