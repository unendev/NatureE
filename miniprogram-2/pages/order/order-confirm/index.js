import Toast from 'tdesign-miniprogram/toast/index';
import { fetchSettleDetail, createOrder } from '../../../services/order/orderConfirm';
import { commitPay, wechatPayOrder } from './pay';
import { getDefaultAddress, getAddressPromise } from '../../../utils/address-manager';
import { addNewOrder } from '../../../model/order/orderList';
import loading from '../../../utils/loading-manager';
import { withLoading } from '../../../utils/loading-manager';
import orderManager from '../../../utils/order-manager';
import { showToast } from '../../../utils/util';
import cartManager from '../../../utils/cart-manager';

const stripeImg = `https://cdn-we-retail.ym.tencent.com/miniapp/order/stripe.png`;

// 导航超时时间设置
const NAV_TIMEOUT = 3000;

Page({
  data: {
    placeholder: '备注信息',
    stripeImg,
    loading: true,
    settleDetailData: {
      storeGoodsList: [], //正常下单商品列表
      outOfStockGoodsList: [], //库存不足商品
      abnormalDeliveryGoodsList: [], // 不能正常配送商品
      inValidGoodsList: [], // 失效或者库存不足
      limitGoodsList: [], //限购商品
      couponList: [], //门店优惠券信息
      remark: '',  // 添加备注默认值
      value: '',   // 添加文本域默认值
    },
    orderCardList: [], // 仅用于商品卡片展示
    couponsShow: false, // 显示优惠券的弹框
    invoiceData: {
      email: '', // 发票发送邮箱
      buyerTaxNo: '', // 税号
      invoiceType: '', // 开票类型
      buyerPhone: '', //手机号
      buyerName: '', //个人或公司名称
      titleType: '', // 发票抬头 1-公司 2-个人
      contentType: '', //发票内容 1-明细 2-类别
    },
    goodsRequestList: [],
    userAddressReq: null,
    popupShow: false,
    notesPosition: 'center',
    storeInfoList: [],
    storeNoteIndex: 0,
    promotionGoodsList: [],
    couponList: [],
    submitCouponList: [],
    currentStoreId: '',
    userAddress: null,
    value: '',  // 确保初始值为空字符串
    remark: '',
    pageRoute: 'pages/order/order-confirm/index',
    pageInit: false,
    componentsReady: {
      addressCard: false,
      goodsList: false,
      couponList: false
    },
    dataReady: {
      settleDetail: false,
      address: false
    },
    address: null,
    goodsList: [],
    totalPrice: 0,
    freight: 0,
    totalAmount: 0
  },

  payLock: false,
  noteInfo: [],
  tempNoteInfo: [],

  async onLoad(options) {
    try {
      if (!options.goodsRequestList) {
        throw new Error('商品列表参数不能为空');
      }

      let goodsRequestList;
      try {
        const decoded = decodeURIComponent(options.goodsRequestList);
        const parsed = JSON.parse(decoded);
        goodsRequestList = Array.isArray(parsed) ? parsed : parsed.goodsRequestList;

        if (!Array.isArray(goodsRequestList)) {
          throw new Error('无效的商品列表格式');
        }
      } catch (err) {
        console.error('解析商品列表失败:', err);
        throw new Error('商品列表格式错误');
      }

      // 获取默认地址
      const address = await getDefaultAddress();

      // 检查是否有商品包含发票需求
      const needInvoice = goodsRequestList.some(item => item.needInvoice);

      this.setData({
        goodsList: goodsRequestList,
        address,
        loading: true,
        needInvoice
      });

      this.init(goodsRequestList);
    } catch (err) {
      console.error('初始化订单确认页失败:', err);
      showToast(err.message || '初始化失败');

      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  onShow() {
    const invoiceData = wx.getStorageSync('invoiceData');
    if (invoiceData) {
      //处理发票
      this.setData({
        invoiceData,
      });
      wx.removeStorageSync('invoiceData');
    }
  },

  // 检查页面是否准备就绪
  checkPageReady() {
    const { componentsReady, dataReady } = this.data;

    // 检查所有组件是否已准备就绪
    const isComponentsReady = Object.values(componentsReady).every(ready => ready);

    // 检查所有数据是否已加载完成
    const isDataReady = Object.values(dataReady).every(ready => ready);

    if (isComponentsReady && isDataReady) {
      this.setData({ loading: false });
      console.log('页面加载完成');
    }
  },

  // 组件准备就绪回调
  onComponentReady(e) {
    const { name } = e.detail;
    if (name && this.data.componentsReady.hasOwnProperty(name)) {
      this.setData({
        [`componentsReady.${name}`]: true
      }, () => {
        this.checkPageReady();
      });
    }
  },

  async init(goodsRequestList) {
    try {
      // 计算商品总价（单位：分）
      const totalPrice = goodsRequestList.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // 设置运费（这里暂时设为0，实际应该从配置或接口获取）
      const freight = 0;

      // 计算实付金额
      const totalAmount = totalPrice + freight;

      // 更新状态
      this.setData({
        goodsList: goodsRequestList,
        totalPrice,
        freight,
        totalAmount,
        loading: false
      });

      console.log('价格计算:', {
        goodsList: goodsRequestList,
        totalPrice,
        freight,
        totalAmount
      });
    } catch (err) {
      console.error('初始化订单数据失败:', err);
      showToast('初始化失败');
    }
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/usercenter/address/list/index?from=order',
      events: {
        // 监听选择地址事件
        selectAddress: (address) => {
          console.log('选择的地址:', address);
          this.setData({ address });
        }
      }
    });
  },

  async submitOrder() {
    try {
      const { address, goodsList, totalAmount, remark } = this.data;

      if (!address) {
        showToast('请选择收货地址');
        return;
      }

      // 创建订单
      const result = await orderManager.createOrder({
        address,
        goodsList,
        totalAmount,
        remark
      });

      if (!result || !result.orderId) {
        throw new Error('创建订单失败');
      }

      const { orderId } = result;

      // 获取要清除的商品SKU ID列表
      const skuIdsToRemove = goodsList.map(item => item.skuId);

      // 跳转到支付页面
      wx.navigateTo({
        url: `/pages/order/order-payment/index?orderId=${orderId}`,
        success: async () => {
          try {
            // 返回上一页，清空购物车中已下单的商品
            const pages = getCurrentPages();
            const cartPage = pages[pages.length - 2];

            if (cartPage && cartPage.route.includes('cart')) {
              // 从购物车中移除已购买的商品
              for (const skuId of skuIdsToRemove) {
                await cartManager.removeItem(skuId);
              }
              // 刷新购物车页面
              cartPage.refreshCart();
            }
          } catch (err) {
            console.error('清除购物车商品失败:', err);
          }
        },
        fail: (err) => {
          console.error('跳转支付页面失败:', err);
          showToast('跳转支付页面失败');
        }
      });
    } catch (err) {
      console.error('提交订单失败:', err);
      showToast(err.message || '提交订单失败');
    }
  },

  showError(message) {
    // 空函数，不执行任何操作
    console.log('错误信息(已禁用提示):', message);
  },

  initData(resData) {
    // 转换商品卡片显示数据
    const data = this.handleResToGoodsCard(resData);
    this.userAddressReq = resData.userAddress;

    if (resData.userAddress) {
      this.setData({ userAddress: resData.userAddress });
    }
    this.setData({ settleDetailData: data });
    this.isInvalidOrder(data);
  },

  isInvalidOrder(data) {
    // 失效 不在配送范围 限购的商品 提示弹窗
    if (
      (data.limitGoodsList && data.limitGoodsList.length > 0) ||
      (data.abnormalDeliveryGoodsList &&
        data.abnormalDeliveryGoodsList.length > 0) ||
      (data.inValidGoodsList && data.inValidGoodsList.length > 0)
    ) {
      this.setData({ popupShow: true });
      return true;
    }
    this.setData({ popupShow: false });
    if (data.settleType === 0) {
      return true;
    }
    return false;
  },

  handleError() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '结算异常, 请稍后重试',
      duration: 2000,
      icon: '',
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
    this.setData({
      loading: false,
    });
  },

  getRequestGoodsList(storeGoodsList) {
    const filterStoreGoodsList = [];
    storeGoodsList &&
      storeGoodsList.forEach((store) => {
        const { storeName } = store;
        store.skuDetailVos &&
          store.skuDetailVos.forEach((goods) => {
            const data = goods;
            data.storeName = storeName;
            filterStoreGoodsList.push(data);
          });
      });
    return filterStoreGoodsList;
  },

  handleGoodsRequest(goods, isOutStock = false) {
    const {
      reminderStock,
      quantity,
      storeId,
      uid,
      saasId,
      spuId,
      goodsName,
      skuId,
      storeName,
      roomId,
    } = goods;
    const resQuantity = isOutStock ? reminderStock : quantity;
    return {
      quantity: resQuantity,
      storeId,
      uid,
      saasId,
      spuId,
      goodsName,
      skuId,
      storeName,
      roomId,
    };
  },

  handleResToGoodsCard(data) {
    // 转换数据 符合 goods-card展示
    const orderCardList = []; // 订单卡片列表
    const storeInfoList = [];
    const submitCouponList = []; //使用优惠券列表;

    data.storeGoodsList &&
      data.storeGoodsList.forEach((ele) => {
        const orderCard = {
          id: ele.storeId,
          storeName: ele.storeName,
          status: 0,
          statusDesc: '',
          amount: ele.storeTotalPayAmount,
          goodsList: [],
        }; // 订单卡片
        ele.skuDetailVos.forEach((item, index) => {
          orderCard.goodsList.push({
            id: index,
            thumb: item.image,
            title: item.goodsName,
            specs: item.skuSpecLst.map((s) => s.specValue), // 规格列表 string[]
            price: item.tagPrice || item.settlePrice || '0', // 优先取限时活动价
            settlePrice: item.settlePrice,
            titlePrefixTags: item.tagText ? [{ text: item.tagText }] : [],
            num: item.quantity,
            skuId: item.skuId,
            spuId: item.spuId,
            storeId: item.storeId,
          });
        });

        storeInfoList.push({
          storeId: ele.storeId,
          storeName: ele.storeName,
          remark: '',
        });
        submitCouponList.push({
          storeId: ele.storeId,
          couponList: ele.couponList || [],
        });
        this.noteInfo.push('');
        this.tempNoteInfo.push('');
        orderCardList.push(orderCard);
      });

    this.setData({ orderCardList, storeInfoList, submitCouponList });
    return data;
  },

  onGotoAddress() {
    /** 获取一个Promise */
    getAddressPromise()
      .then((address) => {
        this.handleOptionsParams({
          userAddressReq: { ...address, checked: true },
        });
      })
      .catch(() => { });

    const { userAddressReq } = this; // 收货地址

    let id = '';

    if (userAddressReq?.id) {
      id = `&id=${userAddressReq.id}`;
    }

    wx.navigateTo({
      url: `/pages/usercenter/address/list/index?selectMode=1&isOrderSure=1${id}`,
    });
  },

  onNotes(e) {
    const { storenoteindex: storeNoteIndex } = e.currentTarget.dataset;
    // 添加备注信息
    this.setData({
      dialogShow: true,
      storeNoteIndex,
    });
  },

  onInput(e) {
    const value = e.detail.value || '';
    this.setData({
      value,
      remark: value,
      'settleDetailData.value': value,
      'settleDetailData.remark': value,
    });
  },

  onBlur(e) {
    const value = e.detail.value || '';
    this.setData({
      value,
      remark: value,
      'settleDetailData.value': value,
      'settleDetailData.remark': value,
      notesPosition: 'center'
    });
  },

  onFocus() {
    this.setData({
      notesPosition: 'self'
    });
  },

  onTap() {
    this.setData({
      placeholder: '',
    });
  },

  onNoteConfirm() {
    // 备注信息 确认按钮
    const { storeInfoList, storeNoteIndex } = this.data;
    this.tempNoteInfo[storeNoteIndex] = this.noteInfo[storeNoteIndex];
    storeInfoList[storeNoteIndex].remark = this.noteInfo[storeNoteIndex];

    this.setData({
      dialogShow: false,
      storeInfoList,
    });
  },

  onNoteCancel() {
    // 备注信息 取消按钮
    const { storeNoteIndex } = this.data;
    this.noteInfo[storeNoteIndex] = this.tempNoteInfo[storeNoteIndex];
    this.setData({
      dialogShow: false,
    });
  },

  onSureCommit() {
    // 商品库存不足继续结算
    const { settleDetailData } = this.data;
    const { outOfStockGoodsList, storeGoodsList, inValidGoodsList } =
      settleDetailData;
    if (
      (outOfStockGoodsList && outOfStockGoodsList.length > 0) ||
      (inValidGoodsList && storeGoodsList)
    ) {
      // 合并正常商品 和 库存 不足商品继续支付
      // 过滤不必要的参数
      const filterOutGoodsList = [];
      outOfStockGoodsList &&
        outOfStockGoodsList.forEach((outOfStockGoods) => {
          const { storeName } = outOfStockGoods;
          outOfStockGoods.unSettlementGoods.forEach((ele) => {
            const data = ele;
            data.quantity = ele.reminderStock;
            data.storeName = storeName;
            filterOutGoodsList.push(data);
          });
        });
      const filterStoreGoodsList = this.getRequestGoodsList(storeGoodsList);
      const goodsRequestList = filterOutGoodsList.concat(filterStoreGoodsList);
      this.handleOptionsParams({ goodsRequestList });
    }
  },

  // 处理支付
  handlePay(data, settleDetailData) {
    const { channel, payInfo, tradeNo, interactId, transactionId } = data;
    const { totalAmount, totalPayAmount } = settleDetailData;
    const payOrderInfo = {
      payInfo: payInfo,
      orderId: tradeNo,
      orderAmt: totalAmount,
      payAmt: totalPayAmount,
      interactId: interactId,
      tradeNo: tradeNo,
      transactionId: transactionId,
    };

    if (channel === 'wechat') {
      wechatPayOrder(payOrderInfo);
    }
  },

  hide() {
    // 隐藏 popup
    this.setData({
      'settleDetailData.abnormalDeliveryGoodsList': [],
    });
  },

  onInvoiceChange(e) {
    this.setData({
      needInvoice: e.detail.value
    });
  },

  onCoupons(e) {
    const { submitCouponList, currentStoreId } = this.data;
    const { goodsRequestList } = this;
    const { selectedList } = e.detail;
    const tempSubmitCouponList = submitCouponList.map((storeCoupon) => {
      return {
        couponList:
          storeCoupon.storeId === currentStoreId
            ? selectedList
            : storeCoupon.couponList,
      };
    });
    const resSubmitCouponList = this.handleCouponList(tempSubmitCouponList);
    //确定选择优惠券
    this.handleOptionsParams({ goodsRequestList }, resSubmitCouponList);
    this.setData({ couponsShow: false });
  },

  onOpenCoupons(e) {
    const { storeid } = e.currentTarget.dataset;
    this.setData({
      couponsShow: true,
      currentStoreId: storeid,
    });
  },

  handleCouponList(storeCouponList) {
    //处理门店优惠券   转换成接口需要
    if (!storeCouponList) return [];
    const resSubmitCouponList = [];
    storeCouponList.forEach((ele) => {
      resSubmitCouponList.push(...ele.couponList);
    });
    return resSubmitCouponList;
  },

  onGoodsNumChange(e) {
    const {
      detail: { value },
      currentTarget: {
        dataset: { goods },
      },
    } = e;
    const index = this.goodsRequestList.findIndex(
      ({ storeId, spuId, skuId }) =>
        goods.storeId === storeId &&
        goods.spuId === spuId &&
        goods.skuId === skuId,
    );
    if (index >= 0) {
      // eslint-disable-next-line no-confusing-arrow
      const goodsRequestList = this.goodsRequestList.map((item, i) =>
        i === index ? { ...item, quantity: value } : item,
      );
      this.handleOptionsParams({ goodsRequestList });
    }
  },

  onPopupChange() {
    this.setData({
      popupShow: !this.data.popupShow,
    });
  },

  getPageRoute() {
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      return currentPage.route || 'pages/order/order-confirm/index';
    } catch (err) {
      console.error('获取页面路由失败:', err);
      return 'pages/order/order-confirm/index';
    }
  }
});
