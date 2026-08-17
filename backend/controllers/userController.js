import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Retrieve all users (excluding passwords)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-failedLoginAttempts -lockUntil');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a specific user
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-failedLoginAttempts -lockUntil');

    if (!user) {
      return next(new AppError('User not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new user (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return next(new AppError('Please provide name, email, password, and role', 400));
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return next(new AppError('A user with this email already exists', 400));
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    // Strip password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user details (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found with that ID', 404));
    }

    // If updating email, check if it already exists elsewhere
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return next(new AppError('A user with this email already exists', 400));
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('User not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
