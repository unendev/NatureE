// 商品图片列表
const goodsImages = [
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.iJQReylpjWNEQbn_Z0tZOAHaL6?pid=ImgDet&w=474&h=762&rs=1',
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.Jj0JGqbDln3ElPORsl-zQgHaLW?pid=ImgDet&w=474&h=726&rs=1',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.GAEO6ffBZmqz_Q_FEKiNSwHaKy?pid=ImgDet&w=474&h=690&rs=1'
];

// 生成所有可能的 SKU 组合
function generateSkuList(colors, sizes, basePrice, index) {
  const skuList = [];
  let skuId = 1;

  // 基础价格随商品索引递增
  const goodBasePrice = basePrice + (index * 500);  // 每个商品基础价格差5元

  colors.forEach(color => {
    sizes.forEach(size => {
      // 不同颜色和尺码有不同的价格增量
      const colorValue = parseInt(color.specValueId) * 200;  // 不同颜色差2元
      const sizeValue = parseInt(size.specValueId) * 100;   // 不同尺码差1元
      const price = goodBasePrice + colorValue + sizeValue;

      skuList.push({
        skuId: `${skuId++}`,
        specInfo: [
          { specId: '1', specValueId: color.specValueId },
          { specId: '2', specValueId: size.specValueId }
        ],
        price: price,  // 单位：分
        originalPrice: Math.floor(price * 1.2),  // 原价比售价高20%
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 10,
          soldQuantity: 0
        }
      });
    });
  });

  return skuList;
}

// 打印生成的商品数据
export function genGood(spuId) {

  // 解析商品索引
  const index = parseInt((spuId || '').replace('goods_', '')) - 1;

  if (isNaN(index) || index < 0) {
    return null;
  }

  // 定义规格选项
  const colorSpecs = [
    { specValueId: '1', specValue: '白色' },
    { specValueId: '2', specValue: '黑色' }
  ];

  const sizeSpecs = [
    { specValueId: '1', specValue: 'S' },
    { specValueId: '2', specValue: 'M' },
    { specValueId: '3', specValue: 'L' }
  ];

  // 生成基础价格（单位：分）
  const basePrice = 1990;  // 基础价格19.9元

  const skuList = generateSkuList(colorSpecs, sizeSpecs, basePrice, index);

  // 计算最低和最高价格（单位：分）
  const prices = skuList.map(sku => sku.price);
  const minSalePrice = Math.min(...prices);
  const maxSalePrice = Math.max(...prices);
  const maxLinePrice = Math.floor(maxSalePrice * 1.2);

  // 生成商品详情
  const detail = {
    spuId,
    title: `民族服饰 ${index + 1}`,
    primaryImage: goodsImages[index % goodsImages.length],
    images: [
      goodsImages[index % goodsImages.length],
      goodsImages[(index + 1) % goodsImages.length]
    ],
    desc: [`这是商品 ${index + 1} 的详细描述`],
    specList: [
      {
        specId: '1',
        title: '颜色',
        specValueList: colorSpecs
      },
      {
        specId: '2',
        title: '尺码',
        specValueList: sizeSpecs
      }
    ],
    skuList,
    minSalePrice,  // 保持单位为分
    maxSalePrice,  // 保持单位为分
    maxLinePrice,  // 保持单位为分
    stockInfo: {
      stockQuantity: 600,
      safeStockQuantity: 50,
      soldQuantity: Math.floor(Math.random() * 1000)
    }
  };

  return detail;
} 