const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorhandler');
const authRoutes = require('./Router/userroute');
const endorsementRoutes = require('./Router/endorsementroute');
const profileRoutes = require('./Router/profileroute');
const analyticsRoutes = require('./Router/analyticsroute');



// ... rest of your Express app setup
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/endorsements', endorsementRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;