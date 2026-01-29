# 民族服装电商小程序

一个集成 AI 民族服装设计功能的微信小程序电商平台。

## 项目截图

| 首页 | 商品列表 | 购物车 |
|---|---|---|
| ![首页](screenshots/home.jpg) | ![商品列表](screenshots/category.jpg) | ![购物车](screenshots/cart.jpg) |
| **个人中心** | **AI客服** | **在线设计** |
| ![个人中心](screenshots/profile.jpg) | ![AI客服](screenshots/ai-service.jpg) | ![在线设计](screenshots/design.jpg) |

## 项目简介

本项目是基于微信小程序原生框架开发的电商购物平台，提供完整的购物流程，并集成了 AI 民族服装设计功能，让用户可以体验智能化的服装设计服务。

## 技术栈

- **框架**: 微信小程序原生框架
- **UI 组件库**: TDesign Miniprogram v1.2.2
- **HTTP 客户端**: Axios v1.7.9
- **开发语言**: JavaScript (ES6+)

## 功能特性

### 核心功能
- 🏠 **首页**: 商品展示、分类导航、搜索功能
- 📦 **商品分类**: 多级分类浏览
- 🛒 **购物车**: 商品管理、规格选择、批量操作
- 👤 **个人中心**: 订单管理、地址管理、个人信息

### 特色功能
- 🎨 **AI 民族服装设计**: 智能化的民族服装设计服务
- 📱 **自定义 TabBar**: 流畅的导航体验
- 🚀 **分包加载**: 优化小程序性能
- 📊 **性能监控**: 实时监控页面性能
- 🔍 **错误追踪**: 统一的错误处理机制

## 项目结构

```
miniprogram-2/
├── pages/              # 页面目录
│   ├── home/          # 首页
│   ├── category/      # 分类页
│   ├── cart/          # 购物车
│   ├── my/            # 个人中心
│   ├── design/        # AI 设计页面
│   ├── goods/         # 商品详情（分包）
│   ├── order/         # 订单相关（分包）
│   ├── usercenter/    # 用户中心（分包）
│   └── ai-service/    # AI 服务（分包）
├── components/        # 自定义组件
│   ├── cart-bar/      # 购物车操作栏
│   ├── goods-card/    # 商品卡片
│   ├── search-bar/    # 搜索栏
│   └── ...
├── services/          # API 服务层
├── utils/             # 工具函数
│   ├── logger.js      # 日志工具
│   ├── error-handler.js  # 错误处理
│   └── performance-monitor.js  # 性能监控
├── model/             # 数据模型
├── config/            # 配置文件
├── assets/            # 静态资源
│   ├── images/        # 图片资源
│   └── ethnic-images/ # 民族服装图片
├── custom-tab-bar/    # 自定义 TabBar
├── app.js             # 小程序入口
├── app.json           # 全局配置
└── app.wxss           # 全局样式
```

## 快速开始

### 环境要求
- 微信开发者工具
- Node.js (推荐 v14+)

### 安装依赖
```bash
cd miniprogram-2
npm install
```

### 构建 npm
在微信开发者工具中：
1. 点击菜单栏：工具 -> 构建 npm
2. 等待构建完成

### 运行项目
1. 使用微信开发者工具打开项目根目录
2. 选择 `miniprogram-2` 作为小程序目录
3. 点击编译运行

## 开发规范

### 代码风格
- 缩进：2 个空格
- 引号：优先使用单引号
- 分号：使用分号结束语句
- ES6+：启用现代 JavaScript 语法

### 文件命名
- 页面/组件目录：小写字母 + 连字符（如 `order-confirm/`）
- JavaScript 文件：小写字母 + 连字符（如 `update-manager.js`）
- 配置文件：小写字母 + 点号（如 `project.config.json`）

### 组件开发
- 使用 TDesign 组件库作为基础 UI
- 自定义组件放在 `components/` 目录
- 每个组件包含 4 个文件：`.js`、`.json`、`.wxml`、`.wxss`

### 页面开发
- 主包页面：首页、分类、购物车、个人中心
- 分包页面：商品详情、订单、用户中心、AI 服务
- 使用懒加载策略优化性能

## 分包策略

项目采用分包加载优化性能：

- **goods 分包**: 商品详情页
- **order 分包**: 订单确认、订单列表、订单详情、支付、物流、评价
- **usercenter 分包**: 地址管理、个人信息、登录、收藏、发票、售后
- **ai-service 分包**: AI 服务相关页面

## 性能优化

- ✅ 分包加载
- ✅ 懒加载组件
- ✅ 图片懒加载
- ✅ 性能监控
- ✅ 请求超时控制（10s）

## 错误处理

项目集成了统一的错误处理机制：
- 开发环境：显示详细错误信息
- 生产环境：错误上报到服务器
- 用户友好的错误提示

## 日志管理

- 开发环境：DEBUG 级别
- 生产环境：INFO 级别
- 统一的日志格式和输出

## 配置说明

### AppID
在 `project.config.json` 中配置你的小程序 AppID：
```json
{
  "appid": "your-appid-here"
}
```

### API 地址
在 `config/` 目录下配置 API 基础地址和相关配置。

## 调试和测试

- **API 测试页面**: `pages/api-test/index`
- **调试页面**: `pages/debug/`
- 使用微信开发者工具的调试功能

## 版本更新

项目集成了自动更新检测功能，当有新版本时会自动提示用户更新。

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，欢迎提交 Issue。
