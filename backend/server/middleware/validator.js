const { ApiError } = require('./errorHandler');

/**
 * Validation helper functions
 */
const validators = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isStrongPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);
  },
  
  isUsername: (username) => {
    // 3-30 characters, alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },
  
  isPositiveInteger: (value) => {
    return Number.isInteger(value) && value > 0;
  },
  
  isDateString: (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
};

/**
 * Create a validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate body
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        const fieldErrors = validateField(field, value, rules);
        errors.push(...fieldErrors);
      }
    }
    
    // Validate params
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        const value = req.params[field];
        const fieldErrors = validateField(field, value, rules);
        errors.push(...fieldErrors);
      }
    }
    
    // Validate query
    if (schema.query) {
      for (const [field, rules] of Object.entries(schema.query)) {
        const value = req.query[field];
        const fieldErrors = validateField(field, value, rules);
        errors.push(...fieldErrors);
      }
    }
    
    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }
    
    next();
  };
};

/**
 * Validate a single field
 */
const validateField = (field, value, rules) => {
  const errors = [];
  
  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push({ field, message: `${field} is required` });
    return errors; // Don't continue if required field is missing
  }
  
  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }
  
  // Type checks
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ field, message: `${field} must be a string` });
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push({ field, message: `${field} must be a number` });
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ field, message: `${field} must be a boolean` });
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push({ field, message: `${field} must be an array` });
        }
        break;
      case 'email':
        if (!validators.isEmail(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }
        break;
      case 'date':
        if (!validators.isDateString(value)) {
          errors.push({ field, message: `${field} must be a valid date` });
        }
        break;
    }
  }
  
  // Length checks
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
  }
  
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
  }
  
  // Number range checks
  if (rules.min !== undefined && Number(value) < rules.min) {
    errors.push({ field, message: `${field} must be at least ${rules.min}` });
  }
  
  if (rules.max !== undefined && Number(value) > rules.max) {
    errors.push({ field, message: `${field} must be at most ${rules.max}` });
  }
  
  // Custom validation
  if (rules.custom && typeof rules.custom === 'function') {
    const customError = rules.custom(value);
    if (customError) {
      errors.push({ field, message: customError });
    }
  }
  
  // Enum check
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
  }
  
  // Pattern check
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push({ field, message: rules.patternMessage || `${field} format is invalid` });
  }
  
  return errors;
};

/**
 * Common validation schemas
 */
const schemas = {
  register: {
    body: {
      email: { required: true, type: 'email' },
      username: { 
        required: true, 
        type: 'string', 
        minLength: 3, 
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_]+$/,
        patternMessage: 'Username can only contain letters, numbers, and underscores'
      },
      password: { 
        required: true, 
        type: 'string', 
        minLength: 8,
        custom: (value) => {
          if (!validators.isStrongPassword(value)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
          }
          return null;
        }
      }
    }
  },
  
  login: {
    body: {
      email: { required: true, type: 'string' }, // Can be email or username
      password: { required: true, type: 'string' }
    }
  },
  
  focusSession: {
    body: {
      task: { type: 'string', maxLength: 200 },
      duration: { required: true, type: 'number', min: 1, max: 180 }
    }
  },
  
  dailyGoal: {
    body: {
      title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      targetDate: { required: true, type: 'date' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      category: { type: 'string', maxLength: 50 }
    }
  }
};

module.exports = {
  validate,
  validators,
  schemas,
  validateField
};
