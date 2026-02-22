const express = require('express');
const router = express.Router();
const { sleepController } = require('../controllers');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/sleep
 * @desc    Create a new sleep record
 * @access  Private
 */
router.post('/', authenticate, sleepController.createRecord);

/**
 * @route   GET /api/sleep
 * @desc    Get user's sleep records
 * @access  Private
 */
router.get('/', authenticate, sleepController.getRecords);

/**
 * @route   GET /api/sleep/stats
 * @desc    Get sleep statistics
 * @access  Private
 */
router.get('/stats', authenticate, sleepController.getStats);

/**
 * @route   GET /api/sleep/weekly
 * @desc    Get weekly sleep data
 * @access  Private
 */
router.get('/weekly', authenticate, sleepController.getWeeklyData);

/**
 * @route   GET /api/sleep/:id
 * @desc    Get a specific sleep record
 * @access  Private
 */
router.get('/:id', authenticate, sleepController.getRecord);

/**
 * @route   PUT /api/sleep/:id
 * @desc    Update a sleep record
 * @access  Private
 */
router.put('/:id', authenticate, sleepController.updateRecord);

/**
 * @route   DELETE /api/sleep/:id
 * @desc    Delete a sleep record
 * @access  Private
 */
router.delete('/:id', authenticate, sleepController.deleteRecord);

module.exports = router;
