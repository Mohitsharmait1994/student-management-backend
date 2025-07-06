const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { registerValidation, loginValidation } = require('../validators/adminValidator');
const validate = require('../validators/validate');
const authenticateAdmin = require('../middleware/auth'); // ✅ add this line

router.post('/register', registerValidation, validate, adminController.register);
router.post('/login', loginValidation, validate, adminController.login);
router.post('/refresh-token', adminController.refreshToken);
router.post('/logout', authenticateAdmin, adminController.logout);

module.exports = router;
