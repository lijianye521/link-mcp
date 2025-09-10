#!/usr/bin/env nod

// Use CommonJS syntax for build script (this file won't be part of the ESM package)
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始一键发布流程...\n');

try {
    // 1. 读取当前版本
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;

    console.log(`📦 当前版本: ${currentVersion}`);
    console.log(`📦 包名: ${
        packageJson.name
    }`);

    // 2. 询问是否要更新版本
    const readline = require('readline');
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    console.log('\n请选择操作:');
    console.log('1. 发布当前版本 (直接发布不改版本号)');
    console.log('2. patch版本并发布 (1.1.1 → 1.1.2)');
    console.log('3. minor版本并发布 (1.1.1 → 1.2.0)');
    console.log('4. major版本并发布 (1.1.1 → 2.0.0)');

    rl.question('输入选择 (1-4): ', (answer) => {
        rl.close();

        try {
            let newVersion = currentVersion;

            // 3. 根据选择更新版本
            if (answer !== '1') {
                let versionType = '';
                switch (answer) {
                    case '2': versionType = 'patch';
                        break;
                    case '3': versionType = 'minor';
                        break;
                    case '4': versionType = 'major';
                        break;
                    default:
                        console.log('❌ 无效选择，直接发布当前版本');
                }

                if (versionType) {
                    console.log(`📈 更新版本 (${versionType})...`);

                    // 手动更新版本号，避免npm version的git操作
                    const versionParts = currentVersion.split('.').map(Number);
                    if (versionType === 'patch') {
                        versionParts[2]++;
                    } else if (versionType === 'minor') {
                        versionParts[1]++;
                        versionParts[2] = 0;
                    } else if (versionType === 'major') {
                        versionParts[0]++;
                        versionParts[1] = 0;
                        versionParts[2] = 0;
                    }

                    newVersion = versionParts.join('.');
                    packageJson.version = newVersion;
                    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

                    console.log(`✅ 版本更新: ${currentVersion} → ${newVersion}\n`);
                }
            } else {
                console.log('⏩ 使用当前版本发布\n');
            }

            // 4. 构建项目
            console.log('🔨 构建项目...');
            execSync('npm run build', {stdio: 'inherit'});
            console.log('✅ 构建完成');

            // 5. 运行代码检查
            console.log('🔍 运行代码检查...');
            execSync('npm run lint', {stdio: 'inherit'});
            console.log('✅ 代码检查通过');

            // 6. 直接发布到npm（绕过npm publish命令避免循环）
            console.log('📤 发布到 npm...');
            execSync('npm publish --access public', {stdio: 'inherit'});

            // 7. 发布成功
            console.log('\n🎉 发布完成！');
            console.log(`📦 包名: ${
                packageJson.name
            }`);
            console.log(`🏷️ 版本: ${newVersion}`);
            console.log(`🌐 NPM: https://www.npmjs.com/package/${
                packageJson.name
            }`);

            console.log('\n💡 用户现在可以通过以下方式使用:');
            console.log(`npx ${
                packageJson.name
            }`);
            console.log(`npm install -g ${
                packageJson.name
            }`);

        } catch (error) {
            console.error('❌ 发布失败:', error.message);
            process.exit(1);
        }
    });

} catch (error) {
    console.error('❌ 发布流程失败:', error.message);
    process.exit(1);
}
