require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Database configuration
  database: {
    type: process.env.DB_TYPE || 'sqlite', // 'sqlite' or 'supabase'
    path: process.env.DB_PATH || './data/cosmicwell.db',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // App specific settings
  app: {
    name: 'CosmicWell',
    version: '1.0.0',
    maxFocusSessionDuration: 180, // minutes
    defaultFocusDuration: 25, // minutes (Pomodoro)
  }
};

// Validate required config in production
if (config.nodeEnv === 'production') {
  const requiredEnvVars = ['JWT_SECRET'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = config;
