import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Read token from Cookies (supports parsed cookies and manual header parsing)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      // Manual cookie parsing to prevent extra dependencies
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const parts = cookie.trim().split('=');
        if (parts.length >= 2) {
          const key = parts[0];
          const value = parts.slice(1).join('=');
          acc[key] = value;
        }
        return acc;
      }, {});
      token = cookies.token;
    }

    // 2) Fallback to Authorization Header (Bearer Token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 3) Check if token exists
    if (!token || token === 'none') {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    // 4) Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 6) Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('Your account is inactive. Access denied.', 403));
    }

    // Grant access to protected route (save user instance to req)
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    next(error);
  }
};

// Authorize roles middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication context missing.', 500));
    }

    // Admin has override access to all endpoints
    if (req.user.role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
