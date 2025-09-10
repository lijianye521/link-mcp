# 🚀 Link MCP - 智能文档获取与记忆管理

> 一个功能强大的 Model Context Protocol (MCP) 服务器，专为 Cursor IDE 设计，提供智能网页文档抓取和对话记忆管理功能。

## ✨ 核心功能

### 🔗 智能文档获取
- **网页内容抓取** - 自动获取任意网页的结构化内容
- **组件识别** - 智能识别 UI 组件、API 接口和代码示例  
- **深度爬取** - 支持多层级链接爬取（0-3层可配置）
- **内容解析** - 提取标题、代码块、API 文档和相关链接

### 🧠 Cursor 记忆管理
- **自动存储** - 将重要对话和信息自动保存到 `.cursor` 目录
- **智能分类** - 支持按类别和标签组织记忆内容
- **快速检索** - 通过分类、标签等维度快速查找历史记忆
- **Markdown 格式** - 生成格式化的记忆文件，便于 Cursor AI 理解

## 🎯 安装使用

### 方式1: 源码安装 (推荐) 📁

```bash
# 下载项目
git clone https://github.com/lijianye/link-mcp.git
cd link-mcp

# 一键安装配置
node install.js
```

安装脚本会自动：
- 安装依赖包
- 构建项目  
- 配置 Cursor MCP 设置
- 创建配置文件 `~/.cursor-mcp-settings.json`

### 方式2: NPM 安装 🌟

```bash
# 如果已发布到 npm
npm install -g @lijianye/link-mcp

# 配置 Cursor
echo '{
  "mcpServers": {
    "link-mcp": {
      "command": "npx",
      "args": ["@lijianye/link-mcp"]
    }
  }
}' > ~/.cursor-mcp-settings.json
```

### 方式3: 手动安装 🔧

```bash
git clone https://github.com/lijianye/link-mcp.git
cd link-mcp
npm install
npm run build
npm run setup
```

## 🎮 立即开始

### 1. 重启 Cursor
安装完成后，**重启 Cursor** 以加载新的 MCP 服务器。

### 2. 验证工具
重启后，你将拥有 3 个强大的新工具：

1. **`fetch_link_documentation`** - 获取网页文档
2. **`save_cursor_memory`** - 保存对话记忆  
3. **`get_cursor_memories`** - 检索历史记忆

### 3. 首次测试
```
请使用 fetch_link_documentation 工具测试
URL: https://www.baidu.com
```

## 📖 工具使用指南

### 🔗 网页文档获取 (`fetch_link_documentation`)

**参数说明：**
- `url` (必需) - 目标网页链接
- `selector` (可选) - CSS选择器，默认 "body" 
- `depth` (可选) - 爬取深度 0-3，默认 1

**使用示例：**
```
# 基础用法
请使用 fetch_link_documentation 获取 Vue 官网文档
URL: https://vuejs.org/guide/

# 深度爬取
请使用 fetch_link_documentation 深度获取 WindUI 组件文档
参数：
url: https://wind-ui.com/components
depth: 2
selector: .content
```

**返回内容包括：**
- 📄 页面标题和结构化内容  
- 🧩 识别的组件和 UI 元素
- 🔌 提取的 API 接口和函数
- 💡 代码示例和使用案例
- 🔗 相关文档链接

### 🧠 保存记忆 (`save_cursor_memory`)

**参数说明：**
- `title` (必需) - 记忆标题
- `content` (必需) - 记忆内容  
- `category` (可选) - 分类，默认 "conversation"
- `tags` (可选) - 标签数组

**预定义分类：**
- `conversation` - 对话记录和讨论
- `documentation` - 技术文档和API参考  
- `code-patterns` - 代码模式和最佳实践
- `project-notes` - 项目决策和重要笔记

**使用示例：**
```
# 保存技术文档
请使用 save_cursor_memory 保存刚才学到的 React 知识
参数：
title: React Hooks 使用总结
content: React Hooks 提供了函数组件状态管理能力...
category: documentation  
tags: ["react", "hooks", "frontend"]

# 保存项目决策
请使用 save_cursor_memory 记录技术选型决定
参数：
title: 前端框架选择：Next.js
content: 经过评估，选择 Next.js 的原因包括...
category: project-notes
tags: ["nextjs", "framework", "decision"]
```

### 🔍 检索记忆 (`get_cursor_memories`)

**参数说明：**
- `category` (可选) - 按分类筛选
- `tag` (可选) - 按标签筛选
- `limit` (可选) - 返回数量限制，默认 10

**使用示例：**
```
# 查找所有文档
请使用 get_cursor_memories 查找所有技术文档
参数：
category: documentation

# 按标签搜索  
请使用 get_cursor_memories 查找 React 相关记录
参数：
tag: react

# 查看最近记忆
请使用 get_cursor_memories 显示最近的项目决策
参数：
category: project-notes
limit: 5
```

