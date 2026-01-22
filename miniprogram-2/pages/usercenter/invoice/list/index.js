Page({
    data: {
        activeTab: 0,
        invoiceList: []
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
        let storedList = wx.getStorageSync('invoiceList') || [];

        // 2. 如果本地为空，塞入一些初始演示数据（仅第一次）
        if (storedList.length === 0) {
            storedList = [
                {
                    id: 'INV2023001',
                    createTime: '2025-01-20 14:30',
                    status: 2,
                    statusDesc: '已开票',
                    type: '电子普通发票',
                    title: '个人',
                    amount: '299.00'
                },
                {
                    id: 'INV2023002',
                    createTime: '2025-01-22 09:15',
                    status: 1,
                    statusDesc: '开票中',
                    type: '电子普通发票',
                    title: '某某科技有限公司',
                    amount: '598.00'
                }
            ];
            wx.setStorageSync('invoiceList', storedList);
        }

        // 3. 根据 Tab 过滤
        // activeTab: 0=全部, 1=开票中, 2=已开票
        const { activeTab } = this.data;
        let filteredList = storedList;

        if (activeTab === 1) {
            filteredList = storedList.filter(item => item.status === 1);
        } else if (activeTab === 2) {
            filteredList = storedList.filter(item => item.status === 2);
        }

        this.setData({ invoiceList: filteredList });
    }
});
