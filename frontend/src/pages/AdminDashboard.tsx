// Admin Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
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
          <h1>Admin Dashboard</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Welcome, {user?.firstName} {user?.lastName} - System Administrator
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

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #007bff, #0056b3)', 
          color: 'white',
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>0</p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #28a745, #1e7e34)', 
          color: 'white',
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Active Services</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>0</p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #ffc107, #e0a800)', 
          color: 'black',
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Pending Requests</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>0</p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #dc3545, #c82333)', 
          color: 'white',
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>$0</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* User Management */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#007bff' }}>User Management</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Manage customers and employees</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View All Users
            </button>
            <button style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Add Employee
            </button>
          </div>
        </div>

        {/* Service Management */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#28a745' }}>Service Management</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Oversee all service operations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View All Services
            </button>
            <button style={{
              padding: '10px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Assign Projects
            </button>
          </div>
        </div>

        {/* Reports & Analytics */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#6c757d' }}>Reports & Analytics</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>View system analytics</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Generate Reports
            </button>
            <button style={{
              padding: '10px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Analytics
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#dc3545' }}>System Settings</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Configure system parameters</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              System Settings
            </button>
            <button style={{
              padding: '10px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Backup & Restore
            </button>
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
        <h3 style={{ marginBottom: '15px' }}>Recent System Activity</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;