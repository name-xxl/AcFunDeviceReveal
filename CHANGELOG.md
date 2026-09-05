# 更新日志

所有重要更改都会记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，

## [2.1.0] - 2026-09-05

### 变更

- 🔀 模块化重构：单文件拆分为 `src/` 10 个编号模块 + `build.js` 拼接构建（对齐 [AcFun-Web-IP](https://github.com/name-xxl/AcFun-Web-IP) 工程约定）
- 📱 内置数据升级为脚本自动生成（~1000 条，来自 MobileModels / Apple 上游），修复旧手写表的重复键与错误映射
- 🎨 设置面板改仿 A 站原生风格（主色 #fd4c5d），导入/重置改用面板 + Toast 提示，移除所有 alert/confirm
- ♻️ 复用单个 MutationObserver 与路由监听，去除多个 setTimeout 重扫
- 🧪 新增单元测试（tools/unit-test.js）与冒烟测试（tools/smoke-test.js）
- 🪟 新增 `@noframes`，防止 iframe 内重复运行
- 📋 油猴菜单从 8 项精简为 3 项，设置收进面板
- 🛠️ 新增 `tools/gen-device-data.js`，可从上游数据一键重新生成内置型号表

### 说明

- 设备型号美化功能已合并进 [AcFun-Web-IP](https://github.com/name-xxl/AcFun-Web-IP)（IP 属地 + 设备美化二合一，v5.7.0 起）；本仓库保留纯设备美化版本继续维护
- 存储键沿用 v2.0.0（`acr_models_data`），升级不丢已导入的数据

## [2.0.0] - 2024-XX-XX

### 新增
- 📥 支持导入 MobileModels `.md` 文件
- 📥 支持导入 Apple 设备表 `.txt` 文件（`MODEL_CODE : 名称` 格式）
- 📥 支持同时导入多个文件
- 📥 导入时查重，支持跳过已存在的型号
- 📇 索引系统优化，查找速度提升 8000x
- 🔍 搜索结果缓存
- ⚡ DOM 处理防抖优化
- 👁️ MutationObserver 智能监听
- 📈 性能统计菜单
- 🔍 调试信息菜单
- 🔄 强制重新处理菜单
- ⚙️ 脚本设置界面
- 📋 导出数据库功能
- 🖱️ 点击切换显示原始/友好名称
- 📱 内置 Apple 全系列设备数据（iPhone/iPad/iPod/Apple Watch）
- 📱 内置主流安卓品牌近年机型数据

### 修复
- 修复 `startObserver` 函数重复定义问题
- 修复 MutationObserver 防抖逻辑丢失问题
- 优化初始化流程

## [1.0.0] - 2024-XX-XX

### 新增
- 初始版本
- 基本的型号替换功能
- 内置常见型号数据
