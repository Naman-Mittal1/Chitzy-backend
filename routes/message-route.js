const messageController = require('../controllers/message-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = require('express').Router();


router.post('/addMessage', authMiddleware, messageController.createMessage);
router.get('/:conversationId', authMiddleware, messageController.getMessages);

module.exports = router;