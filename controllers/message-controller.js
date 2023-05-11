const { MESSGE_SENDING_FAILED } = require("../errors");
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

            await newMesage.save();
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: MESSGE_SENDING_FAILED });
        }
    }

    async getMessages(req, res) {
        try {
            const conversationId = req.params.conversationId;
            const messages = await MessageModel.find({
                conversationId
            });

            res.status(200).json({ messages });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Unable to fetch messages" });
        }
    }
}

module.exports = new MessageController();