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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Create Account</h1>
        <p>Join our automobile service platform</p>
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
          <label htmlFor="fullName" style={{ display: 'block', marginBottom: '5px' }}>
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.fullName ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your full name"
          />
          {formErrors.fullName && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.fullName}
            </span>
          )}
        </div>
        
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
            placeholder="Enter your email"
            autoComplete="email"
          />
          {formErrors.email && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.email}
            </span>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '5px' }}>
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.phoneNumber ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />
          {formErrors.phoneNumber && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.phoneNumber}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.address ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your address (optional)"
          />
          {formErrors.address && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.address}
            </span>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '5px' }}>
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value={UserRole.CUSTOMER}>Customer</option>
            <option value={UserRole.EMPLOYEE}>Employee</option>
          </select>
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
            placeholder="Create a password"
            autoComplete="new-password"
          />
          {formErrors.password && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.password}
            </span>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: formErrors.confirmPassword ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              {formErrors.confirmPassword}
            </span>
          )}
        </div>
        
        <button 
          type="submit" 
          onClick={() => {
            console.log('Button clicked!'); // Debug log
            // Don't prevent default here, let form submission handle it
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
