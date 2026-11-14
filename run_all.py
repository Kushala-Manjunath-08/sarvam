import subprocess
import time
import sys
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
backend_dir = ROOT / "backend"
frontend_dir = ROOT / "frontend"

be_log = open(ROOT / "backend.log", "w")
fe_log = open(ROOT / "frontend.log", "w")

print("Starting FastAPI Backend on port 8000...")
backend_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8000"],
    cwd=backend_dir,
    stdout=be_log,
    stderr=subprocess.STDOUT
)

print("Starting Next.js Frontend on port 3000...")
frontend_process = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=frontend_dir,
    shell=True,
    stdout=fe_log,
    stderr=subprocess.STDOUT
)

print("Waiting for servers to initialize...")
time.sleep(6)

print("\n--- LEGACYOS SERVERS STATUS ---")
try:
    be_req = urllib.request.urlopen("http://127.0.0.1:8000/api/districts")
    print(f"Backend API (FastAPI): Running (Status {be_req.status})")
except Exception as e:
    print(f"Backend API check failed: {e}")

try:
    fe_req = urllib.request.urlopen("http://127.0.0.1:3000")
    print(f"Frontend Website (Next.js): Running (Status {fe_req.status})")
except Exception as e:
    print(f"Frontend check failed: {e}")

print("\nServers are up and running!")
print("Frontend URL: http://localhost:3000")
print("Backend API URL: http://localhost:8000")
print("API Documentation: http://localhost:8000/docs")
print("\nPress Ctrl+C to stop servers.")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_process.terminate()
    frontend_process.terminate()
    be_log.close()
    fe_log.close()
    print("Servers stopped.")

