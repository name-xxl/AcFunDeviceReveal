// 单元测试：对纯逻辑函数做输入→输出验证
// 用法：node tools/unit-test.js
//
// 原理：在 Node 里模拟油猴/浏览器全局，按构建顺序加载 src/，
//        然后对 window.ACFunDeviceReveal 暴露的纯函数做断言。

const fs = require('fs');
const path = require('path');

// ── 1. 模拟油猴 & 浏览器全局 ──────────────────────────────
const storage = {};
global.GM_getValue = (key, fallback) => (key in storage ? storage[key] : fallback);
global.GM_setValue = (key, val) => { storage[key] = val; };
global.GM_setClipboard = () => {};
global.GM_registerMenuCommand = () => {};

// 最小 DOM 模拟：只需要 querySelector / querySelectorAll / createElement 等
class FakeElement {
  constructor(tag, attrs = {}, children = []) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.children = children;
    this.dataset = {};
    this.className = attrs.class || '';
    this.classList = { contains: () => false };
    this.style = {};
    this.isConnected = false;
    this.href = attrs.href || '';
    this.src = attrs.src || '';
    for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith('data-')) this.dataset[k.slice(5)] = v;
    }
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, v) { this.attrs[name] = v; }
  removeAttribute(name) { delete this.attrs[name]; }
  hasAttribute(name) { return name in this.attrs; }
  querySelector(sel) { return queryOne(this, sel); }
  querySelectorAll(sel) { return queryAll(this, sel); }
  closest() { return null; }
  appendChild(child) { this.children.push(child); return child; }
}

// 极简选择器匹配：支持本项目用到的子集
function matches(el, sel) {
  if (!el || el.tagName === undefined) return false;
  if (sel.includes(',')) {
    return sel.split(',').map(s => s.trim()).some(s => matchesSingle(el, s));
  }
  return matchesSingle(el, sel);
}

function matchesSingle(el, sel) {
  let remaining = sel;
  let expectTag = null, expectClass = null, expectAttrs = [];

  const tagMatch = remaining.match(/^([a-z][a-z0-9]*)/i);
  if (tagMatch) {
    expectTag = tagMatch[1].toUpperCase();
    remaining = remaining.slice(tagMatch[0].length);
  }

  while (remaining.length > 0) {
    const classMatch = remaining.match(/^\.([a-zA-Z0-9_-]+)/);
    if (classMatch) {
      expectClass = classMatch[1];
      remaining = remaining.slice(classMatch[0].length);
      continue;
    }
    const attrMatch = remaining.match(/^\[([^\]=~*^$|]+)(?:([~*^$|]?=)"?([^"\]]*)"?)?\]/);
    if (attrMatch) {
      expectAttrs.push({ name: attrMatch[1], op: attrMatch[2] || '=', value: attrMatch[3] });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }
    break;
  }

  if (expectTag && el.tagName !== expectTag) return false;
  if (expectClass && !(el.className || '').split(/\s+/).includes(expectClass)) return false;
  for (const { name, op, value } of expectAttrs) {
    if (!(name in el.attrs)) return false;
    if (value === undefined) continue;
    const attrVal = String(el.attrs[name]);
    if (op === '=' && attrVal !== value) return false;
    if (op === '*=' && !attrVal.includes(value)) return false;
  }
  return true;
}

function queryOne(root, sel) {
  if (sel.includes(',')) {
    for (const s of sel.split(',').map(s => s.trim())) {
      const found = queryOne(root, s);
      if (found) return found;
    }
    return null;
  }
  for (const child of root.children || []) {
    if (matches(child, sel)) return child;
    const found = queryOne(child, sel);
    if (found) return found;
  }
  return null;
}

function queryAll(root, sel) {
  const results = [];
  if (sel.includes(',')) {
    const seen = new Set();
    for (const s of sel.split(',').map(s => s.trim())) {
      for (const el of queryAll(root, s)) {
        if (!seen.has(el)) { seen.add(el); results.push(el); }
      }
    }
    return results;
  }
  for (const child of root.children || []) {
    if (matches(child, sel)) results.push(child);
    results.push(...queryAll(child, sel));
  }
  return results;
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement('body');
    this.head = new FakeElement('head');
  }
  getElementById() { return null; }
  querySelector(sel) { return queryOne(this.body, sel); }
  querySelectorAll(sel) { return queryAll(this.body, sel); }
  createElement(tag) { return new FakeElement(tag); }
  addEventListener() {}
}

global.document = new FakeDocument();
global.MutationObserver = class { observe() {} disconnect() {} };
global.location = { href: 'https://www.acfun.cn/v/ac12345', pathname: '/v/ac12345' };
global.history = { pushState: () => {}, replaceState: () => {} };
global.window = {
  addEventListener: () => {},
  MutationObserver: global.MutationObserver,
  location: global.location,
};

