const AppError = require('../utils/apperror');

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error('Error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = errorHandler;