## 🎨 实际应用场景

### 📚 学习新技术栈
```
1. 获取官方文档
请使用 fetch_link_documentation 获取 React 官方教程
URL: https://react.dev/learn

2. 保存学习笔记
请使用 save_cursor_memory 保存学习内容
title: React 核心概念总结
category: documentation
tags: ["react", "learning"]

3. 后续查阅
请使用 get_cursor_memories 查看所有 React 学习记录
tag: react
```

### 🧩 组件库研究
```
1. 深度抓取组件文档
请使用 fetch_link_documentation 获取 Ant Design 按钮组件
URL: https://ant.design/components/button
depth: 2

2. 保存组件用法
请使用 save_cursor_memory 记录最佳实践
title: Ant Design Button 使用指南
category: code-patterns
tags: ["antd", "components", "ui"]
```

### 🔌 API 文档整理
```
1. 获取 API 文档
请使用 fetch_link_documentation 获取 GitHub API 文档
URL: https://docs.github.com/en/rest/repos

2. 保存常用接口
请使用 save_cursor_memory 记录常用 API
title: GitHub API 常用接口整理
category: documentation
tags: ["github", "api", "rest"]
```

## 🛠️ 项目结构

```
link-mcp/
├── 📁 src/                           # TypeScript 源码
│   ├── 📄 index.ts                  # MCP 服务器主入口
│   └── 📁 tools/                    # 核心工具实现
│       ├── 📄 linkDocumentationTool.ts    # 网页抓取工具
│       └── 📄 cursorMemoryTool.ts         # 记忆管理工具
├── 📁 dist/                         # 编译输出 (自动生成)
├── 📁 .cursor/                      # Cursor 记忆存储 (使用时创建)  
│   ├── 📄 memories.json            # 记忆索引
│   ├── 📁 memories/                 # 记忆文件目录
│   └── 📄 README.md                 # 记忆目录说明
├── 📄 package.json                  # 项目配置
├── 📄 install.js                   # 自动安装脚本
├── 📄 setup-cursor.js              # 配置脚本
└── 📄 README.md                    # 项目文档
```

## ⚙️ 可用命令

```bash
# 项目构建
npm run build          # 编译 TypeScript
npm run dev            # 开发模式 (监听文件变化)

# Cursor 配置
npm run setup-npx      # NPX 方式配置 (推荐)
npm run setup          # 直接路径配置
npm run setup-cursor   # 仅更新配置文件

# 全局安装
npm run install-global # 全局安装包

# 发布相关
npm run publish-check  # 检查发布内容
npm run release        # 构建并发布到 npm

# 代码质量
npm run lint           # ESLint 检查
npm run clean          # 清理构建文件

# 直接启动
npm start             # 启动 MCP 服务器
```

## 🔍 故障排除

### ❌ 重启后看不到 MCP 工具

**解决方法：**
1. 确认配置文件存在：`~/.cursor-mcp-settings.json`
2. 检查配置内容是否正确
3. 完全关闭并重启 Cursor
4. 运行 `node install.js` 重新配置

### ❌ 网页抓取返回空内容

**可能原因：**
- 目标网站有反爬虫机制
- 网络连接问题  
- URL 格式错误

**解决方法：**
- 检查 URL 格式（需包含 http:// 或 https://）
- 尝试不同的网站测试
- 使用简单的静态网站进行测试

### ❌ 记忆文件无法创建

**解决方法：**
- 检查项目目录写权限
- 确保磁盘空间充足
- 手动创建 `.cursor` 目录测试权限

## 🔄 重新配置

如果遇到问题需要重新配置：

```bash
# 完整重新配置
npm run clean          # 清理构建文件
npm run build          # 重新构建
node install.js        # 重新安装配置

# 然后重启 Cursor
```

## 📦 分发给他人

### 给朋友使用（源码分发）
```bash
# 1. 上传到 GitHub
git init
git add .
git commit -m "Link MCP - 智能文档获取工具"
git remote add origin https://github.com/your-username/link-mcp.git
git push -u origin main

# 2. 朋友使用
git clone https://github.com/your-username/link-mcp.git
cd link-mcp
node install.js
```

### 发布到 NPM（专业分发）
```bash
# 1. 注册 npm 账户
npm adduser

# 2. 发布包
npm run release

# 3. 用户使用
npx @your-username/link-mcp
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 🎉 开始使用

现在就可以开始：

1. **克隆项目**: `git clone https://github.com/lijianye/link-mcp.git`
2. **运行安装**: `cd link-mcp && node install.js`
3. **重启 Cursor**
4. **测试工具**: 使用 `fetch_link_documentation` 获取第一个网页文档

**祝你使用愉快！🚀**

---

*如需帮助，请查看故障排除部分或在 GitHub 提交 Issue。*