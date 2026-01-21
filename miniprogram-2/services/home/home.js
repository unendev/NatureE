import request from '../../utils/request';
import errorHandler from '../../utils/error-handler';

// 获取首页数据
import { ethnicGoodsList } from '../../model/goods/ethnic-goods';

// 获取首页数据
export async function fetchHome() {
  try {
    const data = await request.get('/api/home');

    // 从 ethnicGoodsList 生成首页分类导航
    // 取前12个民族，凑齐3行（每行4个）
    const categoryList = ethnicGoodsList.slice(0, 12).map(group => {
      let icon = '';
      if (group.items && group.items.length > 0 && group.items[0].images && group.items[0].images.length > 0) {
        icon = group.items[0].images[0];
      }
      return {
        id: group.categoryId,
        name: group.nation,
        icon: icon // 组件使用的是 icon 字段
      };
    });

    return {
      bannerList: data.banners || [],
      categoryList: categoryList, // 使用动态生成的分类
      goodsList: data.goods || []
    };
  } catch (err) {
    errorHandler.handleError(err);
    return {
      bannerList: [],
      categoryList: [],
      goodsList: []
    };
  }
}

// 获取轮播图数据
export const fetchBannerList = async () => {
  try {
    const res = await request({
      url: '/home/banner',
      method: 'GET'
    });
    return res.data;
  } catch (error) {
    console.error('获取轮播图数据失败:', error);
    throw error;
  }
};

// 获取推荐商品
export const fetchRecommendGoods = async (params) => {
  try {
    const res = await request({
      url: '/home/recommend',
      method: 'GET',
      data: params
    });
    return res.data;
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    throw error;
  }
}; 