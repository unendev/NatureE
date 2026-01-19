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
      const p = typeof price === 'number' && price >= 0 ? price : 0;
      const priceInYuan = (p / 100).toFixed(2);
      const [integer = '0', decimal = '00'] = priceInYuan.split('.');

      this.setData({
        integerPart: integer,
        decimalPart: decimal
      });
    }
  }
});