const xss = require('xss');
const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize user input to prevent XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Sanitize HTML content
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [], // No HTML tags allowed
          allowedAttributes: {},
          textFilter: (text) => xss(text),
        });
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

/**
 * Security headers middleware (additional headers beyond helmet)
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Disable powered by header
 */
const hidePoweredBy = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
};

module.exports = {
  sanitizeInput,
  securityHeaders,
  corsOptions,
  hidePoweredBy,
};