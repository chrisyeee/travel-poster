import './GenerateButton.css';

function GenerateButton({ onClick, disabled, loading }) {
  return (
    <button
      className="generate-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? '生成中...' : '生成海报'}
    </button>
  );
}

export default GenerateButton;