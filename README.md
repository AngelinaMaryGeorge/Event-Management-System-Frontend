# Event Management Frontend

This is the frontend for a student/community event management platform. It is built with React and Vite and connects to a backend API for authentication, events, registrations, profiles, reports, and file uploads.

## High-Level Architecture

The frontend sits in the client layer and talks to the backend over HTTPS.

- React app for user-facing pages
- React Router for navigation and protected routes
- Axios for API calls
- JWT-based authentication flow
- Role-based screens for users, organizers, admins, and super admins
- File upload support for event banners and profile images

## Folder Structure

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   └── utils/
└── package.json
```

### Main Frontend Areas

- `api/` - API wrappers for auth, events, registrations, reports, and users
- `components/` - reusable UI pieces
- `pages/` - route-level screens such as login, register, dashboard, events, profile, and admin views
- `contexts/` - shared app state like authentication
- `hooks/` - reusable logic for auth and events
- `routes/` - protected route handling
- `services/` - shared Axios instance and request configuration

## Key Pages

- Login
- Register
- Events list
- Event details
- Dashboard
- Profile
- Create event
- Edit event
- Event participants
- Admin dashboard
- Reports
- Super admin users

## User Workflow

### 1. Registration and Login

Visitor -> Landing page -> Login or Sign Up -> Fill form -> Validate inputs -> Create account -> Login -> JWT token stored -> Dashboard

### 2. Browse and Register for Events

User dashboard -> Browse events -> Search or filter -> Open event details -> Check registration status -> Register if open -> Confirmation shown -> Available seats updated

### 3. Create and Manage Events

Organizer or admin dashboard -> Create event -> Enter details -> Upload banner -> Submit -> Validate data -> Save event -> Publish event

### 4. Update or Delete Events

My events -> Select event -> Edit or delete -> Update banner if needed -> Save changes or remove event -> Notify affected users when required

### 5. Attendance Flow

Participant arrives -> QR code opened -> Organizer scans code -> Registration validated -> Attendance marked -> Database updated

## Roles

- `SUPER_ADMIN` - manage users, organizers, events, and analytics
- `ADMIN` - manage events, registrations, and reports
- `ORGANIZER` - create and edit events, view participants, upload assets
- `USER` - browse events, register, cancel registration, and update profile

## Frontend API Usage

The app uses API modules for:

- authentication
- events
- registrations
- reports
- users

