module.exports = {
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
  },

  TOKEN_EXPIRY: {
    ACCESS: '15m',
    REFRESH: '7d',
    VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
  },

  AUTH_ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is locked. Too many failed attempts',
    ACCOUNT_SUSPENDED: 'Account has been suspended',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_REVOKED: 'Token has been revoked',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    PHONE_ALREADY_EXISTS: 'Phone number already registered',
  },

  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
};