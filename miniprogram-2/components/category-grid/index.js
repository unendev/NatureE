Component({
  properties: {
    categoryList: {
      type: Array,
      value: []
    },
    loading: {
      type: Boolean,
      value: false
    }
  },

  data: {
    defaultCategories: [
      {
        id: 0,
        name: '全部商品',
        icon: 'https://picsum.photos/300/400?random=1'
      },
      {
        id: 1,
        name: '民族服装',
        icon: 'https://picsum.photos/300/400?random=2'
      },
      {
        id: 2,
        name: '苗族服饰',
        icon: 'https://picsum.photos/300/400?random=3'
      },
      {
        id: 3,
        name: '彝族服饰',
        icon: 'https://picsum.photos/300/400?random=4'
      },
      {
        id: 4,
        name: '傣族服饰',
        icon: 'https://picsum.photos/300/400?random=5'
      },
      {
        id: 5,
        name: '白族服饰',
        icon: 'https://picsum.photos/300/400?random=6'
      },
      {
        id: 6,
        name: '纳西服饰',
        icon: 'https://picsum.photos/300/400?random=7'
      },
      {
        id: 7,
        name: '壮族服饰',
        icon: 'https://picsum.photos/300/400?random=8'
      },
      {
        id: 8,
        name: '瑶族服饰',
        icon: 'https://picsum.photos/300/400?random=9'
      },
      {
        id: 9,
        name: '布依服饰',
        icon: 'https://picsum.photos/300/400?random=10'
      },
      {
        id: 10,
        name: '哈尼服饰',
        icon: 'https://picsum.photos/300/400?random=11'
      },
      {
        id: 11,
        name: '民族配饰',
        icon: 'https://picsum.photos/300/400?random=12'
      }
    ]
  },

  methods: {
    onTapCategory(e) {
      try {
        const { id, name } = e.currentTarget.dataset;

        if (typeof id === 'undefined') {
          console.warn('分类ID未定义');
          return;
        }

        // 所有分类点击都跳转到分类 Tab 页，并通知其切换分类
        wx.setStorageSync('initialCategoryId', id);

        wx.switchTab({
          url: '/pages/category/index',
          fail: (err) => {
            console.error('跳转分类页失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (err) {
        console.error('分类点击事件处理错误:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    }
  }
}); 