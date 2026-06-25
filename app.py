import os
import subprocess
import sys

def main():
    print("=== Hugging Face Entrypoint (app.py) ===")
    
    # Check if node is installed
    try:
        subprocess.run(["node", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Node.js is not installed. Please make sure to add a 'packages.txt' file with 'nodejs' and 'npm', or use a Docker Space.")
        sys.exit(1)

    # 1. Install Node.js dependencies if node_modules doesn't exist
    if not os.path.exists("node_modules"):
        print("Installing Node.js dependencies...")
        subprocess.run(["npm", "install"], check=True)
    else:
        print("Node.js dependencies already installed.")

    # 2. Initialize database if database.db doesn't exist
    db_path = os.path.join("backend", "database.db")
    if not os.path.exists(db_path):
        print("Initializing the database...")
        subprocess.run(["npm", "run", "init-db"], check=True)
    else:
        print("Database already initialized.")

    # 3. Start the Express server
    port = os.environ.get("PORT", "7860")
    print(f"Starting API server on port {port}...")
    
    # We pass the Hugging Face PORT to the Express app via env
    env = os.environ.copy()
    env["PORT"] = port
    
    # Start server and wait
    process = subprocess.Popen(["npm", "start"], env=env)
    
    try:
        process.wait()
    except KeyboardInterrupt:
        print("Stopping server...")
        process.terminate()

if __name__ == "__main__":
    main()
