const User = require('../Model/user');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/apperror');

exports.register = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = new User(req.body);
    await user.save(); 
    
    const token = generateToken(user._id);
    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    res.json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user }
  });
};