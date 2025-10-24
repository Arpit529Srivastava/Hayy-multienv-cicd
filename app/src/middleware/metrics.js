const client = require('prom-client');
const logger = require('./logger');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'hayy-task-manager-api',
  version: process.env.APP_VERSION || '1.0.0'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status', 'environment'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status', 'environment'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const tasksTotal = new client.Gauge({
  name: 'hayy_tasks_total',
  help: 'Total number of tasks by status',
  labelNames: ['status', 'environment'],
  registers: [register]
});

const overdueTasksTotal = new client.Gauge({
  name: 'hayy_overdue_tasks_total',
  help: 'Total number of overdue tasks',
  labelNames: ['environment'],
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'hayy_database_connections',
  help: 'Number of active database connections',
  labelNames: ['environment'],
  registers: [register]
});

const memoryUsage = new client.Gauge({
  name: 'hayy_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type', 'environment'],
  registers: [register]
});

// Middleware to collect HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const environment = process.env.NODE_ENV || 'development';

  // Override the end method to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Increment request counter
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString(), environment)
      .inc();

    // Record request duration
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString(), environment)
      .observe(duration);

    // Call the original end method
    originalEnd.apply(this, args);
  };

  next();
};

// Function to update task metrics
const updateTaskMetrics = async (Task) => {
  try {
    const environment = process.env.NODE_ENV || 'development';
    
    // Get task statistics
    const stats = await Task.getStatistics();
    
    // Update task metrics
    tasksTotal.labels('pending', environment).set(stats.pendingTasks);
    tasksTotal.labels('in-progress', environment).set(stats.inProgressTasks);
    tasksTotal.labels('completed', environment).set(stats.completedTasks);
    
    // Update overdue tasks metric
    overdueTasksTotal.labels(environment).set(stats.overdueTasks);
    
    logger.debug('Task metrics updated', { stats, environment });
  } catch (error) {
    logger.error('Failed to update task metrics:', error);
  }
};

// Function to update system metrics
const updateSystemMetrics = () => {
  const environment = process.env.NODE_ENV || 'development';
  const memUsage = process.memoryUsage();
  
  // Update memory metrics
  memoryUsage.labels('rss', environment).set(memUsage.rss);
  memoryUsage.labels('heapTotal', environment).set(memUsage.heapTotal);
  memoryUsage.labels('heapUsed', environment).set(memUsage.heapUsed);
  memoryUsage.labels('external', environment).set(memUsage.external);
  
  logger.debug('System metrics updated', { memUsage, environment });
};

// Function to update database connection metrics
const updateDatabaseMetrics = (connectionState) => {
  const environment = process.env.NODE_ENV || 'development';
  const isConnected = connectionState === 1 ? 1 : 0;
  
  databaseConnections.labels(environment).set(isConnected);
  
  logger.debug('Database metrics updated', { connectionState, environment });
};

// Metrics endpoint handler
const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Failed to generate metrics:', error);
    res.status(500).end('Failed to generate metrics');
  }
};

module.exports = {
  register,
  metricsMiddleware,
  updateTaskMetrics,
  updateSystemMetrics,
  updateDatabaseMetrics,
  metricsHandler,
  httpRequestsTotal,
  httpRequestDuration,
  tasksTotal,
  overdueTasksTotal,
  databaseConnections,
  memoryUsage
};
