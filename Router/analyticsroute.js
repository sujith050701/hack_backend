const express = require('express');
const analyticsController = require('../controller/analyticscontroller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/skills', analyticsController.getSkillsAnalytics);
router.get('/institution', analyticsController.getInstitutionAnalytics);

module.exports = router; 