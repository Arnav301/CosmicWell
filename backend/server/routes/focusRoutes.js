const express = require('express');
const router = express.Router();
const { focusController } = require('../controllers');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

/**
 * @route   POST /api/focus/sessions
 * @desc    Start a new focus session
 * @access  Private
 */
router.post('/sessions', authenticate, validate(schemas.focusSession), focusController.startSession);

/**
 * @route   GET /api/focus/sessions
 * @desc    Get user's focus sessions
 * @access  Private
 */
router.get('/sessions', authenticate, focusController.getSessions);

/**
 * @route   GET /api/focus/sessions/:id
 * @desc    Get a specific focus session
 * @access  Private
 */
router.get('/sessions/:id', authenticate, focusController.getSession);

/**
 * @route   PUT /api/focus/sessions/:id/end
 * @desc    End a focus session
 * @access  Private
 */
router.put('/sessions/:id/end', authenticate, focusController.endSession);

/**
 * @route   DELETE /api/focus/sessions/:id
 * @desc    Delete a focus session
 * @access  Private
 */
router.delete('/sessions/:id', authenticate, focusController.deleteSession);

/**
 * @route   GET /api/focus/stats
 * @desc    Get focus statistics
 * @access  Private
 */
router.get('/stats', authenticate, focusController.getStats);

/**
 * @route   GET /api/focus/daily
 * @desc    Get daily focus totals
 * @access  Private
 */
router.get('/daily', authenticate, focusController.getDailyTotals);

module.exports = router;
