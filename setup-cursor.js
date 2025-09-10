#!/usr/bin/env node

/**
 * Cursor MCP Setup Script
 * 自动配置Link MCP到Cursor的脚本
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

function getCurrentProjectPath() {
  return __dirname;
}

function setupCursorConfig() {
  const configPath = getCursorConfigPath();
  const projectPath = getCurrentProjectPath();
  const distPath = path.join(projectPath, 'dist', 'index.js');
  
  console.log('🔧 Setting up Cursor MCP configuration...');
  console.log(`📁 Project path: ${projectPath}`);
  console.log(`📄 Config file: ${configPath}`);
  
  // 检查dist目录是否存在
  if (!fs.existsSync(path.join(projectPath, 'dist'))) {
    console.log('❌ Build not found! Please run "npm run build" first.');
    process.exit(1);
  }
  
  let config = {};
  
  // 读取现有配置
  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(existingConfig);
      console.log('📖 Found existing Cursor MCP configuration');
    } catch (error) {
      console.log('⚠️  Existing config file is invalid, creating new one');
      config = {};
    }
  }
  
  // 初始化mcpServers如果不存在
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  // 添加或更新link-mcp配置 (提供两种方式)
  const useNpx = process.env.USE_NPX === 'true' || process.argv.includes('--npx');
  
  if (useNpx) {
    // 方式1: 使用 npx (需要全局安装或在项目目录下)
    config.mcpServers['link-mcp'] = {
      command: 'npx',
      args: ['link-mcp'],
      cwd: projectPath,
      env: {}
    };
  } else {
    // 方式2: 直接使用 node (默认)
    config.mcpServers['link-mcp'] = {
      command: 'node',
      args: [distPath],
      cwd: projectPath,
      env: {}
    };
  }
  
  // 写入配置文件
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Cursor MCP configuration updated successfully!');
    console.log('');
    console.log('📋 Configuration added:');
    console.log(`   Server name: link-mcp`);
    if (useNpx) {
      console.log(`   Command: npx link-mcp`);
      console.log('   Mode: NPX (package-based)');
    } else {
      console.log(`   Command: node`);
      console.log(`   Script: ${distPath}`);
    }
    console.log(`   Working directory: ${projectPath}`);
    console.log('');
    console.log('🔄 Please restart Cursor to load the new MCP server.');
    console.log('');
    console.log('💡 Available tools after restart:');
    console.log('   • fetch_link_documentation - 获取链接文档');
    console.log('   • save_cursor_memory - 保存Cursor记忆');
    console.log('   • get_cursor_memories - 检索Cursor记忆');
    
  } catch (error) {
    console.error('❌ Failed to write configuration:', error.message);
    console.error('');
    console.error('🛠️  Manual configuration required:');
    console.error('');
    console.error('Add this to your Cursor MCP settings:');
    console.error('');
    console.error(JSON.stringify({
      mcpServers: {
        'link-mcp': config.mcpServers['link-mcp']
      }
    }, null, 2));
  }
}

// 运行设置
if (require.main === module) {
  setupCursorConfig();
}