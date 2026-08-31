# AcFunDeviceReveal - A站手机型号美化脚本

> 将 A站（AcFun）评论区的手机内部代号替换为用户友好的设备名称

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v2.0.0-blue.svg)](https://www.tampermonkey.net/)

---

## 📖 简介

A站评论区会显示用户发帖时使用的设备型号，但显示的是厂商内部代号（如 `RMX3619`、`iPhone3,1`），普通用户难以识别。

本脚本通过内置数据库和用户导入的方式，将这些内部代号转换为友好的设备名称：

| 原始显示 | 美化后 |
|----------|--------|
| `realme RMX3619` | `真我 GT Neo5 SE` |
| `iPhone3,1` | `iPhone 4` |
| `HUAWEI NOH-AN00` | `华为 Mate 40 Pro` |
| `V2324A` | `vivo X100` |
| `SM-S9280` | `Galaxy S24 Ultra` |

---

## ✨ 功能特性

### 核心功能

- 🔄 **自动美化** - 页面加载时自动替换设备型号
- 📥 **数据导入** - 支持导入 MobileModels 和 Apple 设备表
- 💾 **持久存储** - 数据保存在本地，刷新不丢失
- 🖱️ **点击切换** - 点击型号可切换显示原始/友好名称

### 支持的数据格式

| 格式 | 示例 | 来源 |
|------|------|------|
| `` `MODEL_CODE`: 名称 `` | `` `RMX3619`: 真我 GT Neo5 SE `` | [MobileModels](https://github.com/KHwang9883/MobileModels) |
| `MODEL_CODE : 名称` | `iPhone3,1 : iPhone 4` | [Apple 设备表](https://gist.github.com/adamawolf/3048717) |

### 内置数据覆盖

- ✅ Apple 全系列（iPhone/iPad/iPod/Apple Watch）
- ✅ 小米/Redmi/POCO 近年机型
- ✅ 华为/荣耀 近年机型
- ✅ OPPO/一加/realme 近年机型
- ✅ vivo/iQOO 近年机型
- ✅ 三星 Galaxy 近年机型
- ✅ 魅族 近年机型

### 性能优化

- 📇 **索引系统** - 使用 Map 哈希表实现 O(1) 查找
- 🔍 **搜索缓存** - 最近查询结果缓存，避免重复计算
- ⚡ **DOM 防抖** - 150ms 批量处理，减少重排
- 👁️ **智能监听** - MutationObserver 只处理相关变更

---

## 📦 安装

### 前置条件

安装以下任一用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)（推荐）
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### 安装脚本

1. 点击脚本管理器图标 → 「添加新脚本」
2. 将 `AcFunDeviceReveal.user.js` 的内容粘贴进去
3. 保存（Ctrl+S）

---

## 🚀 使用方法

### 基本使用

安装后直接访问 A站 页面，脚本会自动运行。

### 导入完整数据（推荐）

1. 点击脚本管理器图标 → 选择「📥 导入型号数据」
2. 选择文件：
   - [MobileModels](https://github.com/KHwang9883/MobileModels) 的 `.md` 文件（支持多选）
   - [Apple 设备表](https://gist.github.com/adamawolf/3048717) 的 `.txt` 文件
3. 点击「导入」

### 菜单功能

| 菜单 | 功能 |
|------|------|
| 📥 导入型号数据 | 打开导入界面 |
| 📊 查看数据库状态 | 显示记录数量和示例 |
| 📈 性能统计 | 查看索引和缓存状态 |
| 🔍 调试信息 | 显示页面元素和匹配情况 |
| 🔄 强制重新处理 | 清除标记，重新扫描 |
| ⚙️ 脚本设置 | 启用/禁用、提示、切换等 |
| 📋 导出数据库 | 复制数据到剪贴板 |
| 🗑️ 清空数据库 | 清除所有数据 |

---

## 📋 数据来源

本项目的设备型号数据来自以下开源项目：

### MobileModels - 手机品牌型号汇总

- **仓库**: [KHwang9883/MobileModels](https://github.com/KHwang9883/MobileModels)
- **内容**: 汇总各厂商上市的手机型号与对应的传播名
- **覆盖**: 小米、华为、OPPO、vivo、三星、苹果等主流品牌
- **格式**: `` `MODEL_CODE`: 友好名称 ``

### Apple Mobile Device Types

- **Gist**: [adamawolf/Apple_mobile_device_types](https://gist.github.com/adamawolf/3048717)
- **内容**: Apple 设备内部型号映射（iPhone/iPad/iPod/Apple Watch）
- **格式**: `MODEL_CODE : 友好名称`

---

## 🔧 技术细节

### 脚本架构

```
┌─────────────────────────────────────────────────────────┐
│                 AcFunDeviceReveal.user.js                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 解析器      │  │ 索引系统    │  │ 设置管理        │  │
│  │ (多格式)    │  │ (Map缓存)   │  │ (GM存储)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │           DOM 处理 + MutationObserver              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 匹配策略

1. **精确匹配** - O(1) 哈希查找
2. **大小写不敏感** - O(1) 大写索引
3. **去后缀匹配** - O(1) 基础索引（如 `V1821A` → `V1821`）
4. **前缀匹配** - O(1) + O(k) 小范围遍历

### 存储使用

- `acr_models_data` - 型号数据库
- `acr_models_meta` - 元数据（版本、数量、更新时间）
- `acr_device_settings` - 用户设置

---

## ❓ FAQ

### Q: 导入后不生效？

A: 点击菜单「🔄 强制重新处理」或刷新页面。

### Q: 如何更新数据？

A: 重新导入即可，勾选「合并模式」+「跳过已存在的型号」可只添加新数据。

### Q: 支持哪些浏览器？

A: 支持所有能安装 Tampermonkey 的浏览器（Chrome、Firefox、Edge、Safari 等）。

### Q: 会泄露隐私吗？

A: 不会。脚本完全本地运行，不上传任何数据。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 添加新型号

1. Fork 本项目
2. 编辑 `BUILTIN_MODELS` 添加新型号
3. 提交 PR

### 报告问题

请提供以下信息：
- 浏览器和版本
- 脚本管理器和版本
- 控制台日志（F12 → Console）
- 问题截图

---

## 📜 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

---

## 🙏 致谢

感谢以下开源项目提供数据支持：

- [**KHwang9883/MobileModels**](https://github.com/KHwang9883/MobileModels) - 手机品牌型号汇总
  - 汇总各厂商上市的手机型号与对应的传播名
  - 许可证: CC BY-NC-SA 4.0

- [**adamawolf/Apple_mobile_device_types**](https://gist.github.com/adamawolf/3048717) - Apple 设备型号映射
  - 提供 iPhone/iPad/iPod/Apple Watch 的内部型号对照表

---

## 📊 统计

- 内置型号: ~200 条（常见机型）
- 完整数据: ~8000+ 条（导入 MobileModels 后）
- 支持品牌: 小米、华为、OPPO、vivo、三星、苹果、荣耀、一加、realme、魅族等

---

## 🔗 相关链接

- [AcFun](https://www.acfun.cn/) - A站官网
- [MobileModels](https://github.com/KHwang9883/MobileModels) - 手机品牌型号汇总
- [Apple Device Types](https://gist.github.com/adamawolf/3048717) - Apple 设备型号
- [Tampermonkey](https://www.tampermonkey.net/) - 用户脚本管理器

---

<p align="center">Made with ❤️ for AcFun users</p>
