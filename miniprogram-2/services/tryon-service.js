/**
 * 阿里云百炼 AI 试衣服务
 */
const API_KEY = 'sk-b166150ad7db4fdcaca6262856d5903b';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * 获取上传策略并上传文件到阿里云 OSS
 * @param {string} filePath 本地临时路径
 * @returns {Promise<string>} 返回 oss:// 协议路径
 */
const uploadToAliCloud = async (filePath) => {
  return new Promise((resolve, reject) => {
    // 1. 获取上传 Policy
    wx.request({
      url: `${BASE_URL}/uploads?action=getPolicy&model=aitryon`,
      method: 'GET',
      header: headers,
      success: (res) => {
        if (!res.data || !res.data.data) {
          return reject(new Error('获取上传策略失败'));
        }
        const policy = res.data.data;
        const fileName = filePath.split('/').pop();
        const key = `${policy.dir}${Date.now()}_${fileName}`;

        // 2. 使用 wx.uploadFile 上传到返回的 upload_host
        wx.uploadFile({
          url: policy.upload_host,
          filePath: filePath,
          name: 'file',
          formData: {
            'OSSAccessKeyId': policy.accessid,
            'Signature': policy.signature,
            'policy': policy.policy,
            'key': key,
            'x-oss-object-acl': 'private',
            'x-oss-forbid-overwrite': 'true',
            'success_action_status': '200'
          },
          success: (uploadRes) => {
            if (uploadRes.statusCode === 200) {
              // 构造 oss:// 路径
              resolve(`oss://${key}`);
            } else {
              reject(new Error('图片上传 OSS 失败'));
            }
          },
          fail: reject
        });
      },
      fail: reject
    });
  });
};

/**
 * 提交试衣任务
 * @param {string} personUrl 模特图 (oss:// 或 http)
 * @param {string} clothUrl 服饰图 (oss:// 或 http)
 * @returns {Promise<string>} task_id
 */
const submitTryonTask = async (personUrl, clothUrl) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/services/aigc/image2image/image-synthesis`,
      method: 'POST',
      header: {
        ...headers,
        'X-DashScope-Async': 'enable',
        'X-DashScope-OssResourceResolve': 'enable' // 关键：允许解析 oss:// 链接
      },
      data: {
        model: 'aitryon',
        input: {
          person_image_url: personUrl,
          top_garment_url: clothUrl // 默认先实现上装，以后可扩展
        },
        parameters: {
          resolution: -1,
          restore_face: true
        }
      },
      success: (res) => {
        if (res.data && res.data.output && res.data.output.task_id) {
          resolve(res.data.output.task_id);
        } else {
          reject(new Error(res.data.message || '提交任务失败'));
        }
      },
      fail: reject
    });
  });
};

/**
 * 查询任务结果
 * @param {string} taskId 
 */
const queryTaskStatus = async (taskId) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/tasks/${taskId}`,
      method: 'GET',
      header: headers,
      success: (res) => {
        if (res.data && res.data.output) {
          resolve(res.data.output);
        } else {
          reject(new Error('查询状态失败'));
        }
      },
      fail: reject
    });
  });
};

export default {
  uploadToAliCloud,
  submitTryonTask,
  queryTaskStatus
};
