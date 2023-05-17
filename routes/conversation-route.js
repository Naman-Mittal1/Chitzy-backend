const { conversationController, groupChatController } = require('../controllers/conversation-controller');

const authMiddleware = require('../middlewares/auth-middleware');

const router = require('express').Router();


router.get('/', authMiddleware, conversationController.getAllConversations);
router.post('/addConversation', authMiddleware, conversationController.addConversation);
router.get('/:userId', authMiddleware, conversationController.getConversations);
router.put('leaveGroup/:conversationId/:userId', authMiddleware, groupChatController.leaveGroupChat);
router.put('removeParticipant/:conversationId/:participantId', authMiddleware, groupChatController.removeParticipant);



// router.post('/group-chats/create', authMiddleware, conversationController)



module.exports = router;