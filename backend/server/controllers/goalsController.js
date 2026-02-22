const { DailyGoal } = require('../models');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new daily goal
 * POST /api/goals
 */
const createGoal = asyncHandler(async (req, res) => {
  const { title, description, targetDate, priority, category } = req.body;
  
  const goal = DailyGoal.create({
    userId: req.user.id,
    title,
    description,
    targetDate,
    priority,
    category
  });
  
  res.status(201).json({
    success: true,
    message: 'Goal created',
    data: goal
  });
});

/**
 * Get user's goals
 * GET /api/goals
 */
const getGoals = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, completed, targetDate } = req.query;
  
  const goals = DailyGoal.findByUserId(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    completed: completed !== undefined ? completed === 'true' : null,
    targetDate
  });
  
  res.json({
    success: true,
    data: goals,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: goals.length
    }
  });
});

/**
 * Get today's goals
 * GET /api/goals/today
 */
const getTodayGoals = asyncHandler(async (req, res) => {
  const goals = DailyGoal.getTodayGoals(req.user.id);
  
  res.json({
    success: true,
    data: goals
  });
});

/**
 * Get a specific goal
 * GET /api/goals/:id
 */
const getGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const goal = DailyGoal.findById(id);
  
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  
  if (goal.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  res.json({
    success: true,
    data: goal
  });
});

/**
 * Update a goal
 * PUT /api/goals/:id
 */
const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, targetDate, priority, category } = req.body;
  
  const goal = DailyGoal.findById(id);
  
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  
  if (goal.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  const updatedGoal = DailyGoal.update(id, req.user.id, {
    title,
    description,
    targetDate,
    priority,
    category
  });
  
  res.json({
    success: true,
    message: 'Goal updated',
    data: updatedGoal
  });
});

/**
 * Toggle goal completion
 * PUT /api/goals/:id/complete
 */
const toggleComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  const goal = DailyGoal.findById(id);
  
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  
  if (goal.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  const updatedGoal = DailyGoal.markCompleted(
    id,
    req.user.id,
    completed !== undefined ? completed : !goal.completed
  );
  
  res.json({
    success: true,
    message: completed ? 'Goal completed' : 'Goal marked incomplete',
    data: updatedGoal
  });
});

/**
 * Delete a goal
 * DELETE /api/goals/:id
 */
const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const goal = DailyGoal.findById(id);
  
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  
  if (goal.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  DailyGoal.delete(id, req.user.id);
  
  res.json({
    success: true,
    message: 'Goal deleted'
  });
});

/**
 * Get goal statistics
 * GET /api/goals/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const stats = DailyGoal.getStats(req.user.id, parseInt(days));
  
  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  createGoal,
  getGoals,
  getTodayGoals,
  getGoal,
  updateGoal,
  toggleComplete,
  deleteGoal,
  getStats
};
