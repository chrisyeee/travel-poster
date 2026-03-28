import './PosterPreview.css';

function PosterPreview({ posterUrl, loading, error }) {
  if (loading) {
    return (
      <div className="poster-preview loading">
        <div className="spinner"></div>
        <p>正在生成海报，请稍候...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="poster-preview error">
        <p>{error}</p>
      </div>
    );
  }

  if (!posterUrl) {
    return null;
  }

  return (
    <div className="poster-preview">
      <img src={posterUrl} alt="生成的海报" />
    </div>
  );
}

export default PosterPreview;