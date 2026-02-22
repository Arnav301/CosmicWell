const { SleepRecord } = require('../models');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new sleep record
 * POST /api/sleep
 */
const createRecord = asyncHandler(async (req, res) => {
  const { sleepTime, wakeTime, quality, notes } = req.body;
  
  // Validate times
  const sleepDate = new Date(sleepTime);
  const wakeDate = new Date(wakeTime);
  
  if (isNaN(sleepDate.getTime()) || isNaN(wakeDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }
  
  if (wakeDate <= sleepDate) {
    throw new ApiError(400, 'Wake time must be after sleep time');
  }
  
  const record = SleepRecord.create({
    userId: req.user.id,
    sleepTime,
    wakeTime,
    quality: quality ? parseInt(quality) : null,
    notes
  });
  
  res.status(201).json({
    success: true,
    message: 'Sleep record created',
    data: record
  });
});

/**
 * Get user's sleep records
 * GET /api/sleep
 */
const getRecords = asyncHandler(async (req, res) => {
  const { limit = 30, offset = 0, startDate, endDate } = req.query;
  
  const records = SleepRecord.findByUserId(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    startDate,
    endDate
  });
  
  res.json({
    success: true,
    data: records,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: records.length
    }
  });
});

/**
 * Get a specific sleep record
 * GET /api/sleep/:id
 */
const getRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const record = SleepRecord.findById(id);
  
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  
  if (record.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  res.json({
    success: true,
    data: record
  });
});

/**
 * Update a sleep record
 * PUT /api/sleep/:id
 */
const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sleepTime, wakeTime, quality, notes } = req.body;
  
  const record = SleepRecord.findById(id);
  
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  
  if (record.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  // Validate times if being updated
  if (sleepTime || wakeTime) {
    const sleepDate = new Date(sleepTime || record.sleepTime);
    const wakeDate = new Date(wakeTime || record.wakeTime);
    
    if (wakeDate <= sleepDate) {
      throw new ApiError(400, 'Wake time must be after sleep time');
    }
  }
  
  const updatedRecord = SleepRecord.update(id, req.user.id, {
    sleepTime,
    wakeTime,
    quality: quality ? parseInt(quality) : undefined,
    notes
  });
  
  res.json({
    success: true,
    message: 'Record updated',
    data: updatedRecord
  });
});

/**
 * Delete a sleep record
 * DELETE /api/sleep/:id
 */
const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const record = SleepRecord.findById(id);
  
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  
  if (record.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }
  
  SleepRecord.delete(id, req.user.id);
  
  res.json({
    success: true,
    message: 'Record deleted'
  });
});

/**
 * Get sleep statistics
 * GET /api/sleep/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const stats = SleepRecord.getStats(req.user.id, parseInt(days));
  
  res.json({
    success: true,
    data: stats
  });
});

/**
 * Get weekly sleep data
 * GET /api/sleep/weekly
 */
const getWeeklyData = asyncHandler(async (req, res) => {
  const data = SleepRecord.getWeeklyData(req.user.id);
  
  res.json({
    success: true,
    data
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStats,
  getWeeklyData
};
