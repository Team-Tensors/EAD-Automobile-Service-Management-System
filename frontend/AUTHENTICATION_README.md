# Automobile Service Management System - Authentication Frontend

## 🚀 Overview

This is the frontend authentication system for the Automobile Service Management System. It provides secure user authentication with role-based access control (RBAC) for **Customers**, **Employees**, and **Admins**.

## ✨ Features

### 🔐 **Authentication**

- **JWT-based authentication** with automatic token handling
- **Secure login/logout** with form validation
- **User registration** with role selection
- **Remember me** functionality
- **Protected routes** based on authentication status

### 👥 **Role-Based Access Control (RBAC)**

- **Customer Role**: Service booking, progress tracking, modification requests
- **Employee Role**: Time logging, project management, customer service
- **Admin Role**: User management, system oversight, analytics

### 🎨 **User Interface**

- **Responsive design** that works on all devices
- **Role-specific dashboards** with relevant features
- **Clean, modern UI** with intuitive navigation
- **Error handling** with user-friendly messages

### 🔧 **Technical Features**

- **TypeScript** for type safety
- **React Context** for state management
- **Automatic token refresh** (ready for implementation)
- **OAuth integration** (Google/GitHub - ready for setup)
- **Fast Refresh** compatible architecture

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication-specific components
│   └── common/            # Reusable UI components
├── context/
│   ├── authContext.tsx    # Auth provider component
│   └── authContextBase.ts # Context definition
├── guards/
│   └── ProtectedRoute.tsx # Route protection components
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── pages/
│   ├── loginPage.tsx      # Login form
│   ├── registerPage.tsx   # Registration form
│   ├── CustomerDashboard.tsx
│   ├── EmployeeDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── DashboardRouter.tsx
├── services/
│   └── authService.ts     # API communication
├── types/
│   ├── auth.ts           # TypeScript interfaces
│   └── constants.ts      # App constants
└── utils/
    └── apiUtils.ts       # Axios configuration
```

## 🛠️ Setup Instructions

### 1. **Install Dependencies**

```bash
npm install
```

### 2. **Environment Configuration**

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### 3. **Start Development Server**

```bash
npm run dev
```

### 4. **Build for Production**

```bash
npm run build
```

## 🔌 Backend Integration

### API Endpoints Expected:

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/verify
```

### Expected Response Format:

```typescript
// Login/Register Success Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600
  }
}
```

## 🎯 Usage Guide

### **For Customers:**

1. **Register** as a customer
2. **Login** to access customer dashboard
3. **Book appointments** for vehicle services
4. **Track service progress** in real-time
5. **Request modifications** to ongoing services

### **For Employees:**

1. **Register** as an employee (or admin creates account)
2. **Login** to access employee dashboard
3. **Log time** against projects/services
4. **Update project status** and track progress
5. **View assigned appointments** and requests

### **For Admins:**

1. **Access admin dashboard** with full system control
2. **Manage users** (customers and employees)
3. **Oversee all services** and projects
4. **Generate reports** and view analytics
5. **Configure system settings**

## 🔒 Security Features

### **Token Management:**

- JWT tokens stored securely in localStorage
- Automatic token refresh before expiration
- Secure logout that clears all stored data

### **Route Protection:**

```typescript
// Protected route example
<ProtectedRoute requiredRole={UserRole.ADMIN}>
  <AdminDashboard />
</ProtectedRoute>

// Public route (login/register only when not authenticated)
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

### **Permission Checking:**

```typescript
const { hasRole, hasPermission } = useAuth();

// Check user role
if (hasRole(UserRole.EMPLOYEE)) {
  // Show employee-specific content
}

// Check specific permission
if (hasPermission("projects", "edit")) {
  // Allow project editing
}
```

## 🚀 Key Components

### **useAuth Hook:**

```typescript
const {
  user, // Current user object
  token, // JWT token
  isAuthenticated, // Authentication status
  isLoading, // Loading state
  error, // Authentication errors
  login, // Login function
  register, // Registration function
  logout, // Logout function
  hasRole, // Role checking
  hasPermission, // Permission checking
} = useAuth();
```

### **Route Guards:**

- `<ProtectedRoute>` - Requires authentication
- `<CustomerRoute>` - Customer access only
- `<EmployeeRoute>` - Employee access only
- `<AdminRoute>` - Admin access only
- `<StaffRoute>` - Employee or Admin access
- `<PublicRoute>` - Unauthenticated users only

## 🔄 State Management

The authentication state is managed using React Context with useReducer for predictable state updates:

```typescript
// Auth State Structure
{
  user: User | null,
  token: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

## 🌐 Future Enhancements

### **OAuth Integration:**

- Google Sign-In ready for implementation
- GitHub OAuth prepared
- Easy to add more providers

### **Advanced Features:**

- Automatic token refresh with retry logic
- Biometric authentication support
- Multi-factor authentication (MFA)
- Session management across tabs

## 🐛 Troubleshooting

### **Common Issues:**

**1. "Cannot find module" errors:**

- Ensure all dependencies are installed: `npm install`
- Check import paths are correct

**2. "Fast refresh only works when a file only exports components":**

- This has been resolved by separating contexts and hooks

**3. Authentication not persisting:**

- Check localStorage in browser dev tools
- Ensure backend is returning proper tokens

**4. CORS issues:**

- Configure backend to allow frontend origin
- Check API base URL in environment variables

## 📞 Support

For questions or issues:

1. Check the console for error messages
2. Verify backend API is running and accessible
3. Ensure environment variables are set correctly
4. Check network tab in dev tools for failed requests

## 🎉 Success!

Your authentication system is now ready! Users can:

- ✅ Register and login securely
- ✅ Access role-appropriate dashboards
- ✅ Navigate with proper route protection
- ✅ Experience smooth UI with error handling

**Next Steps:** Connect to your Spring Boot backend and start building the core automobile service features!
