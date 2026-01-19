Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    price: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.updatePrice(newVal);
      }
    },
    type: {
      type: String,
      value: 'normal' // normal, lighter, large
    },
    symbol: {
      type: String,
      value: '¥'
    },
    fill: {
      type: Boolean,
      value: true
    },
    color: {
      type: String,
      value: '#fa4126'
    },
    decimalSmaller: {
      type: Boolean,
      value: true
    }
  },

  observers: {
    price(value) {
      this.setData({
        integer: Math.floor(value),
        decimal: value.toFixed(2).split('.')[1]
      });
    }
  },

  data: {
    integerPart: '0',
    decimalPart: '00'
  },

  methods: {
    updatePrice(price) {
      if (typeof price !== 'number') {
        console.warn('价格必须是数字类型');
        price = 0;
      }

      // 处理负数
      if (price < 0) {
        console.warn('价格不能为负数');
        price = 0;
      }

      // 将分转换为元，四舍五入保留2位小数
      const priceInYuan = (price / 100).toFixed(2);
      const [integer = '0', decimal = '00'] = priceInYuan.split('.');

      this.setData({
        integerPart: integer,
        decimalPart: decimal
      });
    }
  }
}); 