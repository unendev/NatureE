/**
 * NatureE 统一 AI 服务中心 (Aliyun DashScope) - 终极修复版
 */
const API_KEY = 'sk-b166150ad7db4fdcaca6262856d5903b';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const uploadToAliCloud = async (filePath) => {
    console.log('[AI-Service] 准备上传图片:', filePath);
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}/uploads?action=getPolicy&model=aitryon`,
            method: 'GET',
            header: headers,
            success: (res) => {
                // 关键修复点：根据日志准确匹配 oss_access_key_id
                if (!res.data || !res.data.data) return reject(new Error('获取策略失败'));

                const d = res.data.data;
                const accessId = d.oss_access_key_id || d.accessid || d.accessId;

                console.log('[AI-Service] 字段匹配成功, AccessId:', accessId);

                const fileName = filePath.split('/').pop();
                const key = `${d.upload_dir || d.dir}/${Date.now()}_${fileName}`;

                wx.uploadFile({
                    url: d.upload_host,
                    filePath: filePath,
                    name: 'file',
                    formData: {
                        'OSSAccessKeyId': accessId,
                        'Signature': d.signature,
                        'policy': d.policy,
                        'key': key,
                        'x-oss-object-acl': d.x_oss_object_acl || 'private',
                        'x-oss-forbid-overwrite': d.x_oss_forbid_overwrite || 'true',
                        'success_action_status': '200'
                    },
                    success: (uploadRes) => {
                        if (uploadRes.statusCode === 200) {
                            resolve(`oss://${key}`);
                        } else {
                            console.error('[AI-Service] OSS上传失败:', uploadRes.data);
                            reject(new Error(`上传失败(${uploadRes.statusCode})`));
                        }
                    },
                    fail: reject
                });
            },
            fail: reject
        });
    });
};

const submitDesignTask = async (prompt) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}/services/aigc/text2image/image-synthesis`,
            method: 'POST',
            header: { ...headers, 'X-DashScope-Async': 'enable' },
            data: {
                model: 'wanx-v1',
                input: { prompt },
                parameters: { n: 1, size: '720*1280' }
            },
            success: (res) => {
                if (res.data?.output?.task_id) resolve(res.data.output.task_id);
                else reject(new Error(res.data?.message || '生成提交失败'));
            },
            fail: reject
        });
    });
};

const submitTryonTask = async (personUrl, clothUrl) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}/services/aigc/image2image/image-synthesis`,
            method: 'POST',
            header: {
                ...headers,
                'X-DashScope-Async': 'enable',
                'X-DashScope-OssResourceResolve': 'enable'
            },
            data: {
                model: 'aitryon',
                input: {
                    person_image_url: personUrl,
                    top_garment_url: clothUrl
                },
                parameters: { resolution: -1, restore_face: true }
            },
            success: (res) => {
                if (res.data?.output?.task_id) resolve(res.data.output.task_id);
                else reject(new Error(res.data?.message || '任务提交失败'));
            },
            fail: reject
        });
    });
};

const queryTaskStatus = async (taskId) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}/tasks/${taskId}`,
            method: 'GET',
            header: headers,
            success: (res) => {
                if (res.data?.output) resolve(res.data.output);
                else reject(new Error('查询失败'));
            },
            fail: reject
        });
    });
};

const chatWithAI = async (messages) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${BASE_URL}/services/aigc/text-generation/generation`,
            method: 'POST',
            header: headers,
            data: {
                model: 'qwen-plus',
                input: { messages },
                parameters: { result_format: 'message' }
            },
            success: (res) => {
                if (res.data?.output?.choices?.[0]?.message) resolve(res.data.output.choices[0].message);
                else reject(new Error('对话异常'));
            },
            fail: reject
        });
    });
};

export default {
    uploadToAliCloud,
    submitDesignTask,
    submitTryonTask,
    queryTaskStatus,
    chatWithAI
};
