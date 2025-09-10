#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始一键发布流程...\n');

try {
  // 1. 检查当前版本
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`📦 当前版本: ${currentVersion}`);
  
  // 2. 构建项目
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 构建完成\n');
  
  // 3. 运行 lint 检查
  console.log('🔍 运行代码检查...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ 代码检查通过\n');
  
  // 4. 询问版本更新类型
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('请选择版本更新类型:');
  console.log('1. patch (bug修复) - 1.0.0 → 1.0.1');
  console.log('2. minor (新功能) - 1.0.0 → 1.1.0');
  console.log('3. major (重大更改) - 1.0.0 → 2.0.0');
  console.log('4. 跳过版本更新，使用当前版本发布');
  
  rl.question('输入选择 (1-4): ', (answer) => {
    rl.close();
    
    let versionType = '';
    switch(answer) {
      case '1':
        versionType = 'patch';
        break;
      case '2':
        versionType = 'minor';
        break;
      case '3':
        versionType = 'major';
        break;
      case '4':
        versionType = '';
        break;
      default:
        console.log('❌ 无效选择，使用 patch 更新');
        versionType = 'patch';
    }
    
    try {
      // 5. 更新版本号
      if (versionType) {
        console.log(`📈 更新版本 (${versionType})...`);
        execSync(`npm version ${versionType}`, { stdio: 'inherit' });
        
        // 读取新版本号
        const updatedPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const newVersion = updatedPackageJson.version;
        console.log(`✅ 版本更新: ${currentVersion} → ${newVersion}\n`);
      } else {
        console.log('⏩ 跳过版本更新\n');
      }
      
      // 6. 发布到 npm
      console.log('📤 发布到 npm...');
      execSync('npm publish', { stdio: 'inherit' });
      
      // 7. 推送到 git（如果有版本更新）
      if (versionType) {
        console.log('📤 推送到 Git...');
        try {
          execSync('git push', { stdio: 'inherit' });
          execSync('git push --tags', { stdio: 'inherit' });
          console.log('✅ Git 推送完成\n');
        } catch (error) {
          console.log('⚠️ Git 推送失败，但 npm 发布成功\n');
        }
      }
      
      console.log('🎉 发布完成！');
      console.log(`📦 包名: ${packageJson.name}`);
      console.log(`🏷️ 版本: ${versionType ? JSON.parse(fs.readFileSync(packagePath, 'utf8')).version : currentVersion}`);
      console.log(`🌐 NPM: https://www.npmjs.com/package/${packageJson.name}`);
      
      console.log('\n用户现在可以通过以下方式使用:');
      console.log(`npx ${packageJson.name}`);
      
    } catch (error) {
      console.error('❌ 发布失败:', error.message);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 发布流程失败:', error.message);
  process.exit(1);
}