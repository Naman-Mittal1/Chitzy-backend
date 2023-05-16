const conversationController = require('../controllers/conversation-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = require('express').Router();


router.get('/', authMiddleware, conversationController.getAllConversations);
router.post('/addConversation', authMiddleware, conversationController.addConversation);
router.get('/:userId', authMiddleware, conversationController.getConversation);



module.exports = router;