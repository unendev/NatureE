
import Toast from 'tdesign-miniprogram/toast/index';
import aiService from '../../services/ai-service';

const STYLE_MAP = {
  '云南民族服装': 'yunnan ethnic costume',
  '现代改良旗袍': 'modern qipao',
  '苗族刺绣上衣': 'miao embroidery top',
  '傣族纱笼': 'dai sarong',
  '彝族马甲': 'yi vest',
  '纳西族披肩': 'naxi shawl'
};

const THEME_MAP = {
  '传统民族风': 'traditional ethnic',
  '现代简约风': 'modern minimalist',
  '复古文艺风': 'vintage artistic',
  '时尚潮流风': 'fashion trendy',
  '度假休闲风': 'resort casual'
};

Page({
  data: {
    currentTab: 'design',
    // 1. 完全还原原始数据结构
    styleOptions: [
      { value: 0, label: '云南民族服装' },
      { value: 1, label: '现代改良旗袍' },
      { value: 2, label: '苗族刺绣上衣' },
      { value: 3, label: '傣族纱笼' },
      { value: 4, label: '彝族马甲' },
      { value: 5, label: '纳西族披肩' }
    ],
    styleIndex: 0,

    themeOptions: [
      { value: 0, label: '传统民族风' },
      { value: 1, label: '现代简约风' },
      { value: 2, label: '复古文艺风' },
      { value: 3, label: '时尚潮流风' },
      { value: 4, label: '度假休闲风' }
    ],
    themeIndex: 0,

    colors: [
      '#E60012', '#1D953F', '#4C8DAE', '#FFD700', '#800080', '#FFA500', '#FFFFFF', '#000000', '#FFC0CB'
    ],
    colorNames: {
      '#E60012': '云南 red', '#1D953F': 'jade green', '#4C8DAE': 'sky blue',
      '#FFD700': 'gold', '#800080': 'purple', '#FFA500': 'orange',
      '#FFFFFF': 'white', '#000000': 'black', '#FFC0CB': 'pink'
    },
    selectedColor: '#E60012',

    description: '',
    generatedImage: '', // 原始变量名
    isGenerating: false, // 原始变量名

    // 试衣间专用素材 (属于新增部分，保持独立)
    personImage: '',
    clothImage: '',
    tryonImage: '',
    isTryonLoading: false
  },

  onLoad(options) {
    if (options.tab) this.setData({ currentTab: options.tab });
    this.loadLastDesign();
    this.checkNetworkStatus();
  },

  // --- 原始业务逻辑还原 ---
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          Toast({ context: this, selector: '#t-toast', message: '请检查网络连接', theme: 'warning' });
        }
      }
    });
  },

  loadLastDesign() {
    const lastDesign = wx.getStorageSync('lastDesign');
    if (lastDesign) {
      this.setData({
        generatedImage: lastDesign.image,
        styleIndex: lastDesign.styleIndex,
        themeIndex: lastDesign.themeIndex,
        selectedColor: lastDesign.color,
        description: lastDesign.description
      });
    }
  },

  saveCurrentDesign() {
    const currentDesign = {
      image: this.data.generatedImage,
      styleIndex: this.data.styleIndex,
      themeIndex: this.data.themeIndex,
      color: this.data.selectedColor,
      description: this.data.description
    };
    wx.setStorageSync('lastDesign', currentDesign);
  },

  onTabChange(e) {
    const value = e.detail.value || e.currentTarget.dataset.value;
    this.setData({ currentTab: value });
  },
  onStyleSelect(e) { this.setData({ styleIndex: e.currentTarget.dataset.index }); },
  onThemeSelect(e) { this.setData({ themeIndex: e.currentTarget.dataset.index }); },
  onColorSelect(e) { this.setData({ selectedColor: e.currentTarget.dataset.color }); },
  onDescriptionChange(e) { this.setData({ description: e.detail.value || e.detail.cursor !== undefined ? e.detail.value : '' }); },

  // --- 核心能力：全云端化(High-Fidelity) ---
  async onGenerate() {
    if (this.data.isGenerating) return;

    const styleLabel = this.data.styleOptions[this.data.styleIndex].label;
    const themeLabel = this.data.themeOptions[this.data.themeIndex].label;
    const style = STYLE_MAP[styleLabel];
    const theme = THEME_MAP[themeLabel];
    const colorName = this.data.colorNames[this.data.selectedColor];

    let prompt = `A ${style} in ${theme} style, ${colorName} as main color, with Yunnan ethnic elements, traditional patterns`;
    if (this.data.description) prompt += `, ${this.data.description}`;
    prompt += `, Chinese ethnic minority costume, high quality, detailed, professional fashion photography, studio lighting, 8k uhd`;

    console.log('[Design] 开始云端生成:', prompt);
    this.setData({ isGenerating: true });

    Toast({ context: this, selector: '#t-toast', message: '正在生成设计...', theme: 'loading', duration: 0 });

    try {
      const taskId = await aiService.submitDesignTask(prompt);
      this.pollTask(taskId, 'generatedImage', 'isGenerating');
    } catch (error) {
      this.handleError(error, 'isGenerating');
    }
  },

  // --- 试衣逻辑 ---
  chooseTryonImage(e) {
    const { type } = e.currentTarget.dataset;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => this.setData({ [`${type}Image`]: res.tempFiles[0].tempFilePath })
    });
  },

  async onStartTryon() {
    if (this.data.isTryonLoading) return;
    this.setData({ isTryonLoading: true });
    try {
      const personOss = await aiService.uploadToAliCloud(this.data.personImage);
      const clothOss = this.data.clothImage.startsWith('http') ? this.data.clothImage : await aiService.uploadToAliCloud(this.data.clothImage);
      const taskId = await aiService.submitTryonTask(personOss, clothOss);
      this.pollTask(taskId, 'tryonImage', 'isTryonLoading');
    } catch (err) {
      this.handleError(err, 'isTryonLoading');
    }
  },

  syncToTryon() {
    this.setData({ clothImage: this.data.generatedImage, currentTab: 'tryon' });
    Toast({ context: this, selector: '#t-toast', message: '已同步图纸', theme: 'success' });
  },

  // --- 通用工具 ---
  pollTask(taskId, resKey, loadingKey) {
    const check = async () => {
      try {
        const output = await aiService.queryTaskStatus(taskId);
        if (output.task_status === 'SUCCEEDED') {
          this.setData({ [resKey]: output.image_url || output.results?.[0]?.url, [loadingKey]: false });
          if (resKey === 'generatedImage') this.saveCurrentDesign();
          Toast({ context: this, selector: '#t-toast', message: '操作成功', theme: 'success' });
        } else if (output.task_status === 'FAILED') {
          throw new Error(output.message || '任务失败');
        } else {
          setTimeout(check, 3000);
        }
      } catch (err) {
        this.handleError(err, loadingKey);
      }
    };
    check();
  },

  handleError(err, loadingKey) {
    this.setData({ [loadingKey]: false });
    Toast({ context: this, selector: '#t-toast', message: err.message || '操作失败', theme: 'error' });
  },

  onSave() {
    // 原始保存逻辑
    this.downloadAndSave(this.data.generatedImage);
  },

  async downloadAndSave(url) {
    if (!url) return;
    wx.showLoading({ title: '保存中' });
    try {
      const res = await new Promise((rs, rj) => wx.downloadFile({ url, success: rs, fail: rj }));
      await new Promise((rs, rj) => wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath, success: rs, fail: rj }));
      Toast({ context: this, selector: '#t-toast', message: '已保存', theme: 'success' });
    } catch (e) {
      console.error(e);
    } finally {
      wx.hideLoading();
    }
  }
});