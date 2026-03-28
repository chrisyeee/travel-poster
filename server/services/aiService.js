import axios from 'axios';
import config from '../config/index.js';

/**
 * 推荐城市热门景点
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} 景点列表
 */
export async function recommendSpots(city) {
  const prompt = `请为${city}推荐5-8个热门旅游景点。
请以JSON数组格式返回，每个景点包含以下字段：
- name: 景点名称
- description: 简短描述
- duration: 建议游玩时长

只返回JSON数组，不要其他内容。`;

  try {
    console.log('正在调用AI API...');

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
        timeout: 60000
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('AI返回内容:', content);

    // 尝试解析JSON
    try {
      // 提取JSON部分（可能包含markdown代码块）
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
                        || content.match(/```\n([\s\S]*?)\n```/)
                        || [null, content];
      const parsed = JSON.parse(jsonMatch[1] || content);
      console.log('解析到的景点:', parsed);
      return parsed;
    } catch (e) {
      console.error('解析景点数据失败:', e);
      throw new Error('景点推荐失败：返回格式解析错误');
    }
  } catch (error) {
    console.error('API调用失败:', error.response?.status, error.message);
    throw new Error(`景点推荐失败: ${error.message}`);
  }
}