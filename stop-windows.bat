@echo off
setlocal
chcp 65001 >nul
set "PORT=4173"

cls
echo ------------------------------------
echo 正在关闭审核工具...
echo ------------------------------------
echo.

set "FOUND=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  set "FOUND=1"
  taskkill /PID %%a /F >nul 2>nul
)

if "%FOUND%"=="1" (
  echo 审核工具已关闭。
) else (
  echo 审核工具当前没有运行。
)

echo.
pause
