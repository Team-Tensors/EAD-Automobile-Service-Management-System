// Example component showing how to make authenticated requests with JWT tokens
import React, { useState } from 'react';
import api from '../utill/apiUtils';
import { useAuth } from '../hooks/useAuth';

interface Appointment {
  id: number;
  serviceId: number;
  appointmentDate: string;
  status: string;
}

export const AuthenticatedRequestExample: React.FC = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Book an appointment (authenticated request)
  const bookAppointment = async () => {
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // This request will automatically include:
      // headers: {
      //   "Authorization": "Bearer <JWT_TOKEN>",
      //   "Content-Type": "application/json"
      // }
      const response = await api.post('/appointments/book', {
        serviceId: 123,
        appointmentDate: '2025-09-25T10:00:00'
      });

      console.log('Appointment booked successfully:', response.data);
      
      // Refresh appointments list
      await fetchAppointments();
      
    } catch (error: unknown) {
      console.error('Failed to book appointment:', error);
      
      // Handle different error types
      const errorMessage = (error as Error).message || 'Failed to book appointment';
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('You do not have permission to book appointments');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch user's appointments (authenticated request)
  const fetchAppointments = async () => {
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // JWT token will be automatically included in Authorization header
      const response = await api.get('/appointments/my-appointments');
      
      setAppointments(response.data);
      console.log('Appointments fetched:', response.data);
      
    } catch (error: unknown) {
      console.error('Failed to fetch appointments:', error);
      
      // The interceptor handles 401/403 automatically, but we can still show user-friendly messages
      const errorMessage = (error as Error).message || 'Failed to fetch appointments';
      if (errorMessage.includes('403')) {
        setError('You do not have permission to view appointments');
      } else if (errorMessage.includes('401')) {
        setError('Please login to view your appointments');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example: Admin-only request (requires ADMIN role in JWT)
  const fetchAllUsers = async () => {
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend will check JWT token for ADMIN role
      const response = await api.get('/admin/users');
      
      console.log('All users fetched:', response.data);
      
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      
      const errorMessage = (error as Error).message || 'Failed to fetch users';
      if (errorMessage.includes('403')) {
        setError('Admin access required');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Authentication Required</h3>
        <p>Please login to access this functionality.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Authenticated Requests Example</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Logged in as:</strong> {user?.fullName} ({user?.email})</p>
        <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
        <p><strong>JWT Token:</strong> {token ? '***' + token.slice(-10) : 'None'}</p>
      </div>

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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={bookAppointment} 
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>

        <button 
          onClick={fetchAppointments} 
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'My Appointments'}
        </button>

        <button 
          onClick={fetchAllUsers} 
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'All Users (Admin)'}
        </button>
      </div>

      {appointments.length > 0 && (
        <div>
          <h4>Your Appointments:</h4>
          <ul>
            {appointments.map(appointment => (
              <li key={appointment.id}>
                Service ID: {appointment.serviceId}, 
                Date: {appointment.appointmentDate}, 
                Status: {appointment.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedRequestExample;