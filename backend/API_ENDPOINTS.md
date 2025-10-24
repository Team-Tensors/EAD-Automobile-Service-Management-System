**# 🚀 Backend API Endpoints Reference

## 📡 Base URL
```
http://localhost:4000/api
```

---

## 🔐 Authentication & Authorization

### **Response Format**
All endpoints return JSON responses in these formats:

**Success Response (Login/Register):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e",
  "type": "Bearer",
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "success": false
}
```

---

## 📋 Public Endpoints (No Authentication Required)

### 1. **Health Check**
Check if API is running

**Endpoint:** `GET /health`

**Request:**
```javascript
fetch('http://localhost:4000/api/health')
```

**Response:**
```json
{
  "status": "API is running..."
}
```

---

### 2. **Login (Email/Password)**
User login with email and password

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Example:**
```javascript
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store tokens
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e",
  "type": "Bearer",
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

**Error Response (401):**
```json
{
  "message": "Email not found",
  "success": false
}
// OR
{
  "message": "Password is incorrect",
  "success": false
}
```

---

### 3. **Customer Registration**
Register a new customer account

**Endpoint:** `POST /auth/register/customer`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `fullName`: Required
- `phoneNumber`: Optional
- `address`: Optional

**Request Example:**
```javascript
const response = await fetch('http://localhost:4000/api/auth/register/customer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    password: 'password123',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    address: '123 Main St'
  })
});
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e",
  "type": "Bearer",
  "id": 124,
  "email": "customer@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```
*Note: Auto-login happens after successful registration*

**Error Response (400):**
```json
{
  "message": "Email is already taken",
  "success": false
}
```

---

### 4. **Refresh Token**
Get a new JWT token using refresh token

**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e"
}
```

**Request Example:**
```javascript
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('http://localhost:4000/api/auth/refresh-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refreshToken })
});

const data = await response.json();
// Update token
localStorage.setItem('token', data.token);
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e",
  "type": "Bearer",
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

**Error Response (401):**
```json
{
  "message": "Invalid or expired refresh token",
  "success": false
}
```

---

### 5. **Google OAuth Login**
Initiate Google OAuth flow

**Endpoint:** `GET /oauth2/authorization/google`**

**Frontend Usage:**
```javascript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:4000/api/oauth2/authorization/google';
};
```

**Flow:**
1. Redirects to Google login
2. User authenticates
3. Backend redirects to: `http://localhost:5173/oauth/callback?token=...&refreshToken=...&id=...&email=...&fullName=...`
4. Frontend extracts parameters and stores tokens

---

## 🔒 Protected Endpoints (Requires Authentication)

### **Authorization Header**
All protected endpoints require JWT token in Authorization header:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:4000/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 6. **Logout**
Logout and revoke refresh token

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (Optional):**
```json
{
  "refreshToken": "a5dc8241-57ae-4896-a0a7-bc0b3ce9de7e"
}
```

**Request Example:**
```javascript
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');

await fetch('http://localhost:4000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refreshToken })
});

// Clear local storage
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

---

### 7. **Logout from All Devices**
Revoke all refresh tokens for the current user

**Endpoint:** `POST /auth/logout-all`

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** Any authenticated user

**Request Example:**
```javascript
const token = localStorage.getItem('token');

await fetch('http://localhost:4000/api/auth/logout-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

**Success Response (200):**
```json
{
  "message": "Logged out from all devices successfully",
  "success": true
}
```

---

### 8. **Get Active Sessions**
Get all active sessions for current user

**Endpoint:** `GET /auth/active-sessions`

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** Any authenticated user

**Request Example:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:4000/api/auth/active-sessions', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

const sessions = await response.json();
```

**Success Response (200):**
```json
[
  {
    "id": "session-id-1",
    "deviceInfo": "IP: 192.168.1.1, Agent: Mozilla/5.0...",
    "createdAt": "2025-10-24T10:30:00Z",
    "lastUsedAt": "2025-10-24T15:45:00Z"
  },
  {
    "id": "session-id-2",
    "deviceInfo": "IP: 192.168.1.2, Agent: Chrome/120...",
    "createdAt": "2025-10-23T08:15:00Z",
    "lastUsedAt": "2025-10-24T09:20:00Z"
  }
]
```

---

### 9. **Rotate Refresh Token**
Get a new refresh token (advanced usage)

**Endpoint:** `POST /auth/rotate-refresh-token`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "refreshToken": "old-refresh-token"
}
```

**Success Response (200):**
```json
{
  "message": "Refresh token rotated successfully. New token: new-refresh-token-uuid",
  "success": true
}
```

---

## 👨‍💼 Admin Only Endpoints

### 10. **Employee Registration**
Register a new employee (Admin only)

**Endpoint:** `POST /auth/register/employee`

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Required Role:** ADMIN

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "password123",
  "fullName": "Jane Smith",
  "phoneNumber": "+1234567890",
  "address": "456 Work St, City"
}
```

**Request Example:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:4000/api/auth/register/employee', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'employee@example.com',
    password: 'password123',
    fullName: 'Jane Smith'
  })
});
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "b6ed9352-68bf-5907-b1b8-cd1c4df0ef8f",
  "type": "Bearer",
  "id": 125,
  "email": "employee@example.com",
  "fullName": "Jane Smith",
  "roles": ["EMPLOYEE"]
}
```

**Error Response (403):**
```json
{
  "error": "Access Denied",
  "message": "Insufficient privileges"
}
```

---

## 🛡️ Role-Based Access Control

### **Roles Hierarchy:**
```
ADMIN > EMPLOYEE > CUSTOMER
```

### **Endpoint Access Matrix:**

| Endpoint | PUBLIC | CUSTOMER | EMPLOYEE | ADMIN |
|----------|--------|----------|----------|-------|
| `/health` | ✅ | ✅ | ✅ | ✅ |
| `/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `/auth/register/customer` | ✅ | ✅ | ✅ | ✅ |
| `/auth/refresh-token` | ✅ | ✅ | ✅ | ✅ |
| `/oauth2/authorization/google` | ✅ | ✅ | ✅ | ✅ |
| `/auth/logout` | ❌ | ✅ | ✅ | ✅ |
| `/auth/logout-all` | ❌ | ✅ | ✅ | ✅ |
| `/auth/active-sessions` | ❌ | ✅ | ✅ | ✅ |
| `/auth/register/employee` | ❌ | ❌ | ❌ | ✅ |
| `/admin/**` | ❌ | ❌ | ❌ | ✅ |
| `/employee/**` | ❌ | ❌ | ✅ | ✅ |
| `/customer/**` | ❌ | ✅ | ✅ | ✅ |

---

## 📦 Request/Response Data Types

### **LoginRequest**
```typescript
{
  email: string;      // Required, valid email
  password: string;   // Required, min 6 chars
}
```

### **SignupRequest**
```typescript
{
  email: string;         // Required, valid email
  password: string;      // Required, min 6 chars
  fullName: string;      // Required
  phoneNumber?: string;  // Optional
  address?: string;      // Optional
  role?: string;         // Optional (auto-set for customer/employee)
}
```

### **AuthResponse**
```typescript
{
  token: string;           // JWT access token
  refreshToken: string;    // UUID refresh token
  type: string;           // "Bearer"
  id: number;             // User ID
  email: string;          // Email address
  fullName: string;       // Full name
  roles: string[];        // Array of roles
}
```

### **RefreshTokenRequest**
```typescript
{
  refreshToken: string;   // UUID refresh token
}
```

### **MessageResponse**
```typescript
{
  message: string;        // Response message
  success?: boolean;      // Success indicator
}
```

---

## 🔧 Common API Utilities

### **1. API Service Setup**

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  // Helper to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  },

  // Generic GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: api.getAuthHeaders(),
    });
    return response.json();
  },

  // Generic POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: api.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

### **2. Auth Service**

```javascript
// src/services/authService.js
import { api } from './api';

export const authService = {
  login: async (email, password) => {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles,
    }));
    
    return data;
  },

  register: async (userData) => {
    const response = await fetch('http://localhost:4000/api/auth/register/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    
    // Store tokens (auto-login after registration)
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles,
    }));
    
    return data;
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && refreshToken) {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch('http://localhost:4000/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    
    return data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.roles?.includes(role) || false;
  },
};
```

### **3. Auto Token Refresh (Axios Interceptor)**

```javascript
// src/services/axiosConfig.js
import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshToken();
        const token = localStorage.getItem('token');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 🚨 Error Handling

### **HTTP Status Codes:**

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 200 | OK | Successful request |
| 201 | Created | Successful registration |
| 400 | Bad Request | Validation error, invalid data |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

### **Error Response Format:**

```json
{
  "message": "Descriptive error message",
  "success": false
}
```

### **Frontend Error Handling:**

```javascript
try {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle error
    throw new Error(data.message || 'Request failed');
  }

  // Handle success
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

---

## ✅ Quick Testing Checklist

### **Using cURL:**

```bash
# Health Check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:4000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"password123","fullName":"John Doe"}'

# Protected Endpoint (with token)
curl -X GET http://localhost:4000/api/auth/active-sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Using Postman/Thunder Client:**

1. Create a collection for your API
2. Set base URL: `http://localhost:4000/api`
3. For protected endpoints, add header: `Authorization: Bearer {{token}}`
4. Save token after login/register to use in other requests

---

## 📞 Summary

### **Essential Endpoints for Frontend:**

1. ✅ **Login:** `POST /auth/login`
2. ✅ **Register:** `POST /auth/register/customer`
3. ✅ **Refresh Token:** `POST /auth/refresh-token`
4. ✅ **Logout:** `POST /auth/logout`
5. ✅ **Google OAuth:** Redirect to `/oauth2/authorization/google`
6. ✅ **Health Check:** `GET /health`

### **Key Points:**

- **Base URL:** `http://localhost:4000/api`
- **Auth Header:** `Authorization: Bearer {token}`
- **Token Storage:** Save in localStorage
- **Auto-login:** Registration returns tokens automatically
- **Token Refresh:** Use refresh token when JWT expires
- **Google OAuth:** Redirects to `/oauth/callback` with tokens in URL

---

**Complete! All API endpoints documented and ready for frontend integration! 🎉**

