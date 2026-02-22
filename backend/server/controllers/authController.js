const { User } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { getDatabase } = require('../config/database');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, username, password, displayName } = req.body;
  
  // Check if email already exists
  if (await User.emailExists(email)) {
    throw new ApiError(409, 'Email already registered');
  }
  
  // Check if username already exists
  if (await User.usernameExists(username)) {
    throw new ApiError(409, 'Username already taken');
  }
  
  // Create user
  const user = await User.create({ email, username, password, displayName });
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);
  
  // Store refresh token
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  db.prepare(`
    INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)
  `).run(user.id, refreshToken, expiresAt.toISOString());
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName
      },
      accessToken,
      refreshToken
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email or username
  let user = await User.findByEmail(email);
  if (!user) {
    user = await User.findByUsername(email); // Try username if email not found
  }
  
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }
  
  // Update last login
  await User.updateLastLogin(user.id);
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);
  
  // Store refresh token
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  db.prepare(`
    INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)
  `).run(user.id, refreshToken, expiresAt.toISOString());
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    }
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }
  
  // Verify refresh token
  const decoded = verifyRefreshToken(token);
  
  if (!decoded) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
  
  // Check if token exists in database
  const db = getDatabase();
  const storedToken = db.prepare(`
    SELECT * FROM refresh_tokens WHERE token = ? AND userId = ?
  `).get(token, decoded.userId);
  
  if (!storedToken) {
    throw new ApiError(401, 'Refresh token not found');
  }
  
  // Check if token is expired
  if (new Date(storedToken.expiresAt) < new Date()) {
    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(storedToken.id);
    throw new ApiError(401, 'Refresh token expired');
  }
  
  // Delete old token
  db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(storedToken.id);
  
  // Generate new tokens
  const tokens = generateTokens(decoded.userId);
  
  // Store new refresh token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  db.prepare(`
    INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)
  `).run(decoded.userId, tokens.refreshToken, expiresAt.toISOString());
  
  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 * GET /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.query.refreshToken;
  
  if (token) {
    const db = getDatabase();
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        createdAt: user.createdAt,
        settings: user.settings
      }
    }
  });
});

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findByEmail(req.user.email);
  
  // Verify current password
  const isValid = await User.verifyPassword(currentPassword, user.password);
  
  if (!isValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  
  // Update password
  await User.updatePassword(req.user.id, newPassword);
  
  // Invalidate all refresh tokens
  const db = getDatabase();
  db.prepare('DELETE FROM refresh_tokens WHERE userId = ?').run(req.user.id);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};
