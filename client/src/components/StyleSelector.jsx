import './StyleSelector.css';

const styles = [
  { id: '清新自然', label: '清新自然', color: '#a8e6cf', desc: '浅绿浅蓝，自然风光' },
  { id: '文艺复古', label: '文艺复古', color: '#ffd3b6', desc: '暖色调，胶片感' },
  { id: '韩系ins', label: '韩系 ins', color: '#f5f5f5', desc: '韩风简约，白色系' },
  { id: '卡通可爱', label: '卡通可爱', color: '#ffaaa5', desc: '马卡龙色，萌系' },
  { id: '胶片感', label: '胶片感', color: '#e8d5b7', desc: '复古颗粒，暖色滤镜' },
  { id: '日系治愈', label: '日系治愈', color: '#b8d4e3', desc: '日系杂志，逆光感' },
  { id: '油画质感', label: '油画质感', color: '#d4c4a8', desc: '莫兰迪色调' },
  { id: '时尚都市', label: '时尚都市', color: '#98c1d9', desc: '现代都市，夜景' }
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
            title={style.desc}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StyleSelector;