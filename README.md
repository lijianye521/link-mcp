# 🚀 Link MCP - 智能文档获取与记忆管理

> 一个功能强大的 Model Context Protocol (MCP) 服务器，为 Cursor IDE 提供智能网页文档抓取和对话记忆管理功能。

## ✨ 核心功能

### 🔗 智能文档获取
- **网页内容抓取** - 自动获取任意网页的结构化内容
- **组件识别** - 智能识别 UI 组件、API 接口和代码示例  
- **深度爬取** - 支持多层级链接爬取（0-3层可配置）
- **内容解析** - 提取标题、代码块、API 文档和相关链接

### 🧠 AI智能记忆管理
- **一键保存** - 用户一句话触发，AI自动总结并保存对话
- **智能分析** - 自动提取关键讨论点、代码示例、技术决策
- **工作区存储** - 保存到当前项目的 `.cursor` 目录，便于团队共享
- **结构化输出** - 生成格式化的 Markdown 文件，便于 Cursor AI 理解和引用

## 📦 安装配置

### 方法一：🌟 NPX 直接使用（推荐）

在 Cursor 中配置 MCP，将以下配置添加到 Cursor 的设置中：

1. 打开 Cursor，按 `Ctrl/Cmd + ,` 进入设置
2. 搜索 "MCP" 或找到 "Model Context Protocol" 部分
3. 添加以下配置：

```json
{
  "mcpServers": {
    "link-mcp": {
      "command": "npx",
      "args": ["link-mcp2"]
    }
  }
}
```

**就这么简单！** 配置完成后重启 Cursor 即可使用。

### 方法二：📦 NPM 安装后配置

如果你想先通过npm安装包，然后配置到cursor的MCP中，可以按以下步骤操作：

#### 1. 配置npm代理源（如果使用内部npm源）
```bash
# 设置npm代理源
npm config set registry http://10.100.1.27:8688/repository/npmmirror/

# 验证配置
npm config get registry
```

#### 2. 安装包到全局
```bash
# 从公共npm源安装
npm install -g link-mcp

# 或者从内部代理源安装
npm install -g link-mcp2
```

#### 3. 配置 Cursor MCP
在 Cursor 的 MCP 配置中添加以下内容：

**如果使用 Cursor 设置界面：**
1. 打开 Cursor，按 `Ctrl/Cmd + ,` 进入设置
2. 搜索 "MCP" 或找到 "Model Context Protocol" 部分
3. 添加以下配置：

```json
{
  "mcpServers": {
    "link-mcp": {
      "command": "link-mcp"
    }
  }
}
```

**如果使用 mcp.json 配置文件：**

在项目根目录或 Cursor 配置目录创建 `mcp.json` 文件：

```json
{
  "mcpServers": {
    "link-mcp": {
      "command": "link-mcp"
    }
  }
}
```

**注意：** 无论安装的是 `link-mcp` 还是 `link-mcp2`，MCP配置中的命令都是 `link-mcp`，因为这是在 package.json 中 `bin` 字段定义的可执行文件名。

#### 4. 重启 Cursor
配置完成后重启 Cursor 即可使用。

## 🎮 立即开始

### 1. 重启 Cursor
配置完成后，**重启 Cursor** 以加载新的 MCP 服务器。

### 2. 验证工具
重启后，你将拥有 2 个强大的新工具：

1. **`fetch_link_documentation`** - 获取网页文档
2. **`save_cursor_memory`** - AI智能保存对话记忆

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

### 🧠 智能保存对话记忆 (`save_cursor_memory`)

**核心特点：**
- **AI自动总结** - 智能分析整个对话历史
- **无感保存** - 用户只需一句话触发
- **结构化输出** - 自动格式化为清晰的markdown
- **工作区存储** - 保存到当前项目的`.cursor`目录

**使用方式：**
用户只需要说：
```
"保存这次对话"
"记住刚才讨论的内容"  
"把这次的技术讨论存起来"
"保存我们刚才的代码解决方案"
```

**AI会自动完成：**（开发中）
1. 🧠 智能分析整个对话内容
2. 📋 提取关键讨论点、代码示例、技术决策
3. 📝 格式化为结构化markdown文档
4. 💾 保存到 `.cursor/时间戳_主题.md`
5. ✅ 告知用户保存位置和文件名

**生成的文件包含：**
- 对话主题概述
- 关键技术讨论点
- 代码示例和解决方案  
- 重要决策和待办事项
- 完整的上下文信息


## 🎨 实际应用场景

### 📚 学习新技术栈
```
1. 获取官方文档
请使用 fetch_link_documentation 获取 React 官方教程
URL: https://react.dev/learn

2. 学习讨论后保存
用户："保存我们刚才关于 React Hooks 的讨论"
AI 自动：分析对话 → 总结要点 → 保存到 .cursor/2025-09-09-react-hooks学习总结.md
```

### 🧩 组件库研究  
```
1. 深度抓取组件文档
请使用 fetch_link_documentation 获取 Ant Design 按钮组件
URL: https://ant.design/components/button
depth: 2

2. 研究完成后保存
用户："把这次 Ant Design 的研究结果记录下来"
AI 自动：整理讨论内容 → 保存组件用法和最佳实践
```

### 💬 技术讨论记录
```
在技术讨论过程中或结束后：
用户："保存这次对话"或"记住刚才的解决方案"
AI 自动：
- 提取问题和解决方案
- 整理代码示例
- 记录决策过程  
- 保存为结构化文档
```

## 🔍 故障排除

### ❌ 重启后看不到 MCP 工具

**解决方法：**
1. 检查 Cursor MCP 配置是否正确
2. 确保网络连接正常（需要从 npm 下载）
3. 完全关闭并重启 Cursor
4. 查看 Cursor 的开发者工具是否有错误信息

### ❌ 网页抓取返回空内容

**可能原因：**
- 目标网站有反爬虫机制
- 网络连接问题  
- URL 格式错误

**解决方法：**
- 检查 URL 格式（需包含 http:// 或 https://）
- 尝试不同的网站测试
- 使用简单的静态网站进行测试

### ❌ 对话记忆无法保存

**可能原因：**
- 当前工作目录没有写权限
- 磁盘空间不足
- `.cursor` 目录创建失败

**解决方法：**
- 检查当前工作目录的写权限
- 确保磁盘有足够空间
- 手动创建 `.cursor` 目录测试
- 查看是否有防病毒软件阻止文件创建

## 📄 许可证

MIT License

## 🎉 开始使用

现在就可以开始：

1. **配置 Cursor**: 添加上面的 MCP 配置
2. **重启 Cursor**
3. **测试功能**: 
   - 使用 `fetch_link_documentation` 获取网页文档
   - 说"保存这次对话"测试智能记忆功能

**祝你使用愉快！🚀**

---

*如需帮助，请在 [GitHub](https://github.com/lijianye/link-mcp) 提交 Issue。*