# Hayy Task Manager API

A production-ready Node.js Task Manager REST API built with Express.js and MongoDB.

## Features

- **Task CRUD Operations**: Create, read, update, and delete tasks
- **Advanced Filtering**: Filter tasks by status and priority
- **Pagination**: Efficient data retrieval with pagination support
- **Task Statistics**: Get comprehensive task statistics
- **Health Monitoring**: Health check and readiness probe endpoints
- **Security**: Helmet security headers, CORS, and rate limiting
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Robust error handling middleware
- **Validation**: Input validation using express-validator
- **Graceful Shutdown**: Proper cleanup on application termination

## Tech Stack

- **Node.js** v18+ with Express.js
- **MongoDB** with Mongoose ODM
- **Winston** for logging
- **Helmet** for security
- **CORS** enabled
- **express-validator** for input validation
- **express-rate-limit** for rate limiting

## Project Structure

```
src/
├── index.js                 # Entry point
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── Task.js              # Task schema
├── routes/
│   ├── tasks.js             # Task routes
│   └── health.js            # Health routes
├── controllers/
│   └── taskController.js     # Business logic
└── middleware/
    ├── errorHandler.js      # Error handling
    └── logger.js            # Request logging
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hayy-task-manager-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the application:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/hayy-tasks` |
| `APP_VERSION` | Application version | `1.0.0` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `RATE_LIMIT_MAX` | Rate limit per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

## API Endpoints

### Health & Info
- `GET /` - API welcome message
- `GET /health` - Health check with system info
- `GET /ready` - Readiness probe
- `GET /info` - Environment and version information

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering and pagination)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Task Schema

```javascript
{
  title: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  status: String (enum: pending/in-progress/completed, default: pending),
  priority: String (enum: low/medium/high, default: medium),
  dueDate: Date (optional),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Query Parameters

### GET /api/tasks
- `status` - Filter by status (pending, in-progress, completed)
- `priority` - Filter by priority (low, medium, high)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### GET /api/tasks/overdue
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "dueDate": "2024-01-15T10:00:00Z"
  }'
```

### Get Tasks with Filtering
```bash
curl "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=5"
```

### Get Task Statistics
```bash
curl http://localhost:3000/api/tasks/stats
```

## Health Checks

The API provides comprehensive health monitoring:

- **Health Check** (`/health`): Returns system status, uptime, and memory usage
- **Readiness Probe** (`/ready`): Checks database connectivity
- **Info Endpoint** (`/info`): Returns application and environment information

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Database Errors**: Proper handling of MongoDB errors
- **Not Found**: 404 errors for non-existent resources
- **Rate Limiting**: 429 errors for too many requests
- **Server Errors**: 500 errors with appropriate logging

## Logging

The application uses Winston for structured logging:

- **Request Logging**: All HTTP requests are logged with timing
- **Error Logging**: Detailed error logging with stack traces
- **Application Logging**: Important application events
- **File Logging**: Logs are written to files in production

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **Error Sanitization**: Sensitive information is not exposed in errors

## Development

### Scripts
- `npm start` - Start the application
- `npm run dev` - Start with nodemon for development
- `npm test` - Run tests (when implemented)

### Database Indexes

The Task model includes optimized indexes for:
- Status filtering
- Priority filtering
- Due date queries
- Creation date sorting

## Production Considerations

- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Process Management**: Handle uncaught exceptions and unhandled rejections
- **Memory Management**: Monitor memory usage
- **Database Connection**: Automatic reconnection and retry logic
- **Logging**: Structured logging for production monitoring

## License

MIT License