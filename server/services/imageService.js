import axios from 'axios';
import config from '../config/index.js';

/**
 * 风格配置 - 针对小红书女性用户
 */
const STYLE_CONFIGS = {
  '清新自然': {
    description: '浅绿浅蓝配色，自然风光，清新治愈',
    keywords: 'pastel colors, soft lighting, nature, fresh, airy, travel vibe, lifestyle photography'
  },
  '文艺复古': {
    description: '暖色调，复古胶片感，电影质感',
    keywords: 'warm tones, vintage film, cinematic, retro aesthetic, soft grain, nostalgic mood'
  },
  '时尚都市': {
    description: '高级灰+亮色点缀，现代都市感，夜景',
    keywords: 'modern city, urban style, night lights, fashion, chic, sophisticated, neon accents'
  },
  '卡通可爱': {
    description: '柔和马卡龙色系，卡通插画风格，萌系',
    keywords: 'cute illustration style, pastel macaron colors, kawaii, adorable, playful, soft edges'
  },
  '韩系 ins': {
    description: '韩风杂志感，白色系为主，简约高级',
    keywords: 'korean magazine style, white minimalist, clean composition, aesthetic, monochrome'
  },
  '胶片感': {
    description: '复古胶片颗粒感，暖色滤镜，人文气息',
    keywords: 'film grain texture, warm vintage filter, nostalgic, candid photography, golden hour'
  },
  '油画质感': {
    description: '莫兰迪色调，艺术感，氛围感',
    keywords: 'morandi color palette, oil painting texture, artistic, soft brushstrokes, elegant'
  },
  '日系治愈': {
    description: '日系杂志风，逆光感，温暖治愈',
    keywords: 'japanese magazine style, backlight, warm sunshine, healing, peaceful, serene'
  }
};

/**
 * 使用 DeepSeek 优化图片生成的提示词
 * 生成适合小红书女性用户风格的打卡地图
 */
export async function optimizePrompt(city, style, spots) {
  const spotNames = spots.map(s => s.name).join('、');
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS['清新自然'];

  const prompt = `你是一个专业的小红书旅行博主，擅长写旅行打卡地图的AI生图提示词。

请为以下信息生成一个精美的打卡地图图片提示词：

目的地：${city}
选择风格：${style} - ${styleConfig.description}
打卡景点：${spotNames}

要求：
1. 图片是一张精美的旅行打卡地图，包含多个景点打卡点和连接路线
2. 风格要求：${styleConfig.keywords}
3. 主要面向18-30岁女性用户，审美清新高级
4. 地图风格要像小红书爆款旅行笔记：手绘地图、景点标记、可爱图标
5. 整体氛围：旅行的美好、探索的期待、生活的仪式感
6. 不要任何文字标签（如#打卡 #旅行等）
7. 不要出现人脸或人物特写

请用英文生成这个提示词，直接返回纯文本，不要JSON，不要代码块，不要解释：
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
        max_tokens: 500
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
    // 如果优化失败，使用默认提示词
    return `${city} travel check-in map, ${spotNames}, hand-drawn style, cute markers, pastel colors, Xiaohongshu aesthetic, travel notebook style, soft and dreamy atmosphere`;
  }
}

/**
 * 生成小红书风格打卡地图海报
 */
export async function generatePoster(city, style, spots) {
  // 先用 DeepSeek 优化提示词
  console.log('正在生成精美打卡地图...');
  const optimizedPrompt = await optimizePrompt(city, style, spots);

  // 构建 JSON 格式的 prompt 传给 Nano Banana Pro
  const promptData = {
    prompt: optimizedPrompt,
    city: city,
    style: style,
    spots: spots.map(s => s.name),
    imageSize: "1240x1660",
    aspectRatio: "3:4",
    quality: "ultra detailed, high quality,xiaohongshu aesthetic, travel map style"
  };

  const prompt = JSON.stringify(promptData, null, 2);

  console.log('正在调用 Nano Banana Pro 图片生成...');

  try {
    const submitResponse = await axios.post(
      config.nanobananaPro.apiUrl,
      {
        model: "nano-banana-pro",
        prompt: prompt,
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