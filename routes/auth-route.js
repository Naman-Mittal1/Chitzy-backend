const router = require('express').Router();
// const passport = require('../passport');
const passport = require('passport');
const authController = require('../controllers/auth-controller');
const { LOGIN_FAILED } = require('../errors');
const { createUserSchema, validateLoginSchema } = require('../middlewares/userValidator-middleware');
const { OAUTH_CLIENT_ID } = require('../config');
const tokenService = require('../services/token-service');
const session = require('express-session');


// router.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: 'bla bla bla'
// }));

router.post('/register', createUserSchema, authController.register);
router.get('/verify/:token', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/login', validateLoginSchema, authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

// router.get(
//     '/google',
//     passport.authenticate('google', { scope: ['profile', 'email'] }),
//     (req, res) => {
//         const redirectURL = '/api/auth/google/callback';
//         const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CLIENT_ID}&redirect_uri=${redirectURL}&response_type=code&scope=profile%20email`;

//         res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//         res.setHeader('Pragma', 'no-cache');
//         res.setHeader('Expires', '0');

//         res.redirect(googleAuthURL);
//     }
// );

// router.get(
//     '/google/callback',
//     passport.authenticate('google', { session: false, failureRedirect: process.env.CLIENT_URL }),
//     authController.passportAuthenticate
// );



// router.get('/logout', async(req, res) => {
//     console.log(req.user);

//     const { refreshToken } = req.cookies;

//     await tokenService.removeToken(refreshToken);

//     res.clearCookie('refreshToken');
//     res.clearCookie('accessToken');

//     req.user = null;
//     req.logout((err) => {
//         console.log(err);
//     });

//     res.json({ user: null });
// });

router.post('/logout', authController.logout);

module.exports = router;