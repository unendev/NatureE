import Toast from 'tdesign-miniprogram/toast/index';
import aiService from '../../services/ai-service';

Page({
  data: {
    userInfo: null,
    messages: [],
    inputValue: '',
    loading: false,
    scrollToMessage: '',
    quickQuestions: [
      '如何查看订单状态？',
      '怎么修改收货地址？',
      '如何申请退款？',
      '商品什么时候发货？',
      '如何修改订单？',
      '优惠券怎么使用？'
    ]
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });

    // 发送欢迎语
    this.addAIMessage('您好！我是 NatureE 的智能助手。基于通义千问大模型为您服务。您可以询问我关于商品设计、订单或是民族服饰的小知识。');
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onQuickQuestionTap(e) {
    const { question } = e.currentTarget.dataset;
    this.setData({ inputValue: question }, () => this.onSend());
  },

  async onSend() {
    const { inputValue, loading, messages } = this.data;
    if (loading || !inputValue.trim()) return;

    const userContent = inputValue.trim();
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: userContent,
      time: new Date().toLocaleTimeString()
    };

    this.setData({
      messages: [...messages, userMsg],
      inputValue: '',
      loading: true,
      scrollToMessage: `msg-${userMsg.id}`
    });

    try {
      // 构造上下文（包含最近3轮对话以保持记忆）
      const history = messages.slice(-6).map(m => ({
        role: m.type === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));
      history.push({ role: 'user', content: userContent });

      // 调用阿里云通义千问
      const result = await aiService.chatWithAI(history);

      this.addAIMessage(result.content);
    } catch (error) {
      console.error('AI 对话失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: 'AI 思考时走神了，请重试',
        theme: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  addAIMessage(content) {
    const aiMsg = {
      id: Date.now(),
      type: 'ai',
      content: content,
      time: new Date().toLocaleTimeString()
    };
    this.setData({
      messages: [...this.data.messages, aiMsg],
      scrollToMessage: `msg-${aiMsg.id}`
    });
  },

  navToTryon() {
    wx.navigateTo({
      url: '/pages/design/design?tab=tryon', // 引导至设计中心的试衣 Tab
    });
  }
});