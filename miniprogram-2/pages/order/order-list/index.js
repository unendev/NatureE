import { config as globalConfig } from '../../../config/index';
import { config as orderConfig, orderStatusMap } from '../config';
import orderManager from '../../../utils/order-manager';
import { OrderStatus } from '../config';
import { showToast, showModal } from '../../../utils/util';
import { images } from '../../../config/images';

// 标签页配置
const tabs = [
  { text: '全部', value: -1 },
  { text: '待付款', value: OrderStatus.PENDING_PAYMENT },
  { text: '待发货', value: OrderStatus.PENDING_DELIVERY },
  { text: '待收货', value: OrderStatus.PENDING_RECEIPT },
  { text: '待评价', value: OrderStatus.PENDING_COMMENT }
];

Page({
  data: {
    tabs,
    curTab: -1,
    orderList: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: orderConfig.orderList.pageSize,
    scrollTop: 0,
    OrderStatus,
    defaultGoodsImage: images.defaultGoodsImage,
    emptyOrderImage: images.emptyOrder
  },

  onLoad(query) {
    console.log('订单列表页 onLoad:', query);
    const { status = orderConfig.orderList.defaultTab } = query;
    const statusNum = parseInt(status, 10);

    this.setData({
      curTab: statusNum,
      page: 1,
      orderList: []
    }, () => {
      this.loadOrderList(true);
    });
  },

  onShow() {
    console.log('订单列表页 onShow');
    this.loadOrderList(true);
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadOrderList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadOrderList();
    }
  },

  async loadOrderList(reset = false) {
    if (this.data.loading && !reset) return;

    const { curTab, page, pageSize } = this.data;

    if (reset) {
      this.setData({
        page: 1,
        orderList: [],
        loading: true
      });
    }

    try {
      const result = await orderManager.getOrderList({
        status: curTab,
        page: reset ? 1 : page,
        pageSize
      });

      console.log('加载订单列表:', result);

      if (!result.data.length) {
        this.setData({
          hasMore: false,
          loading: false,
          refreshing: false
        });
        return;
      }

      this.setData({
        orderList: reset ? result.data : this.data.orderList.concat(result.data),
        hasMore: result.hasMore,
        page: (reset ? 1 : page) + 1,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      console.error('加载订单列表失败:', err);
      showToast('加载失败');
      this.setData({
        loading: false,
        refreshing: false
      });
    }
  },

  getStatusDesc(status) {
    return orderStatusMap[status] || '未知状态';
  },

  onTabChange(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({
      curTab: value,
      page: 1,
      orderList: [],
      hasMore: true
    }, () => {
      this.loadOrderList(true);
    });
  },

  onOrderClick(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?orderId=${orderId}`,
      fail: (err) => {
        console.error('跳转订单详情失败:', err);
        showToast('跳转失败');
      }
    });
  },

  onGotoHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  onPageScroll(e) {
    if (!e) return;
    this.setData({
      scrollTop: e.scrollTop || 0
    });
  },

  // 取消订单
  async onCancelOrder(e) {
    const { orderId } = e.currentTarget.dataset;

    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确定要取消该订单吗？'
      });

      if (!confirm) return;

      await orderManager.cancelOrder(orderId);
      showToast('已取消订单', 'success');
      this.loadOrderList(true);
    } catch (err) {
      console.error('取消订单失败:', err);
      showToast('取消失败');
    }
  },

  // 去支付
  onGotoPay(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-payment/index?orderId=${orderId}`,
      fail: (err) => {
        console.error('跳转支付页面失败:', err);
        showToast('跳转失败');
      }
    });
  },

  // 确认收货
  async onConfirmReceipt(e) {
    const { orderId } = e.currentTarget.dataset;

    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确认已收到商品？'
      });

      if (!confirm) return;

      await orderManager.confirmReceipt(orderId);
      showToast('已确认收货', 'success');
      this.loadOrderList(true);
    } catch (err) {
      console.error('确认收货失败:', err);
      showToast('确认失败');
    }
  },

  // 申请退款
  async onApplyRefund(e) {
    const { orderId } = e.currentTarget.dataset;

    try {
      const { confirm } = await showModal({
        title: '申请售后',
        content: '确定要申请退款吗？'
      });

      if (!confirm) return;

      // 1. 找到该订单信息
      const order = this.data.orderList.find(o => o.orderId === orderId);
      if (!order) {
        showToast('订单不存在');
        return;
      }

      // 2. 将订单状态改为售后中 (模拟，实际可能需要后端接口)
      // 这里简单地把订单从列表中移除，或者标记一下，重点是写入售后记录
      // 为了演示，我们不改订单状态，只是提示申请成功，并在售后列表增加一条

      // 3. 写入售后记录到 Storage
      const newAfterSale = {
        id: `AS${Date.now()}`,
        orderNo: order.orderNo,
        status: 1, // 处理中
        statusDesc: '处理中',
        image: order.goodsList[0]?.primaryImage || this.data.defaultGoodsImage,
        goodsName: order.goodsList[0]?.title || '商品',
        num: order.goodsList.length,
        amount: (order.totalAmount / 100).toFixed(2)
      };

      const afterSaleList = wx.getStorageSync('afterSaleList') || [];
      afterSaleList.unshift(newAfterSale);
      wx.setStorageSync('afterSaleList', afterSaleList);

      showToast('申请成功', 'success');

      // 4. 从当前订单列表中移除该订单，防止重复申请
      // 同时也可以视为该订单已流转到售后流程
      // 更新本地存储中的订单列表（如果是模拟数据源）
      await orderManager.deleteOrder(orderId); // 复用删除逻辑将订单从这里移走

      // 刷新列表
      this.loadOrderList(true);

      // 延迟跳转到售后列表查看
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/usercenter/after-sale/list/index'
        });
      }, 1000);

    } catch (err) {
      console.error('申请售后失败:', err);
      showToast('申请失败');
    }
  },

  onGotoDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?orderId=${orderId}`,
      fail: (err) => {
        console.error('跳转订单详情页失败:', err);
        showToast('跳转失败');
      }
    });
  },

  // 清除所有订单数据
  clearAllOrders() {
    orderManager.clearCache();
    this.setData({
      orderList: [],
      hasMore: false
    });
    showToast('订单数据已清除', 'success');
  }
});
