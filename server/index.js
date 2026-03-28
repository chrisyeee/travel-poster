import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import generateRoutes from './routes/generate.js';

const app = express();

// 中间件
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api', generateRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: '服务器错误'
  });
});

app.listen(config.port, () => {
  console.log(`服务器运行在 http://localhost:${config.port}`);
});