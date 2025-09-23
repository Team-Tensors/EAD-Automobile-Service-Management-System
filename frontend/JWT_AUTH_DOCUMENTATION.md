# JWT-Based Authentication System Documentation

## Overview

The frontend authentication system has been updated to work with a JWT-based backend that handles role checking per request. This system automatically includes the JWT token in all authenticated requests and handles token refresh and error scenarios.

## Backend Integration Specifications

### Login Request Format

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response (Frontend Stores These)

```typescript
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",    // JWT token with embedded roles
  "refreshToken": "uuid-refresh-token",   // For token refresh
  "type": "Bearer",
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]                   // User roles
}
```

### Authenticated Request Format

All authenticated requests automatically include:

```typescript
headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

## Frontend Implementation Details

### 1. Authentication Service (`authService.ts`)

**Login Method:**

- Sends email/password to `/auth/login`
- Receives JWT token and user data
- Returns standardized `AuthResponse`

**Register Method:**

- Sends registration data to `/auth/register/customer`
- Supports auto-login if backend returns JWT token
- Falls back to separate login if needed

**Token Refresh:**

- Automatically called when JWT expires (401 response)
- Uses refresh token to get new JWT
- Updates stored tokens seamlessly

### 2. Authentication Context (`authContext.tsx`)

**State Management:**

- Stores JWT token, refresh token, and user data
- Handles authentication state across the app
- Provides login, register, logout functions

**Token Storage:**

- Stores JWT token in `localStorage` with key `token`
- Stores refresh token with key `refresh_token`
- Stores user data with key `user`

**Automatic Token Handling:**

- Sets Authorization header for all API requests
- Clears tokens on logout or authentication errors

### 3. API Utilities (`apiUtils.ts`)

**Request Interceptor:**

- Automatically adds `Authorization: Bearer <token>` header
- Ensures `Content-Type: application/json` is set
- Retrieves fresh token from localStorage for each request

**Response Interceptor:**

- **401 Unauthorized**: Attempts token refresh automatically
- **403 Forbidden**: Allows component to handle permission errors
- **Network Errors**: Provides user-friendly error messages
- **Token Refresh Queue**: Prevents multiple simultaneous refresh attempts

### 4. Error Handling

**401 Unauthorized (Token Issues):**

- Automatic token refresh attempt
- Redirect to login if refresh fails
- Queue pending requests during refresh

**403 Forbidden (Insufficient Permissions):**

- Does not redirect (user is authenticated)
- Returns error for component to handle
- Useful for role-based access control

**Network Errors:**

- User-friendly error messages
- No automatic redirects

## Usage Examples

### Making Authenticated Requests

```typescript
import api from "../utill/apiUtils";

// The JWT token is automatically included
const response = await api.post("/appointments/book", {
  serviceId: 123,
  appointmentDate: "2025-09-25T10:00:00",
});
```

### Handling Authentication in Components

```typescript
import { useAuth } from "../hooks/useAuth";

const MyComponent = () => {
  const { isAuthenticated, user, token } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  // User is authenticated, JWT token available
  return <div>Welcome {user.fullName}!</div>;
};
```

### Error Handling

```typescript
try {
  const response = await api.get("/admin/users");
} catch (error) {
  if (error.message.includes("403")) {
    // User lacks admin role
    setError("Admin access required");
  } else if (error.message.includes("401")) {
    // Token issues (handled automatically, but user feedback)
    setError("Please login again");
  } else {
    setError("Request failed");
  }
}
```

## Backend Responsibilities

The backend handles:

1. **JWT Token Validation**: Verify token signature and expiration
2. **Role Extraction**: Extract user roles from JWT payload
3. **Endpoint Authorization**: Check if user roles match required permissions
4. **Token Refresh**: Generate new JWT when refresh token is provided
5. **Error Responses**: Return 401 for auth issues, 403 for permission issues

## Frontend Responsibilities

The frontend handles:

1. **Token Storage**: Store JWT and refresh tokens securely
2. **Request Headers**: Include Authorization header in all authenticated requests
3. **Token Refresh**: Automatically refresh expired tokens
4. **Error Handling**: Handle 401/403 responses appropriately
5. **User Experience**: Provide loading states and error messages

## Security Features

- **Automatic Token Refresh**: Seamless user experience
- **Request Queuing**: Prevents data loss during token refresh
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
- **Error Boundaries**: Graceful handling of authentication failures
- **Role-Based Access**: Frontend respects backend permission decisions

## Development Tips

1. **Check Authentication**: Always verify `isAuthenticated` before making requests
2. **Handle 403 Errors**: Don't redirect on permission errors, show appropriate UI
3. **Use TypeScript**: The auth system is fully typed for better development experience
4. **Monitor Network Tab**: Verify Authorization headers are included in requests
5. **Test Token Expiry**: Test the automatic refresh functionality

## Production Considerations

1. **Secure Token Storage**: Consider using httpOnly cookies instead of localStorage
2. **HTTPS Only**: Ensure all authentication requests use HTTPS
3. **Token Expiry**: Set appropriate JWT expiration times
4. **Rate Limiting**: Implement rate limiting on authentication endpoints
5. **Monitoring**: Log authentication failures and suspicious activity

This system provides a robust, secure, and user-friendly authentication experience that automatically handles JWT tokens and integrates seamlessly with your role-based backend authorization system.
