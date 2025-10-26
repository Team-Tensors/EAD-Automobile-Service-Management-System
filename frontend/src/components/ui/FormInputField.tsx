import React from 'react';

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
  return (
    <div className="group">
      <label className="flex items-center space-x-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
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
        className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className || ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FormInputField;