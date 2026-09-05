  // ============================================================
  //  设置面板：仿 A 站原生弹窗（浅色主题，主色 #fd4c5d）
  //  入口：油猴菜单「⚙️ 设置面板」
  // ============================================================
  const ACR_Z_INDEX = 2147483000;

  function ensurePanelStyle() {
    if (document.getElementById('acr-panel-style')) return;
    const style = document.createElement('style');
    style.id = 'acr-panel-style';
    style.textContent = `
      .acr-mask{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:${ACR_Z_INDEX};display:flex;align-items:center;justify-content:center}
      .acr-panel{width:340px;max-width:92vw;background:#fff;border-radius:6px;color:#666;
        font:12px/1.6 PingFangSC,-apple-system,Microsoft Yahei,sans-serif;
        box-shadow:0 6px 24px rgba(0,0,0,.25);overflow:hidden}
      .acr-panel-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 4px}
      .acr-panel-title{font-size:14px;font-weight:600;color:#333}
      .acr-panel-close{cursor:pointer;font-size:20px;line-height:1;color:#999;transition:color .2s}
      .acr-panel-close:hover{color:#fd4c5d}
      .acr-panel-body{padding:4px 14px 8px}
      .acr-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0}
      .acr-row:last-child{border-bottom:none}
      .acr-switch{position:relative;width:40px;height:22px;border-radius:11px;background:#ddd;cursor:pointer;transition:background .2s;flex:none}
      .acr-switch::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s}
      .acr-switch.on{background:#fd4c5d}
      .acr-switch.on::after{left:20px}
      .acr-actions{display:flex;gap:6px}
      .acr-actions button{border:1px solid #999;background:#f4f4f4;color:#666;font-size:12px;padding:3px 12px;border-radius:3px;cursor:pointer;transition:.15s;line-height:16px}
      .acr-actions button:hover{background:#e5e5e5}
      .acr-actions button.acr-danger{background:#fff;border-color:#f5222d;color:#f5222d}
      .acr-actions button.acr-danger:hover{background:#fff1f0}
      .acr-panel-foot{padding:10px 14px;font-size:11px;color:#999;background:#fafafa;border-top:1px solid #f0f0f0}
    `;
    document.head.appendChild(style);
  }

  function closePanel() {
    document.querySelectorAll('.acr-mask').forEach(el => el.remove());
  }

  function mkPanelBtn(text, onClick, extraClass) {
    const btn = document.createElement('button');
    btn.textContent = text;
    if (extraClass) btn.classList.add(extraClass);
    btn.addEventListener('click', onClick);
    return btn;
  }

  function openPanel() {
    ensurePanelStyle();
    closePanel();

    const mask = document.createElement('div');
    mask.className = 'acr-mask';
    mask.addEventListener('click', closePanel);

    const panel = document.createElement('div');
    panel.className = 'acr-panel';
    // 阻止面板内部的点击冒泡到遮罩导致误关
    panel.addEventListener('click', e => e.stopPropagation());

    // —— 头部
    const head = document.createElement('div');
    head.className = 'acr-panel-head';
    const title = document.createElement('span');
    title.className = 'acr-panel-title';
    title.textContent = 'AcFunDeviceReveal 设置';
    const close = document.createElement('span');
    close.className = 'acr-panel-close';
    close.textContent = '×';
    close.addEventListener('click', closePanel);
    head.append(title, close);

    const body = document.createElement('div');
    body.className = 'acr-panel-body';

    // —— 设备型号美化：开关 + 数据管理（50-device.js）
    buildDeviceRows(body);

    const foot = document.createElement('div');
    foot.className = 'acr-panel-foot';
    foot.textContent = `v${VERSION} · 数据来源 MobileModels / Apple 设备表，导入后本地保存`;

    panel.append(head, body, foot);
    mask.appendChild(panel);
    document.body.appendChild(mask);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    }, { once: true });
  }

  // ============================================================
  //  Toast 轻提示（替代 alert）
  // ============================================================
  function showToast(message) {
    let container = document.getElementById('acr-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'acr-toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;display:flex;flex-direction:column;gap:6px;pointer-events:none';
      document.body.appendChild(container);
    }
    if (!document.getElementById('acr-toast-style')) {
      const style = document.createElement('style');
      style.id = 'acr-toast-style';
      style.textContent = `
        .acr-toast{background:rgba(0,0,0,.75);color:#fff;font:13px/1.4 PingFangSC,-apple-system,Microsoft Yahei,sans-serif;padding:8px 20px;border-radius:4px;box-shadow:0 2px 12px rgba(0,0,0,.2);animation:acr-toast-in .2s ease-out;white-space:nowrap}
        .acr-toast.out{opacity:0;transition:opacity .3s}
        @keyframes acr-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `;
      document.head.appendChild(style);
    }
    const toast = document.createElement('div');
    toast.className = 'acr-toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 2000);
  }
