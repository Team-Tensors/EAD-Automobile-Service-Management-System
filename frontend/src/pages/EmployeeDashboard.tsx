// Employee Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const EmployeeDashboard: React.FC = () => {
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
          <h1>Employee Dashboard</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Welcome, {user?.firstName} {user?.lastName} - {user?.department || 'Employee'}
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
        {/* Active Projects */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Active Projects</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Current service projects assigned to you</p>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>No active projects</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>New assignments will appear here</p>
          </div>
        </div>

        {/* Time Logging */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#28a745' }}>Log Time</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Track time spent on projects</p>
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
            Log Time
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#ffc107' }}>Upcoming Appointments</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Scheduled customer appointments</p>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>No upcoming appointments</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>Your schedule is clear</p>
          </div>
        </div>

        {/* Workload Summary */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#6c757d' }}>Workload Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Today's Hours:</span>
            <strong>0h</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>This Week:</span>
            <strong>0h</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Projects:</span>
            <strong>0</strong>
          </div>
        </div>
      </div>

      {/* Recent Work */}
      <div style={{ 
        marginTop: '30px',
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Recent Work</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No recent work logged</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        marginTop: '20px',
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Update Project Status
          </button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Customer Requests
          </button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;