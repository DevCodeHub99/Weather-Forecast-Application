import fs from 'fs';
import path from 'path';

const nativeJsPath = path.resolve('node_modules', 'rollup', 'dist', 'native.js');
if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    content = content.replace(
      /const nativeModule = requireWithFriendlyError\([\s\S]*?\);/,
      `let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError(\n\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`\n\t);\n} catch (e) {\n\tnativeModule = require('@rollup/wasm-node/dist/native.js');\n}`
    );
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('[PostInstall] Rollup fallback to wasm-node patched successfully.');
  }
}
