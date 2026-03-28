import axios from 'axios';
import config from '../config/index.js';

/**
 * 风格配置 - 针对小红书女性用户
 */
const STYLE_CONFIGS = {
  '清新自然': {
    art_style: '水彩手绘插画风格，柔和笔触',
    background: '淡雅米色纸张，细腻纹理',
    color_palette: '浅绿色、淡蓝色、柔粉色、奶白色',
    line_work: '轻柔线条，手绘涂鸦感'
  },
  '文艺复古': {
    art_style: '复古胶片插画风格，电影海报质感',
    background: '做旧纸张纹理，泛黄色调',
    color_palette: '暖黄色、棕褐色、焦糖色、复古红',
    line_work: '炭笔线条，复古网点质感'
  },
  '韩系ins': {
    art_style: '韩式简约插画，杂志排版感',
    background: '纯白纸张，大量留白',
    color_palette: '白色、浅灰色、淡粉色、墨绿色',
    line_work: '极简线条，几何感'
  },
  '卡通可爱': {
    art_style: '卡通插画风格，圆润可爱',
    background: '奶油色纸张，卡通纹理',
    color_palette: '马卡龙色：粉色、薄荷绿、淡黄色、薰衣草紫',
    line_work: '圆润线条，粗细均匀'
  },
  '胶片感': {
    art_style: '胶片摄影插画，颗粒感',
    background: '暖调纸张，柔焦效果',
    color_palette: '暖橙色调、复古老电影感、褪色效果',
    line_work: '柔和虚化，电影感'
  },
  '日系治愈': {
    art_style: '日系杂志插画，逆光氛围',
    background: '柔光纸张，梦幻感',
    color_palette: '暖白色、淡粉色、浅蓝色、蜜糖色',
    line_work: '逆光剪影，柔和光晕'
  },
  '油画质感': {
    art_style: '油画质感插画，艺术画廊风',
    background: '画布纹理，梵高感',
    color_palette: '莫兰迪色系：灰蓝、灰粉、豆沙绿',
    line_work: '笔触质感，朦胧美'
  },
  '时尚都市': {
    art_style: '时尚插画，都市霓虹感',
    background: '深色调纸张，霓虹光效',
    color_palette: '深蓝、紫色、粉色霓虹、玫瑰金',
    line_work: '光效线条，LED感'
  }
};

/**
 * 使用 DeepSeek 生成完整的JSON提示词结构
 * 这个JSON会直接传给 Nano Banana Pro
 */
