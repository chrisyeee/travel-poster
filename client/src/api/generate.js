import axios from 'axios';

const API_BASE_URL = 'https://travel-poster-api.onrender.com';

export async function generatePoster(city, style) {
  const response = await axios.post(`${API_BASE_URL}/api/generate`, {
    city,
    style
  });
  return response.data;
}