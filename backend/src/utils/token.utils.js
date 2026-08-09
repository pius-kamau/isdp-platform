const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { TOKEN_TYPES, TOKEN_EXPIRY } = require('../constants/auth.constants');

class TokenUtils {
  generateAccessToken(payload) {
    return jwt.sign(
      { ...payload, type: TOKEN_TYPES.ACCESS },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY.ACCESS }
    );
  }

  generateRefreshToken(payload) {
    return jwt.sign(
      { ...payload, type: TOKEN_TYPES.REFRESH },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY.REFRESH }
    );
  }

  generateVerificationToken(payload) {
    return jwt.sign(
      { ...payload, type: TOKEN_TYPES.VERIFICATION },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY.VERIFICATION }
    );
  }

  generatePasswordResetToken(payload) {
    return jwt.sign(
      { ...payload, type: TOKEN_TYPES.PASSWORD_RESET },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY.PASSWORD_RESET }
    );
  }

  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  verifyToken(token, secret = process.env.JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    return decoded.exp < Math.floor(Date.now() / 1000);
  }

  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    return new Date(decoded.exp * 1000);
  }
}

module.exports = new TokenUtils();