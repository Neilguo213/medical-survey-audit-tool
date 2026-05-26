#!/bin/zsh

cd "$(dirname "$0")"

PORT="4173"

clear
echo "------------------------------------"
echo "正在关闭审核工具..."
echo "------------------------------------"
echo

PIDS=$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null)

if [ -z "$PIDS" ]; then
  echo "审核工具当前没有运行。"
else
  echo "$PIDS" | xargs kill >/dev/null 2>&1
  sleep 1
  LEFT=$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null)
  if [ -n "$LEFT" ]; then
    echo "$LEFT" | xargs kill -9 >/dev/null 2>&1
  fi
  rm -f ".audit-tool.pid"
  echo "审核工具已关闭。"
fi

echo
read "reply?按回车键退出..."
