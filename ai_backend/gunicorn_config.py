# Gunicorn configuration file
import os

# Bind to the port provided by Render
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"

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

# Preload app for better performance
preload_app = True

