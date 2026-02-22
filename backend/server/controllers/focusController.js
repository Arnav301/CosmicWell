const { FocusSession } = require('../models');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Start a new focus session
 * POST /api/focus/sessions
 */
const startSession = asyncHandler(async (req, res) => {
  const { task, duration, wasLocked } = req.body;
  
  if (!duration || duration < 1 || duration > 180) {
    throw new ApiError(400, 'Duration must be between 1 and 180 minutes');
  }
  
  const session = FocusSession.create({
    userId: req.user.id,
    task: task || 'Focus Session',
    duration: duration * 60, // Convert to seconds
    wasLocked: wasLocked || false
  });
  
  res.status(201).json({
    success: true,
    message: 'Focus session started',
    data: session
  });
});

/**
 * End a focus session
 * PUT /api/focus/sessions/:id/end
 */
const endSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actualDuration, completed } = req.body;
  
  const session = FocusSession.findById(id);
  
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  
  if (session.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  const updatedSession = FocusSession.end(id, {
    actualDuration: actualDuration || session.duration,
    completed: completed !== undefined ? completed : true
  });
  
  res.json({
    success: true,
    message: 'Focus session ended',
    data: updatedSession
  });
});

/**
 * Get user's focus sessions
 * GET /api/focus/sessions
 */
const getSessions = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, startDate, endDate } = req.query;
  
  const sessions = FocusSession.findByUserId(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    startDate,
    endDate
  });
  
  res.json({
    success: true,
    data: sessions,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: sessions.length
    }
  });
});

/**
 * Get a specific focus session
 * GET /api/focus/sessions/:id
 */
const getSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const session = FocusSession.findById(id);
  
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  
  if (session.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  res.json({
    success: true,
    data: session
  });
});

/**
 * Delete a focus session
 * DELETE /api/focus/sessions/:id
 */
const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const session = FocusSession.findById(id);
  
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  
  if (session.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  FocusSession.delete(id, req.user.id);
  
  res.json({
    success: true,
    message: 'Session deleted'
  });
});

/**
 * Get focus statistics
 * GET /api/focus/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  
  const stats = FocusSession.getStats(req.user.id, period);
  const dailyTotals = FocusSession.getDailyTotals(req.user.id, period === 'month' ? 30 : 7);
  
  res.json({
    success: true,
    data: {
      ...stats,
      dailyTotals
    }
  });
});

/**
 * Get daily focus totals
 * GET /api/focus/daily
 */
const getDailyTotals = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const totals = FocusSession.getDailyTotals(req.user.id, parseInt(days));
  
  res.json({
    success: true,
    data: totals
  });
});

module.exports = {
  startSession,
  endSession,
  getSessions,
  getSession,
  deleteSession,
  getStats,
  getDailyTotals
};
