@echo off
echo ========================================
echo Building Sparks & Sequins App...
echo ========================================
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Aborting deployment.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Committing Changes to Git...
echo ========================================
git add .
git commit -m "Update app features: dropdowns, sizing/move logic, and custom undo icon"

echo.
echo ========================================
echo Pushing to Repository...
echo ========================================
git push origin main

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
pause