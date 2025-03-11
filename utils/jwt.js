const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};