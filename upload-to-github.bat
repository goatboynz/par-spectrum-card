@echo off
REM PAR Spectrum Card - GitHub Upload Script (Windows)
REM Repository: https://github.com/goatboynz/par-spectrum-card

echo.
echo ========================================
echo PAR Spectrum Card - GitHub Upload
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing git repository...
    git init
    echo Git initialized!
) else (
    echo Git already initialized
)

echo.
echo Adding files...
git add .
echo Files added!

echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update PAR Spectrum Card
echo Creating commit...
git commit -m "%commit_msg%"
echo Commit created!

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/goatboynz/par-spectrum-card.git 2>nul
echo Remote configured!

echo.
echo Setting branch to main...
git branch -M main
echo Branch set to main!

echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Your code is now on GitHub!
    echo ========================================
    echo.
    echo Repository: https://github.com/goatboynz/par-spectrum-card
    echo.
    echo Next steps:
    echo 1. Go to: https://github.com/goatboynz/par-spectrum-card/releases
    echo 2. Click 'Create a new release'
    echo 3. Tag: v1.0.0
    echo 4. Publish release
    echo.
    echo Then install via HACS!
) else (
    echo.
    echo Push failed. You may need to:
    echo 1. Authenticate with GitHub
    echo 2. Or pull first: git pull origin main --allow-unrelated-histories
    echo 3. Then run this script again
)

echo.
pause
