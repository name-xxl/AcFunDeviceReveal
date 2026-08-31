// ==UserScript==
// @name         AcFunDeviceReveal - A站手机型号美化
// @namespace    http://acfun-device-reveal.local
// @version      2.0.0
// @description  将A站评论区的手机内部代号替换为友好名称，支持导入MobileModels数据
// @author       name_xxl
// @match        https://www.acfun.cn/*
// @match        https://m.acfun.cn/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  const log = (...a) => console.log('%c[AcFunDeviceReveal]', 'color:#ff6b35;font-weight:bold', ...a);

  // ============================================================
  //  常量
  // ============================================================
  const STORAGE_KEY = 'acr_models_data';
  const META_KEY = 'acr_models_meta';
  const SETTINGS_KEY = 'acr_device_settings';

  // ============================================================
  //  索引缓存（性能优化核心）
  // ============================================================
  let indexExact = new Map();      // 精确匹配索引: code → name
  let indexUpper = new Map();      // 大写索引: CODE → name
  let indexBase = new Map();       // 去后缀索引: base → name
  let indexPrefix = new Map();     // 前缀索引: prefix → [{code, name}]
  let searchCache = new Map();     // 搜索结果缓存: code → name|null
  const CACHE_MAX_SIZE = 500;

  // ============================================================
  //  内置基础数据（常见型号作为默认）
  // ============================================================
  const BUILTIN_MODELS = {
    // ========== Apple iPhone ==========
    "iPhone3,1": "iPhone 4",
    "iPhone3,2": "iPhone 4",
    "iPhone3,3": "iPhone 4",
    "iPhone4,1": "iPhone 4S",
    "iPhone5,1": "iPhone 5",
    "iPhone5,2": "iPhone 5",
    "iPhone5,3": "iPhone 5c",
    "iPhone5,4": "iPhone 5c",
    "iPhone6,1": "iPhone 5s",
    "iPhone6,2": "iPhone 5s",
    "iPhone7,1": "iPhone 6 Plus",
    "iPhone7,2": "iPhone 6",
    "iPhone8,1": "iPhone 6s",
    "iPhone8,2": "iPhone 6s Plus",
    "iPhone8,4": "iPhone SE",
    "iPhone9,1": "iPhone 7",
    "iPhone9,2": "iPhone 7 Plus",
    "iPhone9,3": "iPhone 7",
    "iPhone9,4": "iPhone 7 Plus",
    "iPhone10,1": "iPhone 8",
    "iPhone10,2": "iPhone 8 Plus",
    "iPhone10,3": "iPhone X",
    "iPhone10,4": "iPhone 8",
    "iPhone10,5": "iPhone 8 Plus",
    "iPhone10,6": "iPhone X",
    "iPhone11,2": "iPhone XS",
    "iPhone11,4": "iPhone XS Max",
    "iPhone11,6": "iPhone XS Max",
    "iPhone11,8": "iPhone XR",
    "iPhone12,1": "iPhone 11",
    "iPhone12,3": "iPhone 11 Pro",
    "iPhone12,5": "iPhone 11 Pro Max",
    "iPhone12,8": "iPhone SE 2",
    "iPhone13,1": "iPhone 12 mini",
    "iPhone13,2": "iPhone 12",
    "iPhone13,3": "iPhone 12 Pro",
    "iPhone13,4": "iPhone 12 Pro Max",
    "iPhone14,4": "iPhone 13 mini",
    "iPhone14,5": "iPhone 13",
    "iPhone14,2": "iPhone 13 Pro",
    "iPhone14,3": "iPhone 13 Pro Max",
    "iPhone14,6": "iPhone SE 3",
    "iPhone14,7": "iPhone 14",
    "iPhone14,8": "iPhone 14 Plus",
    "iPhone15,2": "iPhone 14 Pro",
    "iPhone15,3": "iPhone 14 Pro Max",
    "iPhone15,4": "iPhone 15",
    "iPhone15,5": "iPhone 15 Plus",
    "iPhone16,1": "iPhone 15 Pro",
    "iPhone16,2": "iPhone 15 Pro Max",
    "iPhone17,1": "iPhone 16 Pro",
    "iPhone17,2": "iPhone 16 Pro Max",
    "iPhone17,3": "iPhone 16",
    "iPhone17,4": "iPhone 16 Plus",
    "iPhone17,5": "iPhone 16e",
    "iPhone18,1": "iPhone 17 Pro",
    "iPhone18,2": "iPhone 17 Pro Max",
    "iPhone18,3": "iPhone 17",
    "iPhone18,4": "iPhone Air",
    "iPhone18,5": "iPhone 17e",
    // ========== Apple iPod ==========
    "iPod1,1": "iPod Touch 1G",
    "iPod2,1": "iPod Touch 2G",
    "iPod3,1": "iPod Touch 3G",
    "iPod4,1": "iPod Touch 4G",
    "iPod5,1": "iPod Touch 5G",
    "iPod7,1": "iPod Touch 6G",
    "iPod9,1": "iPod Touch 7G",
    // ========== Apple iPad ==========
    "iPad1,1": "iPad",
    "iPad1,2": "iPad 3G",
    "iPad2,1": "iPad 2",
    "iPad2,2": "iPad 2",
    "iPad2,3": "iPad 2",
    "iPad2,4": "iPad 2",
    "iPad2,5": "iPad Mini",
    "iPad2,6": "iPad Mini",
    "iPad2,7": "iPad Mini",
    "iPad3,1": "iPad 3",
    "iPad3,2": "iPad 3",
    "iPad3,3": "iPad 3",
    "iPad3,4": "iPad 4",
    "iPad3,5": "iPad 4",
    "iPad3,6": "iPad 4",
    "iPad4,1": "iPad Air",
    "iPad4,2": "iPad Air",
    "iPad4,3": "iPad Air",
    "iPad4,4": "iPad Mini 2",
    "iPad4,5": "iPad Mini 2",
    "iPad4,6": "iPad Mini 2",
    "iPad4,7": "iPad Mini 3",
    "iPad4,8": "iPad Mini 3",
    "iPad4,9": "iPad Mini 3",
    "iPad5,1": "iPad Mini 4",
    "iPad5,2": "iPad Mini 4",
    "iPad5,3": "iPad Air 2",
    "iPad5,4": "iPad Air 2",
    "iPad6,3": "iPad Pro 9.7",
    "iPad6,4": "iPad Pro 9.7",
    "iPad6,7": "iPad Pro 12.9",
    "iPad6,8": "iPad Pro 12.9",
    "iPad6,11": "iPad 5",
    "iPad6,12": "iPad 5",
    "iPad7,1": "iPad Pro 12.9 2代",
    "iPad7,2": "iPad Pro 12.9 2代",
    "iPad7,3": "iPad Pro 10.5",
    "iPad7,4": "iPad Pro 10.5",
    "iPad7,5": "iPad 6",
    "iPad7,6": "iPad 6",
    "iPad7,11": "iPad 7",
    "iPad7,12": "iPad 7",
    "iPad8,1": "iPad Pro 11",
    "iPad8,2": "iPad Pro 11",
    "iPad8,3": "iPad Pro 11",
    "iPad8,4": "iPad Pro 11",
    "iPad8,5": "iPad Pro 12.9 3代",
    "iPad8,6": "iPad Pro 12.9 3代",
    "iPad8,7": "iPad Pro 12.9 3代",
    "iPad8,8": "iPad Pro 12.9 3代",
    "iPad8,9": "iPad Pro 11 2代",
    "iPad8,10": "iPad Pro 11 2代",
    "iPad8,11": "iPad Pro 12.9 4代",
    "iPad8,12": "iPad Pro 12.9 4代",
    "iPad11,1": "iPad Mini 5",
    "iPad11,2": "iPad Mini 5",
    "iPad11,3": "iPad Air 3",
    "iPad11,4": "iPad Air 3",
    "iPad11,6": "iPad 8",
    "iPad11,7": "iPad 8",
    "iPad12,1": "iPad 9",
    "iPad12,2": "iPad 9",
    "iPad13,1": "iPad Air 4",
    "iPad13,2": "iPad Air 4",
    "iPad13,4": "iPad Pro 11 3代",
    "iPad13,5": "iPad Pro 11 3代",
    "iPad13,6": "iPad Pro 11 3代",
    "iPad13,7": "iPad Pro 11 3代",
    "iPad13,8": "iPad Pro 12.9 5代",
    "iPad13,9": "iPad Pro 12.9 5代",
    "iPad13,10": "iPad Pro 12.9 5代",
    "iPad13,11": "iPad Pro 12.9 5代",
    "iPad13,16": "iPad Air 5",
    "iPad13,17": "iPad Air 5",
    "iPad13,18": "iPad 10",
    "iPad13,19": "iPad 10",
    "iPad14,1": "iPad Mini 6",
    "iPad14,2": "iPad Mini 6",
    "iPad14,3": "iPad Pro 11 4代",
    "iPad14,4": "iPad Pro 11 4代",
    "iPad14,5": "iPad Pro 12.9 6代",
    "iPad14,6": "iPad Pro 12.9 6代",
    "iPad14,8": "iPad Air 6",
    "iPad14,9": "iPad Air 6",
    "iPad14,10": "iPad Air 13 6代",
    "iPad14,11": "iPad Air 13 6代",
    "iPad15,3": "iPad Air 11 7代",
    "iPad15,4": "iPad Air 11 7代",
    "iPad15,5": "iPad Air 13 7代",
    "iPad15,6": "iPad Air 13 7代",
    "iPad15,7": "iPad 11代",
    "iPad15,8": "iPad 11代",
    "iPad16,1": "iPad Mini 7代",
    "iPad16,2": "iPad Mini 7代",
    "iPad16,3": "iPad Pro 11 5代",
    "iPad16,4": "iPad Pro 11 5代",
    "iPad16,5": "iPad Pro 12.9 7代",
    "iPad16,6": "iPad Pro 12.9 7代",
    "iPad16,8": "iPad Air 11 8代",
    "iPad16,9": "iPad Air 11 8代",
    "iPad16,10": "iPad Air 13 8代",
    "iPad16,11": "iPad Air 13 8代",
    // ========== Apple Watch ==========
    "Watch1,1": "Apple Watch 38mm",
    "Watch1,2": "Apple Watch 42mm",
    "Watch2,6": "Apple Watch Series 1 38mm",
    "Watch2,7": "Apple Watch Series 1 42mm",
    "Watch2,3": "Apple Watch Series 2 38mm",
    "Watch2,4": "Apple Watch Series 2 42mm",
    "Watch3,1": "Apple Watch Series 3 38mm (GPS+蜂窝)",
    "Watch3,2": "Apple Watch Series 3 42mm (GPS+蜂窝)",
    "Watch3,3": "Apple Watch Series 3 38mm (GPS)",
    "Watch3,4": "Apple Watch Series 3 42mm (GPS)",
    "Watch4,1": "Apple Watch Series 4 40mm (GPS)",
    "Watch4,2": "Apple Watch Series 4 44mm (GPS)",
    "Watch4,3": "Apple Watch Series 4 40mm (GPS+蜂窝)",
    "Watch4,4": "Apple Watch Series 4 44mm (GPS+蜂窝)",
    "Watch5,1": "Apple Watch Series 5 40mm (GPS)",
    "Watch5,2": "Apple Watch Series 5 44mm (GPS)",
    "Watch5,3": "Apple Watch Series 5 40mm (GPS+蜂窝)",
    "Watch5,4": "Apple Watch Series 5 44mm (GPS+蜂窝)",
    "Watch5,9": "Apple Watch SE 40mm (GPS)",
    "Watch5,10": "Apple Watch SE 44mm (GPS)",
    "Watch5,11": "Apple Watch SE 40mm (GPS+蜂窝)",
    "Watch5,12": "Apple Watch SE 44mm (GPS+蜂窝)",
    "Watch6,1": "Apple Watch Series 6 40mm (GPS)",
    "Watch6,2": "Apple Watch Series 6 44mm (GPS)",
    "Watch6,3": "Apple Watch Series 6 40mm (GPS+蜂窝)",
    "Watch6,4": "Apple Watch Series 6 44mm (GPS+蜂窝)",
    "Watch6,6": "Apple Watch Series 7 41mm (GPS)",
    "Watch6,7": "Apple Watch Series 7 45mm (GPS)",
    "Watch6,8": "Apple Watch Series 7 41mm (GPS+蜂窝)",
    "Watch6,9": "Apple Watch Series 7 45mm (GPS+蜂窝)",
    "Watch6,10": "Apple Watch SE 40mm (GPS)",
    "Watch6,11": "Apple Watch SE 44mm (GPS)",
    "Watch6,12": "Apple Watch SE 40mm (GPS+蜂窝)",
    "Watch6,13": "Apple Watch SE 44mm (GPS+蜂窝)",
    "Watch6,14": "Apple Watch Series 8 41mm (GPS)",
    "Watch6,15": "Apple Watch Series 8 45mm (GPS)",
    "Watch6,16": "Apple Watch Series 8 41mm (GPS+蜂窝)",
    "Watch6,17": "Apple Watch Series 8 45mm (GPS+蜂窝)",
    "Watch6,18": "Apple Watch Ultra",
    "Watch7,1": "Apple Watch Series 9 41mm (GPS)",
    "Watch7,2": "Apple Watch Series 9 45mm (GPS)",
    "Watch7,3": "Apple Watch Series 9 41mm (GPS+蜂窝)",
    "Watch7,4": "Apple Watch Series 9 45mm (GPS+蜂窝)",
    "Watch7,5": "Apple Watch Ultra 2",
    "Watch7,8": "Apple Watch Series 10 42mm (GPS)",
    "Watch7,9": "Apple Watch Series 10 46mm (GPS)",
    "Watch7,10": "Apple Watch Series 10 42mm (GPS+蜂窝)",
    "Watch7,11": "Apple Watch Series 10 46mm (GPS+蜂窝)",
    "Watch7,12": "Apple Watch Ultra 3",
    "Watch7,13": "Apple Watch SE 3 40mm",
    "Watch7,14": "Apple Watch SE 3 44mm",
    "Watch7,17": "Apple Watch Series 11 42mm",
    "Watch7,18": "Apple Watch Series 11 46mm",
    // ========== Apple 其他 ==========
    "i386": "iPhone Simulator",
    "x86_64": "iPhone Simulator",
    "arm64": "iPhone Simulator",
    // ========== 小米常见型号 ==========
    "2201123C": "小米 12",
    "2201122C": "小米 12 Pro",
    "2112123AC": "小米 12X",
    "2202121C": "小米 12S",
    "2206122SC": "小米 12S Pro",
    "22061218C": "小米 12S Ultra",
    "2210132C": "小米 13",
    "22101321C": "小米 13 Pro",
    "2211133C": "小米 13 Ultra",
    "2304FPN6DC": "小米 14",
    "23116PN5BC": "小米 14 Ultra",
    "23015RN84C": "Redmi Note 12",
    "23015RN84I": "Redmi Note 12 Pro",
    "2209116AG": "POCO F4 GT",
    "2210129SG": "POCO F5",
    "22111317G": "POCO F5 Pro",
    // 华为常见型号
    "NOH-AN00": "华为 Mate 40 Pro",
    "NOH-AN01": "华为 Mate 40 Pro+",
    "OCE-AN10": "华为 Mate 40",
    "LIO-AN00": "华为 Mate 30 Pro",
    "TAS-AN00": "华为 Mate 30",
    "ABR-AL00": "华为 P60",
    "MNA-AL00": "华为 P60 Pro",
    "ALN-AL00": "华为 Mate 60",
    "ALN-AL10": "华为 Mate 60 Pro",
    "BRA-AL00": "华为 Mate 60 Pro+",
    "JAD-AL00": "华为 P50",
    "JAD-AL10": "华为 P50 Pro",
    "ABR-AL60": "华为 P50E",
    // OPPO 常见型号
    "PFDM00": "OPPO Find X5",
    "PFEM00": "OPPO Find X5 Pro",
    "PGFM10": "OPPO Find X6",
    "PGEM10": "OPPO Find X6 Pro",
    "PHZ110": "OPPO Find X7",
    "PHY110": "OPPO Find X7 Ultra",
    "PHT110": "OPPO Find N3",
    "PHN110": "OPPO Find N3 Flip",
    "PCLM10": "OPPO Reno5 Pro",
    "PDPM00": "OPPO Reno6 Pro",
    "PERM00": "OPPO Reno7 Pro",
    "PGZ110": "OPPO Reno8 Pro",
    "PHQ110": "OPPO Reno9 Pro",
    "PHV110": "OPPO Reno10 Pro",
    "PJZ110": "OPPO Reno11 Pro",
    // vivo 常见型号
    "V2046A": "vivo X60",
    "V2046A": "vivo X60 Pro",
    "V2185A": "vivo X70 Pro+",
    "V2227A": "vivo X80",
    "V2228A": "vivo X80 Pro",
    "V2242A": "vivo X90",
    "V2241A": "vivo X90 Pro",
    "V2241A": "vivo X90 Pro+",
    "V2324A": "vivo X100",
    "V2324A": "vivo X100 Pro",
    "V2339A": "vivo X100 Ultra",
    "V2056A": "vivo iQOO 7",
    "V2120A": "vivo iQOO 8",
    "V2171A": "vivo iQOO 9",
    "V2243A": "vivo iQOO 11",
    "V2254A": "vivo iQOO 12",
    // realme 常见型号
    "RMX3366": "真我 GT 大师探索版",
    "RMX3310": "真我 GT2",
    "RMX3300": "真我 GT2 Pro",
    "RMX3551": "真我 GT2 大师探索版",
    "RMX3700": "真我 GT3",
    "RMX3706": "真我 GT3 Pro",
    "RMX3820": "真我 GT5",
    "RMX3823": "真我 GT5 240W",
    "RMX3888": "真我 GT5 Pro",
    "RMX3619": "真我 GT Neo5 SE",
    "RMX3708": "真我 GT Neo5",
    "RMX3888": "真我 GT Neo6 SE",
    // 一加常见型号
    "PGKM10": "一加 9",
    "PGKM10": "一加 9 Pro",
    "PGZ110": "一加 10 Pro",
    "PHQ110": "一加 11",
    "PJD110": "一加 12",
    "PJC110": "一加 13",
    "PGZ110": "一加 Ace",
    "PHQ110": "一加 Ace 2",
    "PJZ110": "一加 Ace 3",
    "PJZ110": "一加 Ace 3V",
    // 三星常见型号
    "SM-S9080": "Galaxy S22 Ultra",
    "SM-S9060": "Galaxy S22+",
    "SM-S9010": "Galaxy S22",
    "SM-S9180": "Galaxy S23 Ultra",
    "SM-S9160": "Galaxy S23+",
    "SM-S9110": "Galaxy S23",
    "SM-S9280": "Galaxy S24 Ultra",
    "SM-S9260": "Galaxy S24+",
    "SM-S9210": "Galaxy S24",
    "SM-F9360": "Galaxy Z Fold4",
    "SM-F9460": "Galaxy Z Fold5",
    "SM-F7210": "Galaxy Z Flip4",
    "SM-F7310": "Galaxy Z Flip5",
    // 荣耀常见型号
    "ANY-AN00": "荣耀 Magic4 Pro",
    "PGT-AN00": "荣耀 Magic5",
    "PGT-AN10": "荣耀 Magic5 Pro",
    "BVL-AN00": "荣耀 Magic6",
    "BVL-AN10": "荣耀 Magic6 Pro",
    "FLP-AN00": "荣耀 Magic V2",
    "FLC-AN00": "荣耀 Magic Vs2",
    // iQOO 常见型号
    "V2056A": "iQOO 7",
    "V2120A": "iQOO 8",
    "V2171A": "iQOO 9",
    "V2243A": "iQOO 11",
    "V2254A": "iQOO 12",
    // 魅族常见型号
    "m2181": "魅族 20",
    "m2191": "魅族 20 Pro",
    "m2291": "魅族 21",
    "m2391": "魅族 21 Pro",
  };

  // ============================================================
  //  设置管理
  // ============================================================
  let settings = {
    enabled: true,
    showTooltip: true,
    clickToToggle: true,
    autoProcess: true,
  };

  function loadSettings() {
    try {
      const saved = GM_getValue(SETTINGS_KEY, null);
      if (saved && typeof saved === 'object') {
        settings = { ...settings, ...saved };
      }
    } catch (e) {
      log('加载设置失败:', e);
    }
  }

  function saveSettings() {
    try {
      GM_setValue(SETTINGS_KEY, settings);
    } catch (e) {
      log('保存设置失败:', e);
    }
  }

  // ============================================================
  //  数据库管理
  // ============================================================
  let modelsDB = {};

  function loadDatabase() {
    try {
      const saved = GM_getValue(STORAGE_KEY, null);
      if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
        modelsDB = saved;
        log(`📦 已加载数据库: ${Object.keys(modelsDB).length} 条记录`);
      } else {
        modelsDB = { ...BUILTIN_MODELS };
        log(`📦 使用内置数据: ${Object.keys(modelsDB).length} 条记录`);
      }
      buildIndexes(); // 构建索引
    } catch (e) {
      log('❌ 加载数据库失败:', e);
      modelsDB = { ...BUILTIN_MODELS };
      buildIndexes();
    }
  }

  function saveDatabase() {
    try {
      GM_setValue(STORAGE_KEY, modelsDB);
      GM_setValue(META_KEY, {
        version: 2,
        count: Object.keys(modelsDB).length,
        lastUpdate: new Date().toISOString()
      });
      buildIndexes(); // 重建索引
      log(`💾 数据库已保存: ${Object.keys(modelsDB).length} 条记录`);
      return true;
    } catch (e) {
      log('❌ 保存数据库失败:', e);
      alert('保存失败: ' + e.message);
      return false;
    }
  }

  // ============================================================
  //  构建索引（性能优化关键）
  // ============================================================
  function buildIndexes() {
    const start = performance.now();
    
    indexExact.clear();
    indexUpper.clear();
    indexBase.clear();
    indexPrefix.clear();
    searchCache.clear();

    for (const [code, name] of Object.entries(modelsDB)) {
      // 1. 精确索引
      indexExact.set(code, name);
      
      // 2. 大写索引
      const upper = code.toUpperCase();
      if (!indexUpper.has(upper)) {
        indexUpper.set(upper, name);
      }
      
      // 3. 去后缀索引（去除末尾单个字母）
      const base = code.replace(/[A-Za-z]$/, '');
      if (base.length >= 3 && base !== code && !indexBase.has(base)) {
        indexBase.set(base, name);
      }
      
      // 4. 前缀索引（取前4-6字符作为 key）
      for (let len = 4; len <= Math.min(6, code.length); len++) {
        const prefix = code.substring(0, len).toUpperCase();
        if (!indexPrefix.has(prefix)) {
          indexPrefix.set(prefix, []);
        }
        indexPrefix.get(prefix).push({ code, name });
      }
    }

    const elapsed = (performance.now() - start).toFixed(2);
    log(`📇 索引构建完成: ${indexExact.size} 条, 耗时 ${elapsed}ms`);
  }

  function clearDatabase() {
    if (confirm('确定清空数据库？此操作不可撤销。')) {
      modelsDB = {};
      GM_deleteValue(STORAGE_KEY);
      GM_deleteValue(META_KEY);
      log('🗑️ 数据库已清空');
      alert('数据库已清空');
      location.reload();
    }
  }

  function resetToBuiltin() {
    if (confirm('确定重置为内置数据？将清除所有导入的数据。')) {
      modelsDB = { ...BUILTIN_MODELS };
      saveDatabase();
      log('🔄 已重置为内置数据');
      alert('已重置为内置数据');
      location.reload();
    }
  }

  // ============================================================
  //  MD/TXT 解析器（支持多种格式）
  // ============================================================
  function parseMobileModelsMD(mdContent) {
    const models = {};
    const lines = mdContent.split('\n');
    let count = 0;

    for (const line of lines) {
      // 跳过空行和注释
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

      let match = null;

      // 格式1: `MODEL_CODE`: 友好名称 (MobileModels 格式)
      match = trimmed.match(/^`([^`]+)`(?:\s+`[^`]+`)*:\s*(.+)$/);
      if (match) {
        const code = match[1].trim();
        const name = match[2].trim();
        if (code && name) {
          models[code] = name;
          count++;
          continue;
        }
      }

      // 格式2: MODEL_CODE : 友好名称 (Apple 格式，冒号分隔)
      match = trimmed.match(/^([A-Za-z0-9_,.\-]+(?:\s+[A-Za-z0-9_,.\-]+)*)\s*:\s*(.+)$/);
      if (match) {
        const code = match[1].trim();
        const name = match[2].trim();
        if (code && name && code.length >= 2) {
          models[code] = name;
          count++;
          continue;
        }
      }

      // 格式3: MODEL_CODE 友好名称 (空格分隔，第一个空格前是代码)
      // 仅当行以常见设备前缀开头时匹配
      if (/^(iPhone|iPad|iPod|Watch|Mac|Apple)[\d,]/i.test(trimmed)) {
        const spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx > 0) {
          const code = trimmed.substring(0, spaceIdx).trim();
          const name = trimmed.substring(spaceIdx + 1).trim();
          if (code && name) {
            models[code] = name;
            count++;
            continue;
          }
        }
      }
    }

    log(`📋 解析完成: ${count} 条记录`);
    return models;
  }

  // ============================================================
  //  导入界面
  // ============================================================
  function showImportDialog() {
    // 移除已有对话框
    const existing = document.getElementById('acr-import-dialog');
    const existingOverlay = document.getElementById('acr-import-overlay');
    if (existing) existing.remove();
    if (existingOverlay) existingOverlay.remove();

    // 遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'acr-import-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 99998;
    `;
    overlay.onclick = () => { dialog.remove(); overlay.remove(); };
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.id = 'acr-import-dialog';
    dialog.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 99999; width: 520px; max-width: 90vw; max-height: 85vh; overflow: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    dialog.innerHTML = `
      <h3 style="margin:0 0 20px;color:#ff6b35;font-size:18px;">📥 导入 MobileModels 数据</h3>
      
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 10px;font-size:14px;color:#333;">方式一：选择文件</h4>
        <input type="file" accept=".md,.txt" multiple id="acr-file-input" 
               style="width:100%;padding:10px;border:2px dashed #ddd;border-radius:8px;cursor:pointer;">
        <p style="margin:8px 0 0;font-size:12px;color:#666;">
          💡 支持多个文件，格式：
          <br>• MobileModels: <code>xiaomi_cn.md</code> 等
          <br>• Apple 设备表: <code>Apple_mobile_device_types.txt</code>
        </p>
      </div>
      
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 10px;font-size:14px;color:#333;">方式二：粘贴文本</h4>
        <textarea id="acr-text-input" rows="6" 
                  placeholder="粘贴文件内容...&#10;&#10;支持格式:&#10;① MobileModels: \`RMX3619\`: 真我 GT Neo5 SE&#10;② Apple 设备表: iPhone3,1 : iPhone 4"
                  style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-family:monospace;font-size:12px;resize:vertical;"></textarea>
      </div>
      
      <div style="margin-bottom:20px;padding:12px;background:#f8f9fa;border-radius:8px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;">
          <input type="checkbox" id="acr-merge-mode" checked style="width:16px;height:16px;">
          <span style="font-size:14px;">合并模式（追加到现有数据）</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" id="acr-skip-existing" checked style="width:16px;height:16px;">
          <span style="font-size:14px;">跳过已存在的型号（不覆盖）</span>
        </label>
        <p style="margin:8px 0 0;font-size:12px;color:#666;">
          取消勾选"跳过已存在"将覆盖同名型号
        </p>
      </div>
      
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="acr-cancel-btn" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;cursor:pointer;background:#fff;font-size:14px;">
          取消
        </button>
        <button id="acr-import-btn" style="padding:10px 20px;border:none;border-radius:8px;cursor:pointer;background:#ff6b35;color:#fff;font-weight:bold;font-size:14px;">
          导入
        </button>
      </div>
      
      <div id="acr-import-status" style="margin-top:16px;display:none;padding:12px;border-radius:8px;font-size:14px;"></div>
    `;

    document.body.appendChild(dialog);

    // 事件绑定
    const fileInput = dialog.querySelector('#acr-file-input');
    const textInput = dialog.querySelector('#acr-text-input');
    const mergeMode = dialog.querySelector('#acr-merge-mode');
    const importBtn = dialog.querySelector('#acr-import-btn');
    const cancelBtn = dialog.querySelector('#acr-cancel-btn');
    const statusDiv = dialog.querySelector('#acr-import-status');

    cancelBtn.onclick = () => { dialog.remove(); overlay.remove(); };

    importBtn.onclick = async () => {
      const newModels = {};
      let fileCount = 0;
      let totalParsed = 0;

      log('📥 开始导入...');

      // 处理文件
      if (fileInput.files.length > 0) {
        log(`📁 选择了 ${fileInput.files.length} 个文件`);
        for (const file of fileInput.files) {
          try {
            const content = await file.text();
            log(`📄 读取文件 ${file.name}: ${content.length} 字符`);
            
            const parsed = parseMobileModelsMD(content);
            const parsedCount = Object.keys(parsed).length;
            
            if (parsedCount > 0) {
              Object.assign(newModels, parsed);
              fileCount++;
              totalParsed += parsedCount;
              log(`✅ 解析文件 ${file.name}: ${parsedCount} 条记录`);
              // 显示前3条示例
              const samples = Object.entries(parsed).slice(0, 3);
              samples.forEach(([k, v]) => log(`   ${k} → ${v}`));
            } else {
              log(`⚠️ 文件 ${file.name} 未解析出有效记录`);
            }
          } catch (e) {
            log(`❌ 读取文件失败: ${file.name}`, e);
          }
        }
      } else {
        log('📁 未选择文件');
      }

      // 处理粘贴文本
      const textContent = textInput.value.trim();
      if (textContent) {
        log(`📋 粘贴文本: ${textContent.length} 字符`);
        const parsed = parseMobileModelsMD(textContent);
        const parsedCount = Object.keys(parsed).length;
        if (parsedCount > 0) {
          Object.assign(newModels, parsed);
          fileCount++;
          totalParsed += parsedCount;
          log(`✅ 解析粘贴文本: ${parsedCount} 条记录`);
        } else {
          log('⚠️ 粘贴文本未解析出有效记录');
        }
      }

      const newModelsCount = Object.keys(newModels).length;
      log(`📊 解析结果: ${newModelsCount} 条记录`);

      if (newModelsCount === 0) {
        showStatus('❌ 未找到有效数据，请检查文件格式', 'error');
        return;
      }

      // 获取选项
      const skipExisting = dialog.querySelector('#acr-skip-existing').checked;
      
      // 统计重复项
      let duplicateCount = 0;
      let newCount = 0;
      
      if (mergeMode.checked) {
        log('🔀 合并模式');
        
        if (skipExisting) {
          // 跳过已存在的型号
          for (const [code, name] of Object.entries(newModels)) {
            if (modelsDB[code]) {
              duplicateCount++;
            } else {
              modelsDB[code] = name;
              newCount++;
            }
          }
          log(`📋 跳过 ${duplicateCount} 条已存在，新增 ${newCount} 条`);
        } else {
          // 覆盖已存在的型号
          for (const [code, name] of Object.entries(newModels)) {
            if (modelsDB[code]) {
              duplicateCount++;
            } else {
              newCount++;
            }
            modelsDB[code] = name; // 覆盖或新增
          }
          log(`📋 覆盖 ${duplicateCount} 条，新增 ${newCount} 条`);
        }
      } else {
        log('🔄 替换模式: 替换全部数据');
        modelsDB = { ...newModels };
        newCount = newModelsCount;
      }

      log(`💾 保存数据库: ${Object.keys(modelsDB).length} 条记录`);
      if (saveDatabase()) {
        const total = Object.keys(modelsDB).length;
        const statusMsg = skipExisting && duplicateCount > 0
          ? `✅ 新增 ${newCount} 条，跳过 ${duplicateCount} 条重复，数据库共 ${total} 条`
          : `✅ 成功导入 ${newCount} 条记录，数据库共 ${total} 条`;
        
        showStatus(statusMsg, 'success');
        log(`📥 导入完成: ${statusMsg}`);

        setTimeout(() => {
          dialog.remove();
          overlay.remove();
          
          const confirmMsg = duplicateCount > 0
            ? `导入完成！\n新增: ${newCount} 条\n跳过重复: ${duplicateCount} 条\n总计: ${total} 条\n\n是否刷新页面以应用更改？`
            : `导入成功！共 ${total} 条记录。\n是否刷新页面以应用更改？`;
          
          if (confirm(confirmMsg)) {
            location.reload();
          }
        }, 1500);
      }
    };

    function showStatus(msg, type) {
      statusDiv.style.display = 'block';
      statusDiv.textContent = msg;
      statusDiv.style.background = type === 'error' ? '#fef2f2' : '#f0fdf4';
      statusDiv.style.color = type === 'error' ? '#dc2626' : '#16a34a';
      statusDiv.style.border = `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`;
    }
  }

  // ============================================================
  //  数据库状态
  // ============================================================
  function showDatabaseStatus() {
    const meta = GM_getValue(META_KEY, {});
    const count = Object.keys(modelsDB).length;
    const lastUpdate = meta.lastUpdate ? new Date(meta.lastUpdate).toLocaleString() : '未知';

    const sampleEntries = Object.entries(modelsDB).slice(0, 5);
    const sampleText = sampleEntries.map(([k, v]) => `  ${k} → ${v}`).join('\n');

    const msg = `📊 数据库状态

记录数量: ${count}
最后更新: ${lastUpdate}
启用状态: ${settings.enabled ? '是' : '否'}

示例记录:
${sampleText || '  (无数据)'}`;

    alert(msg);
    log('📊 数据库状态:', { count, lastUpdate, enabled: settings.enabled });
  }

  // ============================================================
  //  导出数据库
  // ============================================================
  function exportDatabase() {
    const data = JSON.stringify(modelsDB, null, 2);
    try {
      GM_setClipboard(data, 'text');
      alert(`📋 已复制 ${Object.keys(modelsDB).length} 条记录到剪贴板\n\n可保存为 .json 文件备份`);
      log('📋 数据库已导出到剪贴板');
    } catch (e) {
      // 降级方案：显示文本
      const textarea = document.createElement('textarea');
      textarea.value = data;
      textarea.style.cssText = 'position:fixed;width:80vw;height:60vh;top:20;left:10%;z-index:99999;';
      document.body.appendChild(textarea);
      textarea.select();
      alert('请手动复制文本框中的内容');
    }
  }

  // ============================================================
  //  设置界面
  // ============================================================
  function showSettingsDialog() {
    const existing = document.getElementById('acr-settings-dialog');
    const existingOverlay = document.getElementById('acr-settings-overlay');
    if (existing) existing.remove();
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'acr-settings-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 99998;
    `;
    overlay.onclick = () => { dialog.remove(); overlay.remove(); };
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.id = 'acr-settings-dialog';
    dialog.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 99999; width: 400px; max-width: 90vw;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    dialog.innerHTML = `
      <h3 style="margin:0 0 20px;color:#ff6b35;font-size:18px;">⚙️ 脚本设置</h3>
      
      <div style="margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 0;">
          <input type="checkbox" id="acr-setting-enabled" ${settings.enabled ? 'checked' : ''} style="width:18px;height:18px;">
          <span style="font-size:14px;">启用脚本</span>
        </label>
      </div>
      
      <div style="margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 0;">
          <input type="checkbox" id="acr-setting-tooltip" ${settings.showTooltip ? 'checked' : ''} style="width:18px;height:18px;">
          <span style="font-size:14px;">显示原始型号提示</span>
        </label>
      </div>
      
      <div style="margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 0;">
          <input type="checkbox" id="acr-setting-toggle" ${settings.clickToToggle ? 'checked' : ''} style="width:18px;height:18px;">
          <span style="font-size:14px;">点击切换显示</span>
        </label>
      </div>
      
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;">
        <button id="acr-settings-cancel" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;cursor:pointer;background:#fff;font-size:14px;">
          取消
        </button>
        <button id="acr-settings-save" style="padding:10px 20px;border:none;border-radius:8px;cursor:pointer;background:#ff6b35;color:#fff;font-weight:bold;font-size:14px;">
          保存
        </button>
      </div>
    `;

    document.body.appendChild(dialog);

    const cancelBtn = dialog.querySelector('#acr-settings-cancel');
    const saveBtn = dialog.querySelector('#acr-settings-save');

    cancelBtn.onclick = () => { dialog.remove(); overlay.remove(); };

    saveBtn.onclick = () => {
      settings.enabled = dialog.querySelector('#acr-setting-enabled').checked;
      settings.showTooltip = dialog.querySelector('#acr-setting-tooltip').checked;
      settings.clickToToggle = dialog.querySelector('#acr-setting-toggle').checked;

      saveSettings();
      dialog.remove();
      overlay.remove();

      alert('设置已保存，刷新页面后生效');
      log('⚙️ 设置已保存:', settings);
    };
  }

  // ============================================================
  //  型号匹配（优化版 - 使用索引）
  // ============================================================
  function findFriendlyName(code) {
    if (!code || code.length < 3) return null;

    // 检查缓存
    if (searchCache.has(code)) {
      return searchCache.get(code);
    }

    let result = null;

    // 1. 精确匹配 - O(1)
    result = indexExact.get(code);
    if (result) {
      cacheResult(code, result);
      return result;
    }

    // 2. 大小写不敏感匹配 - O(1)
    const upperCode = code.toUpperCase();
    result = indexUpper.get(upperCode);
    if (result) {
      cacheResult(code, result);
      return result;
    }

    // 3. 去除版本后缀匹配 (如 V1821A → V1821) - O(1)
    const baseCode = code.replace(/[A-Za-z]$/, '');
    if (baseCode.length >= 3 && baseCode !== code) {
      result = indexBase.get(baseCode) || indexBase.get(baseCode.toUpperCase());
      if (result) {
        cacheResult(code, result);
        return result;
      }
    }

    // 4. 前缀匹配（快速缩小范围）- O(1) 查找 + O(k) 遍历
    for (let len = Math.min(6, code.length); len >= 4; len--) {
      const prefix = code.substring(0, len).toUpperCase();
      const candidates = indexPrefix.get(prefix);
      if (candidates) {
        for (const { code: k, name: v } of candidates) {
          if (k.includes(code) || code.includes(k)) {
            cacheResult(code, v);
            return v;
          }
        }
      }
    }

    // 5. 未找到，缓存 null
    cacheResult(code, null);
    return null;
  }

  // 缓存结果
  function cacheResult(code, result) {
    // 防止缓存过大
    if (searchCache.size >= CACHE_MAX_SIZE) {
      // 删除最早的 20% 条目
      const deleteCount = Math.floor(CACHE_MAX_SIZE * 0.2);
      const keys = searchCache.keys();
      for (let i = 0; i < deleteCount; i++) {
        searchCache.delete(keys.next().value);
      }
    }
    searchCache.set(code, result);
  }

  // ============================================================
  //  DOM 处理（优化版）
  // ============================================================
  let processedCount = 0;
  let processTimer = null;
  const PROCESSED_ATTR = 'data-acr-done';

  function processDeviceModels() {
    if (!settings.enabled) {
      log('⚠️ 脚本已禁用，跳过处理');
      return;
    }

    // 使用更高效的选择器，避免重复查询已处理元素
    const selector = `.deviceModel:not([${PROCESSED_ATTR}])`;
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) {
      log('🔍 未找到新的 .deviceModel 元素');
      return;
    }

    log(`🔍 找到 ${elements.length} 个待处理的 .deviceModel 元素`);
    let newProcessed = 0;
    let notFound = 0;

    elements.forEach(el => {
      // 双重检查（防止并发问题）
      if (el.hasAttribute(PROCESSED_ATTR)) return;

      const text = el.textContent.trim();
      if (!text) return;

      // 提取型号代码（通常是最后一部分）
      const parts = text.split(/\s+/);
      const modelCode = parts[parts.length - 1];
      
      const friendlyName = findFriendlyName(modelCode);
      if (friendlyName) {
        // 标记为已处理（使用属性比 dataset 更快）
        el.setAttribute(PROCESSED_ATTR, '1');
        el.dataset.original = text;
        
        // 始终设置 title 显示原始型号（悬停可见）
        el.title = `原始型号: ${text}\n点击可切换显示`;
        
        // 使用 textContent 而非 innerHTML（更安全更快）
        el.textContent = friendlyName;
        el.style.cursor = 'pointer';
        
        // 点击切换（使用事件委托会更好，但这里保持简单）
        if (settings.clickToToggle) {
          el.addEventListener('click', handleToggleClick, { once: false });
        }
        
        newProcessed++;
        log(`✅ ${modelCode} → ${friendlyName} (原文: ${text})`);
      } else {
        notFound++;
        log(`❓ 未匹配: ${modelCode} (原文: ${text})`);
      }
    });

    if (newProcessed > 0) {
      processedCount += newProcessed;
      log(`🔄 处理了 ${newProcessed} 个型号 (总计: ${processedCount})`);
    }
    if (notFound > 0) {
      log(`⚠️ ${notFound} 个型号未找到映射`);
    }
  }

  // 点击切换处理函数（提取出来避免重复绑定）
  function handleToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    const current = el.textContent;
    el.textContent = el.dataset.original;
    el.dataset.original = current;
    
    // 始终更新 title 显示当前的"原始型号"
    el.title = `原始型号: ${current}\n点击可切换显示`;
  }

  // ============================================================
  //  MutationObserver（防抖优化）
  // ============================================================
  let observer = null;
  let observerStarted = false;

  // 防抖函数
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // 防抖处理，避免频繁触发
  const debouncedProcess = debounce(() => {
    processDeviceModels();
  }, 150);

  function startObserver() {
    if (observerStarted) return;

    observer = new MutationObserver((mutations) => {
      // 快速检查是否有相关新增节点
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // 检查新增节点是否可能包含 deviceModel
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.classList?.contains('deviceModel') ||
                node.querySelector?.('.deviceModel') ||
                node.querySelector?.('.area-comment-from')
              ) {
                debouncedProcess();
                return; // 找到一个就够了
              }
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    observerStarted = true;
    log('👁️ MutationObserver 已启动');
  }

  // ============================================================
  //  URL 变化检测
  // ============================================================
  let lastUrl = location.href;

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      log('🔄 URL 变化，重新扫描...');
      setTimeout(processDeviceModels, 500);
    }
  }

  // 监听 popstate 和 pushState
  window.addEventListener('popstate', checkUrlChange);
  
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  
  history.pushState = function(...args) {
    origPush.apply(this, args);
    checkUrlChange();
  };
  
  history.replaceState = function(...args) {
    origReplace.apply(this, args);
    checkUrlChange();
  };

  // ============================================================
  //  初始化
  // ============================================================
  log('🔧 开始初始化...');
  loadSettings();
  loadDatabase();

  log(`⚙️ 设置状态: enabled=${settings.enabled}, 数据库=${Object.keys(modelsDB).length} 条`);

  // 初始处理
  if (settings.enabled) {
    // 立即处理已有元素
    processDeviceModels();
    
    // 启动 Observer 监听新元素
    startObserver();
    
    // 延迟再次处理，确保动态内容被覆盖
    setTimeout(() => {
      processDeviceModels();
      log('⏰ 延迟处理完成 (1s)');
    }, 1000);
    
    setTimeout(() => {
      processDeviceModels();
      log('⏰ 延迟处理完成 (3s)');
    }, 3000);
    
    // 页面完全加载后再处理一次
    window.addEventListener('load', () => {
      processDeviceModels();
      log('📄 页面 load 事件触发');
    });
  } else {
    log('⚠️ 脚本已禁用');
  }

  // ============================================================
  //  性能统计
  // ============================================================
  function showPerformanceStats() {
    const stats = {
      '数据库大小': `${indexExact.size} 条`,
      '索引数量': `精确:${indexExact.size} 大写:${indexUpper.size} 前缀:${indexPrefix.size}`,
      '搜索缓存': `${searchCache.size}/${CACHE_MAX_SIZE} 条`,
      '已处理元素': `${processedCount} 个`,
      '缓存命中率': searchCache.size > 0 ? `${((1 - searchCache.size / Math.max(1, processedCount)) * 100).toFixed(1)}%` : 'N/A',
    };

    const msg = `📊 性能统计

${Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join('\n')}

💡 优化说明:
• 精确/大写匹配: O(1) 哈希查找
• 前缀匹配: O(1) + O(k) 小范围遍历
• 搜索结果缓存: 避免重复计算
• DOM处理防抖: 150ms 批量处理
• MutationObserver: 智能过滤无关变更`;

    alert(msg);
    log('📊 性能统计:', stats);
  }

  // ============================================================
  //  调试功能
  // ============================================================
  function debugInfo() {
    const deviceModels = document.querySelectorAll('.deviceModel');
    const processed = document.querySelectorAll(`.deviceModel[${PROCESSED_ATTR}]`);
    
    const info = {
      '脚本版本': '2.0.0',
      '启用状态': settings.enabled,
      '数据库条数': Object.keys(modelsDB).length,
      '索引条数': indexExact.size,
      '页面 .deviceModel 元素': deviceModels.length,
      '已处理元素': processed.length,
      'Observer 状态': observerStarted ? '运行中' : '未启动',
    };

    // 采样一些未处理的元素
    const unprocessed = [];
    deviceModels.forEach(el => {
      if (!el.hasAttribute(PROCESSED_ATTR)) {
        const text = el.textContent.trim();
        const code = text.split(/\s+/).pop();
        unprocessed.push({ text, code, found: !!findFriendlyName(code) });
      }
    });

    const sampleText = unprocessed.slice(0, 5).map(u => 
      `  "${u.text}" → 代码: ${u.code} → ${u.found ? '✅ 可匹配' : '❌ 未匹配'}`
    ).join('\n');

    const msg = `🔍 调试信息

${Object.entries(info).map(([k, v]) => `${k}: ${v}`).join('\n')}

未处理元素采样:
${sampleText || '  (无)'}

💡 打开浏览器控制台 (F12) 查看详细日志`;

    alert(msg);
    log('🔍 调试信息:', info);
    log('📋 未处理元素:', unprocessed);
    
    // 测试解析器
    const testCode = 'RMX3619';
    log(`🧪 测试查找 "${testCode}":`, findFriendlyName(testCode));
  }

  // 强制重新处理
  function forceReprocess() {
    // 清除所有已处理标记
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
      // 恢复原始文本
      if (el.dataset.original) {
        el.textContent = el.dataset.original;
        delete el.dataset.original;
      }
    });
    
    // 清除搜索缓存
    searchCache.clear();
    
    // 重新处理
    processedCount = 0;
    processDeviceModels();
    
    log('🔄 强制重新处理完成');
    alert('已重新处理所有元素');
  }

  // ============================================================
  //  菜单注册
  // ============================================================
  GM_registerMenuCommand('📥 导入型号数据', showImportDialog);
  GM_registerMenuCommand('📊 查看数据库状态', showDatabaseStatus);
  GM_registerMenuCommand('📈 性能统计', showPerformanceStats);
  GM_registerMenuCommand('🔍 调试信息', debugInfo);
  GM_registerMenuCommand('🔄 强制重新处理', forceReprocess);
  GM_registerMenuCommand('⚙️ 脚本设置', showSettingsDialog);
  GM_registerMenuCommand('📋 导出数据库', exportDatabase);
  GM_registerMenuCommand('🗑️ 清空数据库', clearDatabase);

  // ============================================================
  //  启动日志
  // ============================================================
  const count = Object.keys(modelsDB).length;
  log(`🚀 AcFunDeviceReveal v2.0.0 | 数据库: ${count} 条记录 | 状态: ${settings.enabled ? '启用' : '禁用'}`);
  log(`📇 索引状态: 精确=${indexExact.size}, 大写=${indexUpper.size}, 前缀=${indexPrefix.size}`);
  
  // 测试解析器
  const testMD = '`RMX3619`: 真我 GT Neo5 SE\n`MI-ONE PLUS`: 小米 1 联通版';
  const testResult = parseMobileModelsMD(testMD);
  log('🧪 解析器测试:', testResult);
  
  // 测试查找
  if (count > 0) {
    const sampleCode = Object.keys(modelsDB)[0];
    log(`🧪 查找测试: "${sampleCode}" → "${findFriendlyName(sampleCode)}"`);
  }

  if (count === Object.keys(BUILTIN_MODELS).length && count < 100) {
    log('💡 提示: 使用内置数据，可通过菜单导入完整的 MobileModels 数据');
    
    // 首次使用提示
    setTimeout(() => {
      if (confirm('📱 欢迎使用 AcFunDeviceReveal！\n\n当前使用内置数据，建议导入完整的 MobileModels 数据以获得更多型号支持。\n\n是否现在导入？')) {
        showImportDialog();
      }
    }, 3000);
  }

})();
