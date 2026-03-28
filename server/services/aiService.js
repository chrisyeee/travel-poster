import axios from 'axios';
import config from '../config/index.js';

/**
 * 推荐城市热门景点
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} 景点列表
 */
export async function recommendSpots(city, retries = 3) {
  const prompt = `请为${city}推荐5-8个热门旅游景点。
请以JSON数组格式返回，每个景点包含以下字段：
- name: 景点名称
- description: 简短描述
- duration: 建议游玩时长

只返回JSON数组，不要其他内容。`;

  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        config.ai.apiUrl,
        {
          model: 'gpt-3.5-turbo',
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

      const content = response.data.choices[0].message.content;
      // 尝试解析JSON
      try {
        // 提取JSON部分（可能包含markdown代码块）
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
                          || content.match(/```\n([\s\S]*?)\n```/)
                          || [null, content];
        return JSON.parse(jsonMatch[1] || content);
      } catch (e) {
        console.error('解析景点数据失败:', e);
        throw new Error('景点推荐失败');
      }
    } catch (error) {
      console.error(`API调用失败 (尝试 ${i + 1}/${retries}):`, error.message);
      lastError = error;

      // 如果是502错误，等待一下再重试
      if (error.response?.status === 502) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw new Error(`景点推荐失败: ${lastError.message}`);
}