  // ============================================================
  //  存储封装：GM 读写统一 try/catch
  // ============================================================
  function readStorage(key, fallback) {
    try {
      return GM_getValue(key, fallback);
    } catch (e) {
      addLog('warn', `读取存储失败: ${key}`, e.message);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      GM_setValue(key, value);
      return true;
    } catch (e) {
      addLog('warn', `写入存储失败: ${key}`, e.message);
      return false;
    }
  }
