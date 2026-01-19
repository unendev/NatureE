import { fetchHome } from '../../../services/home/home';
import { fetchGoodsList } from '../../../services/good/fetchGoodsList';
import { imageManager } from '../../../utils/image-manager';
import performanceMonitor from '../../../utils/performance-monitor';

Page({
  data: {
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: true,
    bannerList: [],
    categoryList: [],
    searchValue: '', // 搜索关键词
    swiperConfig: {
      current: 0,
      autoplay: true,
      duration: 500,
      interval: 5000,
      navigation: { type: 'dots' }
    }
  },

  onLoad() {
    const startTime = Date.now();
    this.loadPageData()
      .then(() => {
        performanceMonitor.recordPageLoad('home', startTime);
      })
      .catch(console.error)
      .finally(() => {
        this.setData({ pageLoading: false });
      });
  },

  async loadPageData() {
    try {
      const [homeData, goodsData] = await Promise.all([
        this.loadHomePage(),
        this.loadGoodsList()
      ]);

      this.setData({
        ...homeData,
        ...goodsData
      });

    } catch (err) {
      console.error('加载数据失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      throw err;
    }
  },

  async loadHomePage() {
    try {
      const { bannerList = [], categoryList = [], tabList = [] } = await fetchHome();
      return {
        bannerList: this._processImages(bannerList, 'banner'),
        categoryList: this._processImages(categoryList, 'category'),
        tabList
      };
    } catch (err) {
      console.error('加载首页数据失败:', err);
      throw err;
    }
  },

  async loadGoodsList() {
    try {
      const { list = [], total = 0, hasMore } = await fetchGoodsList();
      return {
        goodsList: list,
        goodsListLoadStatus: hasMore ? 0 : 2
      };
    } catch (err) {
      console.error('加载商品列表失败:', err);
      throw err;
    }
  },

  _processImages(list = [], type = 'goods') {
    return list.map(item => ({
      ...item,
      imgUrl: imageManager.getImageUrl(item.imgUrl, type)
    }));
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 2) return;
    // TODO: 实现加载更多逻辑
  },

  // 处理搜索事件
  onSearch(e) {
    const { value } = e.detail;
    // 跳转到搜索结果页面
    wx.navigateTo({
      url: `/pages/category/list/index?keyword=${encodeURIComponent(value)}`,
      fail: (err) => {
        console.error('跳转搜索结果页失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理商品点击跳转
  goodClickHandle(e) {
    const { goods } = e.detail;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${goods.spuId}`,
    });
  },

  // 处理分类跳转事件
  onCategory(e) {
    const { id } = e.currentTarget.dataset;
    // 跳转到分类页面
    wx.navigateTo({
      url: `/pages/category/list/index?categoryId=${id}`,
      fail: (err) => {
        console.error('跳转分类页失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().init();
    }
  }
}); 