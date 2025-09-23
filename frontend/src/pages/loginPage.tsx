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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Welcome Back</h1>
        <p>Sign in to your automobile service account</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffe6e6', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.email ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your email address"
            autoComplete="email"
          />
          {formErrors.email && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.email}
            </span>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.password ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {formErrors.password && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.password}
            </span>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={{ marginRight: '5px' }}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <span style={{ color: '#666' }}>or</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#db4437',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('Google OAuth coming soon!')}
          >
            Google
          </button>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('GitHub OAuth coming soon!')}
          >
            GitHub
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
