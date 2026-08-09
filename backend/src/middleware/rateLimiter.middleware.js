const rateLimit = require('express-rate-limit');

// Middleware that does nothing (for test environment)
const noopMiddleware = (req, res, next) => next();

/**
 * General rate limiter - applies to all requests
 */
const generalLimiter = process.env.NODE_ENV === 'test' 
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Strict rate limiter - for auth endpoints
 */
const authLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      message: {
        status: 'error',
        message: 'Too many authentication attempts from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
    });

/**
 * Moderate rate limiter - for API endpoints
 */
const apiLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50,
      message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Admin rate limiter - stricter for admin endpoints
 */
const adminLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30,
      message: {
        status: 'error',
        message: 'Too many admin requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  adminLimiter,
};