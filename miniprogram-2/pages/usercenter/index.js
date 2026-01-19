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
  ],
  [
    {
      title: '帮助中心',
      tit: '',
      url: '',
      type: 'help-center',
      icon: 'help-circle',
    },
    {
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
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

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '点击登录',
    phoneNumber: '',
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {
    servicePhone: '',
    serviceTimeDuration: '9:00-18:00',
  },
  currAuthStep: 1,
  showKefu: false,
  versionNo: '',
});

Page({
  data: {
    userInfo: null,
    loading: true,
    currAuthStep: 1,
    menuData: [
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
          url: '/pages/design/design',
        },
        {
          title: '我的收藏',
          tpl: 'favorites',
          url: '/pages/usercenter/favorites/index',
        }
      ]
    ],
    orderTagInfos: [
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
    ],
    versionNo: '',
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.getTabBar().init();
  },

  async loadUserInfo() {
    try {
      this.setData({ loading: true });
      // TODO: 加载用户信息
      this.setData({ loading: false });
    } catch (err) {
      console.error('加载用户信息失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  onOrderClick(e) {
    const { status } = e.currentTarget.dataset;
    console.log('点击订单', status);

    try {
      wx.navigateTo({
        url: `/pages/order/order-list/index?status=${status}`,
        fail: (err) => {
          console.error('跳转订单列表失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          });
        }
      });
    } catch (err) {
      console.error('订单点击处理失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  gotoUserEditPage() {
    const { currAuthStep } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({ url: '/pages/usercenter/person-info/index' });
    } else {
      wx.navigateTo({ url: '/pages/usercenter/login/index' });
    }
  },
});
