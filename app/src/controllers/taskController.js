const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, page = 1, limit = 10 } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination info
  const total = await Task.countDocuments(filter);

  logger.info(`Retrieved ${tasks.length} tasks`, {
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    total
  });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: {
      tasks
    }
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }

  logger.info(`Retrieved task: ${task._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  // Validate required fields
  if (!title) {
    throw new AppError('Title is required', 400);
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined
  });

  logger.info(`Created new task: ${task._id}`, {
    title: task.title,
    status: task.status,
    priority: task.priority
  });

  res.status(201).json({
    status: 'success',
    data: {
      task
    }
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined)
    updateData.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }

  logger.info(`Updated task: ${task._id}`, {
    updatedFields: Object.keys(updateData)
  });

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    throw new AppError('No task found with that ID', 404);
  }

  logger.info(`Deleted task: ${task._id}`, {
    title: task.title
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Public
const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.getStatistics();

  logger.info('Retrieved task statistics', stats);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: stats
    }
  });
});

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Public
const getOverdueTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  })
    .sort({ dueDate: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  });

  logger.info(`Retrieved ${tasks.length} overdue tasks`);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: {
      tasks
    }
  });
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getOverdueTasks
};
