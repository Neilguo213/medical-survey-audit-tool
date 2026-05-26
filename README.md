# 病例问卷审核工具

一个本地网页小工具，用于读取问卷链接或粘贴问卷文本，并根据内置规则生成审核意见。

## 功能

- 支持粘贴 `doctor.wenwo.com/medic/nsurvey/...` 问卷链接读取题干和答案
- 审核规则优先按题干内容匹配，适配逻辑跳转导致的动态题号
- 支持手动粘贴题干/答案文本
- 内置血液肿瘤、乳腺癌基础审核规则
- 输出高风险、需复核、提示类审核意见

## 本地运行

需要安装 Node.js。

### macOS 推荐方式

双击：

```text
启动审核工具.command
```

脚本会自动启动本地服务，并打开：

```text
http://localhost:4173
```

### Windows 推荐方式

双击：

```text
start-windows.bat
```

### 命令行方式

```bash
npm start
```

然后打开：

```text
http://localhost:4173
```

## 使用方式

1. 在页面顶部粘贴问卷链接
2. 点击“读取链接”
3. 工具会自动提取题干和答案
4. 选择病种模板
5. 点击“开始审核”

也可以直接把问卷页面复制出来的文本粘贴到“病例内容”输入框中审核。

## 文件说明

- `index.html`：页面结构
- `styles.css`：页面样式
- `app.js`：前端审核规则和交互逻辑
- `server.js`：本地服务和问卷链接读取接口
- `启动审核工具.command`：macOS 双击启动脚本
- `start-windows.bat`：Windows 双击启动脚本
- `package.json`：Node 项目启动配置

## 注意

链接读取功能需要通过 `node server.js` 或 `npm start` 启动本地服务后使用。直接双击 `index.html` 只能使用手动粘贴文本审核，不能读取链接。

如果 macOS 双击启动脚本提示没有权限，请在终端进入项目目录后执行：

```bash
chmod +x ./启动审核工具.command
```
