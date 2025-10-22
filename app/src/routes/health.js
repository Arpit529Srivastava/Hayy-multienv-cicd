const express = require('express');
const database = require('../config/database');
const logger = require('../middleware/logger');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Store application start time
const startTime = new Date();

// @desc    API welcome message
// @route   GET /
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Hayy Task Manager API',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// @desc    Health check endpoint
// @route   GET /health
// @access  Public
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime)
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform
  };

  logger.info('Health check requested', { uptime: healthData.uptime.seconds });

  res.status(200).json({
    status: 'success',
    data: healthData
  });
});

// @desc    Readiness probe endpoint
// @route   GET /ready
// @access  Public
router.get(
  '/ready',
  asyncHandler(async (req, res) => {
    const isDbHealthy = database.isHealthy();
    const dbConnectionState = database.getConnectionState();

    const readinessData = {
      status: isDbHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: isDbHealthy ? 'healthy' : 'unhealthy',
          connectionState: dbConnectionState
        }
      },
      environment: process.env.NODE_ENV || 'development'
    };

    if (isDbHealthy) {
      logger.info('Readiness check passed', { dbState: dbConnectionState });
      res.status(200).json({
        status: 'success',
        data: readinessData
      });
    } else {
      logger.warn('Readiness check failed', { dbState: dbConnectionState });
      res.status(503).json({
        status: 'error',
        data: readinessData
      });
    }
  })
);

// @desc    Environment and version information
// @route   GET /info
// @access  Public
router.get('/info', (req, res) => {
  const infoData = {
    name: 'Hayy Task Manager API',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'Production-ready Node.js Task Manager REST API',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    startTime: startTime.toISOString(),
    deployedAt: process.env.DEPLOYED_AT || 'Not specified',
    uptime: {
      seconds: Math.floor(process.uptime()),
      human: formatUptime(process.uptime())
    },
    dependencies: {
      express: require('express/package.json').version,
      mongoose: require('mongoose/package.json').version,
      winston: require('winston/package.json').version
    }
  };

  logger.info('Info endpoint requested');

  res.status(200).json({
    status: 'success',
    data: infoData
  });
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

module.exports = router;
