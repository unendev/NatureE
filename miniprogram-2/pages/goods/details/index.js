import { fetchGood } from '../../../services/good/fetchGood';
import { fetchActivityList } from '../../../services/activity/fetchActivityList';
import {
  getGoodsDetailsCommentList,
  getGoodsDetailsCommentsCount,
} from '../../../services/good/fetchGoodsDetailsComments';
import { addGoodsToCart } from '../../../services/cart/cart';
import errorHandler from '../../../utils/error-handler';

import { cdnBase } from '../../../config/index';

// 确保 cdnBase 末尾有斜杠
const imgPrefix = (cdnBase || 'https://cdn-we-retail.ym.tencent.com/').replace(/\/?$/, '/');

const recLeftImg = `${imgPrefix}common/rec-left.png`;
const recRightImg = `${imgPrefix}common/rec-right.png`;
const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );

  return result.join('&');
};

Page({
  data: {
    commentsList: [],
    commentsStatistics: {
      badCount: 0,
      commentCount: 0,
      goodCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      middleCount: 0,
    },
    isShowPromotionPop: false,
    activityList: [],
    recLeftImg,
    recRightImg,
    details: null,
    currentPrice: 0,
    goodsTabArray: [],
    allImages: [],
    storeLogo: `${imgPrefix}common/store-logo.png`,
    storeName: '云mall标准版旗舰店',
    jumpArray: [
      {
        title: '首页',
        url: '/pages/home/home',
        iconName: 'home',
      },
      {
        title: '购物车',
        url: '/pages/cart/index',
        iconName: 'cart',
        showCartNum: true,
      },
    ],
    isStock: true,
    cartNum: 0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    primaryImage: '',
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    defaultImage: '/assets/images/default-goods.png',
    buyType: '',
    outOperateStatus: false,
    operateType: 0,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    spuId: '',
    navigation: { type: 'dots' },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0,
    swiperList: [],
    imgSrcs: [],
    swiperImageProps: { mode: 'scaleToFill' },
    loading: true,
    loadError: false,
    stockStatus: {
      stock: 0,
      available: false,
      message: ''
    },
    // 规格选择状态
    specSelectState: {
      selectedSpecs: {},
      currentSku: null,
      isAllSelected: false
    },
    goods: null,
    specsVisible: false,
    activities: [],
    pageError: null,
    quantity: 1,
    selectedSpecs: null,
    selectedSku: null
  },

  // 商品状态映射
  statusMap: {
    ONSALE: { text: '在售', available: true },
    SOLDOUT: { text: '已售罄', available: false },
    OFFSALE: { text: '已下架', available: false }
  },

  // 购买相关的常量
  buyConstants: {
    ADD_CART: 1,
    BUY_NOW: 2,
    MIN_BUY_NUM: 1,
    MAX_BUY_NUM: 999
  },

  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  showSkuSelectPopup(type) {
    this.setData({
      isSpuSelectPopupShow: true,
      buyType: type,
      selectedSku: null,
      buyNum: 1
    });
  },

  hideSkuSelectPopup() {
    this.setData({
      isSpuSelectPopupShow: false
    });
  },

  onSpecSelect(e) {
    const { selectedSpecs, isAllSelected } = e.detail;

    if (!isAllSelected) {
      this.setData({
        selectedSku: null
      });
      return;
    }

    // 查找匹配的SKU
    const matchedSku = this.findMatchedSku(selectedSpecs);
    if (matchedSku) {
      this.setData({
        selectedSku: matchedSku
      });
    }
  },

  onQuantityChange(e) {
    const { buyNum } = e.detail;
    this.setData({ buyNum });
  },

  onAddToCart() {
    this.showSkuSelectPopup('cart');
  },

  onBuyNow() {
    this.showSkuSelectPopup('buy');
  },

  async onConfirmBuy() {
    const { selectedSku, buyNum, buyType, details } = this.data;

    if (!selectedSku) {
      // 不显示提示,直接返回
      return;
    }

    try {
      if (buyType === 'cart') {
        // 统一规格信息的数据结构
        const specInfo = selectedSku.specInfo.map(spec => ({
          specId: spec.specId,
          specValueId: spec.specValueId,
          specValue: details.specList.find(s => s.specId === spec.specId)?.specValueList.find(v => v.specValueId === spec.specValueId)?.specValue || '',
          name: details.specList.find(s => s.specId === spec.specId)?.title || '',
          value: spec.specValueId
        }));

        // 加入购物车
        const cartData = {
          skuId: selectedSku.skuId,
          spuId: details.spuId,
          quantity: parseInt(buyNum) || 1,
          price: selectedSku.price,
          primaryImage: selectedSku.skuImage || details.primaryImage,
          title: details.title,
          specInfo: specInfo,
          specs: specInfo.map(spec => `${spec.name}: ${spec.specValue}`).join('，')
        };

        await addGoodsToCart(cartData);

        wx.showToast({
          title: '已加入购物车',
          icon: 'success'
        });

        this.hideSkuSelectPopup();
      } else {
        // 构建规格信息
        const specInfo = selectedSku.specInfo.map(spec => ({
          specId: spec.specId,
          specValueId: spec.specValueId,
          specValue: details.specList.find(s => s.specId === spec.specId)?.specValueList.find(v => v.specValueId === spec.specValueId)?.specValue || '',
          name: details.specList.find(s => s.specId === spec.specId)?.title || '',
          value: spec.specValueId
        }));

        const unitPrice = selectedSku.price;
        const totalPrice = unitPrice * buyNum;


        // 立即购买
        const goodsRequestList = [{
          spuId: details.spuId,
          skuId: selectedSku.skuId,
          quantity: buyNum,
          price: unitPrice,
          totalPrice: totalPrice,
          primaryImage: selectedSku.skuImage || details.primaryImage,
          title: details.title,
          specInfo: specInfo,
          specs: specInfo.map(spec => `${spec.name}: ${spec.specValue}`).join('，'),
          settlementType: 'NOW'
        }];


        const encodedGoodsRequestList = encodeURIComponent(JSON.stringify(goodsRequestList));
        wx.navigateTo({
          url: `/pages/order/order-confirm/index?goodsRequestList=${encodedGoodsRequestList}`,
          fail: (err) => {
            console.error('跳转订单确认页失败:', err);
          }
        });

        this.hideSkuSelectPopup();
      }
    } catch (err) {
      console.error('处理购买失败:', err);
    }
  },

  toNav(e) {
    const { url } = e.detail;
    wx.switchTab({
      url: url,
    });
  },

  showCurImg(e) {
    const { index } = e.detail;
    const { images } = this.data.details;
    wx.previewImage({
      current: images[index],
      urls: images, // 需要预览的图片http链接列表
    });
  },

  onPageScroll({ scrollTop }) {
    const goodsTab = this.selectComponent('#goodsTab');
    goodsTab && goodsTab.onScroll(scrollTop);
  },

  onSpecValueClick(e) {
    try {
      const { specId, valueId } = e.currentTarget.dataset;
      const { details } = this.data;


      if (!details || !details.specList) {
        console.error('商品规格数据不存在');
        return;
      }

      // 更新选中状态
      const updatedSpecList = details.specList.map(spec => {
        if (spec.specId === specId) {
          return {
            ...spec,
            specValueList: spec.specValueList.map(value => ({
              ...value,
              selected: value.specValueId === valueId
            }))
          };
        }
        return spec;
      });

      // 构建已选规格对象
      const selectedSpecs = {};
      let isAllSelected = true;
      let selectedSpecsText = '已选：';

      updatedSpecList.forEach(spec => {
        const selectedValue = spec.specValueList.find(v => v.selected);
        if (selectedValue) {
          selectedSpecs[spec.specId] = selectedValue.specValueId;
          selectedSpecsText += `${spec.title}: ${selectedValue.specValue}，`;
        } else {
          isAllSelected = false;
        }
      });

      // 移除最后一个逗号
      selectedSpecsText = selectedSpecsText.replace(/，$/, '');
      if (selectedSpecsText === '已选：') {
        selectedSpecsText = '请选择规格';
      }

      // 查找匹配的SKU
      const matchedSku = isAllSelected ? this.findMatchedSku(selectedSpecs) : null;

      // 更新状态
      this.setData({
        'details.specList': updatedSpecList,
        selectedSku: matchedSku,
        specImg: matchedSku ? (matchedSku.skuImage || details.primaryImage) : details.primaryImage,
        selectedAttrStr: selectedSpecsText,
        selectSkuSellsPrice: matchedSku ? matchedSku.price : 0,
        isAllSelectedSku: isAllSelected
      });
    } catch (err) {

      console.error('处理规格选择失败:', err);
    }
  },

  // 获取已选择的sku名称
  getSelectedSkuValues(skuTree, selectedSku) {
    const normalizedTree = this.normalizeSkuTree(skuTree);
    return Object.keys(selectedSku).reduce((selectedValues, skuKeyStr) => {
      const skuValues = normalizedTree[skuKeyStr];
      const skuValueId = selectedSku[skuKeyStr];
      if (skuValueId !== '') {
        const skuValue = skuValues.filter((value) => {
          return value.specValueId === skuValueId;
        })[0];
        skuValue && selectedValues.push(skuValue);
      }
      return selectedValues;
    }, []);
  },

  normalizeSkuTree(skuTree) {
    const normalizedTree = {};
    skuTree.forEach((treeItem) => {
      normalizedTree[treeItem.specId] = treeItem.specValueList;
    });
    return normalizedTree;
  },

  selectSpecsName(selectSpecsName) {
    if (selectSpecsName) {
      this.setData({
        selectedAttrStr: selectSpecsName,
      });
    } else {
      this.setData({
        selectedAttrStr: '',
      });
    }
  },

  // 验证购买条件
  validatePurchase() {
    const { currentSku } = this.specSelectState;
    const { stockStatus, buyNum } = this.data;

    if (!stockStatus.available) {
      wx.showToast({
        title: stockStatus.message,
        icon: 'none'
      });
      return false;
    }

    if (!currentSku) {
      wx.showToast({
        title: '请选择完整规格',
        icon: 'none'
      });
      return false;
    }

    const skuStock = currentSku.stockInfo?.stockQuantity || 0;
    if (buyNum > skuStock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  async addToCart() {
    try {
      if (!this.validatePurchase()) return;

      const { currentSku } = this.specSelectState;
      const { buyNum, details } = this.data;

      const cartData = {
        skuId: currentSku.skuId,
        spuId: details.spuId,
        quantity: buyNum,
        price: currentSku.price,
        primaryImage: currentSku.skuImage || this.data.primaryImage,
        title: details.title,
        specInfo: currentSku.specInfo
      };

      await addGoodsToCart(cartData);

      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });

      this.handlePopupHide();
    } catch (err) {
      console.error('加入购物车失败:', err);
      wx.showToast({
        title: '加入购物车失败',
        icon: 'error'
      });
    }
  },

  changeNum(e) {
    this.setData({
      buyNum: e.detail.buyNum,
    });
  },

  closePromotionPopup() {
    this.setData({
      isShowPromotionPop: false,
    });
  },

  promotionChange(e) {
    const { index } = e.detail;
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${index}`,
    });
  },

  showPromotionPopup() {
    this.setData({
      isShowPromotionPop: true,
    });
  },

  async getDetail(spuId) {
    try {
      const details = await fetchGood(spuId);


      if (!details) {
        throw new Error('商品数据获取失败');
      }

      if (!details?.primaryImage) {
        throw new Error('商品详情缺少主图');
      }

      // 处理图片路径
      const primaryImage = details.primaryImage.startsWith('http')
        ? details.primaryImage
        : `${cdnBase}${details.primaryImage}`;

      const imgSrcs = [primaryImage];
      if (details.images?.length) {
        details.images.forEach(img => {
          if (!img) return;
          const imageUrl = img.startsWith('http') ? img : `${cdnBase}${img}`;
          if (imageUrl !== primaryImage) {
            imgSrcs.push(imageUrl);
          }
        });
      }

      // 计算最低和最高价格
      const prices = details.skuList.map(sku => sku.price || 0);
      const minSalePrice = prices.length ? Math.min(...prices) / 100 : 0;
      const maxSalePrice = prices.length ? Math.max(...prices) / 100 : 0;
      const maxLinePrice = Math.max(...details.skuList.map(sku => sku.originalPrice || 0), 0) / 100;

      // 更新商品数据
      const updatedDetails = {
        ...details,
        images: imgSrcs,
        price: minSalePrice,
        originalPrice: maxLinePrice,
        minSalePrice,
        maxSalePrice
      };

      this.setData({
        details: updatedDetails,
        currentPrice: minSalePrice,
        imgSrcs,
        primaryImage,
        specImg: primaryImage,
        isStock: true,
        soldout: false,
        soldNum: details.stockInfo?.soldQuantity || 0,
        minSalePrice,
        maxSalePrice,
        maxLinePrice,
        current: 0,
        spuId,
        swiperImageProps: { mode: 'aspectFill' },
        loading: false,
        loadError: false,
        stockStatus: {
          stock: details.skuList.reduce((total, sku) => total + (sku.stockInfo?.stockQuantity || 0), 0),
          available: this.statusMap[details.status]?.available || false,
          message: this.statusMap[details.status]?.text || '未知状态'
        }
      });

      // 初始化规格数据
      this.initSpecData(details);

    } catch (err) {
      console.error('获取商品详情失败', err);
      this.showError(err.message || '获取商品信息失败');
      this.setData({
        loading: false,
        loadError: true
      });
    }
  },

  async getCommentsList() {
    try {
      const code = 'Success';
      const data = await getGoodsDetailsCommentList();
      const { homePageComments } = data;
      if (code.toUpperCase() === 'SUCCESS') {
        const nextState = {
          commentsList: homePageComments.map((item) => {
            return {
              goodsSpu: item.spuId,
              userName: item.userName || '',
              commentScore: item.commentScore,
              commentContent: item.commentContent || '用户未填写评价',
              userHeadUrl: item.isAnonymity
                ? this.anonymityAvatar
                : item.userHeadUrl || this.anonymityAvatar,
            };
          }),
        };
        this.setData(nextState);
      }
    } catch (error) {
      console.error('comments error:', error);
    }
  },

  onShareAppMessage() {
    // 自定义的返回信息
    const { selectedAttrStr } = this.data;
    let shareSubTitle = '';
    if (selectedAttrStr.indexOf('件') > -1) {
      const count = selectedAttrStr.indexOf('件');
      shareSubTitle = selectedAttrStr.slice(count + 1, selectedAttrStr.length);
    }
    const customInfo = {
      imageUrl: this.data.details.primaryImage,
      title: this.data.details.title + shareSubTitle,
      path: `/pages/goods/details/index?spuId=${this.data.spuId}`,
    };
    return customInfo;
  },

  /** 获取评价统计 */
  async getCommentsStatistics() {
    try {
      const code = 'Success';
      const data = await getGoodsDetailsCommentsCount();
      if (code.toUpperCase() === 'SUCCESS') {
        const {
          badCount,
          commentCount,
          goodCount,
          goodRate,
          hasImageCount,
          middleCount,
        } = data;
        const nextState = {
          commentsStatistics: {
            badCount: parseInt(`${badCount}`),
            commentCount: parseInt(`${commentCount}`),
            goodCount: parseInt(`${goodCount}`),
            /** 后端返回百分比后数据但没有限制位数 */
            goodRate: Math.floor(goodRate * 10) / 10,
            hasImageCount: parseInt(`${hasImageCount}`),
            middleCount: parseInt(`${middleCount}`),
          },
        };
        this.setData(nextState);
      }
    } catch (error) {
      console.error('comments statiistics error:', error);
    }
  },

  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?spuId=${this.data.spuId}`,
    });
  },

  handleOptionsParams(options) {
    try {
      if (!options || typeof options !== 'object') {
        console.warn('无效的页面参数:', options);
        return { spuId: '' };
      }

      const params = {};

      Object.keys(options).forEach(key => {
        const value = options[key];
        if (!value) {
          params[key] = '';
          return;
        }

        // 其他参数直接使用原值
        params[key] = value;
      });

      return params;


    } catch (err) {
      console.error('参数处理错误:', err);
      return {
        spuId: options?.id || options?.spuId || ''
      };
    }
  },

  async onLoad(options) {
    try {


      // 处理页面参数
      const params = this.handleOptionsParams(options);
      const spuId = params.id || params.spuId;

      if (!spuId) {
        this.showError('商品ID无效');
        return;
      }

      this.setData({
        spuId,
        loading: true,
        loadError: false,
        pageError: null
      });

      // 加载商品详情
      await this.getDetail(spuId);

      // 加载成功后再加载其他数据
      if (!this.data.loadError) {
        await Promise.all([
          this.loadActivities(),
          this.loadComments()
        ]).catch(err => {
          console.warn('加载附加数据失败:', err);
          // 不影响主体功能
        });
      }

    } catch (err) {
      console.error('页面加载错误:', err);
      this.showError('系统繁忙，请稍后重试');
    }
  },

  showError(message) {
    // 禁用提示
  },

  initSpecData(details) {
    try {
      const { specList = [], skuList = [] } = details;

      // 初始化规格数据
      const processedSpecList = specList.map(spec => ({
        ...spec,
        specValueList: spec.specValueList.map(value => ({
          ...value,
          disabled: !this.isSpecValueAvailable(value.specValueId, skuList),
          selected: false
        }))
      }));

      this.setData({
        'details.specList': processedSpecList,
        skuArray: skuList,
        isAllSelectedSku: false,
        selectSkuSellsPrice: 0,
        selectedAttrStr: '请选择规格',
        selectedSku: null,
        specImg: details.primaryImage
      });
    } catch (err) {
      console.error('初始化规格数据失败:', err);
      wx.showToast({
        title: '规格数据错误',
        icon: 'error'
      });
    }
  },

  // 检查规格值是否可选
  isSpecValueAvailable(specValueId, skuList) {
    return skuList.some(sku =>
      sku.specInfo.some(spec =>
        spec.specValueId === specValueId &&
        (sku.stockInfo?.stockQuantity > 0 || sku.stock > 0)
      )
    );
  },

  // 查找匹配的SKU
  findMatchedSku(selectedSpecs) {
    if (!this.data.skuArray || !selectedSpecs) return null;

    const sku = this.data.skuArray.find(sku =>
      sku.specInfo && sku.specInfo.every(spec =>
        selectedSpecs[spec.specId] === spec.specValueId
      )
    );

    return sku;
  },

  // 获取已选规格文本
  getSelectedSpecStr() {
    const { details } = this.data;
    if (!details?.specList) return '请选择规格';

    const selectedSpecs = details.specList
      .map(spec => {
        const selectedValue = spec.specValueList.find(v => v.selected);
        return selectedValue ? `${spec.title}: ${selectedValue.specValue}` : '';
      })
      .filter(text => text);

    return selectedSpecs.length ? selectedSpecs.join('，') : '请选择规格';
  },

  async loadGoodsDetail() {
    try {
      const { spuId } = this.data;

      const goods = await fetchGood(spuId);

      if (!goods) {
        throw new Error('商品不存在');
      }

      // 处理图片路径
      const imgSrcs = [];
      if (goods.primaryImage) {
        imgSrcs.push(goods.primaryImage);
      }
      if (goods.images?.length) {
        goods.images.forEach(img => {
          if (img && !imgSrcs.includes(img)) {
            imgSrcs.push(img);
          }
        });
      }

      // 更新商品数据
      this.setData({
        goods,
        imgSrcs,
        loading: false,
        loadError: false,
        pageError: null
      });

      // 初始化规格数据
      this.initSpecData(goods);

    } catch (err) {
      console.error('加载商品详情失败:', err);
    }
  },

  onShowSpecs() {
    this.setData({ specsVisible: true });
  },

  onHideSpecs() {
    this.setData({ specsVisible: false });
  },

  onSpecChange(specs) {
    this.setData({ selectedSpecs: specs });
  },

  // 预览商品图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { imgSrcs } = this.data;

    if (!imgSrcs.length) return;

    wx.previewImage({
      current: imgSrcs[index],
      urls: imgSrcs,
      fail: (err) => {
        console.error('预览图片失败:', err);
      }
    });
  },

  // 处理图片加载失败
  onImageError(e) {
    const { index } = e.currentTarget.dataset;
    const { imgSrcs } = this.data;

    // 替换为默认图片
    imgSrcs[index] = '/assets/images/default-goods.png';
    this.setData({ imgSrcs });
  },

  // 加载商品活动
  async loadActivities() {
    if (!this.data.spuId) return;

    try {
      const activities = await fetchActivityList({
        goodsId: this.data.spuId
      });

      this.setData({
        activities,
        loading: false
      });
    } catch (err) {
      console.error('加载活动失败:', err);
      // 活动加载失败不影响整体页面
      this.setData({
        activities: []
      });
    }
  },

  // 加载评论数据
  async loadComments() {
    if (!this.data.spuId) return;

    try {
      const [comments, statistics] = await Promise.all([
        getGoodsDetailsCommentList({ spuId: this.data.spuId }),
        getGoodsDetailsCommentsCount({ spuId: this.data.spuId })
      ]);

      this.setData({
        commentsList: comments,
        commentsStatistics: statistics
      });
    } catch (err) {
      console.error('加载评论失败:', err);
      // 评论加载失败显示空状态
      this.setData({
        commentsList: [],
        commentsStatistics: {
          commentCount: 0,
          goodRate: 0
        }
      });
    }
  },

  // 选择规格
  onSelectSpec(e) {
    const { specs } = this.data.details;
    const { specIndex, valueIndex } = e.currentTarget.dataset;

    // 更新选中状态
    specs[specIndex].values.forEach((value, index) => {
      value.selected = index === valueIndex;
    });

    this.setData({
      'details.specs': specs
    });
  },

  // 修改数量
  onQuantityChange(e) {
    const { buyNum } = e.detail;
    this.setData({ quantity: buyNum });
  },

  // 阻止事件冒泡
  stopPropagation() {
    return;
  },

  // 减少数量
  onQuantityMinus() {
    const { buyNum } = this.data;
    if (buyNum <= 1) return;
    this.setData({ buyNum: buyNum - 1 });
  },

  // 增加数量
  onQuantityPlus() {
    const { buyNum } = this.data;
    if (buyNum >= 999) return;
    this.setData({ buyNum: buyNum + 1 });
  },
});