// ── 2. 按构建顺序拼接并加载 src/ ─────────────────────────
const SRC_DIR = path.join(__dirname, '..', 'src');
const FILES = [
  '00-header.js', '10-constants.js', '20-utils.js', '30-storage.js',
  '40-device-data.js', '50-device.js', '60-observers.js',
  '70-panel.js', '80-menu.js', '90-main.js',
];

let combined = '';
for (const f of FILES) {
  combined += fs.readFileSync(path.join(SRC_DIR, f), 'utf8');
}

// 整体执行：源码是一个 IIFE，最终会执行 window.ACFunDeviceReveal = {...}
new Function(combined)();

const api = global.window.ACFunDeviceReveal;
if (!api) {
  console.error('✗ window.ACFunDeviceReveal 未暴露，加载失败');
  process.exit(1);
}

// ── 3. 测试框架 ──────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    期望: ${JSON.stringify(expected)}`);
    console.log(`    实际: ${JSON.stringify(actual)}`);
  }
}

function group(name) {
  console.log(`\n${name}`);
}

// ── 4. parseDeviceModelsText ─────────────────────────────
group('parseDeviceModelsText');
assert('MobileModels 格式',
  api.parseDeviceModelsText('`RMX3700`: 真我 GT Neo5 SE'),
  { RMX3700: '真我 GT Neo5 SE' }
);
assert('一行多个代码',
  api.parseDeviceModelsText('`ALN-AL00` `ALN-AL80`: HUAWEI Mate 60 Pro'),
  { 'ALN-AL00': 'HUAWEI Mate 60 Pro', 'ALN-AL80': 'HUAWEI Mate 60 Pro' }
);
assert('Apple gist 冒号格式',
  api.parseDeviceModelsText('iPhone3,1 : iPhone 4'),
  { 'iPhone3,1': 'iPhone 4' }
);
assert('Apple 空格格式',
  api.parseDeviceModelsText('iPhone3,1 iPhone 4'),
  { 'iPhone3,1': 'iPhone 4' }
);
assert('跳过注释与空行',
  api.parseDeviceModelsText('# 注释\n\n// 斜杠注释\n`RMX3700`: 真我 GT Neo5 SE'),
  { RMX3700: '真我 GT Neo5 SE' }
);
assert('空输入', api.parseDeviceModelsText(''), {});
assert('混合格式多行',
  api.parseDeviceModelsText('`V2324A`: vivo X100 Pro\niPhone3,1 : iPhone 4'),
  { V2324A: 'vivo X100 Pro', 'iPhone3,1': 'iPhone 4' }
);

// ── 5. findFriendlyName ─────────────────────────────────
group('findFriendlyName');
assert('精确匹配 iPhone3,1', api.findFriendlyName('iPhone3,1'), 'iPhone 4');
assert('精确匹配 iPhone14,5', api.findFriendlyName('iPhone14,5'), 'iPhone 13');
assert('大小写不敏感', api.findFriendlyName('rmx3700'), '真我 GT Neo5 SE');
assert('去尾字母匹配 V2324B', api.findFriendlyName('V2324B'), 'vivo X100 Pro');
assert('前缀包含匹配 V2324AX', api.findFriendlyName('V2324AX'), 'vivo X100 Pro');
assert('未收录返回 null', api.findFriendlyName('ZZZZ9999X'), null);
assert('过短返回 null', api.findFriendlyName('ab'), null);
assert('空值返回 null', api.findFriendlyName(''), null);
assert('null 返回 null', api.findFriendlyName(null), null);

// ── 6. importDeviceModels ───────────────────────────────
group('importDeviceModels');
const count0 = api.getState().deviceModels;
const r1 = api.importDeviceModels({ ACR_TEST_CODE_1: '测试机型一', RMX3700: '覆盖尝试' }, true);
assert('skipExisting 返回值', r1, { added: 1, skipped: 1 });
assert('skipExisting 已存在不覆盖', api.findFriendlyName('RMX3700'), '真我 GT Neo5 SE');
assert('新增可查到', api.findFriendlyName('ACR_TEST_CODE_1'), '测试机型一');
assert('新增后数量 +1', api.getState().deviceModels, count0 + 1);

const r2 = api.importDeviceModels({ ACR_TEST_CODE_2: '测试机型二' }, false);
assert('覆盖模式新增', r2, { added: 1, skipped: 0 });
assert('覆盖模式数量 +1', api.getState().deviceModels, count0 + 2);

const r3 = api.importDeviceModels({}, true);
assert('空导入无变化', r3, { added: 0, skipped: 0 });

// ── 结果 ─────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`通过: ${passed}  失败: ${failed}`);
if (failed) {
  console.error(`${failed} 项未通过`);
  process.exit(1);
}
console.log('全部通过');
process.exit(0);
