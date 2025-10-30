import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { Toaster } from 'react-hot-toast'; 
import './globals.css';
import App from './App.tsx';

const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <App />
        
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{ zIndex: 9999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            success: {
              icon: 'Success',
              style: {
                background: '#10b981',
              },
            },
            error: {
              icon: 'Error',
              style: {
                background: '#ef4444',
              },
            },
            loading: {
              style: {
                background: '#f97316',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);