export async function optimizePrompt(city, style, spots) {
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS['清新自然'];

  // 构建景点详细信息供DeepSeek参考
  const spotInfo = spots.map((s, i) => ({
    name: s.name,
    description: s.description || '',
    duration: s.duration || '1-2小时',
    order: i + 1
  }));

  const prompt = `你是一个专业的小红书旅行打卡地图设计师。请为以下目的地生成一个精美的JSON格式图片生成提示词。

【目的地】${city}
【选择风格】${style}
【风格参数】
- 艺术风格：${styleConfig.art_style}
- 背景：${styleConfig.background}
- 色调：${styleConfig.color_palette}
- 线条：${styleConfig.line_work}

【景点信息】
${spots.map((s, i) => `景点${i + 1}：${s.name}，游玩时长：${s.duration || '1-2小时'}，特色：${s.description || '著名打卡地'}`).join('\n')}

【生成要求 - 必须返回JSON格式】
请生成一个完整的JSON对象，包含以下结构（所有文字必须是中文）：

{
  "poster_type": "精美旅行打卡地图海报",
  "visual_style": {
    "art_style": "艺术风格描述",
    "background": "背景描述",
    "color_palette": "色调描述",
    "line_work": "线条风格",
    "atmosphere": "整体氛围描述"
  },
  "layout_elements": {
    "title_section": {
      "position": "顶部居中",
      "content": "城市名+旅行打卡地图",
      "font_style": "手绘艺术字体"
    },
    "map_section": {
      "position": "画面中央",
      "style": "手绘地图风格",
      "route_style": "实线路径连接各景点，有起点到终点路线感",
      "route_markers": "起点标记、终点标记、途经点标记"
    },
    "landmarks": [
      {
        "name": "景点名称",
        "icon": "标志性图标描述（如塔、桥、楼阁等）",
        "position": "在地图上的位置",
        "info_bubble": {
          "name": "景点名",
          "duration": "游玩时长",
          "tip": "小贴士或特色"
        }
      }
    ],
    "compass": {
      "position": "右上角",
      "style": "简约手绘指南针"
    }
  },
  "decoration_details": [
    "手绘树木",
    "简约云朵",
    "当地特色花卉",
    "阳光光影效果",
    "装饰性虚线框"
  ],
  "image_prompt": "一段完整的中文描述，用于AI生图，包含：画面整体描述、地图风格、景点视觉呈现、氛围感、色彩描述等"
}

【重要约束】
1. 所有中文文字描述都要简洁清晰
2. 每个景点要有：名称、游玩时长、特色描述（info_bubble）
3. 路线连接必须是实线路径，不是虚线
4. 画面要丰富有层次，不能平淡
5. image_prompt字段要是完整的中文描述，可直接用于AI生图
6. 返回的JSON必须能被JSON.parse解析

请直接返回JSON，不要有任何其他内容：`;

  try {
    console.log('正在调用 DeepSeek 生成JSON提示词...');

    const response = await axios.post(
      config.ai.apiUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    let jsonPrompt = response.data.choices[0].message.content.trim();

    // 提取JSON（可能有markdown代码块）
    const jsonMatch = jsonPrompt.match(/```json\n?([\s\S]*?)\n?```/) || jsonPrompt.match(/```\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonPrompt = jsonMatch[1];
    }

    console.log('DeepSeek 生成的JSON提示词:', jsonPrompt);

    // 验证JSON是否有效
    try {
      JSON.parse(jsonPrompt);
    } catch (e) {
      console.error('JSON解析失败，重新生成...');
      // 返回一个默认的JSON
      jsonPrompt = generateDefaultJsonPrompt(city, style, spots, styleConfig);
    }

    return jsonPrompt;

  } catch (error) {
    console.error('提示词生成失败:', error.message);
    return generateDefaultJsonPrompt(city, style, spots, styleConfig);
  }
}

/**
 * 生成默认的JSON提示词
 */
function generateDefaultJsonPrompt(city, style, spots, styleConfig) {
  const landmarks = spots.map((s, i) => ({
    name: s.name,
    icon: `标志性建筑或景观插画`,
    position: `第${i + 1}站`,
    info_bubble: {
      name: s.name,
      duration: s.duration || '1-2小时',
      tip: s.description || '值得打卡'
    }
  }));

  return JSON.stringify({
    poster_type: '精美旅行打卡地图海报',
    visual_style: {
      art_style: styleConfig.art_style,
      background: styleConfig.background,
      color_palette: styleConfig.color_palette,
      line_work: styleConfig.line_work,
      atmosphere: '旅行的美好氛围，探索的期待感'
    },
    layout_elements: {
      title_section: {
        position: '顶部居中',
        content: `${city}旅行打卡地图`,
        font_style: '手绘艺术字体'
      },
      map_section: {
        position: '画面中央',
        style: '手绘旅行地图风格',
        route_style: '实线路径连接各景点',
        route_markers: '起点、终点、途经点标记'
      },
      landmarks: landmarks,
      compass: {
        position: '右上角',
        style: '简约手绘指南针'
      }
    },
    decoration_details: [
      '手绘树木',
      '简约云朵',
      '阳光光影',
      '装饰框'
    ],
    image_prompt: `小红书风格旅行打卡地图，${city}景点：${spots.map(s => s.name).join('、')}，手绘地图风格，${styleConfig.art_style}，${styleConfig.background}，${styleConfig.color_palette}，实线连接各景点，画面丰富有层次感，氛围美好，无文字标签`
  }, null, 2);
}

/**
 * 生成小红书风格打卡地图海报
 */
export async function generatePoster(city, style, spots) {
  // 先用 DeepSeek 生成完整JSON提示词
  console.log('正在生成JSON提示词...');
  const jsonPrompt = await optimizePrompt(city, style, spots);

  console.log('正在调用 Nano Banana Pro 图片生成...');

  try {
    const submitResponse = await axios.post(
      config.nanobananaPro.apiUrl,
      {
        model: "nano-banana-pro",
        prompt: jsonPrompt,
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