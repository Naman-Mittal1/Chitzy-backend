const router = require('express').Router();

const activateController = require('../controllers/activate-controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post("/", activateController.activate);

module.exports = router;