const router = require('express').Router();
// const passport = require('../passport');
const passport = require('passport');
const authController = require('../controllers/auth-controller');
const { LOGIN_FAILED } = require('../errors');
const { createUserSchema, validateLoginSchema } = require('../middlewares/userValidator-middleware');

router.post('/register', createUserSchema, authController.register);
router.get('/verify/:token', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/login', validateLoginSchema, authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
    (req, res) => {
        // Redirect or respond with the authenticated user data
        console.log("done dana done");
        res.redirect(process.env.CLIENT_URL);
    }
);


router.post('/logout', authController.logout);

module.exports = router;