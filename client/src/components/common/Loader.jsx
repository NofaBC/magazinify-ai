import React from 'react';
import './Loader.css';

const Loader = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '',
  overlay = false,
  className = '' 
}) => {
  const loaderClass = `loader loader-${size} loader-${color} ${overlay ? 'loader-overlay' : ''} ${className}`;
  
  if (overlay) {
    return (
      <div className="loader-overlay-container">
        <div className={loaderClass}>
          <div className="loader-spinner"></div>
          {text && <div className="loader-text">{text}</div>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={loaderClass}>
      <div className="loader-spinner"></div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;
