import { useEffect, useRef } from 'react';

/**
 * Icon component wrapper for Lucide Icons
 * Usage: <Icon name="building-2" size={24} color="#007AFF" />
 */
const Icon = ({ name, size = 24, color = 'currentColor', className = '', strokeWidth = 2 }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current && window.lucide) {
      // Clear previous icon
      iconRef.current.innerHTML = '';

      // Create new icon
      const iconElement = window.lucide.createElement(name);
      if (iconElement) {
        iconRef.current.appendChild(iconElement);
      }
    }
  }, [name]);

  return (
    <i
      ref={iconRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color: color,
        strokeWidth: strokeWidth
      }}
    />
  );
};

export default Icon;
