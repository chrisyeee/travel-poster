import './DownloadButton.css';

function DownloadButton({ posterUrl }) {
  const handleDownload = async () => {
    if (!posterUrl) return;

    try {
      const response = await fetch(posterUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'travel-poster.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  if (!posterUrl) return null;

  return (
    <button className="download-button" onClick={handleDownload}>
      下载海报
    </button>
  );
}

export default DownloadButton;