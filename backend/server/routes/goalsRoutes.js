const express = require('express');
const router = express.Router();
const { goalsController } = require('../controllers');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', authenticate, validate(schemas.dailyGoal), goalsController.createGoal);

/**
 * @route   GET /api/goals
 * @desc    Get user's goals
 * @access  Private
 */
router.get('/', authenticate, goalsController.getGoals);

/**
 * @route   GET /api/goals/today
 * @desc    Get today's goals
 * @access  Private
 */
router.get('/today', authenticate, goalsController.getTodayGoals);

/**
 * @route   GET /api/goals/stats
 * @desc    Get goal statistics
 * @access  Private
 */
router.get('/stats', authenticate, goalsController.getStats);

/**
 * @route   GET /api/goals/:id
 * @desc    Get a specific goal
 * @access  Private
 */
router.get('/:id', authenticate, goalsController.getGoal);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put('/:id', authenticate, goalsController.updateGoal);

/**
 * @route   PUT /api/goals/:id/complete
 * @desc    Toggle goal completion
 * @access  Private
 */
router.put('/:id/complete', authenticate, goalsController.toggleComplete);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/:id', authenticate, goalsController.deleteGoal);

module.exports = router;
