import { config } from '../../config/index';
import { genGood } from '../../model/goods/good';
import errorHandler from '../../utils/error-handler';
import { delay } from '../../utils/delay';

/** 获取商品详情（模拟数据） */
async function mockFetchGood(spuId) {
  try {
    await delay(500);  // 模拟网络延迟

    const good = genGood(spuId);

    if (!good) {
      throw errorHandler.createBusinessError('GOODS_001', '商品不存在');
    }

    return good;
  } catch (err) {
    throw err;
  }
}

/** 获取商品详情 */
export async function fetchGood(spuId) {
  try {
    if (!spuId) {
      throw errorHandler.createBusinessError('GOODS_001', '商品ID无效');
    }

    // 开发环境使用模拟数据
    if (config.useMock) {
      return await mockFetchGood(spuId);
    }

    // TODO: 实际环境调用后端接口
    const good = await mockFetchGood(spuId);
    return good;

  } catch (err) {
    throw errorHandler.formatError(err);
  }
}
