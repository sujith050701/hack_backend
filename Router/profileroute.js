const express = require('express');
const profileController = require('../controller/profilecontroller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.patch('/me', profileController.updateProfile);
router.get('/institutions', profileController.getInstitutions);
router.get('/professionals', profileController.getProfessionals);
router.get('/:id', profileController.getProfile);

module.exports = router;