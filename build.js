// 构建脚本：把 src/ 下的源文件按顺序拼接成 dist/AcFunDeviceReveal.user.js
// 用法：node build.js
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_FILE = path.join(__dirname, 'dist', 'AcFunDeviceReveal.user.js');

// 顺序即最终脚本的拼接顺序
const FILES = [
    '00-header.js',
    '10-constants.js',
    '20-utils.js',
    '30-storage.js',
    '40-device-data.js',
    '50-device.js',
    '60-observers.js',
    '70-panel.js',
    '80-menu.js',
    '90-main.js',
];

let out = '';
for (const f of FILES) {
    const p = path.join(SRC_DIR, f);
    if (!fs.existsSync(p)) {
        console.error('缺少源文件: ' + f);
        process.exit(1);
    }
    out += fs.readFileSync(p, 'utf8');
}

// 版本一致性校验：@version（Tampermonkey 识别）必须与 package.json 一致，
// 防止发版时只改一处
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const vm = out.match(/@version\s+([^\s]+)/);
if (!vm || vm[1] !== pkg.version) {
    console.error(`版本不一致：header @version=${vm ? vm[1] : '(未找到)'} vs package.json=${pkg.version}，请同步后再构建`);
    process.exit(1);
}

// 常量一致性校验：10-constants.js 里的 VERSION（运行时日志/导出用）也要同步
const vc = out.match(/const VERSION = '([^']+)'/);
if (!vc || vc[1] !== pkg.version) {
    console.error(`版本不一致：src VERSION=${vc ? vc[1] : '(未找到)'} vs package.json=${pkg.version}，请同步后再构建`);
    process.exit(1);
}

fs.mkdirSync(path.dirname(DIST_FILE), { recursive: true });
fs.writeFileSync(DIST_FILE, out, 'utf8');
console.log('构建完成 -> ' + DIST_FILE);
console.log('拼接 ' + FILES.length + ' 个文件，' + out.length + ' 字符，版本 ' + pkg.version);
