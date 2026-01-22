Page({
    data: {
        activeTab: 0,
        list: []
    },

    onShow() {
        this.loadData();
    },

    onTabsChange(e) {
        this.setData({
            activeTab: e.detail.value
        });
        this.loadData();
    },

    loadData() {
        // 1. 获取本地存储的动态数据
        let storedList = wx.getStorageSync('afterSaleList') || [];

        // 2. 如果本地为空，塞入一些初始演示数据（仅第一次）
        if (storedList.length === 0) {
            storedList = [
                {
                    id: 'AS2023001',
                    orderNo: '1234567890',
                    status: 1,
                    statusDesc: '处理中',
                    image: '/assets/ethnic-images/ethnic_1.png',
                    goodsName: '汉元素披肩百褶裙套装',
                    num: 1,
                    amount: '299.00'
                },
                {
                    id: 'AS2023002',
                    orderNo: '0987654321',
                    status: 2,
                    statusDesc: '已退款',
                    image: '/assets/ethnic-images/ethnic_44.png',
                    goodsName: '汉风马面裙套装',
                    num: 1,
                    amount: '329.00'
                }
            ];
            wx.setStorageSync('afterSaleList', storedList);
        }

        // 3. 根据 Tab 过滤
        // activeTab: 0=申请售后(全部?), 1=处理中, 2=申请记录(已完成?)
        // 这里简单映射：0=全部, 1=处理中(status=1), 2=已完成/已退款(status=2)
        const { activeTab } = this.data;
        let filteredList = storedList;

        if (activeTab === 1) {
            filteredList = storedList.filter(item => item.status === 1);
        } else if (activeTab === 2) {
            filteredList = storedList.filter(item => item.status === 2);
        }

        this.setData({ list: filteredList });
    }
});
