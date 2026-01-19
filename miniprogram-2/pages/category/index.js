// pages/category/index.js
import { fetchCategories } from '../../services/category/fetchCategories';
import { fetchGoodsList } from '../../services/good/fetchGoodsList';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    currentCategory: null,
    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadCategories();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().init();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  async loadCategories() {
    try {
      const categories = await fetchCategories();
      this.setData({
        categories,
        currentCategory: categories[0] || null
      }, () => {
        if (this.data.currentCategory) {
          this.loadGoodsList();
        }
      });
    } catch (error) {
      console.error('加载分类列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  async loadGoodsList() {
    try {
      const { currentCategory } = this.data;
      const params = {
        categoryId: currentCategory?.id,
        pageNum: 1,
        pageSize: 30
      };

      const { list = [] } = await fetchGoodsList(params);
      this.setData({ goodsList: list });
    } catch (error) {
      console.error('加载商品列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  onCategoryClick(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({
      currentCategory: category,
      goodsList: []
    }, () => {
      this.loadGoodsList();
    });
  },

  onGoodsClick(e) {
    const { goods } = e.currentTarget.dataset;
    if (goods?.spuId) {
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${goods.spuId}`,
        fail: (err) => {
          console.error('跳转商品详情页失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
})