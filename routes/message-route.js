const messageController = require('../controllers/message-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = require('express').Router();


router.post('/addMessage', authMiddleware, messageController.createMessage);
router.get('/:conversationId', authMiddleware, messageController.getMessages);

router.post('/:parentMessage/replies', authMiddleware, messageController.createReply);
router.get('/:messageId/replies', authMiddleware, messageController.getReplies);

router.post('/pin/:pinned/:conversationId/:messageId', authMiddleware, messageController.togglePinMessage);

module.exports = router;