  // ============================================================
  //  启动
  // ============================================================
  loadDeviceDB();
  processDeviceModels();

  startObserver();
  registerMenus();
  setTimeout(onDomChange, CONFIG.OBSERVER.urlChangeDelayMs);
  setTimeout(checkUrl, 100);

  // 暴露纯函数与内部状态，供控制台调试和单元测试使用
  window.ACFunDeviceReveal = {
    version: VERSION,
    config: CONFIG,
    // 纯函数（可直接单测）
    findFriendlyName,
    parseDeviceModelsText,
    importDeviceModels,
    processDeviceModels,
    // 内部状态（只读调试用）
    getState: () => ({
      deviceEnabled: deviceSettings.enabled,
      deviceModels: Object.keys(deviceDB).length,
    }),
    getLogs: () => logs.slice(),
  };

  log(`🚀 AcFunDeviceReveal v${VERSION} | 设备库 ${Object.keys(deviceDB).length} 条${deviceSettings.enabled ? '' : ' (美化关闭)'}`);
})();
