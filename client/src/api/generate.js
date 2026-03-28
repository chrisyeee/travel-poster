import axios from 'axios';

export async function generatePoster(city, style) {
  const response = await axios.post('/api/generate', {
    city,
    style
  });
  return response.data;
}