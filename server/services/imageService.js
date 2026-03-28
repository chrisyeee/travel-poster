import axios from 'axios';
import config from '../config/index.js';

/**
 * 生成小红书风格海报
 * @param {string} city - 城市名称
 * @param {string} style - 风格
 * @param {Array} spots - 景点列表
 * @returns {Promise<string>} 图片URL
 */
export async function generatePoster(city, style, spots) {
  // 构建JSON格式的prompt
  const promptData = {
    city: city,
    style: style,
    spots: spots.map((spot, index) => ({
      name: spot.name,
      description: spot.description,
      order: index + 1
    })),
    imageSize: "1240x1660",
    format: "竖版3:4小红书图文笔记风格，地图形式展示路线打卡点"
  };

  const prompt = JSON.stringify(promptData, null, 2);

  console.log('正在调用图片生成API...');

  try {
    // 尝试使用webhook="-1"立即获取任务id，然后轮询结果
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