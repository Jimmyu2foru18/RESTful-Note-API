# RESTful Note API

A flexible note-taking API built with Node.js and Express that demonstrates both stateless and stateful authentication.

## Project Overview

This RESTful Note API provides a backend for note-taking applications with distinct authentications:

- **Stateless**: Each request includes full user credentials, with no server-side session storage
- **Stateful**: Uses server-side sessions to track logged-in users across requests

The project uses API authentication & includes note-taking functionality.

## Features

- Create and retrieve notes via RESTful endpoints
- Switch between stateless and stateful authentication modes
- Secure user authentication and authorization
- Data persistence options
- Comprehensive API documentation

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive authentication token/session

### Notes
- `POST /notes` - Create a new note
- `GET /notes` - Retrieve all notes for the authenticated user
- `GET /notes/:id` - Retrieve a specific note by ID
- `PUT /notes/:id` - Update a specific note
- `DELETE /notes/:id` - Delete a specific note

## Authentication Modes

### Stateless Mode
In stateless mode, each API request must include authentication credentials. 
The server validates these credentials with each request without maintaining the session state.

**Example Request:**
```
POST /notes
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Meeting Notes",
  "content": "Discuss project timeline and resource allocation"
}
```

### Stateful Mode
In stateful mode, the server maintains session information after login. 
A session cookie is used to identify the user across multiple requests.

**Example Request:**
```
POST /notes
Content-Type: application/json
Cookie: connect.sid=s%3A12345...

{
  "title": "Meeting Notes",
  "content": "Discuss project timeline and resource allocation"
}
```

## Setup Instructions

### Prerequisites
- Node.js 
- npm

### Installation

1. Clone the repository
   ```
   git clone https://github.com/jimmyu2foru18/RESTful-Note-API.git
   cd RESTful-Note-API
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   ```
   cp .env.example .env
   ```

4. Start the server
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## Configuration

The application can be configured using environment variables:

- `PORT` - Server port (default: 3000)
- `AUTH_MODE` - Authentication mode (`stateless` or `stateful`, default: `stateless`)
- `JWT_SECRET` - Secret key for JWT token generation/validation
- `SESSION_SECRET` - Secret key for session management
- `STORAGE_TYPE` - Data storage type (`memory`, `sqlite`, or `mongodb`, default: `memory`)
- `DB_CONNECTION_STRING` - Database connection string (required if using `sqlite` or `mongodb`)

## Usage Examples

### Register a New User
```
POST /auth/register
Content-Type: application/json

{
  "username": "user1",
  "password": "securepassword"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "securepassword"
}
```

### Create a Note
```
POST /notes
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Shopping List",
  "content": "Milk, Eggs, Bread"
}
```

### Get All Notes
```
GET /notes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```