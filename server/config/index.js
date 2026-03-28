import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  ai: {
    apiKey: process.env.AI_API_KEY,
    apiUrl: process.env.AI_API_URL
  },
  nanobananaPro: {
    apiKey: process.env.NANOBANANA_PRO_API_KEY,
    apiUrl: process.env.NANOBANANA_PRO_API_URL
  }
};