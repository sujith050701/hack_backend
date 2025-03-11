const express = require('express');
const endorsementController = require('../controller/endoresementlogin');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', endorsementController.createEndorsement);
router.get('/my-endorsements', endorsementController.getMyEndorsements);
router.get('/pending', endorsementController.getPendingEndorsements);
router.patch('/:id/verify', endorsementController.verifyEndorsement);

module.exports = router;