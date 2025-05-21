# RESTful Note API - Project Proposal

## Project Overview

This proposal outlines the development of a RESTful Note API that demonstrates two different authentication paradigms: 
stateless and stateful. 
The project will serve as both a functional note-taking backend and an educational tool to understand the differences between these authentication approach.

## Technical Specifications

### Technology Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Authentication**: 
  - JWT
  - Express-session for stateful authentication
- **Data Storage Options**:
  - In-memory storage
  - SQLite
  - MongoDB
- **Testing**: Jest and Supertest
- **Documentation**: Swagger/OpenAPI

### System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client         │────▶│  API Layer      │────▶│  Storage Layer  │
│  Applications   │◀────│  (Express)      │◀────│                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │  Auth Layer     │
                        │  (Stateless/    │
                        │   Stateful)     │
                        │                 │
                        └─────────────────┘
```

## Authentication Modes

### Stateless Authentication

In stateless mode, the server does not maintain any session state.
Each request must include all necessary authentication information.

**Implementation Details**:
- JWT-based authentication
- Tokens issued upon successful login
- Each API request includes the JWT in the Authorization header
- Server validates the token with each request
- No server-side session storage required

**Advantages**:
- Scalability: No need to share session state across multiple servers
- Simplicity: No session management overhead
- Suitable for microservices architecture

**Disadvantages**:
- Cannot invalidate tokens before expiration
- Tokens can grow in size if storing too much information

### Stateful Authentication

In stateful mode, the server maintains session information after user login.

**Implementation Details**:
- Express-session middleware for session management
- Session ID stored in a cookie on the client side
- Session data stored server-side
- Server looks up session data for each request

**Advantages**:
- Easy to invalidate sessions
- Smaller payload in requests
- More control over user sessions

**Disadvantages**:
- Requires session storage and management
- More complex to scale across multiple servers

## API Endpoints

### Authentication Endpoints

| Method | Endpoint         | Description                                  | Request Body                      | Response                         |
|--------|------------------|----------------------------------------------|-----------------------------------|----------------------------------|
| POST   | /auth/register   | Register a new user                          | `{username, password}`            | `{userId, username}`             |
| POST   | /auth/login      | Authenticate and receive token/session       | `{username, password}`            | `{token}` or Session Cookie      |
| POST   | /auth/logout     | Invalidate session (stateful mode only)      | None                              | Success message                  |

### Note Endpoints

| Method | Endpoint         | Description                                  | Request Body                      | Response                         |
|--------|------------------|----------------------------------------------|-----------------------------------|----------------------------------|
| POST   | /notes           | Create a new note                            | `{title, content}`                | Created note object              |
| GET    | /notes           | Get all notes for authenticated user         | None                              | Array of note objects            |
| GET    | /notes/:id       | Get a specific note by ID                    | None                              | Note object                      |
| PUT    | /notes/:id       | Update a specific note                       | `{title, content}`                | Updated note object              |
| DELETE | /notes/:id       | Delete a specific note                       | None                              | Success message                  |

## Data Models

### User Model

```javascript
{
  id: String,
  username: String,
  password: String,
  createdAt: Date
}
```

### Note Model

```javascript
{
  id: String,
  userId: String,
  title: String,
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Plan

### Phase 1: Project Setup and Core Structure

- Initialize Node.js project with Express
- Set up project structure and configuration
- Implement middleware
- Create data models and in-memory storage implementation

### Phase 2: Authentication Implementation

- Implement user registration and login functionality
- Develop JWT-based stateless authentication
- Implement session-based stateful authentication
- Create authentication middleware for both modes

### Phase 3: Note API Implementation

- Develop CRUD endpoints for notes
- Implement user-specific note filtering
- Add validation and error handling

### Phase 4: Storage Options

- Implement SQLite storage adapter
- Add MongoDB storage adapter
- Create storage factory for easy switching

### Phase 5: Testing and Documentation

- Write unit and integration tests
- Create API documentation with Swagger
- Develop example client for demonstration

## Configuration Options

The application will be configurable through environment variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication Configuration
AUTH_MODE=stateless  # or 'stateful'
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400  # 24 hours in seconds
SESSION_SECRET=your_session_secret

# Storage Configuration
STORAGE_TYPE=memory  # or 'sqlite', 'mongodb'
DB_CONNECTION_STRING=your_connection_string  # for sqlite or mongodb
```

## Conclusion

This RESTful Note API project will provide a practical demonstration of different authentication and a functional note-taking backend. 
The ability to switch between stateless and stateful modes for understanding the trade-offs between approaches.