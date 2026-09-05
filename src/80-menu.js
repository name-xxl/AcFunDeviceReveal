  // ============================================================
  //  油猴菜单（3 项：设置面板 / 强制重新处理 / 复制日志）
  // ============================================================
  function copyLogs() {
    const text = [
      `=== AcFunDeviceReveal v${VERSION} ===`,
      `时间: ${new Date().toLocaleString()}`,
      `页面: ${location.href}`,
      `设备库: ${Object.keys(deviceDB).length} 条`,
      `=============================`,
      ...logs,
    ].join('\n');
    GM_setClipboard?.(text, 'text');
    showToast('日志已复制');
  }

  function registerMenus() {
    if (typeof GM_registerMenuCommand === 'undefined') return;
    const commands = [
      { title: '⚙️ 设置面板', run: () => openPanel() },
      { title: '🔄 强制重新处理', run: forceReprocessDevices },
      { title: '📋 复制全部日志', run: copyLogs },
    ];
    for (const command of commands) GM_registerMenuCommand(command.title, command.run);
  }
