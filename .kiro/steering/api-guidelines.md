---
inclusion: fileMatch
fileMatchPattern: "**/services/**"
---

# API 服务层开发指南

## 服务层结构
所有 API 请求封装在 `services/` 目录下，按业务模块划分。

## 网络请求规范

### 使用 Axios
项目使用 Axios 作为 HTTP 客户端，版本 v1.7.9。

### 请求配置
- 超时时间：10000ms（在 app.json 中配置）
- 基础 URL：根据环境配置

### 请求封装示例
```javascript
import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 token 等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 统一错误处理
    return Promise.reject(error);
  }
);

export default request;
```

### API 方法定义
```javascript
// services/goods.js
import request from './request';

export const getGoodsList = (params) => {
  return request({
    url: '/api/goods/list',
    method: 'GET',
    params
  });
};

export const getGoodsDetail = (id) => {
  return request({
    url: `/api/goods/${id}`,
    method: 'GET'
  });
};
```

## 错误处理
- 使用统一的错误处理器：`utils/error-handler.js`
- 在 API 调用处使用 try-catch 捕获错误
- 错误信息应该对用户友好

```javascript
try {
  const data = await getGoodsList(params);
  // 处理数据
} catch (error) {
  errorHandler.handleError(error);
}
```

## 数据模型
- 数据模型定义在 `model/` 目录
- 使用 TypeScript 风格的 JSDoc 注释

```javascript
/**
 * @typedef {Object} GoodsItem
 * @property {string} id - 商品ID
 * @property {string} name - 商品名称
 * @property {number} price - 商品价格
 * @property {string} image - 商品图片
 */
```
