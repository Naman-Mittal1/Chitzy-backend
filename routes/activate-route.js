const router = require('express').Router();
const multer = require('multer');
const upload = multer();
const activateController = require('../controllers/activate-controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post("/", upload.single('profilePic'), activateController.activate);

module.exports = router;