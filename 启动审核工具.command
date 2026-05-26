#!/bin/zsh

cd "$(dirname "$0")"
unsetopt BG_NICE HUP 2>/dev/null

URL="http://localhost:4173"
PORT="4173"
LOG_FILE="audit-tool.log"

clear
echo "------------------------------------"
echo "审核工具启动中..."
echo "------------------------------------"
echo

pause_exit() {
  echo
  read "reply?按回车键退出..."
  exit 1
}

friendly_error() {
  echo "✘ $1"
  echo
  echo "原因：$2"
  echo "建议：$3"
  pause_exit
}

if ! command -v node >/dev/null 2>&1; then
  friendly_error \
    "当前电脑未安装 Node.js，请先安装 Node.js 后再运行审核工具。" \
    "审核工具需要 Node.js 来启动本地服务。" \
    "请访问 https://nodejs.org/ 下载并安装 LTS 版本，安装完成后重新双击启动即可。"
fi

if ! command -v npm >/dev/null 2>&1; then
  friendly_error \
    "当前电脑未检测到 npm。" \
    "npm 通常会随 Node.js 一起安装，当前环境可能安装不完整。" \
    "请访问 https://nodejs.org/ 重新安装 LTS 版本，安装完成后重新双击启动即可。"
fi

echo "✔ Node.js 环境检查完成"

if [ ! -f "package.json" ]; then
  friendly_error \
    "未找到 package.json，无法启动审核工具。" \
    "当前文件夹可能不是完整的审核工具目录，或文件被移动/删除。" \
    "请确认从完整项目文件夹中双击“启动审核工具.command”。"
fi

if [ ! -f "server.js" ]; then
  friendly_error \
    "未找到 server.js，无法启动本地服务。" \
    "审核工具的服务入口文件缺失。" \
    "请恢复完整项目文件，或重新下载审核工具后再启动。"
fi

if [ ! -d "node_modules" ]; then
  echo "首次运行，正在安装依赖，请稍候..."
  if ! npm install > "$LOG_FILE" 2>&1; then
    friendly_error \
      "依赖安装失败。" \
      "可能是网络不可用、npm 配置异常，或项目文件不完整。详细信息已写入 $LOG_FILE。" \
      "请检查网络后重新双击启动；如果仍失败，请把 $LOG_FILE 发给技术同事查看。"
  fi
  mkdir -p node_modules
fi

echo "✔ 依赖检查完成"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "审核工具似乎已经运行，正在打开浏览器..."
  if open "$URL" >/dev/null 2>&1; then
    echo "✔ 浏览器已打开"
    echo
    echo "审核工具已就绪。"
    exit 0
  fi
  friendly_error \
    "浏览器打开失败。" \
    "本地服务已经在运行，但系统没有成功打开浏览器。" \
    "请手动打开浏览器，并访问 $URL。"
fi

nohup npm start > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" >/dev/null 2>&1
echo "$SERVER_PID" > ".audit-tool.pid"

STARTED=0
for i in {1..20}; do
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    STARTED=1
    break
  fi
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if [ "$STARTED" != "1" ]; then
  friendly_error \
    "本地服务启动失败。" \
    "server.js 未能正常启动，详细信息已写入 $LOG_FILE。" \
    "请重新双击启动；如果仍失败，请把 $LOG_FILE 发给技术同事查看。"
fi

echo "✔ 本地服务启动成功"

if open "$URL" >/dev/null 2>&1; then
  echo "✔ 浏览器已打开"
else
  friendly_error \
    "浏览器打开失败。" \
    "审核工具已经启动，但系统没有成功打开默认浏览器。" \
    "请手动打开浏览器，并访问 $URL。"
fi

echo
echo "审核工具已就绪。"
echo
echo "关闭工具时，请双击“关闭审核工具.command”。"
sleep 2
