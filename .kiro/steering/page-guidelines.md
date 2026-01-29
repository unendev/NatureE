---
inclusion: fileMatch
fileMatchPattern: "**/pages/**"
---

# 页面开发指南

## 页面结构
每个页面必须包含以下文件：
- `index.js` - 页面逻辑
- `index.json` - 页面配置
- `index.wxml` - 页面模板
- `index.wxss` - 页面样式

## 主包页面
- `pages/home/home/index` - 首页
- `pages/category/index` - 分类页
- `pages/cart/index` - 购物车
- `pages/my/index` - 个人中心

## 分包页面

### goods 分包
- `pages/goods/details/index` - 商品详情

### order 分包
- `pages/order/order-confirm/index` - 订单确认
- `pages/order/order-list/index` - 订单列表
- `pages/order/order-detail/index` - 订单详情
- `pages/order/order-payment/index` - 订单支付
- `pages/order/logistics/index` - 物流信息
- `pages/order/comment/index` - 订单评价

### usercenter 分包
- `pages/usercenter/address/list/index` - 地址列表
- `pages/usercenter/address/edit/index` - 地址编辑
- `pages/usercenter/person-info/index` - 个人信息
- `pages/usercenter/login/index` - 登录页
- `pages/usercenter/favorites/index` - 收藏夹
- `pages/usercenter/invoice/list/index` - 发票列表
- `pages/usercenter/after-sale/list/index` - 售后列表

### ai-service 分包
- `pages/ai-service/index` - AI 服务页面

## 页面开发规范

### 页面定义
```javascript
Page({
  data: {
    // 页面数据
  },
  
  onLoad(options) {
    // 页面加载
    const startTime = Date.now();
    performanceMonitor.recordPageLoad('pageName', startTime);
  },
  
  onShow() {
    // 页面显示
  },
  
  onReady() {
    // 页面初次渲染完成
  },
  
  onHide() {
    // 页面隐藏
  },
  
  onUnload() {
    // 页面卸载
  },
  
  // 自定义方法
  handleClick() {
    // 处理点击事件
  }
})
```

### 生命周期
- `onLoad`: 页面加载时触发，只触发一次
- `onShow`: 页面显示时触发
- `onReady`: 页面初次渲染完成时触发
- `onHide`: 页面隐藏时触发
- `onUnload`: 页面卸载时触发

### 性能监控
在 `onLoad` 中记录页面加载时间：
```javascript
onLoad(options) {
  const startTime = Date.now();
  performanceMonitor.recordPageLoad(this.route, startTime);
}
```

### 错误处理
使用 try-catch 包裹可能出错的代码：
```javascript
async loadData() {
  try {
    const data = await api.getData();
    this.setData({ data });
  } catch (error) {
    await errorHandler.handleError(error);
  }
}
```

### 页面配置
在 `index.json` 中配置页面：
```json
{
  "navigationBarTitleText": "页面标题",
  "usingComponents": {
    "goods-card": "/components/goods-card/index"
  }
}
```

## TabBar 页面
- 使用自定义 TabBar
- TabBar 实现在 `custom-tab-bar/` 目录
- TabBar 页面需要在 `app.json` 的 `tabBar.list` 中配置

## 页面跳转
```javascript
// 保留当前页面，跳转到应用内的某个页面
wx.navigateTo({
  url: '/pages/goods/details/index?id=123'
});

// 关闭当前页面，跳转到应用内的某个页面
wx.redirectTo({
  url: '/pages/order/order-list/index'
});

// 跳转到 tabBar 页面
wx.switchTab({
  url: '/pages/home/home/index'
});
```
