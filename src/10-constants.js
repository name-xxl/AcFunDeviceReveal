  // ============================================================
  //  常量与配置：DOM 选择器、存储 key、各类阈值统一收拢于此
  //  A 站改版时只需调整本区块
  // ============================================================
  const VERSION = '2.1.0';

  const CONFIG = {
    LOG: {
      limit: 500,            // 内存日志上限（供"复制日志"导出）
    },
    OBSERVER: {
      domDebounceMs: 300,    // MutationObserver 防抖
      urlChangeDelayMs: 500, // 路由切换后等 DOM 稳定
    },
    // 设备型号美化
    DEVICE: {
      selector: '.deviceModel',
      processedAttr: 'data-acr-done',
      manualAttr: 'data-acr-manual',
      storageKey: 'acr_models_data',       // 沿用 v2.0.0 的 key，升级不丢已导入数据
      metaKey: 'acr_models_meta',
      settingsKey: 'acr_device_settings',
      cacheMaxSize: 500,
    },
  };
