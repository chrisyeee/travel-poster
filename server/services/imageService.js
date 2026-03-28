import axios from 'axios';
import config from '../config/index.js';

/**
 * 风格配置 - 针对小红书女性用户
 */
const STYLE_CONFIGS = {
  '清新自然': {
    description: '浅绿浅蓝配色，自然风光，清新治愈',
    keywords: '浅绿色调，清新风格，自然景色，阳光明媚，柔和光线，旅行氛围，生活美学'
  },
  '文艺复古': {
    description: '暖色调，复古胶片感，电影质感',
    keywords: '暖黄色调，复古胶片质感，电影画面，怀旧氛围，颗粒感，暖色滤镜'
  },
  '时尚都市': {
    description: '高级灰+亮色点缀，现代都市感，夜景',
    keywords: '现代城市天际线，霓虹灯光，高级灰色调，精致时尚，夜景璀璨，都市感'
  },
  '卡通可爱': {
    description: '柔和马卡龙色系，卡通插画风格，萌系',
    keywords: '马卡龙柔和色彩，可爱卡通插画风格，萌系元素，圆润线条，童话风格'
  },
  '韩系ins': {
    description: '韩风杂志感，白色系为主，简约高级',
    keywords: '韩式简约风格，白色主调，干净构图，高级感，杂志排版，单色系'
  },
  '胶片感': {
    description: '复古胶片颗粒感，暖色滤镜，人文气息',
    keywords: '复古胶片颗粒，暖色滤镜，逆光拍摄，人文纪实，金色阳光，怀旧感'
  },
  '油画质感': {
    description: '莫兰迪色调，艺术感，氛围感',
    keywords: '莫兰迪色系，油画笔触质感，艺术氛围，柔和色调，高级感，朦胧美'
  },
  '日系治愈': {
    description: '日系杂志风，逆光感，温暖治愈',
    keywords: '日系杂志风格，逆光温暖阳光，治愈系画面，宁静氛围，柔和生活感'
  }
};

/**
 * 使用 DeepSeek 优化图片生成的提示词
 * 生成适合小红书女性用户风格的打卡地图
 */
export async function optimizePrompt(city, style, spots) {
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS['清新自然'];

  // 构建详细的景点描述
  const spotDescriptions = spots.map((s, i) => {
    return `第${i + 1}站：${s.name} - ${s.description || '著名景点'}`;
  }).join('\n');

  const prompt = `你是一个专业的小红书旅行博主，擅长写AI生图提示词。

请根据以下信息生成一个精美的旅行打卡地图图片提示词：

【目的地】${city}
【选择风格】${style} - ${styleConfig.description}
【打卡景点】
${spotDescriptions}

【生成要求】
1. 图片是一张精美的旅行打卡地图，必须包含所有上述景点的标志性特征
2. 风格要求：${styleConfig.keywords}
3. 面向18-30岁中国女性用户，审美清新高级
4. 每个景点要有清晰可辨认的代表性元素
5. 地图风格：小红书爆款旅行笔记风格，手绘地图，可爱景点图标，连接路线
6. 整体氛围：旅行的美好、探索的期待、生活的仪式感
7. 不要任何文字标签（如#打卡 #旅行等 hashtag）
8. 不要出现人脸或人物特写
9. 必须用中文描述各个景点的标志性元素

请直接返回用于AI生图的中文提示词，直接返回纯文本，不要JSON，不要代码块，不要解释：
`;

  try {
    console.log('正在调用 DeepSeek 优化提示词...');

    const response = await axios.post(
      config.ai.apiUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const optimizedPrompt = response.data.choices[0].message.content.trim();
    console.log('DeepSeek 优化后的提示词:', optimizedPrompt);
    return optimizedPrompt;

  } catch (error) {
    console.error('提示词优化失败:', error.message, error.response?.data);
    // 如果优化失败，使用包含景点名称的默认提示词
    const spotNames = spots.map(s => s.name).join('、');
    return `小红书风格旅行打卡地图，${city}著名景点：${spotNames}，手绘地图风格，可爱景点标记，连接路线，${styleConfig.keywords}，清新治愈风格，无文字标签`;
  }
}

/**
 * 生成小红书风格打卡地图海报
 */
export async function generatePoster(city, style, spots) {
  // 先用 DeepSeek 优化提示词
  console.log('正在生成精美打卡地图...');
  const optimizedPrompt = await optimizePrompt(city, style, spots);

  // 直接使用优化后的中文提示词
  console.log('正在调用 Nano Banana Pro 图片生成...');

  try {
    const submitResponse = await axios.post(
      config.nanobananaPro.apiUrl,
      {
        model: "nano-banana-pro",
        prompt: optimizedPrompt,
        aspectRatio: "3:4",
        imageSize: "1K",
        webHook: "-1",
        shutProgress: true
      },
      {
        headers: {
          'Authorization': `Bearer ${config.nanobananaPro.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('提交响应:', submitResponse.data);

    const taskId = submitResponse.data?.data?.id;

    if (!taskId) {
      throw new Error('无法获取任务ID');
    }

    console.log('任务ID:', taskId);

    // 轮询获取结果
    const imageUrl = await pollForResult(taskId);
    return imageUrl;

  } catch (error) {
    console.error('图片生成失败:', error.message, error.response?.data);
    throw new Error(`图片生成失败: ${error.message}`);
  }
}

/**
 * 轮询获取结果
 */
async function pollForResult(taskId, maxAttempts = 60) {
  const resultUrl = config.nanobananaPro.apiUrl.replace('/draw/nano-banana', '/draw/result');

  console.log('开始轮询结果...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.post(
        resultUrl,
        { id: taskId },
        {
          headers: {
            'Authorization': `Bearer ${config.nanobananaPro.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data?.data;

      console.log(`轮询 ${i + 1}:`, data?.status);

      if (data?.status === 'succeeded' && data?.results?.[0]?.url) {
        console.log('图片生成成功!');
        return data.results[0].url;
      }

      if (data?.status === 'failed') {
        throw new Error(`图片生成失败: ${data.failure_reason || '未知错误'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('轮询结果失败:', error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('图片生成超时');
}