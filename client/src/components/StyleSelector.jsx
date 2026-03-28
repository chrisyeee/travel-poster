import './StyleSelector.css';

const styles = [
  { id: '清新自然', label: '清新自然', color: '#a8e6cf' },
  { id: '文艺复古', label: '文艺复古', color: '#ffd3b6' },
  { id: '时尚都市', label: '时尚都市', color: '#98c1d9' },
  { id: '卡通可爱', label: '卡通可爱', color: '#ffaaa5' },
  { id: '电影质感', label: '电影质感', color: '#e8e8e8' }
];

function StyleSelector({ value, onChange }) {
  return (
    <div className="style-selector">
      <span className="style-label">选择风格：</span>
      <div className="style-options">
        {styles.map((style) => (
          <button
            key={style.id}
            className={`style-option ${value === style.id ? 'active' : ''}`}
            style={{ '--accent-color': style.color }}
            onClick={() => onChange(style.id)}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StyleSelector;