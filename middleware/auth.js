const jwt = require('jsonwebtoken');
const User = require('../Model/user');
const AppError = require('../utils/apperror');
const { jwtSecret } = require('../config/config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(new AppError('Please authenticate', 401));
  }
};

module.exports = auth;