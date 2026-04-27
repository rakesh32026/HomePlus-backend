import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import './Navbar.css';

const Navbar = ({ 
  showUserInfo = false, 
  userName = '', 
  onLogout = null,
  isScrollable = false,
  navLinks = []
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isScrollable) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isScrollable]);

  const handleLogout = () => {
    api.logout();
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">HomePlus</Link>
      
      {navLinks.length > 0 && (
        <div className="nav-links">
          {navLinks.map((link, index) => (
            <a key={index} href={link.href}>{link.label}</a>
          ))}
        </div>
      )}

      {showUserInfo && (
        <div className="user-info">
          <span>Welcome, {userName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
