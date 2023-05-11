const { SOMETHING_WENT_WRONG, USER_NOT_FOUND_ERR } = require("../errors");
const ConversationModel = require("../models/conversation-model");
const UserModel = require("../models/user-model");

class ConversationController {
    async getAllConversations(req, res) {
        try {
            const conversations = await ConversationModel.find();
            res.status(200).json({ conversations });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }
    }


    async addConversation(req, res) {
        try {
            const { username } = req.body;
            const anotherParticipant = await UserModel.findOne({ username });

            if (!anotherParticipant) {
                res.status(404).json({ error: USER_NOT_FOUND_ERR });
            }

            const participantsArray = [
                anotherParticipant._id,
                req.userId
            ];

            const newConversation = new ConversationModel({
                participants: participantsArray,
                messages: []
            });

            await newConversation.save();

            res.status(200).json({ message: "New chat room created" });


        } catch (err) {
            console.log(err);
            res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }
    }


    async getConversation(req, res) {
        const userId = req.params.userId;
        try {
            const conversations = await Conversation.find({ participants: userId }).populate('participants');
            res.status(200).json({ conversations });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }

    }
}

module.exports = new ConversationController();