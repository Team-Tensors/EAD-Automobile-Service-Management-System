<div align="center">

# DriveCare Automobile Service Management System

**Automobile Service Time Logging & Appointment System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)

*A comprehensive enterprise application for managing automotive service appointments, time logging, and customer interactions*

[Features](#key-features) • [Tech Stack](#technology-stack) • [Getting Started](#getting-started) • [API Docs](#api-documentation) • [Documentation](#system-diagrams) • [License](#license)

</div>

---

## Project Overview

This is an **Enterprise Application Development (EAD)** project that implements a comprehensive automobile service management system. The system streamlines the process of managing vehicle service appointments, tracking service progress, and logging service times for automotive service centers and their customers.

### Project Objectives

- Develop a web-based automobile service management system
- Implement appointment booking and scheduling functionality
- Create service time logging and tracking capabilities
- Provide real-time status updates for customers
- Enable efficient management of service center operations
- Demonstrate enterprise application development best practices

## System Diagrams

<details>
<summary><b>Use Case Diagram</b></summary>

![Use Case Diagram](diagrams/use_case.png)

</details>

<details>
<summary><b>Entity Relationship Diagram</b></summary>

![ER Diagram](diagrams/er.png)

</details>

## Key Features

### Customer Portal
- **User Registration & Authentication**: Secure login system with JWT and OAuth2 (Google) support
- **Vehicle Management**: Add, edit, and manage multiple vehicles with comprehensive details
- **Appointment Booking**: Schedule service appointments online with real-time slot availability checking
- **Service History**: View detailed past and current service records with time logs
- **Real-time Status Tracking**: Monitor service progress with live updates and notifications
- **Notifications**: Real-time SSE-based notification system for service status updates
- **Chat Support**: Real-time chat communication with service center staff via WebSocket
- **AI Chatbot**: Intelligent chatbot assistant for common queries and support
- **Profile Management**: Update personal information, view active sessions, and manage account security
- **Service Centers**: Browse nearby service centers with location mapping

### Employee Dashboard
- **Staff Dashboard**: Comprehensive dashboard to manage daily operations and assigned appointments
- **Service Time Logging**: Track actual time spent on services with precision time log entries
- **Appointment Management**: View, update status, and manage customer appointments
- **Service Status Updates**: Real-time status updates (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
- **Shift Scheduling**: Self-assign to appointments based on availability and workload
- **Inventory Access**: View and manage inventory items required for services
- **Chat System**: Real-time communication with customers for service-related queries
- **Profile Management**: View assigned service center and personal details

### Administrative Functions
- **User Management**: Comprehensive user and employee account management
- **Appointment Administration**: View and manage all appointments (upcoming, ongoing, unassigned)
- **Employee Assignment**: Assign employees to appointments and service centers
- **Analytics & Reports**: Advanced analytics dashboard with:
  - Service distribution charts
  - Revenue trend analysis
  - Employee performance metrics
  - Customer insights and statistics
- **Service Catalog Management**: Full CRUD operations for services and modifications
- **Inventory Management**: Complete inventory system with:
  - Low stock alerts
  - Category-based organization
  - Restock and purchase operations
  - Search and filtering capabilities
- **Service Center Management**: Manage multiple service center locations
- **Notification Center**: Centralized notification management for all users
- **System Configuration**: Configure system settings and parameters

## System Architecture

### Technology Stack

#### Frontend
- **Framework**: React 19.1.1 with TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: TailwindCSS 4.1.13 with custom animations
- **Routing**: React Router DOM 7.9.3
- **UI Components**: Radix UI, Lucide React, Framer Motion
- **Charts**: Recharts for analytics visualization
- **Maps**: Leaflet & React-Leaflet for location services
- **HTTP Client**: Axios 1.12.2
- **Real-time Communication**: 
  - WebSocket (SockJS + STOMP) for chat
  - Server-Sent Events (SSE) for notifications
- **Additional Libraries**:
  - React Hot Toast for notifications
  - jsPDF for PDF generation
  - Vercel Analytics for performance monitoring
- **Features**: Responsive design, real-time updates, intuitive UI, offline-ready architecture

#### Backend
- **Framework**: Spring Boot 3.5.5
- **Language**: Java 21
- **Database**: PostgreSQL (production), H2 (development/testing)
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT authentication
- **OAuth2**: Google OAuth2 integration for social login
- **Real-time Communication**:
  - WebSocket support for chat functionality
  - Server-Sent Events (SSE) for notifications
- **Email**: Spring Boot Mail for password reset and notifications
- **API Documentation**: Swagger/OpenAPI 3
- **Architecture**: RESTful API, Layered Architecture (Controller → Service → Repository)
- **Build Tool**: Maven
- **Environment Configuration**: Spring Dotenv for .env file support

#### Database
- **Primary Database**: PostgreSQL
- **Development Database**: H2 (in-memory for testing)
- **Design**: Normalized relational database schema
- **Key Entities**: 
  - User, Role (Authentication & Authorization)
  - Vehicle, Appointment, TimeLog (Core Service Management)
  - ServiceOrModification, ServiceCenter (Service Catalog)
  - RefreshToken, PasswordResetToken (Security)
  - ChatRoom, ChatMessage (Communication)
  - Notification (Real-time Updates)
  - InventoryItem (Inventory Management)
  - EmployeeCenter, ShiftSchedules (Workforce Management)
- **Features**: Data integrity, ACID compliance, indexing for performance, foreign key constraints

#### Security & Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- OAuth2 integration (Google Sign-In)
- Password encryption and secure token management
- XSS and CSRF protection

#### DevOps & Deployment
- Docker & Docker Compose support
- Containerized microservices architecture
- Environment-based configuration (.env files)

## User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Book appointments, track services, manage vehicles, view service history |
| **Employee** | Log service times, update service status, manage appointments |
| **Admin** | System administration, user management, analytics, inventory management |

## Getting Started

### Prerequisites

**Required Software:**
- Java 21 or higher
- PostgreSQL 14 or higher
- Node.js 18+ and npm/yarn
- Docker and Docker Compose (for containerized deployment)
- Maven 3.8+ (for backend build)

### Installation & Setup

#### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Team-Tensors/EAD-Automobile-Service-Management-System.git
cd EAD-Automobile-Service-Management-System

# Start all services with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:4000
```

#### Option 2: Manual Setup

**Backend Setup:**

```bash
# Navigate to backend directory
cd backend

# Create .env file from example
cp .env.example .env
# Edit .env file with your database credentials and configuration

# Build the application
mvn clean install

# Run the application
mvn spring-boot:run

# Backend will be available at http://localhost:4000
```

**Frontend Setup:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### Database Setup

```sql
-- Create PostgreSQL database
CREATE DATABASE automobile_service_db;

-- The application will automatically create tables on first run
-- using JPA/Hibernate auto-ddl configuration
```

### Environment Configuration

**Backend (.env file):**
```env
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/automobile_service_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_at_least_256_bits
JWT_EXPIRATION=86400000                # 24 hours in milliseconds
JWT_REFRESH_EXPIRATION=604800000       # 7 days in milliseconds
JWT_REFRESH_MAX_TOKENS=5

# AI Chatbot (Groq API)
GROQ_API_KEY=your_groq_api_key

# Spring Profile (optional)
# SPRING_PROFILES_ACTIVE=dev    # For development (default)
# SPRING_PROFILES_ACTIVE=prod   # For production
```

**Note:** 
- Copy `backend/.env.example` to `backend/.env` and fill in your actual values
- Never commit `.env` file to version control
- Generate a strong JWT secret (minimum 256 bits / 32 characters)

### Running Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests (if configured)
cd frontend
npm test
```

## Project Structure

```
EAD-Automobile-Service-Management-System/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ead/backend/
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── VehicleController.java
│   │   │   │   │   ├── AppointmentBookingController.java
│   │   │   │   │   ├── CustomerAppointmentController.java
│   │   │   │   │   ├── AdminAppointmentController.java
│   │   │   │   │   ├── EmployeeController.java
│   │   │   │   │   ├── ServiceOrModificationController.java
│   │   │   │   │   ├── ServiceCenterController.java
│   │   │   │   │   ├── InventoryController.java
│   │   │   │   │   ├── AnalyticsController.java
│   │   │   │   │   ├── ChatController.java
│   │   │   │   │   ├── ChatBotController.java
│   │   │   │   │   ├── WebSocketChatController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   ├── ShiftScheduleController.java
│   │   │   │   │   └── HealthController.java
│   │   │   │   ├── service/         # Business logic layer
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── AppointmentService.java
│   │   │   │   │   ├── CustomerAppointmentService.java
│   │   │   │   │   ├── EmployeeService.java
│   │   │   │   │   ├── AdminService.java
│   │   │   │   │   ├── VehicleService.java
│   │   │   │   │   ├── ServiceCenterService.java
│   │   │   │   │   ├── InventoryService.java
│   │   │   │   │   ├── AnalyticsService.java
│   │   │   │   │   ├── ChatService.java
│   │   │   │   │   ├── ChatbotService.java
│   │   │   │   │   ├── NotificationService.java
│   │   │   │   │   ├── ShiftScheduleService.java
│   │   │   │   │   ├── EmailService.java
│   │   │   │   │   ├── RefreshTokenService.java
│   │   │   │   │   ├── PasswordResetService.java
│   │   │   │   │   ├── JwtAuthorizationService.java
│   │   │   │   │   └── CustomUserDetailsService.java
│   │   │   │   ├── repository/      # Data access layer (JPA)
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   │   ├── User.java, Role.java
│   │   │   │   │   ├── Vehicle.java
│   │   │   │   │   ├── Appointment.java, TimeLog.java
│   │   │   │   │   ├── ServiceOrModification.java
│   │   │   │   │   ├── ServiceCenter.java
│   │   │   │   │   ├── EmployeeCenter.java
│   │   │   │   │   ├── ShiftSchedules.java
│   │   │   │   │   ├── InventoryItem.java
│   │   │   │   │   ├── ChatRoom.java, ChatMessage.java
│   │   │   │   │   ├── Notification.java
│   │   │   │   │   ├── RefreshToken.java
│   │   │   │   │   └── PasswordResetToken.java
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── exception/       # Exception handlers
│   │   │   │   ├── filter/          # Security filters
│   │   │   │   ├── annotation/      # Custom annotations
│   │   │   │   └── util/            # Utility classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── ...
│   │   └── test/                    # Unit and integration tests
│   ├── pom.xml                      # Maven dependencies
│   ├── .env.example                 # Environment variables template
│   └── Dockerfile                   # Backend Docker configuration
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminAnalytics.tsx
│   │   │   │   ├── AdminInventory.tsx
│   │   │   │   ├── AdminServiceTypes.tsx
│   │   │   │   ├── AdminEmployees.tsx
│   │   │   │   └── AdminNotifications.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── AppoinmentBookingPage.tsx
│   │   │   ├── MyAppointmentsPage.tsx
│   │   │   ├── MyVehiclesPage.tsx
│   │   │   ├── MySchedulePage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── EmployeeInventory.tsx
│   │   │   ├── ShiftSchedulingPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   └── ...
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Chatbot/             # AI chatbot components
│   │   │   ├── Notification/        # Notification bell and SSE
│   │   │   ├── HomePage/            # Landing page components
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── services/                # API service layer
│   │   │   ├── authService.ts
│   │   │   ├── appointmentService.ts
│   │   │   ├── vehicleService.ts
│   │   │   ├── inventoryService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── chatService.ts
│   │   │   ├── notificationService.ts
│   │   │   └── ...
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   ├── public/                      # Static assets
│   ├── package.json                 # npm dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   └── Dockerfile                   # Frontend Docker configuration
├── diagrams/                   # System design diagrams
│   ├── use_case.png                 # Use case diagram
│   └── er.png                       # Entity relationship diagram
├── documents/                  # Project documentation
├── docker-compose.yml          # Docker Compose configuration
├── PERFORMANCE_ISSUES.md       # Performance analysis document
└── README.md                   # This file
```

## API Documentation

The backend provides a comprehensive RESTful API with JWT-based authentication. All authenticated endpoints require a valid JWT token in the `Authorization` header.

### Base URL
```
Development: http://localhost:4000
```

### Authentication & User Management

#### Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user (customer/employee) | Public |
| POST | `/auth/register/customer` | Register customer (forces CUSTOMER role) | Public |
| POST | `/auth/register/employee` | Register employee (forces EMPLOYEE role) | Admin Only |
| POST | `/auth/login` | User login with email/password | Public |
| POST | `/auth/refresh-token` | Refresh JWT access token | Public |
| POST | `/auth/rotate-refresh-token` | Rotate refresh token | Public |
| POST | `/auth/logout` | Logout and revoke refresh token | Public |
| POST | `/auth/logout-all` | Logout from all devices | Authenticated |
| GET | `/auth/active-sessions` | Get all active user sessions | Authenticated |
| GET | `/auth/profile` | Get current user profile | Authenticated |
| PUT | `/auth/update-profile` | Update user profile information | Authenticated |
| POST | `/auth/forgot-password` | Request password reset email | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| GET | `/auth/verify-reset-token/{token}` | Verify password reset token | Public |

**Sample Login Request:**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Sample Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["CUSTOMER"]
}
```

---

### Vehicle Management (`/vehicles`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/vehicles` | Get all vehicles for current user | Authenticated |
| GET | `/vehicles/{id}` | Get specific vehicle by ID | Authenticated |
| POST | `/vehicles` | Add new vehicle | Authenticated |
| PUT | `/vehicles/{id}` | Update vehicle information | Authenticated |
| DELETE | `/vehicles/{id}` | Delete vehicle | Authenticated |

**Sample Vehicle Creation:**
```json
POST /vehicles
{
  "brand": "Toyota",
  "model": "Camry",
  "year": 2023,
  "licensePlate": "ABC-1234",
  "vin": "1HGBH41JXMN109186"
}
```

---

### Appointment Management

#### Customer Appointment Endpoints (`/appointments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/appointments/book` | Book new appointment | Customer |
| GET | `/appointments/my-appointments` | Get user's appointments (summary) | Customer |
| GET | `/appointments/my-detailed-appointments` | Get detailed appointment information | Customer |
| PUT | `/appointments/{id}/cancel` | Cancel appointment | Customer |
| GET | `/appointments/available-slots` | Check available time slots | Customer |

**Sample Appointment Booking:**
```json
POST /appointments/book
{
  "vehicleId": "uuid",
  "serviceOrModificationId": "uuid",
  "serviceCenterId": "uuid",
  "appointmentType": "SERVICE",
  "appointmentDate": "2025-11-15T10:00:00",
  "description": "Regular maintenance service"
}
```

#### Admin Appointment Endpoints (`/admin/appointments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/appointments/upcoming` | Get all upcoming appointments | Admin |
| GET | `/admin/appointments/ongoing` | Get all ongoing appointments | Admin |
| GET | `/admin/appointments/unassigned` | Get unassigned appointments | Admin |
| POST | `/admin/appointments/{id}/assign-employees` | Assign employees to appointment | Admin |
| GET | `/admin/appointments/employees` | Get all employees with service centers | Admin |
| POST | `/admin/appointments/assign-employee` | Assign employee to service center | Admin |

---

### Employee Operations (`/employee`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employee/appointments` | Get appointments assigned to employee | Employee |
| GET | `/employee/appointments/{appointmentId}/employees/{employeeId}/timelogs` | Get time logs for appointment | Employee |
| POST | `/employee/appointments/{appointmentId}/timelog` | Create new time log entry | Employee |
| PUT | `/employee/appointments/{appointmentId}/status` | Update appointment status | Employee |
| GET | `/employee/details` | Get employee details with service center | Employee |

**Appointment Statuses:**
- `PENDING` - Initial status after booking
- `CONFIRMED` - Confirmed by admin/system
- `IN_PROGRESS` - Service is being performed
- `COMPLETED` - Service completed
- `CANCELLED` - Appointment cancelled

---

### Service Catalog (`/services-modifications`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/services-modifications/services` | Get all services | Public |
| GET | `/services-modifications/modifications` | Get all modifications | Public |
| GET | `/services-modifications/admin/all` | Get all services/modifications (admin) | Admin |
| GET | `/services-modifications/admin/{id}` | Get specific service/modification | Admin |
| POST | `/services-modifications/admin` | Create new service/modification | Admin |
| PUT | `/services-modifications/admin/{id}` | Update service/modification | Admin |
| DELETE | `/services-modifications/admin/{id}` | Delete service/modification | Admin |

---

### Service Centers (`/service-centers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/service-centers/with-services` | Get all service centers with their services | Public |
| GET | `/service-centers/nearby-with-services` | Get nearby service centers with location data | Public |
| GET | `/service-centers/with-available-slots` | Get service centers with slot availability | Public |

---

### Inventory Management (`/inventory`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/inventory` | Get all inventory items | Authenticated |
| GET | `/inventory/{id}` | Get specific inventory item | Authenticated |
| GET | `/inventory/low-stock` | Get low stock items | Authenticated |
| GET | `/inventory/category/{category}` | Get items by category | Authenticated |
| GET | `/inventory/search` | Search inventory items | Authenticated |
| POST | `/inventory` | Add new inventory item | Admin/Employee |
| PUT | `/inventory/{id}` | Update inventory item | Admin/Employee |
| PUT | `/inventory/{id}/restock` | Restock inventory item | Admin/Employee |
| PUT | `/inventory/{id}/buy` | Purchase/reduce inventory | Admin/Employee |
| DELETE | `/inventory/{id}` | Delete inventory item | Admin |

---

### Chat & Communication

#### Chat Endpoints (`/chat`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/chat/appointment/{appointmentId}` | Get chat room for appointment | Authenticated |
| GET | `/chat/my-chats` | Get all chat rooms for user | Authenticated |
| GET | `/chat/{chatRoomId}/messages` | Get messages in chat room | Authenticated |
| POST | `/chat/send` | Send message in chat room | Authenticated |
| PUT | `/chat/{chatRoomId}/mark-read` | Mark messages as read | Authenticated |

#### AI Chatbot (`/chat`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/chat/message` | Send message to AI chatbot | Authenticated |

**WebSocket Endpoint:** `/ws` (for real-time chat using STOMP over SockJS)

---

### Notifications (`/notifications`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications/subscribe/{userId}` | Subscribe to SSE notification stream | Authenticated |
| GET | `/notifications/user/{userId}` | Get all notifications for user | Authenticated |
| GET | `/notifications/user/{userId}/unread` | Get unread notifications | Authenticated |
| GET | `/notifications/user/{userId}/unread/count` | Get unread notification count | Authenticated |
| PUT | `/notifications/{notificationId}/read` | Mark notification as read | Authenticated |
| PUT | `/notifications/user/{userId}/read-all` | Mark all notifications as read | Authenticated |
| DELETE | `/notifications/user/{userId}` | Delete all notifications | Authenticated |

**SSE Stream:** Real-time server-sent events for live notification updates

---

### Analytics & Reports (`/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/analytics/service-distribution` | Get service type distribution data | Admin |
| GET | `/analytics/revenue-trend` | Get revenue trend over time | Admin |
| GET | `/analytics/employee-performance` | Get employee performance metrics | Admin |
| GET | `/analytics/customer-insights` | Get customer statistics and insights | Admin |
| GET | `/analytics/dashboard` | Get complete dashboard analytics | Admin |
| POST | `/analytics/custom` | Get custom analytics with filters | Admin |

---

### Shift Scheduling (`/shift`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/shift/pending-appointments` | Get pending appointments for scheduling | Employee |
| GET | `/shift/possible-appointments` | Get appointments employee can take | Employee |
| GET | `/shift/possible-employees/{appointmentId}` | Get employees available for appointment | Admin |
| POST | `/shift/self-assign-employee` | Self-assign to an appointment | Employee |

---

### Health Check (`/health`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Basic health check | Public |
| GET | `/health/debug` | Detailed health and debug information | Public |

---

### Authentication Flow

1. **Registration:** `POST /auth/register` → Returns JWT token + refresh token
2. **Login:** `POST /auth/login` → Returns JWT token + refresh token
3. **Use API:** Include JWT in header: `Authorization: Bearer <token>`
4. **Token Expires:** `POST /auth/refresh-token` with refresh token → Get new JWT
5. **Logout:** `POST /auth/logout` with refresh token → Revoke tokens

### Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "success": false
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Rate Limiting & Security

- JWT tokens expire after 24 hours (configurable)
- Refresh tokens expire after 7 days (configurable)
- Maximum 5 active refresh tokens per user
- CORS configured for frontend origin
- XSS and CSRF protection enabled
- Password encryption with BCrypt

---

## Recent Updates & Features

### 🆕 Latest Additions

#### Real-time Communication System
- **WebSocket Chat**: Real-time chat between customers and service staff using SockJS and STOMP
- **AI Chatbot**: Intelligent chatbot for answering common questions and providing support
- **Server-Sent Events**: Live notification updates without polling

#### Advanced Analytics Dashboard
- Service distribution visualization
- Revenue trend analysis with charts
- Employee performance metrics
- Customer insights and statistics
- Custom analytics with filtering capabilities

#### Inventory Management System
- Complete CRUD operations for inventory items
- Category-based organization
- Low stock alerts and monitoring
- Restock and purchase tracking
- Search and filtering capabilities

#### Shift Scheduling & Workforce Management
- Employee self-assignment to appointments
- Workload balancing algorithms
- Service center assignment management
- Availability tracking

#### Enhanced Security Features
- Multi-device session management
- Refresh token rotation
- Active session monitoring
- Device information tracking
- Password reset via email with secure tokens

### 🔧 Technical Improvements

- **Performance Optimizations**: Identified and documented in `PERFORMANCE_ISSUES.md`
- **Real-time Updates**: Replaced polling with WebSocket and SSE where appropriate
- **Enhanced Validation**: Comprehensive input validation on both frontend and backend
- **Error Handling**: Consistent error responses across all endpoints
- **Database Optimizations**: Indexed queries and optimized relationships

### 📱 User Experience Enhancements

- Responsive design for all screen sizes
- Real-time status updates without page refresh
- Interactive charts and data visualization
- Map integration for service center locations
- PDF generation for reports
- Toast notifications for user feedback
- Loading states and skeleton screens

---

## Contributing

We welcome contributions to improve the EAD Automobile Service Management System! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Team

**Team Tensors** - Enterprise Application Development Project

For questions or support, please open an issue in the GitHub repository.

## License

<div align="center">

### MIT License

Copyright (c) 2025 Team Tensors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*This project is licensed under the MIT License - see above for details*

</div>

## Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- All contributors and team members who made this project possible

---

<div align="center">

**Last Updated**: November 2025

Made with ❤️ by Team Tensors

[Back to Top](#drivecare-automobile-service-management-system)

</div>
