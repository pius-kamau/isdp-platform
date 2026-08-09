const { z } = require('zod');
const { PASSWORD_REQUIREMENTS } = require('../constants/auth.constants');

// Password validation schema
const passwordSchema = z.string()
  .min(PASSWORD_REQUIREMENTS.MIN_LENGTH, `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`)
  .refine(
    (val) => !PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE || /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => !PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE || /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => !PASSWORD_REQUIREMENTS.REQUIRE_NUMBER || /\d/.test(val),
    'Password must contain at least one number'
  )
  .refine(
    (val) => !PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL || /[!@#$%^&*(),.?":{}|<>]/.test(val),
    'Password must contain at least one special character'
  );

// Register validation
const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().regex(/^[0-9]{10,15}$/, 'Invalid phone number').optional(),
    password: passwordSchema,
    county: z.string().min(2, 'County is required'),
    subCounty: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    occupation: z.string().max(100).optional(),
  }).refine(
    (data) => data.email || data.phone,
    { message: 'Either email or phone number is required' }
  ),
});

// Login validation
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }).refine(
    (data) => data.email || data.phone,
    { message: 'Either email or phone number is required' }
  ),
});

// Refresh token validation
const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Forgot password validation
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

// Reset password validation
const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
  }),
});

// Verify email validation
const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

// Change password validation
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
};