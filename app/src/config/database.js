const mongoose = require('mongoose');
const logger = require('../middleware/logger');

class Database {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hayy-tasks';
      
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Removed deprecated options that cause connection issues
      };

      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info('Successfully connected to MongoDB', {
        uri: mongoUri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
        environment: process.env.NODE_ENV || 'development'
      });

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      this.connectionRetries++;
      logger.error(`Failed to connect to MongoDB (attempt ${this.connectionRetries}/${this.maxRetries}):`, error);
      
      if (this.connectionRetries < this.maxRetries) {
        logger.info(`Retrying connection in 5 seconds...`);
        setTimeout(() => this.connect(), 5000);
      } else {
        logger.error('Max connection retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }
}

module.exports = new Database();
