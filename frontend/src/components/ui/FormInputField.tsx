import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FormInputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  icon: React.ReactNode;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', placeholder, error, icon, maxLength, className, disabled = false, required = false }) => {
  const { theme } = useTheme();
  
  return (
    <div className="group">
      <label className="flex items-center space-x-2 mb-3">
        {icon}
        <span className={`text-sm font-semibold uppercase tracking-wide ${
          theme === 'light' ? 'text-gray-700' : 'text-white'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        className={`w-full border rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
          theme === 'light' 
            ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' 
            : 'bg-zinc-800/50 border-zinc-700 text-white placeholder-gray-500'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className || ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FormInputField;