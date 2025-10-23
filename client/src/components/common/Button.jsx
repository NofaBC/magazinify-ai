import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <div className="spinner"></div>
        </span>
      )}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;
