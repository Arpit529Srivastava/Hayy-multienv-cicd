# Hayy Multi-Environment CI/CD System

A comprehensive, production-ready CI/CD pipeline for the Hayy Task Manager API with multi-environment deployment, automated testing, security scanning, and infrastructure monitoring.

##  Complete CI/CD Pipeline Features

### **Application Features**
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

### **CI/CD Pipeline Features**
- **Multi-Environment Deployment**: Dev, Staging, Production
- **Automated Testing**: Unit, Integration, Performance tests
- **Security Scanning**: Snyk, Trivy vulnerability scanning
- **Code Quality**: ESLint, Prettier, Security audits
- **Container Security**: Multi-stage Docker builds with security scanning
- **Infrastructure as Code**: Terraform for AWS EKS + DocumentDB
- **Drift Detection**: Automated infrastructure monitoring
- **Monitoring**: Prometheus + Grafana observability
- **Alerting**: Slack notifications, GitHub issues, PagerDuty
- **Zero-Downtime Deployments**: Rolling updates with health checks

## 🛠️ Tech Stack

### **Application Stack**
- **Node.js** v18+ with Express.js
- **MongoDB** with Mongoose ODM (DocumentDB in production)
- **Winston** for logging
- **Helmet** for security
- **CORS** enabled
- **express-validator** for input validation
- **express-rate-limit** for rate limiting

### **Infrastructure Stack**
- **AWS EKS** (Kubernetes clusters)
- **AWS DocumentDB** (MongoDB-compatible)
- **GitHub Container Registry** (ghcr.io)
- **Terraform** for Infrastructure as Code
- **Prometheus + Grafana** for monitoring
- **Slack** for notifications
- **PagerDuty** for critical alerts

### **CI/CD Tools**
- **GitHub Actions** for CI/CD pipelines
- **Docker** for containerization
- **Trivy** for container security scanning
- **Snyk** for dependency vulnerability scanning
- **Jest** for testing
- **ESLint + Prettier** for code quality

## 📁 Project Structure

```
Hayy-multienv-cicd/
├── app/                          # Node.js Application
│   ├── src/                      # Source code
│   │   ├── config/               # Database configuration
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/           # Error handling, logging
│   │   ├── models/               # Data models
│   │   ├── routes/               # API routes
│   │   └── index.js              # Application entry point
│   ├── tests/                    # Test suites
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── performance/          # Performance tests
│   ├── Dockerfile                # Multi-stage container build
│   ├── package.json              # Dependencies and scripts
│   └── jest.config.js            # Test configuration
├── k8s/                          # Kubernetes Manifests
│   ├── deployment.yaml           # Application deployment
│   ├── service.yaml              # Service configuration
│   └── configmap.yaml            # Environment configuration
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Main Terraform configuration
│   ├── variables.tf              # Variable definitions
│   ├── outputs.tf                # Output definitions
│   └── environments/             # Environment-specific configs
│       ├── dev.tfvars
│       ├── staging.tfvars
│       └── prod.tfvars
├── monitoring/                   # Observability Configuration
│   ├── prometheus-config.yaml    # Prometheus configuration
│   └── grafana-dashboard.json    # Grafana dashboard
└── .github/workflows/            # CI/CD Pipelines
    ├── ci-cd-complete.yml        # Complete CI/CD pipeline
    ├── test.yml                  # Testing workflow
    ├── deploy-dev.yaml           # Development deployment
    ├── deploy.stag.yaml          # Staging deployment
    ├── deploy-prod.yaml          # Production deployment
    └── drift-detection.yml        # Infrastructure monitoring
```

## 💰 Cost Optimization

This setup is optimized for **AWS Free Tier** and minimal costs:

### **Free Tier Resources**
- **EC2 Instances**: t3.micro (750 hours/month free)
- **EBS Storage**: 30GB free per month
- **Data Transfer**: 1GB free per month
- **S3 Storage**: 5GB free per month

### **Estimated Monthly Costs**
- **Development**: ~$94.50/month (EKS control plane + minimal resources)
- **Staging**: ~$124.50/month
- **Production**: ~$124.50/month

> **Note**: EKS control plane costs ~$73/month regardless of usage. Consider alternatives like AWS App Runner or single EC2 instance for ultra-low-cost deployments.

### **Cost Optimization Strategies**
1. **Single EKS cluster** with multiple namespaces
2. **Spot instances** for non-critical workloads
3. **Reserved instances** for predictable workloads
4. **Alternative architectures** (App Runner, Lambda, single EC2)

See [COST_OPTIMIZATION.md](COST_OPTIMIZATION.md) for detailed cost analysis and optimization strategies.

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
