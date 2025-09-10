#!/usr/bin/env node

/**
 * Link MCP 源码分发安装脚本
 * 用于直接从源码安装和配置 Link MCP
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 开始安装 Link MCP...');
console.log('');

try {
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    console.error('❌ 需要 Node.js 版本 >= 16，当前版本:', nodeVersion);
    process.exit(1);
  }

  console.log('✅ Node.js 版本检查通过:', nodeVersion);

  // 安装依赖
  console.log('📦 安装依赖包...');
  execSync('npm install', { stdio: 'inherit' });

  // 构建项目
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 获取当前安装目录
  const installDir = process.cwd();
  const distPath = path.join(installDir, 'dist', 'index.js');
  
  // 检查构建是否成功
  if (!fs.existsSync(distPath)) {
    console.error('❌ 构建失败，找不到输出文件:', distPath);
    process.exit(1);
  }

  console.log('✅ 项目构建成功');

  // 配置 Cursor MCP
  console.log('⚙️ 配置 Cursor MCP...');
  
  const configPath = getCursorConfigPath();
  console.log('📄 配置文件路径:', configPath);

  // 读取或创建配置
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(existingConfig);
      console.log('📖 读取现有配置');
    } catch (error) {
      console.log('⚠️ 现有配置文件格式错误，将创建新配置');
      config = {};
    }
  } else {
    console.log('📝 创建新配置文件');
  }

  // 初始化 mcpServers
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // 添加 Link MCP 配置
  config.mcpServers['link-mcp'] = {
    command: 'node',
    args: [distPath],
    cwd: installDir,
    env: {}
  };

  // 保存配置
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('');
  console.log('🎉 Link MCP 安装成功！');
  console.log('');
  console.log('📋 安装信息:');
  console.log(`   📁 安装目录: ${installDir}`);
  console.log(`   🔧 执行文件: ${distPath}`);
  console.log(`   ⚙️ 配置文件: ${configPath}`);
  console.log('');
  console.log('🔄 请重启 Cursor 以加载新的 MCP 服务器');
  console.log('');
  console.log('💡 安装后可用的工具:');
  console.log('   • fetch_link_documentation - 获取网页文档');
  console.log('   • save_cursor_memory - 保存 Cursor 记忆');
  console.log('   • get_cursor_memories - 检索历史记忆');
  console.log('');
  console.log('🧪 首次测试建议:');
  console.log('   请使用 fetch_link_documentation 获取百度首页进行测试');
  console.log('   URL: https://www.baidu.com');

} catch (error) {
  console.error('❌ 安装过程中出现错误:', error.message);
  console.error('');
  console.error('🛠️ 故障排除建议:');
  console.error('1. 检查网络连接是否正常');
  console.error('2. 确保有足够的磁盘空间');
  console.error('3. 检查目录写权限');
  console.error('4. 尝试使用管理员权限运行');
  process.exit(1);
}

function getCursorConfigPath() {
  const platform = os.platform();
  const homeDir = os.homedir();
  
  switch (platform) {
    case 'win32':
      return path.join(homeDir, '.cursor-mcp-settings.json');
    case 'darwin':
      return path.join(homeDir, '.cursor-mcp-settings.json');
    case 'linux':
      return path.join(homeDir, '.cursor-mcp-settings.json');
    default:
      return path.join(homeDir, '.cursor-mcp-settings.json');
  }
}