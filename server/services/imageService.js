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

  const response = await axios.post(
    config.nanobananaPro.apiUrl,
    {
      model: "nano-banana-pro",
      prompt: prompt,
      aspectRatio: "3:4",
      imageSize: "1K"
    },
    {
      headers: {
        'Authorization': `Bearer ${config.nanobananaPro.apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    }
  );

  // 解析流式响应，提取图片URL
  return new Promise((resolve, reject) => {
    let data = '';
    response.data.on('data', (chunk) => {
      data += chunk.toString();
    });
    response.data.on('end', () => {
      try {
        // 解析每个行的JSON数据
        const lines = data.split('\n').filter(line => line.trim());
        let imageUrl = '';

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.results && parsed.results[0] && parsed.results[0].url) {
              imageUrl = parsed.results[0].url;
              break;
            }
            if (parsed.status === 'succeeded' && parsed.results && parsed.results[0]) {
              imageUrl = parsed.results[0].url;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (imageUrl) {
          resolve(imageUrl);
        } else {
          reject(new Error('图片生成失败'));
        }
      } catch (e) {
        reject(new Error('解析图片响应失败: ' + e.message));
      }
    });
    response.data.on('error', reject);
  });
}