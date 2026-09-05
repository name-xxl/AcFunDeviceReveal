# AcFunDeviceReveal - A站手机型号美化脚本

[![GitHub stars](https://img.shields.io/github/stars/name-xxl/AcFunDeviceReveal.svg?style=social)](https://github.com/name-xxl/AcFunDeviceReveal/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/name-xxl/AcFunDeviceReveal.svg?style=social)](https://github.com/name-xxl/AcFunDeviceReveal/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v2.1.0-blue.svg)](https://github.com/name-xxl/AcFunDeviceReveal/releases)

> **📢 项目合并说明**
>
> 本项目的设备型号美化功能已于 [AcFun-Web-IP](https://github.com/name-xxl/AcFun-Web-IP) **v5.8.0** 合并，成为「IP 属地显示 + 设备型号美化」二合一脚本。
>
> - 需要 **IP 属地 + 设备美化** 二合一 → 请安装新仓库 [**AcFun-Web-IP**](https://github.com/name-xxl/AcFun-Web-IP)
> - 只需要 **设备型号美化**（不含 IP 功能）→ 继续使用本仓库，v2.1.0 起为模块化重构版本，后续在此维护

## 📖 项目简介

A站（AcFun）评论区会显示用户发帖时使用的设备型号，但展示的是厂商内部代号（如 `RMX3619`、`iPhone3,1`、`NOH-AN00`），普通用户难以直观识别。

本油猴脚本通过内置数据库和用户自主导入的方式，将这些晦涩的内部代号转换为用户友好的设备名称，让评论区的设备信息一目了然。

| 原始显示 | 美化后 |
|----------|--------|
| `realme RMX3619` | `真我 GT Neo5 SE` |
| `iPhone3,1` | `iPhone 4` |
| `HUAWEI NOH-AN00` | `华为 Mate 40 Pro` |
| `V2324A` | `vivo X100` |
| `SM-S9280` | `Galaxy S24 Ultra` |

---

## ✨ 功能特性

- 🔄 **自动美化** - 页面加载、翻页、SPA 跳转时自动替换设备型号
- 📱 **内置数据** - ~1000 条主流机型（由脚本从上游数据自动生成，见下文）
- 📥 **数据导入** - 面板内导入 MobileModels `.md` / Apple 设备表 `.txt` / 粘贴文本，支持合并与跳过已存在条目
- 💾 **持久存储** - 数据保存在本地，刷新不丢失
- 🖱️ **点击切换** - 点击型号可切换显示原始/友好名称
- ⚙️ **原生风格面板** - 仿 A 站原生弹窗的设置面板，导入/重置全程 Toast 提示，无 alert/confirm 打断

### 匹配策略（四级）

1. **精确匹配** - O(1) 哈希查找
2. **大小写不敏感** - O(1) 大写索引
3. **去尾字母变体** - O(1)（如 `V2324B` → `V2324A`）
4. **前缀包含** - O(1) 定位 + 小范围遍历

查找结果带缓存（上限 500 条，含未命中），避免重复计算。

---

## 📦 安装

### 前置条件

安装以下任一用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)（推荐）
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### 安装脚本

任选其一：

1. **从 Release 安装（推荐）**：到 [Releases](https://github.com/name-xxl/AcFunDeviceReveal/releases) 下载最新版 `AcFunDeviceReveal.user.js`，Tampermonkey 会自动提示安装
2. **手动粘贴**：点击脚本管理器图标 → 「添加新脚本」→ 粘贴 `dist/AcFunDeviceReveal.user.js` 的内容 → 保存（Ctrl+S）

---

## 🚀 使用方法

安装后直接访问 A站 页面，脚本会自动运行。点击油猴菜单「⚙️ 设置面板」进行配置：

| 面板项 | 说明 |
|--------|------|
| 设备型号美化开关 | 即时生效，关闭后停止替换 |
| 设备数据 · 导入 | 选择文件（可多选）或粘贴文本，支持 MobileModels / Apple 两种格式 |
| 设备数据 · 导出 | 复制当前数据库 JSON 到剪贴板 |
| 设备数据 · 重置 | 两步确认后恢复为内置数据（清除导入的数据） |

### 油猴菜单

| 菜单 | 功能 |
|------|------|
| ⚙️ 设置面板 | 打开设置面板 |
| 🔄 强制重新处理 | 清除标记，按当前文本重新匹配 |
| 📋 复制全部日志 | 复制运行日志（反馈问题时附上） |

### 支持的数据格式

| 格式 | 示例 | 来源 |
|------|------|------|
| `` `MODEL_CODE`: 名称 `` | `` `RMX3619`: 真我 GT Neo5 SE `` | [MobileModels](https://github.com/KHwang9883/MobileModels) |
| `MODEL_CODE : 名称` | `iPhone3,1 : iPhone 4` | [Apple 设备表](https://gist.github.com/adamawolf/3048717) |

> **📥 更新型号数据**：内置数据为常用机型快照（~1000 条）。如需完整数据（~8000+ 条），下载 [MobileModels](https://github.com/KHwang9883/MobileModels) 的 `.md` 文件和 [Apple 设备表](https://gist.github.com/adamawolf/3048717) 的 `.txt` 文件，在面板「导入」中选择即可。

---

## 🔧 技术细节

### 项目结构（拼接式模块化，无打包器依赖）

```
src/
  00-header.js        油猴元数据 + IIFE 开头
  10-constants.js     CONFIG：DOM 选择器、存储 key、阈值
  20-utils.js         分级日志 + 有界内存日志队列
  30-storage.js       GM 存储封装
  40-device-data.js   内置型号表（~1000 条，由 tools/gen-device-data.js 生成，勿手改）
  50-device.js        四级匹配、文本解析、导入/导出/重置、DOM 替换、面板区块
  60-observers.js     MutationObserver / 路由监听
  70-panel.js         设置面板（仿 A 站原生，主色 #fd4c5d）+ Toast
  80-menu.js          油猴菜单（3 项）
  90-main.js          启动流程 + window.ACFunDeviceReveal 调试接口
```

```bash
node build.js            # 拼接 src/ -> dist/AcFunDeviceReveal.user.js（含版本一致性校验）
node tools/unit-test.js  # 单元测试：纯函数输入输出
node tools/smoke-test.js # 冒烟测试：语法、版本、关键函数
node tools/gen-device-data.js <MobileModels 数据目录>  # 重新生成内置型号表
```

版本号需同步三处：`package.json`、`src/00-header.js` 的 `@version`、`src/10-constants.js` 的 `VERSION`，build.js 会校验，不一致直接报错。

### 调试接口

脚本暴露 `window.ACFunDeviceReveal`，可在控制台直接调用：

```js
ACFunDeviceReveal.findFriendlyName('RMX3700')   // → '真我 GT Neo5 SE'
ACFunDeviceReveal.parseDeviceModelsText(text)    // 解析导入文本
ACFunDeviceReveal.processDeviceModels()          // 手动触发替换
ACFunDeviceReveal.getState()                     // 内部状态
ACFunDeviceReveal.getLogs()                      // 运行日志
```

### 存储使用

- `acr_models_data` - 型号数据库（沿用 v2.0.0 的 key，升级不丢已导入数据）
- `acr_models_meta` - 元数据（数量、更新时间）
- `acr_device_settings` - 用户设置

---

## ❓ FAQ

### Q: 导入后不生效？

A: 点击菜单「🔄 强制重新处理」或刷新页面。

### Q: 如何更新数据？

A: 在面板「导入」重新导入即可，勾选「跳过已存在的型号」可只添加新数据。

### Q: 支持哪些浏览器？

A: 支持所有能安装 Tampermonkey 的浏览器（Chrome、Firefox、Edge、Safari 等）。

### Q: 会泄露隐私吗？

A: 不会。脚本完全本地运行，不上传任何数据。

### Q: 想要 IP 属地显示功能？

A: 请安装二合一版本 [AcFun-Web-IP](https://github.com/name-xxl/AcFun-Web-IP)。

---

## 📋 数据来源

本项目的设备型号数据来自以下开源项目（内置表由 `tools/gen-device-data.js` 自动生成）：

### MobileModels - 手机品牌型号汇总

- **仓库**: [KHwang9883/MobileModels](https://github.com/KHwang9883/MobileModels)
- **内容**: 汇总各厂商上市的手机型号与对应的传播名（安卓各品牌国行数据）
- **许可**: CC BY-NC-SA 4.0

### Apple Mobile Device Types

- **Gist**: [adamawolf/Apple_mobile_device_types](https://gist.github.com/adamawolf/3048717)
- **内容**: Apple 设备内部型号映射（iPhone/iPad/iPod/Apple Watch）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 更新型号数据

内置表由脚本生成，不建议手改 `src/40-device-data.js`。更新方式：

1. 准备 [MobileModels](https://github.com/KHwang9883/MobileModels) 仓库内容（含各品牌 `.md` 与 Apple `.txt`）
2. 运行 `node tools/gen-device-data.js <数据目录>`
3. 提交 PR

### 报告问题

请提供以下信息：
- 浏览器和版本
- 脚本管理器和版本
- 控制台日志（油猴菜单「📋 复制全部日志」或 F12 → Console）
- 问题截图

---

## 📜 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。内置型号数据遵循上游许可（MobileModels 为 CC BY-NC-SA 4.0）。

---

## 🙏 致谢

感谢以下开源项目提供数据支持：

- [**KHwang9883/MobileModels**](https://github.com/KHwang9883/MobileModels) - 手机品牌型号汇总
- [**adamawolf/Apple_mobile_device_types**](https://gist.github.com/adamawolf/3048717) - Apple 设备型号对照表

---

## 📊 统计

- 内置型号: ~1000 条（由上游数据自动生成）
- 完整数据: ~8000+ 条（导入 MobileModels 后）
- 支持品牌: Apple、小米/Redmi/POCO、华为、荣耀、OPPO/一加/realme、vivo/iQOO、三星、魅族等

---

## 🔗 相关链接

- [AcFunDeviceReveal](https://github.com/name-xxl/AcFunDeviceReveal) - 本项目 GitHub 仓库（纯设备美化）
- [AcFun-Web-IP](https://github.com/name-xxl/AcFun-Web-IP) - 二合一版本（IP 属地 + 设备美化）
- [AcFun](https://www.acfun.cn/) - A站官网
- [MobileModels](https://github.com/KHwang9883/MobileModels) - 手机品牌型号汇总
- [Apple Device Types](https://gist.github.com/adamawolf/3048717) - Apple 设备型号
- [Tampermonkey](https://www.tampermonkey.net/) - 用户脚本管理器

---

<p align="center">Made with ❤️ for AcFun users</p>
