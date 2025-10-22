const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be one of: pending, in-progress, completed'
      },
      default: 'pending'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be one of: low, medium, high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      validate: {
        validator(value) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for overdue tasks
taskSchema.virtual('isOverdue').get(function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== 'completed'
  );
});

// Instance method to check if task is overdue
taskSchema.methods.checkOverdue = function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== 'completed'
  );
};

// Static method to get task statistics
taskSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        pendingTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        lowPriorityTasks: {
          $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
        },
        mediumPriorityTasks: {
          $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
        },
        highPriorityTasks: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'completed'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return (
    stats[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      lowPriorityTasks: 0,
      mediumPriorityTasks: 0,
      highPriorityTasks: 0,
      overdueTasks: 0
    }
  );
};

module.exports = mongoose.model('Task', taskSchema);
