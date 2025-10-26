import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { User } from '../types/auth';
import type { UserRole } from '../types/auth';
import { authService } from '@/services/authService';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract tokens from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        // Check for error in URL
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Validate tokens
        if (!token || !refreshToken) {
          setError('Authentication failed. Missing tokens.');
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);

        // Fetch user profile
        try {
          const backendUserData = await authService.getProfile();
          
          console.log('Backend user data received:', backendUserData);
          
          // Transform backend user data to match frontend User type
          const userData: User = {
            id: backendUserData.id,
            email: backendUserData.email,
            fullName: backendUserData.fullName,
            phoneNumber: backendUserData.phoneNumber,
            address: backendUserData.address,
            roles: backendUserData.roles,
            // Extract primary role for backward compatibility
            role: (backendUserData.roles && backendUserData.roles.length > 0 
              ? backendUserData.roles[0] 
              : 'CUSTOMER') as UserRole,
            // Legacy support
            firstName: backendUserData.fullName?.split(' ')[0],
            lastName: backendUserData.fullName?.split(' ').slice(1).join(' '),
            isActive: backendUserData.isActive,
            createdAt: backendUserData.createdAt,
            updatedAt: backendUserData.updatedAt
          };
          
          console.log('Transformed user data:', userData);
          console.log('Primary role:', userData.role);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userData));
          
          console.log('User data stored in localStorage');
          
          // Check if user needs to complete profile (missing phone number)
          const needsProfileCompletion = !userData.phoneNumber || userData.phoneNumber.trim() === '';
          
          if (needsProfileCompletion) {
            console.log('User needs to complete profile, redirecting...');
            setIsProcessing(false);
            // Redirect to profile completion page
            window.location.href = '/complete-profile';
          } else {
            console.log('Profile complete, redirecting to dashboard...');
            // Success! Redirect to dashboard
            setIsProcessing(false);
            // Force a page reload to trigger auth context initialization
            window.location.href = '/dashboard';
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Authentication successful, but failed to load profile. Redirecting...');
          setIsProcessing(false);
          
          // Even if profile fetch fails, we have tokens, so proceed to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        {isProcessing && !error && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
            <p className="text-gray-400">Please wait while we complete your Google sign-in.</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-red-500 mx-auto" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        )}

        {!isProcessing && !error && (
          <div className="text-center">
            <div className="mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-green-500 mx-auto" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
