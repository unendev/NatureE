---
inclusion: fileMatch
fileMatchPattern: "**/components/**"
---

# 组件开发指南

## 组件结构
每个组件必须包含以下文件：
- `index.js` - 组件逻辑
- `index.json` - 组件配置
- `index.wxml` - 组件模板
- `index.wxss` - 组件样式

## 现有组件列表

### 购物车相关
- `cart-bar` - 购物车底部操作栏
- `cart-empty` - 购物车空状态
- `cart-group` - 购物车商品分组

### 商品相关
- `goods-card` - 商品卡片
- `goods-list` - 商品列表
- `specs-popup` - 规格选择弹窗
- `price` - 价格展示组件

### 分类相关
- `category-grid` - 分类网格

### 通用组件
- `search-bar` - 搜索栏
- `load-more` - 加载更多
- `error-tips` - 错误提示
- `swipeout` - 滑动操作

## 组件开发规范

### 组件定义
```javascript
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },
  
  properties: {
    // 定义组件属性
  },
  
  data: {
    // 组件内部数据
  },
  
  lifetimes: {
    attached() {
      // 组件生命周期
    }
  },
  
  methods: {
    // 组件方法
  }
})
```

### 属性定义
- 使用完整的属性定义格式
- 指定类型、默认值和观察器
```javascript
properties: {
  title: {
    type: String,
    value: '',
    observer(newVal, oldVal) {
      // 属性变化处理
    }
  }
}
```

### 事件触发
- 使用 `triggerEvent` 触发自定义事件
- 事件名使用小写字母和连字符
```javascript
this.triggerEvent('item-click', { id: itemId })
```

### 样式隔离
- 默认使用 `apply-shared` 样式隔离
- 允许外部样式类影响组件

### TDesign 组件使用
- 优先使用 TDesign 提供的组件
- 在组件 `.json` 中引入需要的 TDesign 组件
```json
{
  "component": true,
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button"
  }
}
```
