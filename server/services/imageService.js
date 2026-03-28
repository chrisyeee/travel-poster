import axios from 'axios';
import config from '../config/index.js';

/**
 * 风格配置 - 针对小红书女性用户，英文描述用于图片生成
 */
const STYLE_CONFIGS = {
  '清新自然': {
    art_style: 'Watercolor hand-drawn illustration, soft brushstrokes, isometric flat design',
    background: 'Light beige parchment paper texture, delicate paper grain',
    color_palette: 'Pastel green, light blue, soft pink, cream white, terracotta accents',
    line_work: 'Soft charcoal outlines, hand-drawn doodle style',
    atmosphere: 'Fresh, airy, cozy, adventurous, nostalgic'
  },
  '文艺复古': {
    art_style: 'Vintage travel map illustration, detailed 2D flat vector art, retro film texture',
    background: 'Aged parchment paper, warm yellow tones, vintage texture',
    color_palette: 'Terracotta red, jade green, warm vintage tones, soft blue',
    line_work: 'Charcoal lines, vintage stipple texture',
    atmosphere: 'Nostalgic, cozy, highly detailed, movie poster quality'
  },
  '韩系ins': {
    art_style: 'Korean minimalist illustration, magazine layout aesthetic, clean lines',
    background: 'Pure white paper, generous white space, clean and airy',
    color_palette: 'White, light gray, soft pink, dark green, muted tones',
    line_work: 'Minimalist lines, geometric feel'
  },
  '卡通可爱': {
    art_style: 'Cute cartoon illustration style, rounded and adorable shapes, kawaii aesthetic',
    background: 'Cream color paper, cartoon texture, playful feel',
    color_palette: 'Macaron colors: pink, mint green, pale yellow, lavender purple',
    line_work: 'Rounded lines, uniform thickness'
  },
  '胶片感': {
    art_style: 'Film photography illustration, grainy texture, cinematic feel',
    background: 'Warm toned paper, soft focus effect, vintage film look',
    color_palette: 'Warm orange tones, retro movie feel, faded effect',
    line_work: 'Soft blur, cinematic quality'
  },
  '日系治愈': {
    art_style: 'Japanese magazine illustration, backlight atmosphere, dreamy glow',
    background: 'Soft light paper, dreamy feel, ethereal atmosphere',
    color_palette: 'Warm white, soft pink, light blue, honey amber',
    line_work: 'Backlight silhouettes, soft glow'
  },
  '油画质感': {
    art_style: 'Oil painting texture illustration, art gallery style, brushstroke质感',
    background: 'Canvas texture, Van Gogh inspired, artistic feel',
    color_palette: 'Morandi colors: gray blue, gray pink, dusty green, muted earth tones',
    line_work: 'Brushstroke texture, hazy beauty'
  },
  '时尚都市': {
    art_style: 'Fashion illustration, urban neon vibe, modern city aesthetic',
    background: 'Dark toned paper, neon light effects',
    color_palette: 'Dark blue, purple, pink neon, rose gold accents',
    line_work: 'Light effect lines, LED feel'
  }
};

/**
 * 使用 DeepSeek 生成完整的JSON提示词结构
 * 这个JSON会直接传给 Nano Banana Pro
 */
