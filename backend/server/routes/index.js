const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const focusRoutes = require('./focusRoutes');
const goalsRoutes = require('./goalsRoutes');
const sleepRoutes = require('./sleepRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/focus', focusRoutes);
router.use('/goals', goalsRoutes);
router.use('/sleep', sleepRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CosmicWell API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      focus: '/api/focus',
      goals: '/api/goals',
      sleep: '/api/sleep'
    }
  });
});

module.exports = router;
