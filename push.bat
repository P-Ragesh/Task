@echo off
echo [Task Monitor Git Push Helper]
echo.

echo 1. Initializing Git repository...
git init

echo 2. Adding files to staging...
git add .

echo 3. Creating initial commit...
git commit -m "Initial commit - Task Monitor project files"

echo 4. Setting up GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/P-Ragesh/Task.git
git branch -M main

echo 5. Pushing files to GitHub...
git push -u origin main

echo.
echo Process completed!
pause
