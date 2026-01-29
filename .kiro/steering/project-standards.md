---
inclusion: always
---

# 微信小程序项目开发规范

## 项目概述
这是一个基于微信小程序的电商购物平台，集成了 AI 民族服装设计功能。

## 技术栈
- **框架**: 微信小程序原生框架
- **UI 组件库**: TDesign Miniprogram v1.2.2
- **HTTP 客户端**: Axios v1.7.9
- **开发语言**: JavaScript (ES6+)

## 项目结构
```
miniprogram-2/
├── pages/          # 页面目录
│   ├── home/       # 首页
│   ├── category/   # 分类页
│   ├── cart/       # 购物车
│   ├── my/         # 个人中心
│   ├── design/     # AI 设计页面
│   └── ...
├── components/     # 自定义组件
├── services/       # API 服务层
├── utils/          # 工具函数
├── model/          # 数据模型
├── config/         # 配置文件
├── assets/         # 静态资源
└── custom-tab-bar/ # 自定义 TabBar
```

## 代码规范

### 文件命名
- 页面目录：使用小写字母和连字符，如 `order-confirm/`
- 组件目录：使用小写字母和连字符，如 `goods-card/`
- JavaScript 文件：使用小写字母和连字符，如 `update-manager.js`
- 配置文件：使用小写字母和点号，如 `project.config.json`

### 代码风格
- **缩进**: 2 个空格（根据 project.config.json 配置）
- **ES6**: 启用 ES6+ 语法
- **分号**: 使用分号结束语句
- **引号**: 优先使用单引号

### 组件开发
- 使用 TDesign 组件库作为基础 UI 组件
- 全局注册的组件：`t-button`, `t-icon`, `t-input`, `t-avatar`, `t-dialog`, `t-toast`
- 自定义组件放在 `components/` 目录下
- 每个组件包含：`.js`, `.json`, `.wxml`, `.wxss` 四个文件

### 页面开发
- 主包页面：首页、分类、购物车、个人中心
- 分包页面：商品详情、订单相关、用户中心、AI 服务
- 使用懒加载策略：`"lazyCodeLoading": "requiredComponents"`

## API 和服务

### 网络请求
- 使用 Axios 进行 HTTP 请求
- 请求超时时间：10000ms
- 服务层文件放在 `services/` 目录

### 错误处理
- 使用统一的错误处理器：`utils/error-handler.js`
- 开发环境禁用错误上报
- 生产环境启用错误上报到指定 URL

### 日志管理
- 使用统一的日志工具：`utils/logger.js`
- 开发环境：DEBUG 级别
- 生产环境：INFO 级别

### 性能监控
- 使用性能监控工具：`utils/performance-monitor.js`
- 记录页面加载时间
- 最大记录数：1000 条

## 开发流程

### 新增页面
1. 在 `pages/` 或对应分包目录下创建页面文件夹
2. 创建 `.js`, `.json`, `.wxml`, `.wxss` 四个文件
3. 在 `app.json` 的 `pages` 或 `subpackages` 中注册页面路径
4. 如果是 TabBar 页面，需要在 `tabBar.list` 中配置

### 新增组件
1. 在 `components/` 目录下创建组件文件夹
2. 创建组件的四个文件
3. 在需要使用的页面 `.json` 中引入组件

### 调试和测试
- 使用微信开发者工具进行调试
- 测试页面：`pages/api-test/index`
- 调试页面：`pages/debug/`

## 注意事项

### 权限配置
- 位置权限：用于展示位置相关功能
- 在 `app.json` 的 `permission` 中配置权限说明

### 版本更新
- 使用 `utils/update-manager.js` 检查小程序更新
- 在 `App.onShow()` 中调用更新检查

### 环境判断
- 通过 `__wxConfig.envVersion` 判断运行环境
- 环境类型：`develop`（开发版）、`trial`（体验版）、`release`（正式版）

### TabBar
- 使用自定义 TabBar：`custom: true`
- TabBar 实现在 `custom-tab-bar/` 目录

## AI 功能
- AI 民族服装设计功能位于 `pages/ai-service/` 和 `pages/design/`
- 相关资源在 `assets/ethnic-images/` 目录
