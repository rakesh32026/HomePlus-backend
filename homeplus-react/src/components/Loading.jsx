import './Loading.css';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true 
}) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner"></div>
      {showText && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
