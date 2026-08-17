import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Sign JWT token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send JWT in cookie and JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  // Cookie settings (expires in 7 days)
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  // Remove password from response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // 1) Check if email and password and role exist
    if (!email || !password || !role) {
      return next(new AppError('Please provide email, password, and role', 400));
    }

    // 2) Find user & explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // 3) Check if user account is active
    if (!user.isActive) {
      return next(new AppError('Account is inactive. Please contact admin.', 403));
    }

    // 4) Check if account is currently locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return next(
        new AppError(
          `Account locked after 5 failed attempts. Please try again in ${remainingTime} minute(s).`,
          401
        )
      );
    }

    // 5) Check if password matches
    const isMatch = await user.comparePassword(password, user.password);

    if (!isMatch) {
      // Increment failed login count
      user.failedLoginAttempts += 1;

      // Lock account if failed attempts >= 5
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await user.save({ validateBeforeSave: false });
        return next(
          new AppError(
            'Account locked after 5 failed attempts. Please try again in 15 minutes.',
            401
          )
        );
      }

      await user.save({ validateBeforeSave: false });
      return next(new AppError('Invalid credentials', 401));
    }

    // 6) Password is correct, verify that selected role matches the DB role
    if (user.role !== role) {
      return next(new AppError('Unauthorized role selection for this account', 401));
    }

    // 7) Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user (clear cookie)
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10s
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// Get current authenticated user
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};
