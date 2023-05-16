const { SOMETHING_WENT_WRONG, USER_NOT_FOUND_ERR, CONVERSATION_NOT_FOUND_ERR } = require("../errors");
const { ConversationModel, GroupChat } = require("../models/conversation-model");
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
            const { username, group } = req.body;

            let conversation;

            if (group) {
                conversation = new GroupChat({
                    participants: group.participants,
                    groupName: group.groupName,
                    groupAdmin: group.groupAdmin,
                    groupInfo: group.groupInfo,
                    groupChat: true
                });
            } else {
                const anotherParticipant = await UserModel.findOne({ username });

                if (!anotherParticipant) {
                    res.status(404).json({ error: USER_NOT_FOUND_ERR });
                }

                const participantsArray = [
                    anotherParticipant._id,
                    req.userId
                ];
                conversation = new ConversationModel({ participants: participantsArray, })
            }

            await conversation.save();

            res.status(200).json({ message: "New chat room created", conversation });

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Failed to create conversation' });
        }
    }


    async getConversations(req, res) {
        const userId = req.params.userId;
        try {
            const conversations = await ConversationModel.find({ participants: userId }).populate('participants');
            res.status(200).json({ conversations });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }

    }
}


class GroupChatController {
    async leaveGroupChat(req, res) {
        try {
            const { conversationId, userId } = req.params;

            const conversation = await GroupChat.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: CONVERSATION_NOT_FOUND_ERR });
            }

            if (conversation.groupAdmin === userId) {
                return res.status(400).json({ error: 'Group admin cannot leave the group chat' });
            }

            conversation.participants = conversation.participants.filter(id => id.toString() !== userId);
            await conversation.save();

            res.status(200).json({ message: 'Successfully left the group.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to leave the group.' });
        }
    }

    async removeParticipant(req, res) {
        try {
            const { conversationId, participantId } = req.params;

            const conversation = await GroupChat.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: CONVERSATION_NOT_FOUND_ERR });
            }

            if (conversation.groupAdmin !== req.userId) {
                return res.status(403).json({ error: 'Only the group admin can remove participants' });
            }

            if (conversation.groupAdmin === participantId) {
                return res.status(400).json({ error: 'Group admin cannot be removed from the group chat' });
            }

            conversation.participants = conversation.participants.filter(id => id.toString() !== participantId);
            await conversation.save();

            res.status(200).json({ message: 'Participant removed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to remove participant' });
        }
    }
}

const conversationController = new ConversationController();
const groupChatController = new GroupChatController();
module.exports = {
    conversationController,
    groupChatController
};