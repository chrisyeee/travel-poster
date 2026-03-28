import express from 'express';

const router = express.Router();

// 临时占位路由，将在Task 5实现
router.post('/generate', (req, res) => {
  res.json({
    success: false,
    error: 'API not implemented yet'
  });
});

export default router;