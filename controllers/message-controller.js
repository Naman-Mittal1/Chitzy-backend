const { MESSGE_SENDING_FAILED } = require("../errors");
const ConversationModel = require("../models/conversation-model");
const MessageModel = require("../models/message-model");

class MessageController {
    async createMessage(req, res) {
        try {
            const { conversationId, senderId, content } = req.body;

            const newMesage = new MessageModel({
                conversationId,
                senderId,
                content,
            });

            const savedMessage = await newMesage.save();

            await ConversationModel.findByIdAndUpdate(
                conversationId, { $push: { messages: savedMessage._id } }, { new: true }
            );

            res.json({ message: "Message Sent" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: MESSGE_SENDING_FAILED });
        }
    }

    async getMessages(req, res) {
        try {
            const conversationId = req.params.conversationId;
            const { page, pageSize } = req.query;
            const limit = parseInt(pageSize);
            const skip = (parseInt(page) - 1) * limit;
            const conversation = await ConversationModel.findById({
                conversationId
            }).populate({
                path: 'messages',
                options: { skip, limit }
            });

            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            res.status(200).json({ messages: conversation.messages });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Unable to fetch messages" });
        }
    }

    async createReply(req, res) {
        try {
            const { content } = req.body;
            const { parentMessage } = req.params;

            const reply = new MessageModel({
                conversationId,
                senderId,
                content,
                parentMessage,

            });

            await reply.save();

            res.status(201).json(reply);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create reply' });
        }
    }

    async getReplies(req, res) {
        try {
            const { messageId } = req.params;
            const { page, pageSize } = req.query;

            const limit = parseInt(pageSize);
            const skip = (parseInt(page) - 1) * limit;
            const replies = await MessageModel.find({ parentMessage: messageId }).skip(skip).limit(limit);
            res.json(replies);

        } catch (err) {
            res.status(500).json({ error: 'Failed to retrieve replies' });
        }
    }

    async togglePinMessage(req, res) {
        try {
            const { pinned, conversationId, messageId } = req.params;

            const conversation = await ConversationModel.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            const message = await MessageModel.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }

            if (message.pinned === pinned) {
                const action = pinned ? 'pin' : 'unpin';
                return res.status(400).json({ error: `Message is already ${action}ned` });
            }

            message.pinned = pinned;
            await message.save();

            const action = pinned ? 'pinned' : 'unpinned';
            res.status(200).json({ message: `Message ${action} successfully` });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'FFailed to toggle pin for message' });
        }
    }
}

module.exports = new MessageController();