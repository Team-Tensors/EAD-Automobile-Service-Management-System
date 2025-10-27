// src/components/ui/FormSelectField.tsx
import React from 'react';

const FormSelectField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  error?: string;
  icon: React.ReactNode;
}> = ({ label, name, value, onChange, options, error, icon }) => {
  return (
    <div className="group">
      <label className="flex items-center space-x-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
          {label}
        </span>
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FormSelectField;