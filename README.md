# Event Management System

## Project Overview
A backend application for event management built with Node.js and Fastify, integrating external APIs.

## Technology Stack
- **Backend**: Node.js
- **Web Framework**: Fastify
- **API Mocking**: MSW (Mock Service Worker)

## Key Architectural Decisions

### 1. Performance Optimization
- Parallel requests using `Promise.all()`
- Efficient user event retrieval
- Reduced API call latency

### 2. Resilience Mechanisms
- Custom Circuit Breaker implementation
- Retry mechanism with exponential backoff
- Service states: CLOSED, OPEN, HALF_OPEN
- Service recovery timeout - 30 seconds


## Installation and Running

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the application
npm start
```

## API Endpoints

### GET /getUsers
- Retrieve list of users
- URL: `http://localhost:3000/getUsers`

### GET /getEvents
- Retrieve list of events
- URL: `http://localhost:3000/getEvents`

### GET /getEventsByUserId/:id
- Retrieve events for a specific user
- URL: `http://localhost:3000/getEventsByUserId/{userId}`

### POST /addEvent
- Add a new event
- URL: `http://localhost:3000/addEvent`
- Payload example:
```json
{
    "name": "Team Meeting",
    "userId": "1",
    "details": "Weekly team sync-up meeting"
}
```

#### Full Event Structure After Creation
```json
{
    "id": 1,
    "name": "Team Meeting", 
    "userId": 1,
    "details": "Weekly team sync-up meeting"
}
```

## Testing
- MSW used for external API simulation
- Built-in delay and failure imitation

## Performance Characteristics
- Parallel API requests
- Intelligent retry mechanism
- Circuit Breaker for service reliability

## Future Improvements
- Add comprehensive unit and integration tests
- Implement advanced logging
- Set up external monitoring
- Enhance error reporting
- Add more robust configuration management


