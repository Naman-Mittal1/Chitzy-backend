const { MESSGE_SENDING_FAILED, CONVERSATION_NOT_FOUND_ERR, MESSAGE_NOT_FOUND_ERR } = require("../errors");
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
                readBy: [senderId]
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
                return res.status(404).json({ error: CONVERSATION_NOT_FOUND_ERR });
            }

            res.status(200).json({ messages: conversation.messages });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Unable to fetch messages" });
        }
    }

    async createReply(req, res) {
        try {
            const { conversationId, senderId, content } = req.body;
            const { parentMessage } = req.params;

            const reply = new MessageModel({
                conversationId,
                senderId,
                content,
                parentMessage,
                readBy: [senderId]
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
                return res.status(404).json({ error: CONVERSATION_NOT_FOUND_ERR });
            }

            const message = await MessageModel.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: MESSAGE_NOT_FOUND_ERR });
            }

            if (message.pinned === pinned) {
                const action = pinned ? 'pin' : 'unpin';
                return res.status(400).json({ error: `Message is already ${action}ned` });
            }

            message.pinned = pinned;

            if (pinned) {
                await ConversationModel.findByIdAndUpdate(
                    conversationId, { $push: { pinnedMessages: messageId } }, { new: true }
                );
            }
            await message.save();

            const action = pinned ? 'pinned' : 'unpinned';
            res.status(200).json({ message: `Message ${action} successfully` });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to toggle pin for message' });
        }
    }

    async getPinnedMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const conversation = await ConversationModel.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: CONVERSATION_NOT_FOUND_ERR });
            }

            return res.json({ pinnedMessages: conversation.pinnedMessages });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Failed to retrieve pinned messages' });
        }


    }


    async toggleReaction(req, res) {
        try {
            const { messageId } = req.params;
            const { userId, reaction } = req.body;

            const message = await MessageModel.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: MESSAGE_NOT_FOUND_ERR });
            }

            message.reactions.push({ userId, reaction });
            await message.save();

            res.status(200).json({ message });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add reaction to message' });
        }
    }


    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;

            const message = await MessageModel.findByIdAndDelete(messageId);
            if (!message) {
                return res.status(404).json({ error: MESSAGE_NOT_FOUND_ERR });
            }

            const conversation = await ConversationModel.findById(message.conversationId);
            conversation.messages = conversation.messages.filter(id => id.toString() !== messageId);
            await conversation.save();

            res.status(200).json({ message: 'Message deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    }


    async markAsRead(req, res) {
        try {
            const { messageId, userId } = req.params;

            const message = await MessageModel.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: MESSAGE_NOT_FOUND_ERR });
            }

            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
                await message.save();
            }

            res.status(200).json({ message: 'Message marked as read' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to mark the message as read' });
        }
    }


}

module.exports = new MessageController();