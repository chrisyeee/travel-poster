# Travel Poster Generator

一个精美的旅行打卡海报生成器，支持 8 种风格选择，自动生成带有景点信息的中文标签地图海报。

![Preview](docs/preview.png)

## Features

- **城市旅行打卡地图海报**：输入城市名称和景点，自动生成精美海报
- **8 种风格选择**：
  - 清新自然 - Watercolor hand-drawn illustration
  - 文艺复古 - Vintage travel map illustration
  - 韩系ins - Korean minimalist illustration
  - 卡通可爱 - Cute cartoon illustration
  - 胶片感 - Film photography style
  - 日系治愈 - Japanese magazine illustration
  - 油画质感 - Oil painting texture
  - 时尚都市 - Fashion urban neon
- **智能提示词优化**：使用 DeepSeek AI 优化生成提示词
- **中文文字标签**：自动在图片上渲染景点名称、门票价格、游玩时长
- **实线路径连接**：景点间有道路路径连接

## Tech Stack

**Frontend**
- React 18
- Vite
- Axios

**Backend**
- Express.js
- Axios (for API calls)

**AI Services**
- DeepSeek (prompt optimization)
- Nano Banana Pro (image generation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Configuration

Create a `.env` file in the `server` directory:

```env
PORT=3001
DEEPSEEK_API_KEY=your_deepseek_api_key
NANOBANANA_PRO_API_KEY=your_nanobanana_api_key
NANOBANANA_PRO_API_URL=https://api.nano-banana.pro/draw/nano-banana
```

### Running

```bash
# Development (runs both client and server)
npm run dev

# Build for production
npm run build

# Start server only
npm start
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
travel-poster/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── services/
│   │   └── imageService.js  # Image generation logic
│   ├── config/
│   │   └── index.js       # Configuration
│   ├── index.js           # Server entry
│   └── package.json
├── docs/                   # Documentation
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### POST /api/generate

Generate a travel poster.

**Request Body:**
```json
{
  "city": "杭州",
  "style": "文艺复古",
  "spots": [
    {
      "name": "西湖",
      "description": "断桥残雪、白堤",
      "duration": "半天",
      "ticket": "免费"
    }
  ]
}
```

**Response:**
```json
{
  "imageUrl": "https://example.com/image.png"
}
```

## License

MIT
