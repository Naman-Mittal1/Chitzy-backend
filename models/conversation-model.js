const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    groupChat: { type: Boolean, default: false }
}, { timestamps: true });


const groupChatSchema = new Schema({
    groupName: { type: String, required: true },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    groupInfo: {
        type: String
    },
    groupPic: {
        type: String
    }
}, { timestamps: true });

conversationSchema.set('discriminatorKey', 'chatType');

const ConversationModel = mongoose.model('Conversation', conversationSchema);



const GroupChat = ConversationModel.discriminator('GroupChat', groupChatSchema);


module.exports = { ConversationModel, GroupChat };