import './CityInput.css';

function CityInput({ value, onChange }) {
  return (
    <div className="city-input">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请输入城市名称，如：北京、上海、杭州"
      />
    </div>
  );
}

export default CityInput;