import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  showClearButton = true,
  autoFocus = false,
  size = 'md'
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2 px-3',
    lg: 'py-3 px-4 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, onChange]);

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-secondary-400" size={iconSizes[size]} />
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          input-field pl-10 
          ${showClearButton && searchTerm ? 'pr-10' : ''}
          ${sizeClasses[size]}
        `}
      />
      
      {showClearButton && searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
        >
          <FiX size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
