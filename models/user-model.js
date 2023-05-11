const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { BASE_URL } = require('../config');

const userSchema = new Schema({
    name: { type: String, required: false },
    username: { type: String, required: false, unique: true, default: "" },
    email: { type: String, required: true },
    phone: { type: String, required: false },

    profilePic: {
        type: String,
        required: false,
        get: (profilePic) => {
            if (profilePic) {
                return `${BASE_URL}/${profilePic}`;
            }
            return profilePic;
        }
    },

    password: {
        type: String,
        required: false
    },
    activated: { type: Boolean, required: true, default: false },
    verified: { type: Boolean, required: true, default: false },
    premium: { type: Boolean, required: true, default: false },
    status: {
        type: String,
        enum: ['online', 'offline', 'idle', 'busy', 'away'],
        default: 'offline'
    },
    resetToken: String,
    resetTokenExpiry: Date,

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('User', userSchema, 'users');