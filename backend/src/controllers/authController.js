import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return errorResponse(res, 'User already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      return successResponse(
        res,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
        'User registered successfully',
        201
      );
    } else {
      return errorResponse(res, 'Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return successResponse(
        res,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
        'Login successful'
      );
    } else {
      return errorResponse(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      return successResponse(
        res,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        'User profile retrieved successfully'
      );
    } else {
      return errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    next(error);
  }
};
