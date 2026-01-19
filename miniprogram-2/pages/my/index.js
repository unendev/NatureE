import { fetchUserInfo, fetchUserData } from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';

const menuData = [
  [
    {
      title: '收货地址',
      tpl: 'address',
      url: '/pages/usercenter/address/list/index',
    },
    {
      title: 'AI客服',
      tpl: 'service',
      url: '/pages/ai-service/index',
    },
    {
      title: '在线设计',
      tpl: 'design',
      url: '/pages/online-design/index',
    }
  ]
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    status: 1
  },
  {
    title: '待发货',
    iconName: 'gift',
    orderNum: 0,
    status: 2
  },
  {
    title: '待收货',
    iconName: 'shop',
    orderNum: 0,
    status: 3
  },
  {
    title: '待评价',
    iconName: 'edit',
    orderNum: 0,
    status: 4
  }
];

Page({
  data: {
    userInfo: null,
    loading: true,
    currAuthStep: 1,
    menuData,
    orderTagInfos,
    versionNo: '',
    orderTabs: [
      { text: '待付款', status: 'pending_payment', icon: 'wallet' },
      { text: '待发货', status: 'pending_delivery', icon: 'gift' },
      { text: '待收货', status: 'pending_receipt', icon: 'shop' },
      { text: '已完成', status: 'completed', icon: 'check-circle' }
    ],
    menuList: [
      { text: '个人信息', icon: 'user', url: '/pages/usercenter/person-info/index' },
      { text: '我的收藏', icon: 'heart', url: '/pages/usercenter/favorites/index' },
      { text: '收货地址', icon: 'location', url: '/pages/usercenter/address/list/index' },
      { text: 'AI客服', icon: 'chat', url: '/pages/ai-service/index' },
      { text: '在线设计', icon: 'edit', url: '/pages/design/design' }
    ],
    showLogoutConfirm: false
  },

  onLoad() {
    this.getUserInfo();
    this.getVersionNo();
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().init();
    }

    this.getUserInfo();
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    // 检查是否是通过登录页面登录的
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    this.setData({
      userInfo: isLoggedIn ? userInfo : null
    });
  },

  getVersionNo() {
    const accountInfo = wx.getAccountInfoSync();
    this.setData({
      versionNo: accountInfo.miniProgram.version || '1.0.0'
    });
  },

  onLoginClick() {
    wx.navigateTo({
      url: '/pages/usercenter/login/index',
      fail: (err) => {
        console.error('跳转登录页失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onOrderTabClick(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const { status } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-list/index?type=${status}`,
      fail: (err) => {
        console.error('跳转订单列表页失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onMenuClick(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const { url } = e.currentTarget.dataset;
    if (!url) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示退出确认对话框
  showLogoutDialog() {
    this.setData({ showLogoutConfirm: true });
  },

  // 隐藏退出确认对话框
  hideLogoutDialog() {
    this.setData({ showLogoutConfirm: false });
  },

  // 执行退出登录
  handleLogout() {
    // 清除登录状态和用户信息
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');

    // 更新页面状态
    this.setData({
      userInfo: null,
      showLogoutConfirm: false
    });

    // 显示退出成功提示
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已退出登录',
      theme: 'success',
    });
  }
}); 