const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const { updateUserProfileSchema } = require('../middlewares/userValidator-middleware');

const router = require('express').Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.post('/profile/update', authMiddleware, updateUserProfileSchema, userController.updateProfile);

router.post('/search', authMiddleware, userController.searchUser);

module.exports = router;