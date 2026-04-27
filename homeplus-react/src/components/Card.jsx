import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  icon = null,
  title = '',
  subtitle = '',
  className = '',
  onClick = null
}) => {
  return (
    <div 
      className={`card card-${variant} ${className} ${onClick ? 'card-clickable' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="card-icon">{icon}</div>}
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
};

export default Card;
