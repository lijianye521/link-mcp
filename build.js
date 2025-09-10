#!/usr/bin/env nod

/**
 * Build script for Link MCP Server
 */

// Use CommonJS syntax for build script (this file won't be part of the ESM package)
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Link MCP Server...');

try {
    // Clean dist directory
    console.log('📁 Cleaning dist directory...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', {recursive: true});
    }

    // Build TypeScript
    console.log('📦 Compiling TypeScript...');
    execSync('npx tsc', {stdio: 'inherit'});

    // Make the built file executable
    const indexPath = path.join('dist', 'index.js');
    if (fs.existsSync(indexPath)) {
        console.log('🔧 Making index.js executable...');
        fs.chmodSync(indexPath, '755');

        // Ensure shebang is present
        const content = fs.readFileSync(indexPath, 'utf-8');
        if (! content.startsWith('#!/usr/bin/env node')) {
            fs.writeFileSync(indexPath, '#!/usr/bin/env node\n\n' + content);
        }
    }

    console.log('✅ Build completed successfully!');
    console.log('💡 You can now run the server with: node dist/index.js');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