export async function optimizePrompt(city, style, spots) {
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS['清新自然'];

  const prompt = `You are a professional travel poster designer. Generate a detailed JSON prompt for creating a travel打卡 map poster.

【Destination】${city}
【Style】${style}
【Style Parameters】
- Art Style: ${styleConfig.art_style}
- Background: ${styleConfig.background}
- Color Palette: ${styleConfig.color_palette}
- Line Work: ${styleConfig.line_work}
- Atmosphere: ${styleConfig.atmosphere}

【Landmarks Information】
${spots.map((s, i) => `Spot ${i + 1}: ${s.name}, Duration: ${s.duration || '1-2 hours'}, Features: ${s.description || 'Famous check-in spot'}`).join('\n')}

【JSON Output Requirements - MUST return valid JSON】
Generate a complete JSON object with this EXACT structure:

{
  "poster_info": {
    "type": "Travel打卡map poster",
    "theme_city": "City name",
    "design_goal": "Generate map illustrations with Chinese text directly in one step"
  },
  "visual_style": {
    "art_style": "Art style description in English",
    "background": "Background description in English",
    "color_palette": "Color palette description in English",
    "route_style": "Road-like path connecting landmarks (solid road path, winding road)",
    "atmosphere": "Atmosphere description in English"
  },
  "layout_elements": {
    "title": "Top title: City name + 探索之旅 (Exploration Journey)",
    "map_features": "Hand-drawn vintage compass with directions: 北(N), 南(S), 东(E), 西(W), road paths connecting spots",
    "decorations": "Chinese traditional clouds, green mountains, small figures traveling by bicycle"
  },
  "landmarks_with_text": [
    {
      "english_prompt": "Detailed visual description of landmark (e.g., broken bridge, white causeway for West Lake)",
      "chinese_text_to_render": "Text bubbles saying exactly: \"景点名\", \"门票：X元\", \"游玩：时长\""
    }
  ],
  "final_image_prompt": "Complete English prompt for image generation, MUST include: 1) Visual English descriptions of landmarks 2) Chinese text labels like 'text bubbles saying exactly \"景点名\", \"门票：免费\", \"游玩：半天\"' 3) Road path connecting all landmarks 4) Hand-drawn compass with 北(N) 南(S) 东(E) 西(W) 5) Chinese traditional decorations"
}

【Critical Requirements】
1. Each landmark MUST have both english_prompt (visual description) and chinese_text_to_render
2. chinese_text_to_render format: "Text bubbles saying exactly: \"景点名\", \"门票：X元\", \"游玩：时长\""
3. final_image_prompt MUST contain: "text bubbles saying exactly \"中文内容\"" for rendering Chinese text
4. Route must be solid road-like path connecting landmarks, NOT dashed lines
5. Compass MUST have Chinese directions: 北(N) 南(S) 东(E) 西(W)
6. The poster must have rich details and depth, not flat or boring
7. Output MUST be valid JSON parseable by JSON.parse

Return ONLY JSON, no other text:`;

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
  const landmarksWithText = spots.map((s, i) => ({
    english_prompt: `${s.name} iconic landmark illustration, ${s.description || 'famous check-in spot'}, ${styleConfig.art_style}`,
    chinese_text_to_render: `Text bubbles saying exactly: \"${s.name}\", \"门票：${s.ticket || '免费'}\", \"游玩：${s.duration || '1-2小时'}\"`
  }));

  const chineseLabels = spots.map(s => `"${s.name}", "门票：${s.ticket || '免费'}", "游玩：${s.duration || '1-2小时'}"`).join(', ');

  return JSON.stringify({
    poster_info: {
      type: 'Travel打卡map poster',
      theme_city: city,
      design_goal: 'Generate map illustrations with Chinese text directly in one step'
    },
    visual_style: {
      art_style: styleConfig.art_style,
      background: styleConfig.background,
      color_palette: styleConfig.color_palette,
      route_style: 'Road-like path connecting landmarks (solid road path, winding road)',
      atmosphere: styleConfig.atmosphere
    },
    layout_elements: {
      title: `${city}探索之旅`,
      map_features: 'Hand-drawn vintage compass with directions: 北(N), 南(S), 东(E), 西(W), solid road paths connecting all landmarks',
      decorations: 'Chinese traditional clouds, green mountains, small figures traveling by bicycle'
    },
    landmarks_with_text: landmarksWithText,
    final_image_prompt: `Travel打卡map poster for ${city} featuring ${spots.map(s => s.name).join(', ')}, ${styleConfig.art_style}, ${styleConfig.background}, ${styleConfig.color_palette}, solid road-like path connecting all landmarks, hand-drawn vintage compass with 北(N) 南(S) 东(E) 西(W), Chinese traditional clouds and green mountains decorations, text bubbles saying exactly ${chineseLabels}, rich details and depth, ${styleConfig.atmosphere}`
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