// 冒烟测试：对 dist/AcFunDeviceReveal.user.js 做构建后基本检查
// 用法：node tools/smoke-test.js （建议先 node build.js）
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIST = path.join(__dirname, '..', 'dist', 'AcFunDeviceReveal.user.js');
const ROOT = path.join(__dirname, '..');

let failed = 0;
const check = (name, ok) => {
  console.log((ok ? '  ✓ ' : '  ✗ ') + name);
  if (!ok) failed++;
};

if (!fs.existsSync(DIST)) {
  console.error('✗ dist 未构建，请先运行 node build.js');
  process.exit(1);
}
const src = fs.readFileSync(DIST, 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

console.log('冒烟测试: ' + path.relative(ROOT, DIST));

// 1. 语法（node --check 通过即整个文件可解析）
try {
  execFileSync(process.execPath, ['--check', DIST], { stdio: 'pipe' });
  check('语法检查 (node --check)', true);
} catch (e) {
  check('语法检查 (node --check): ' + e.stderr, false);
}

// 2. 版本三处一致：header @version / VERSION 常量 / package.json
const headerVersion = (src.match(/@version\s+([^\s]+)/) || [])[1];
const constVersion = (src.match(/const VERSION = '([^']+)'/) || [])[1];
check(`版本一致 @version=${pkg.version}`, headerVersion === pkg.version);
check(`版本一致 VERSION=${pkg.version}`, constVersion === pkg.version);

// 3. 结构完整：IIFE 闭合、油猴元数据块
check('IIFE 开头 (function () {', src.includes("(function () {"));
check('IIFE 结尾 })();', /\}\)\(\);\s*$/.test(src));
check('==UserScript== 元数据块', src.includes('// ==UserScript==') && src.includes('// ==/UserScript=='));

// 4. 关键函数齐全（每个模块的核心导出都在）
for (const fn of [
  'loadDeviceDB', 'saveDeviceDB', 'buildDeviceIndexes',  // device 数据与索引
  'findFriendlyName', 'parseDeviceModelsText',
  'importDeviceModels', 'processDeviceModels',
  'buildDeviceRows', 'openDeviceImport', 'forceReprocessDevices',
  'startObserver', 'checkUrl',                            // observers
  'openPanel', 'ensurePanelStyle', 'showToast',           // panel
  'registerMenus', 'copyLogs',                            // menu
]) {
  check(`关键函数 ${fn}`, src.includes(`function ${fn}`));
}

// 5. 行为要点未被回归
check('@noframes 已声明', src.includes('@noframes'));
check('deviceModel 选择器接入', src.includes('.deviceModel'));
check('设备数据存储 key（沿用 v2.0.0）', src.includes('acr_models_data'));
check('内置设备数据表存在', src.includes('const DEVICE_BUILTIN'));
check('MobileModels 数据来源署名', src.includes('KHwang9883/MobileModels'));
check('无 alert/confirm 残留', !src.includes('alert(') && !src.includes('confirm('));
check('调试接口 window.ACFunDeviceReveal', src.includes('window.ACFunDeviceReveal'));

// 6. 不含 IP 属地功能（本仓库为纯设备美化版）
check('不包含 IP 查询 API', !src.includes('userInfo'));
check('不包含 fetch/XHR 拦截', !src.includes('hookFetch') && !src.includes('hookXHR'));

// 7. 面板样式对齐 A 站原生主色
check('面板主色 #fd4c5d', src.includes('#fd4c5d'));

if (failed) {
  console.error(`\n${failed} 项未通过`);
  process.exit(1);
}
console.log('\n全部通过');
