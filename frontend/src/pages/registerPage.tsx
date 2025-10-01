// Register Page Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import type { RegisterData } from '../types/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    role: UserRole.CUSTOMER,
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData); // Debug log
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors); // Debug log
      return;
    }
    
    try {
      console.log('Attempting registration...'); // Debug log
      
      // Ensure all required fields have values
      const registrationData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address || '',
        role: formData.role,
        // Include confirmation password for validation
        confirmPassword: formData.confirmPassword,
      };
      
      console.log('Sending registration data:', registrationData); // Debug log
      
      await register(registrationData);
      console.log('Registration successful!'); // Debug log
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 px-4 relative overflow-hidden">
      {/* Automotive Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 left-8 w-28 h-28 border-2 border-orange-400 rounded-full"></div>
        <div className="absolute top-32 right-16 w-20 h-20 border-2 border-blue-400 rounded-full"></div>
        <div className="absolute bottom-24 left-24 w-24 h-24 border-2 border-orange-400 rounded-full"></div>
        <div className="absolute bottom-16 right-8 w-32 h-32 border-2 border-blue-400 rounded-full"></div>
      </div>
      
      <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50">
        {/* Logo/Branding Section */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <div className="text-white text-2xl font-bold">🔧</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-2">
            Join AutoService Pro
          </h1>
          <p className="text-gray-600 font-medium">Start Your Professional Vehicle Care Journey</p>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-3 rounded-full"></div>
        </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-5">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="fullName" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            👤 Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.fullName 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="John Doe"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">👨</span>
            </div>
          </div>
          {formErrors.fullName && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.fullName}
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            📧 Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.email 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="john@example.com"
              autoComplete="email"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">✉️</span>
            </div>
          </div>
          {formErrors.email && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.email}
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            📞 Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.phoneNumber 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">📱</span>
            </div>
          </div>
          {formErrors.phoneNumber && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.phoneNumber}
            </span>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            🏠 Address <span className="text-gray-500 normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.address 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="123 Main St, City, State 12345"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🗺</span>
            </div>
          </div>
          {formErrors.address && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.address}
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            🎯 Account Type
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-gray-50 hover:bg-white focus:bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value={UserRole.CUSTOMER}>👨‍💼 Vehicle Owner (Customer)</option>
              <option value={UserRole.EMPLOYEE}>🔧 Service Technician (Employee)</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">👥</span>
            </div>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">▼</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            🔒 Create Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.password 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="Create a secure password (8+ chars)"
              autoComplete="new-password"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔐</span>
            </div>
          </div>
          {formErrors.password && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.password}
            </span>
          )}
        </div>
        
        <div className="mb-8">
          <label htmlFor="confirmPassword" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            🔍 Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-4 pl-12 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                formErrors.confirmPassword 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
              } bg-gray-50 hover:bg-white focus:bg-white shadow-sm`}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔑</span>
            </div>
          </div>
          {formErrors.confirmPassword && (
            <span className="text-red-600 text-sm mt-2 block font-medium">
              ⚠️ {formErrors.confirmPassword}
            </span>
          )}
        </div>
        
        <button 
          type="submit" 
          onClick={() => {
            console.log('Button clicked!'); // Debug log
            // Don't prevent default here, let form submission handle it
          }}
          className={`w-full p-4 text-white border-0 rounded-xl text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg transform hover:scale-[1.02] ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl cursor-pointer'
          }`}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Creating Account...' : '🚀 Start Your Journey'}
        </button>
        
        <div className="text-center border-t-2 border-gray-100 pt-6 mt-8">
          <p className="text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 no-underline font-bold hover:underline transition-all">
              🔑 Sign In Here
            </Link>
          </p>
        </div>
      </form>
      </div>
    </div>
  );
};

export default RegisterPage;
