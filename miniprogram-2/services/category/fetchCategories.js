import { ethnicGoodsList } from '../../model/goods/ethnic-goods';
import { cdnBase } from '../../config/index';

export const fetchCategories = () => {
  // 1. 生成所有商品分类
  const allCategory = {
    id: 0,
    name: '全部商品',
    // 使用第一个民族的第一张图作为全部商品的封面
    icon: ethnicGoodsList[0]?.items[0]?.images[0] || ''
  };

  // 2. 遍历民族数据生成分类列表
  const ethnicCategories = ethnicGoodsList.map(group => {
    // 获取该民族第一件商品的第一张图作为分类图标
    // 如果图片是本地路径 (以/开头)，保持原样；如果是外部链接，也可以；
    // 注意：展示层通常不需要加 cdnBase，除非 img 组件不做处理
    let icon = '';
    if (group.items && group.items.length > 0 && group.items[0].images && group.items[0].images.length > 0) {
      icon = group.items[0].images[0];
    }

    return {
      id: group.categoryId, // 确保转换类型匹配
      name: group.nation,
      icon: icon
    };
  });

  return Promise.resolve([allCategory, ...ethnicCategories]);
}; 