import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-brand">💰 MiBalance</div>
      
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
            <span key={theme} className="theme-icon">
             {theme === 'light' ? '☾' : '☀'}
            </span>
        </button>
        
        <button 
          className={`hamburger ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li><NavLink to="/" onClick={closeMenu}>Dashboard</NavLink></li>
        <li><NavLink to="/ingresos" onClick={closeMenu}>Ingresos</NavLink></li>
        <li><NavLink to="/gastos" onClick={closeMenu}>Gastos</NavLink></li>
        <li><NavLink to="/recordatorios" onClick={closeMenu}>Recordatorios</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;