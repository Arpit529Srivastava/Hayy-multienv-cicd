const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getOverdueTasks
} = require('../controllers/taskController');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation result checker middleware
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
  }
  next();
};

// Validation middleware
const validateTaskCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
];

const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid task ID format')
];

const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage(
      'Status filter must be one of: pending, in-progress, completed'
    ),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be one of: low, medium, high'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router
  .route('/')
  .get(validateQueryParams, checkValidationResult, asyncHandler(getTasks))
  .post(validateTaskCreation, checkValidationResult, asyncHandler(createTask));

router.route('/stats').get(asyncHandler(getTaskStats));

router
  .route('/overdue')
  .get(
    validateQueryParams,
    checkValidationResult,
    asyncHandler(getOverdueTasks)
  );

router
  .route('/:id')
  .get(validateObjectId, checkValidationResult, asyncHandler(getTask))
  .put(
    validateObjectId,
    validateTaskUpdate,
    checkValidationResult,
    asyncHandler(updateTask)
  )
  .delete(validateObjectId, checkValidationResult, asyncHandler(deleteTask));

module.exports = router;
