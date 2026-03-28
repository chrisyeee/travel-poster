import axios from 'axios';
import config from '../config/index.js';

/**
 * 风格配置 - 针对小红书女性用户
 * 包含视觉风格描述和氛围关键词
 */
const STYLE_CONFIGS = {
  '清新自然': {
    description: '清新自然风格',
    atmosphere: '阳光明媚，清新空气，绿树成荫，碧水蓝天',
    colors: '浅绿色、淡蓝色、白色为主色调，清新明亮',
    mood: '放松、治愈、舒适的旅行氛围'
  },
  '文艺复古': {
    description: '文艺复古风格',
    atmosphere: '暖黄灯光，旧时光质感，岁月沉淀，文化气息',
    colors: '暖黄色、棕褐色、米白色，复古色调',
    mood: '怀旧、文艺、有故事感的旅行氛围'
  },
  '韩系ins': {
    description: '韩系简约风格',
    atmosphere: '干净利落，高级感，留白美学',
    colors: '白色、浅灰色、淡粉色，极简色调',
    mood: '精致、时尚、都市感'
  },
  '卡通可爱': {
    description: '卡通可爱风格',
    atmosphere: '童趣梦幻，糖果色彩，萌系元素',
    colors: '马卡龙色系：粉色、薄荷绿、淡黄色',
    mood: '可爱、甜蜜、少女心'
  },
  '胶片感': {
    description: '胶片复古老电影风格',
    atmosphere: '电影感镜头，胶片颗粒，暖色光晕',
    colors: '暖橙色调，复古滤镜，颗粒质感',
    mood: '电影感、故事感、时光感'
  },
  '日系治愈': {
    description: '日系杂志治愈风格',
    atmosphere: '逆光拍摄，阳光透射，温柔光影',
    colors: '暖白、淡粉、浅蓝，柔和色调',
    mood: '宁静、治愈、温柔'
  },
  '油画质感': {
    description: '油画艺术质感风格',
    atmosphere: '艺术画廊感，笔触质感，朦胧美',
    colors: '莫兰迪色系：灰蓝、灰粉、高级灰',
    mood: '艺术、优雅、有品位'
  },
  '时尚都市': {
    description: '时尚都市夜景风格',
    atmosphere: '霓虹灯光，现代建筑，都市夜景',
    colors: '深蓝、紫色、粉色霓虹，璀璨灯光',
    mood: '时尚、活力、现代'
  }
};

/**
 * 使用 DeepSeek 优化图片生成的提示词
 * 生成适合小红书女性用户风格的精美打卡地图
 */
export async function optimizePrompt(city, style, spots) {
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS['清新自然'];

  // 构建详细的景点信息
  const spotDetails = spots.map((s, i) => {
    return `
【景点${i + 1}】${s.name}
- 游玩时长：${s.duration || '1-2小时'}
- 特色描述：${s.description || s.name + '著名打卡地'}
`;
  }).join('\n');

  const prompt = `你是一个专业的小红书旅行博主，擅长写AI生图提示词。

请为以下旅行打卡地图生成一个精美丰富的图片提示词：

【目的地】${city}
【选择风格】${style}
- 视觉氛围：${styleConfig.atmosphere}
- 色调：${styleConfig.colors}
- 整体感觉：${styleConfig.mood}

【打卡景点信息】${spotDetails}

【生成要求 - 非常重要】
1. 这是一张精美的小红书旅行打卡地图，必须具备以下要素：
   - 地图背景：手绘风格地图，有纹理感
   - 景点标记：用该景点最标志性的视觉元素来呈现（如建筑轮廓、景观特征）
   - 路线连接：景点之间用【实线路径】连接，有起点到终点的路线感，像真实地图上的道路
   - 打卡图标：每个景点有醒目的打卡标记（可以用圆形/星形等图标）

2. 每个景点的视觉呈现（重要！）：
   ${spots.map((s, i) => `   - ${s.name}：要用能让人一眼认出的标志性元素表现`).join('\n')}

3. 整体画面要求：
   - 画面丰富有层次，不能太平淡
   - 有前景、中景、远景的层次感
   - 整体色调统一协调，符合所选风格
   - 有氛围感：阳光、光影、虚实结合
   - 有装饰元素：树木、花草、云朵等自然元素点缀

4. 绝对禁止：
   - 不要任何文字、标签、hashtag
   - 不要人脸、人物特写
   - 不要虚线、虚线路径

请直接返回中文提示词，纯文本，直接用于AI生图：
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
        max_tokens: 1000
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
    // 生成包含详细景点信息的备用提示词
    const spotNames = spots.map(s => s.name).join('、');
    const spotVisuals = spots.map(s => `${s.name}标志性建筑或景观`).join('、');
    return `小红书旅行打卡地图，${city}景点：${spotVisuals}，手绘地图风格，实线路径连接各景点，${styleConfig.atmosphere}，${styleConfig.colors}，画面丰富有层次，${styleConfig.mood}，阳光光影，装饰元素，画面饱满，堪比小红书爆款旅行笔记，无文字标签`;
  }
}

/**
 * 生成小红书风格打卡地图海报
 */
export async function generatePoster(city, style, spots) {
  // 先用 DeepSeek 优化提示词
  console.log('正在生成精美打卡地图...');
  const optimizedPrompt = await optimizePrompt(city, style, spots);

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