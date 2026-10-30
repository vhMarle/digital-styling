@echo off
echo ========================================
echo 1. Staging and Committing Changes...
echo ========================================
git add .
git commit -m "Update App.jsx styles and components"

echo.
echo ========================================
echo 2. Pushing Code to GitHub...
echo ========================================
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Git push failed! Please check your branch or git status.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo 3. Triggering Render Deployment...
echo ========================================
powershell -Command "Invoke-RestMethod -Method Post -Uri 'https://api.render.com/deploy/srv-dbakj1gm7kps7397jlng?key=f9reLz0NPDE'"

echo.
echo ========================================
echo All steps completed successfully! 
echo Your live site will update shortly.
echo ========================================
pause