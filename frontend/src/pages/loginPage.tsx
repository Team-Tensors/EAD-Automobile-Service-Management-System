// Login Page Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col relative overflow-hidden">
      {/* Automotive Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-orange-400 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-blue-400 rounded-full"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 border-2 border-orange-400 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 border-2 border-blue-400 rounded-full"></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50">
          {/* Logo/Branding Section */}
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <div className="text-white text-2xl font-bold">🔧</div>
            </div>
            <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-2">
              AutoService Pro
            </h1>
            <p className="text-gray-600 font-medium font-sans">Professional Vehicle Care</p>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-3 rounded-full"></div>
          </div>
      
         {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-5">
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="your.email@example.com"
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
          <label htmlFor="password" className="block mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            🔒 Password
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
              placeholder="Enter your secure password"
              autoComplete="current-password"
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
        
        <div className="flex justify-between items-center mb-8">
          <label className="flex items-center text-sm text-slate-700 font-medium hover:text-slate-800 transition-colors cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="mr-3 h-5 w-5 text-orange-500 focus:ring-orange-400 focus:ring-2 border-gray-300 rounded-md transition-all"
            />
            🔄 Remember me
          </label>
          <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700 no-underline text-sm font-semibold hover:underline transition-all">
            🔑 Forgot password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          className={`w-full p-4 text-white border-0 rounded-xl text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg transform hover:scale-[1.02] ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl cursor-pointer'
          }`}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Signing in...' : '🚗 Start Your Service'}
        </button>
        
        <div className="text-center my-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or continue with</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <button 
            type="button" 
            className="w-full p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold shadow-sm hover:shadow-md flex items-center justify-center space-x-3"
            onClick={() => console.log('Google OAuth coming soon!')}
          >
            <span className="text-xl">🔍</span>
            <span>Continue with Google</span>
          </button>
        </div>
        
        <div className="text-center border-t-2 border-gray-100 pt-6">
          <p className="text-gray-600 font-medium">
            New to AutoService Pro?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-700 no-underline font-bold hover:underline transition-all">
              🚀 Create Account
            </Link>
          </p>
        </div>
      </form>
      </div>
    </div>
  </div>
  );
};

export default LoginPage;
