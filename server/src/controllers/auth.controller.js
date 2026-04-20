import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, aadhaarNumber, upiId, bankDetails } = req.body;
    logger.info({ email, role }, '🆕 Identity registration initiated');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn({ email }, '⚠️ Registration failed: Email already registered');
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name, email, phone, password: hashedPassword,
      role: role || 'user'
    };

    if (role === 'owner') {
      userData.aadhaarNumber = aadhaarNumber;
      userData.upiId = upiId;
      userData.bankDetails = bankDetails;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    logger.info({ userId: user._id, role: user.role }, '✅ Identity registered successfully');

    res.status(201).json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role, avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info({ email }, '🔐 Identity authentication initiated');

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn({ email }, '❌ Authentication failed: Identity not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn({ email, userId: user._id }, '❌ Authentication failed: Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    logger.info({ userId: user._id, role: user.role }, '✅ Identity authenticated successfully');

    res.json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role, avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error({ err: error, email }, '💥 Critical authentication failure');
    next(error);
  }
};


export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, upiId, bankDetails } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (upiId) updateData.upiId = upiId;
    if (bankDetails) updateData.bankDetails = bankDetails;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
