# 完整上下文与开发日志 (Development Log & Context)

## 📌 项目背景
本项目是一个名为 **NatureE** 的民族服饰电商小程序。
主要功能包括：
1.  **首页/分类页**：展示 25 个民族的特色服装。
2.  **商品详情页**：展示商品图片、价格、描述，并支持加入购物车和收藏。
3.  **下单流程**：地址选择、订单确认、模拟支付。
4.  **收藏功能**：用户可收藏商品并在个人中心查看。

---

## 📅 更新日期: 2026-01-21

### 1. 核心问题解决 (Critical Fixes)

#### A. 首页宫格分类 (Home Page Categories)
*   **问题**：首页宫格导航显示的是 Mock 数据（“手机数码”等），或者有正确文字但无图片。
*   **原因**：首页用了独立的 Mock 数据源 (`utils/request.js`)，且 WXML 期待的字段名 (`icon`) 与服务返回的 (`imgUrl`) 不一致。
*   **修复**：
    *   修改 `services/home/home.js`，不再使用 Mock API，而是直接从 `ethnic-goods.js` 中提取真实民族数据。
    *   统一字段名为 `icon`，确保与 `category-grid` 组件匹配。

#### B. 订单确认页 (Order Confirm Page)
*   **问题**：
    1.  WXML 编译报错 `get tag end without start`，导致页面无法编译。
    2.  用户希望直接在页面内切换“是否开发票”，而不是跳转新页面。
*   **修复**：
    *   彻底检查并修复了 `index.wxml` 的标签闭合结构，移除了多余的闭合标签。
    *   移除了跳转逻辑，替换为 `<switch>` 开关组件。
    *   在 JS 中添加了 `onInvoiceChange` 方法来处理状态变化。

#### C. 分类页 (Category Page)
*   **问题**：分类列表显示的是旧的 Mock 数据。
*   **修复**：修改 `index.js` 和 `fetchCategories.js`，使其动态读取 `ethnic-goods.js`，展示真实的民族分类。

#### D. 收藏功能 (Favorites)
*   **问题**：跳转“我的收藏”报错 `page not found`，且功能未闭环。
*   **修复**：
    *   在 `app.json` 中注册了 `pages/usercenter/favorites/index`。
    *   在详情页实现了 `onToggleFavorite`，将收藏状态写入 `wx.setStorage`。
    *   在收藏页实现了 `onShow` 读取 Storage 并渲染列表。

#### E. 图片资源 (Assets)
*   **问题**：大量图片引用错误（404/500），特别是 `ethnic_195.png` 丢失。
*   **修复**：
    *   重构了 `ethnic-goods.js`，使用批量重命名后的 `ethnic_X.png` 格式。
    *   将丢失图片的引用手动替换为可用图片 (`ethnic_44.png`) 作为兜底。
    *   详情页轮播图改为 `aspectFit` 模式，解决长图显示不全问题。

---

## 📂 关键文件变更 (File Changes)

### 1. `services/home/home.js`
> 首页数据获取服务
- **Change**: 引入 `ethnicGoodsList`，动态生成前 9 个民族 + “全部商品”作为分类导航。
- **Fix**: 字段映射从 `imgUrl` 改为 `icon`。

### 2. `pages/order/order-confirm/index.wxml` & `index.js`
> 订单确认页
- **Change**: 移除发票跳转入口，新增 `<switch>` 开关。
- **Fix**: 修复 WXML 标签嵌套错误。
- **Logic**: 新增 `onInvoiceChange` 处理函数。

### 3. `pages/goods/details/index.js`
> 商品详情页
- **Feature**: 实现 `onToggleFavorite` 和 `getDetail` 中的本地存储逻辑。

### 4. `pages/usercenter/favorites/index.js`
> 收藏页
- **Feature**: 实现 `onShow` 从 Storage 读取收藏列表。

### 5. `miniprogram-2/app.json`
> 小程序配置
- **Fix**: 注册 missing page `favorites/index`。

---

## 📝 遗留/待办事项 (TODOs)
1.  **支付流程**：目前的支付是 Mock 的，如果需要真实支付需对接微信支付 API。
2.  **样式微调**：订单确认页顶部的留白可能需要根据不同机型适配。
3.  **数据完整性**：目前的 `ethnic-goods.js` 只映射了部分图片，后续可继续完善。

---

## 🔧 Git 状态
- 所有修复已 Commit。
- Commit Message: `Fix homepage category icons and order confirmation invoice logic`
