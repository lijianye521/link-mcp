#!/usr/bin/env node

/**
 * Build script for Link MCP Server
 */

// Use ESM syntax for build script
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
