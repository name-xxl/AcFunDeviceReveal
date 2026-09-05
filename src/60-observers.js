  // ============================================================
  //  MutationObserver + 路由监听：DOM 变化 / 翻页 / SPA 跳转后重新处理
  // ============================================================
  let domObserver = null;

  function startObserver() {
    if (domObserver) return;
    let debounceTimer = null;
    domObserver = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(onDomChange, CONFIG.OBSERVER.domDebounceMs);
    });
    domObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function onDomChange() {
    processDeviceModels();
  }

  let lastUrl = '';

  function checkUrl() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    addLog('info', `🔄 ${lastUrl}`);
    setTimeout(onDomChange, CONFIG.OBSERVER.urlChangeDelayMs);
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    checkUrl();
  };
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    checkUrl();
  };
  window.addEventListener('popstate', checkUrl);
