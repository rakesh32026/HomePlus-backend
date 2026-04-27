import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">HomePlus</Link>
          <p className="footer-tagline">Transform your dream home</p>
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#roles">How It Works</a>
          <a href="#ideas">Upgrade Ideas</a>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} HomePlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
