Page({
    data: {
        goodsList: []
    },

    onShow() {
        this.init();
    },

    init() {
        const favorites = wx.getStorageSync('favorites') || [];

        // 转换数据格式以适配 goods-list 组件
        const formattedList = favorites.map(item => ({
            id: item.spuId,
            spuId: item.spuId,
            title: item.title,
            price: item.price * 100, // 组件需要分，存储的是元
            primaryImage: item.thumb, // 组件优先使用 primaryImage
            image: item.thumb
        }));

        this.setData({
            goodsList: formattedList
        });
    }
});
