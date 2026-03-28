import { useState } from 'react';
import Header from '../components/Header';
import CityInput from '../components/CityInput';
import StyleSelector from '../components/StyleSelector';
import GenerateButton from '../components/GenerateButton';
import PosterPreview from '../components/PosterPreview';
import DownloadButton from '../components/DownloadButton';
import { generatePoster } from '../api/generate';
import './Home.css';

function Home() {
  const [city, setCity] = useState('');
  const [style, setStyle] = useState('清新自然');
  const [loading, setLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!city.trim()) {
      setError('请输入城市名称');
      return;
    }

    setLoading(true);
    setError('');
    setPosterUrl('');

    try {
      const result = await generatePoster(city, style);
      if (result.success) {
        setPosterUrl(result.data.posterUrl);
      } else {
        setError(result.error || '生成失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <Header />
      <main className="main-content">
        <CityInput value={city} onChange={setCity} />
        <StyleSelector value={style} onChange={setStyle} />
        <GenerateButton
          onClick={handleGenerate}
          disabled={!city.trim()}
          loading={loading}
        />
        <PosterPreview
          posterUrl={posterUrl}
          loading={loading}
          error={error}
        />
        <DownloadButton posterUrl={posterUrl} />
      </main>
    </div>
  );
}

export default Home;