const oauthController = require('../controllers/oauth-controller');
const oauthService = require('../services/oauth-service');

const router = require('express').Router();

router.get('/auth/google/url', (req, res) => {
    return res.send(oauthService.getGoogleAuthURL());
});


router.get(`/auth/google`, oauthController.authenticateGoogleUser);
router.get("/auth/me", oauthController.getMe);

module.exports = router;