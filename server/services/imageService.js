import axios from 'axios';
import config from '../config/index.js';

/**
 * 优化图片生成的提示词
 * 使用AI将景点信息优化为更适合小红书风格的提示词
 * @param {string} city - 城市名称
 * @param {string} style - 风格
 * @param {Array} spots - 景点列表
 * @returns {Promise<string>} 优化后的提示词
 */
export async function optimizePrompt(city, style, spots) {
  const prompt = `你是一个小红书图片提示词优化专家。

请根据以下信息，生成一个适合AI生图的简洁提示词：

城市：${city}
风格：${style}
景点列表：
${spots.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}

要求：
1. 不要任何tag标签（如#旅行 #打卡等）
2. 文字越少越好，最多保留5-8个关键词
3. 风格要像小红书打卡照片：清新、自然、生活感
4. 突出场景氛围，不要列出具体文字信息

请直接返回优化后的提示词（纯文本，不要JSON，不要代码块）：
`;

  try {
    const response = await axios.post(
      config.ai.apiUrl,
      {
        model: 'nano-banana-fast',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const optimizedPrompt = response.data.choices[0].message.content.trim();
    console.log('优化后的提示词:', optimizedPrompt);
    return optimizedPrompt;

  } catch (error) {
    console.error('提示词优化失败:', error.message);
    // 如果优化失败，使用默认的简洁提示词
    return `${city}旅行打卡，${style}风格，${spots.slice(0,3).map(s => s.name).join('、')}，清新自然，小红书风格`;
  }
}

/**
 * 生成小红书风格海报
 * @param {string} city - 城市名称
 * @param {string} style - 风格
 * @param {Array} spots - 景点列表
 * @returns {Promise<string>} 图片URL
 */
export async function generatePoster(city, style, spots) {
  // 先优化提示词
  console.log('正在优化提示词...');
  const optimizedPrompt = await optimizePrompt(city, style, spots);

  // 构建JSON格式的prompt传给Nano Banana Pro
  const promptData = {
    city: city,
    style: style,
    mainSpots: spots.slice(0, 5).map(s => s.name),
    optimizedPrompt: optimizedPrompt,
    imageSize: "1240x1660",
    aspectRatio: "3:4",
    quality: "high quality, detailed,xiaohongshu style, travel photo aesthetic"
  };

  const prompt = JSON.stringify(promptData, null, 2);

  console.log('正在调用图片生成API...');

  try {
    // 使用webhook="-1"立即获取任务id，然后轮询结果
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

      // 继续轮询
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('轮询结果失败:', error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('图片生成超时');
}