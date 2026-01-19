/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`[copy-report-dist] Source does not exist: ${src}`);
        return false;
    }

    fs.mkdirSync(dest, { recursive: true });

    // Node 16+ supports fs.cpSync
    fs.cpSync(src, dest, { recursive: true, force: true });
    return true;
}

function main() {
    const root = path.resolve(__dirname, '..');
    const srcDir = path.join(root, 'src', 'report', 'dist');
    const destDir = path.join(root, 'dist', 'report');

    const ok = copyDir(srcDir, destDir);
    if (ok) {
        console.log(`[copy-report-dist] Copied ${srcDir} -> ${destDir}`);
    } else {
        console.warn('[copy-report-dist] Skipped (no report dist found).');
    }
}

main();

