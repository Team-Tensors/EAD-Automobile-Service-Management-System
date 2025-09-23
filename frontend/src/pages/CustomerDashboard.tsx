// Customer Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1>Customer Dashboard</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Welcome back, {user?.firstName} {user?.lastName}!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Service Status */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>My Services</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Track your vehicle service progress</p>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>No active services</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>Book a service to see progress here</p>
          </div>
        </div>

        {/* Book Appointment */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#28a745' }}>Book Appointment</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Schedule a vehicle service</p>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Book Service
          </button>
        </div>

        {/* Request Modification */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#ffc107' }}>Request Modification</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Submit modification requests</p>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Request Changes
          </button>
        </div>

        {/* Service History */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#6c757d' }}>Service History</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>View past services and projects</p>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>No service history</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>Your completed services will appear here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        marginTop: '30px',
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Recent Activity</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;