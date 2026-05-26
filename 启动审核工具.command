#!/bin/zsh

set -e

cd "$(dirname "$0")"

URL="http://localhost:4173"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js。请先安装 Node.js 后再运行。"
  echo "下载地址：https://nodejs.org/"
  echo
  read "reply?按回车键退出..."
  exit 1
fi

if lsof -ti :4173 >/dev/null 2>&1; then
  echo "审核工具已经在运行，正在打开浏览器..."
  open "$URL"
  exit 0
fi

echo "正在启动病例问卷审核工具..."
echo "浏览器将自动打开：$URL"
echo "关闭此窗口会停止工具服务。"
echo

(sleep 1 && open "$URL") &
node server.js
