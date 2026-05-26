@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

set "URL=http://localhost:4173"
set "PORT=4173"
set "LOG_FILE=audit-tool.log"

cls
echo ------------------------------------
echo 审核工具启动中...
echo ------------------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  call :friendly_error "当前电脑未安装 Node.js，请先安装 Node.js 后再运行审核工具。" "审核工具需要 Node.js 来启动本地服务。" "请访问 https://nodejs.org/ 下载并安装 LTS 版本，安装完成后重新双击启动即可。"
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  call :friendly_error "当前电脑未检测到 npm。" "npm 通常会随 Node.js 一起安装，当前环境可能安装不完整。" "请访问 https://nodejs.org/ 重新安装 LTS 版本，安装完成后重新双击启动即可。"
  exit /b 1
)

echo ✔ Node.js 环境检查完成

if not exist "package.json" (
  call :friendly_error "未找到 package.json，无法启动审核工具。" "当前文件夹可能不是完整的审核工具目录，或文件被移动/删除。" "请确认从完整项目文件夹中双击 start-windows.bat。"
  exit /b 1
)

if not exist "server.js" (
  call :friendly_error "未找到 server.js，无法启动本地服务。" "审核工具的服务入口文件缺失。" "请恢复完整项目文件，或重新下载审核工具后再启动。"
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行，正在安装依赖，请稍候...
  call npm install > "%LOG_FILE%" 2>&1
  if errorlevel 1 (
    call :friendly_error "依赖安装失败。" "可能是网络不可用、npm 配置异常，或项目文件不完整。详细信息已写入 %LOG_FILE%。" "请检查网络后重新双击启动；如果仍失败，请把 %LOG_FILE% 发给技术同事查看。"
    exit /b 1
  )
  if not exist "node_modules" mkdir "node_modules"
)

echo ✔ 依赖检查完成

call :is_port_busy
if "%PORT_BUSY%"=="1" (
  echo 审核工具似乎已经运行，正在打开浏览器...
  start "" "%URL%"
  if errorlevel 1 (
    call :friendly_error "浏览器打开失败。" "本地服务已经在运行，但系统没有成功打开浏览器。" "请手动打开浏览器，并访问 %URL%。"
    exit /b 1
  )
  echo ✔ 浏览器已打开
  echo.
  echo 审核工具已就绪。
  timeout /t 2 >nul
  exit /b 0
)

start "病例问卷审核工具服务" /min cmd /c npm start ^> audit-tool.log 2^>^&1

set "STARTED=0"
for /l %%i in (1,1,20) do (
  timeout /t 1 >nul
  call :is_port_busy
  if "!PORT_BUSY!"=="1" (
    set "STARTED=1"
    goto :started
  )
)

:started
if not "%STARTED%"=="1" (
  call :friendly_error "本地服务启动失败。" "server.js 未能正常启动，详细信息已写入 %LOG_FILE%。" "请重新双击启动；如果仍失败，请把 %LOG_FILE% 发给技术同事查看。"
  exit /b 1
)

echo ✔ 本地服务启动成功

start "" "%URL%"
if errorlevel 1 (
  call :friendly_error "浏览器打开失败。" "审核工具已经启动，但系统没有成功打开默认浏览器。" "请手动打开浏览器，并访问 %URL%。"
  exit /b 1
)

echo ✔ 浏览器已打开
echo.
echo 审核工具已就绪。
echo.
echo 关闭工具时，请双击 stop-windows.bat。
timeout /t 3 >nul
exit /b 0

:is_port_busy
set "PORT_BUSY=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do set "PORT_BUSY=1"
exit /b 0

:friendly_error
echo ✘ %~1
echo.
echo 原因：%~2
echo 建议：%~3
echo.
pause
exit /b 0
