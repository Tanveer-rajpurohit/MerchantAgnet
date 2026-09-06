import os
import sys

# Auto-exec uvicorn if Render runs its default command: 'gunicorn your_application.wsgi'
port = os.environ.get("PORT", "10000")
if "gunicorn" in sys.argv[0] and "uvicorn" not in " ".join(sys.argv):
    os.execvp(sys.executable, [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(port)])

from app.main import app as application
