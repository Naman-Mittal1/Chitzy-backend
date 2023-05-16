const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/auth-controller');
const { LOGIN_FAILED } = require('../errors');
const { createUserSchema, validateLoginSchema } = require('../middlewares/userValidator-middleware');
const { OAUTH_CLIENT_ID } = require('../config');
const tokenService = require('../services/token-service');
const session = require('express-session');
const authMiddleware = require('../middlewares/auth-middleware');


router.post('/sendOTP', authController.sendOTP);
router.post('/verifyOTP', authController.verifyOTP);
// router.post('/register', createUserSchema, authController.register);
// router.get('/verify/:token', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/login', validateLoginSchema, authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;