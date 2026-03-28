import express from 'express';
import { recommendSpots } from '../services/aiService.js';
import { generatePoster } from '../services/imageService.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { city, style = '清新自然' } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: '请输入城市名称'
      });
    }

    // 1. 调用大模型推荐景点
    const spots = await recommendSpots(city);

    // 2. 调用Nano Banana Pro生成图片
    const posterUrl = await generatePoster(city, style, spots);

    res.json({
      success: true,
      data: {
        city,
        style,
        spots,
        posterUrl
      }
    });
  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成失败，请稍后重试'
    });
  }
});

export default router;