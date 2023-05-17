const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: {
        type: String
    },
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    pinned: { type: Boolean, default: false },
    reactions: {
        userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        reaction: {
            type: String
        }
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });


module.exports = mongoose.model('Message', messageSchema);