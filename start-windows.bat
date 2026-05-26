@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js first:
  echo https://nodejs.org/
  pause
  exit /b 1
)

start http://localhost:4173
node server.js
pause
