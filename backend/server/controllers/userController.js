const { User } = require('../models');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = User.findById(req.user.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      settings: user.settings
    }
  });
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, avatar } = req.body;
  
  const updates = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (avatar !== undefined) updates.avatar = avatar;
  
  const user = User.update(req.user.id, updates);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar
    }
  });
});

/**
 * Update user settings
 * PUT /api/users/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings || typeof settings !== 'object') {
    throw new ApiError(400, 'Settings must be an object');
  }
  
  // Get current settings and merge
  const currentUser = User.findById(req.user.id);
  const mergedSettings = {
    ...currentUser.settings,
    ...settings
  };
  
  const user = User.update(req.user.id, { settings: mergedSettings });
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      settings: user.settings
    }
  });
});

/**
 * Get user settings
 * GET /api/users/settings
 */
const getSettings = asyncHandler(async (req, res) => {
  const user = User.findById(req.user.id);
  
  res.json({
    success: true,
    data: {
      settings: user.settings || {}
    }
  });
});

/**
 * Delete user account
 * DELETE /api/users/account
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    throw new ApiError(400, 'Password is required to delete account');
  }
  
  const user = User.findByEmail(req.user.email);
  
  // Verify password
  const isValid = await User.verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new ApiError(401, 'Invalid password');
  }
  
  // Delete user (cascade will delete related data)
  User.delete(req.user.id);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  getSettings,
  deleteAccount
};
