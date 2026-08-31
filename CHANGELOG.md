# 更新日志

所有重要更改都会记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，

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
