/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import { request } from '../../utils/request';
import errorHandler from '../../utils/error-handler';
import performanceMonitor from '../../utils/performance-monitor';
import { genGood } from '../../model/goods/good';  // 导入商品详情生成函数
import { getAllProducts } from '../../model/goods/ethnic-goods';

// 商品图片列表
const goodsImages = [
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.iJQReylpjWNEQbn_Z0tZOAHaL6?pid=ImgDet&w=474&h=762&rs=1',
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.Jj0JGqbDln3ElPORsl-zQgHaLW?pid=ImgDet&w=474&h=726&rs=1',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.GAEO6ffBZmqz_Q_FEKiNSwHaKy?pid=ImgDet&w=474&h=690&rs=1'
];

// 分类商品名称映射
const categoryNames = {
  1: '民族服装',
  2: '苗族服饰',
  3: '彝族服饰',
  4: '傣族服饰',
  5: '白族服饰',
  6: '纳西服饰',
  7: '壮族服饰',
  8: '瑶族服饰',
  9: '布依服饰',
  10: '哈尼服饰',
  11: '民族配饰'
};

/** 获取商品列表（模拟数据） */
async function mockFetchGoodsList(params = {}) {
  const { pageSize = 10, pageNum = 1, sortBy = 'default', sortType = 'desc' } = params;

  // 模拟加载延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 生成商品列表
  const list = [];
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  for (let i = startIndex; i < endIndex; i++) {
    // 使用与商品详情相同的价格生成逻辑
    const spuId = `goods_${i + 1}`;
    const goodDetail = genGood(spuId);

    if (goodDetail) {
      list.push({
        id: spuId,
        name: goodDetail.title,
        price: goodDetail.minSalePrice,  // 保持单位为分
        originalPrice: goodDetail.maxLinePrice,  // 保持单位为分
        imgUrl: goodDetail.primaryImage,
        sales: Math.floor(Math.random() * 1000),
        inventory: Math.floor(Math.random() * 100 + 50),
        tags: ['新品', '热销'],
        description: goodDetail.desc[0] || '精美民族服饰，传统与时尚的完美结合'
      });
    }
  }

  // 根据排序参数处理数据
  if (sortBy !== 'default') {
    list.sort((a, b) => {
      const compareResult = sortType === 'asc' ?
        a[sortBy] - b[sortBy] :
        b[sortBy] - a[sortBy];
      return compareResult;
    });
  }

  // 模拟总数和是否有更多
  const total = 100;
  const hasMore = endIndex < total;

  return {
    list,
    total,
    pageNum,
    pageSize,
    hasMore
  };
}

/** 获取商品列表 */
export const fetchGoodsList = async (params = {}) => {
  const {
    pageNum = 1,
    pageSize = 20,
    categoryId = '',
    keyword = '',
    sortBy = 'default',
    sortType = 'desc'
  } = params;

  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 获取真实商品数据
    let allGoods = getAllProducts();

    // 筛选
    if (categoryId && categoryId !== '0') {
      allGoods = allGoods.filter(item => {
        // 简单映射：我们的真实数据ID通常是 'goods_分类_序号'
        // 但这里我们已经在数据里加上了 categoryId 字段

        // 尝试从 ethnicGoodsList 结构中匹配
        // 注意：getAllProducts 返回的是扁平化的 items 数组
        // 我们需要在 ethnicGoodsList 中预置 categoryId 或者在这里通过 ID 推断

        // 临时方案：通过ID前缀推断分类，或者假设数据已经包含了 categoryId
        // 实际上我们在 ethnic-goods.js 中并没有给 item 加 categoryId，只在大对象加了
        // 我们修改 getAllProducts 让它带上 categoryId 信息会更好
        // 这里假设 getAllProducts 已经优化，或者我们直接通过 ID 解析

        const parts = item.id.split('_');
        const itemCatId = parts[1];
        return itemCatId === String(categoryId);
      });
    }

    if (keyword) {
      allGoods = allGoods.filter(item =>
        item.title.includes(keyword) ||
        item.desc.includes(keyword)
      );
    }

    const total = allGoods.length;

    // 排序
    if (sortBy !== 'default') {
      allGoods.sort((a, b) => {
        if (sortBy === 'price') {
          return sortType === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return 0;
      });
    }

    // 分页
    const startIndex = (pageNum - 1) * pageSize;
    const list = allGoods.slice(startIndex, startIndex + pageSize).map(item => ({
      id: item.id,
      spuId: item.id,
      title: item.title,
      price: item.price,
      minSalePrice: item.price,
      originalPrice: Math.floor(item.price * 1.2),
      primaryImage: item.images[0],
      image: item.images[0],
      tags: ['新品', '甄选'],
      sales: Math.floor(Math.random() * 500)
    }));

    return {
      list,
      total,
      pageNum,
      pageSize,
      hasMore: startIndex + pageSize < total
    };
  } catch (err) {
    console.error('获取商品列表失败:', err);
    return {
      list: [],
      total: 0,
      pageNum,
      pageSize,
      hasMore: false
    };
  }
};
