const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { BASE_URL } = require('../config');

const userSchema = new Schema({
    name: { type: String, required: false },
    username: { type: String, default: "" },
    // username: {
    //     type: String,
    //     default: "",
    //     validate: {
    //         validator: async function(value) {
    //             if (value !== "") {
    //                 const existingUser = await this.constructor.findOne({ username: value });
    //                 return !existingUser;
    //             }
    //             return true;
    //         },
    //         message: 'Username must be unique',
    //     },
    // },
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


userSchema.pre('save', function(next) {
    // Convert the username to lowercase
    this.username = this.username.toLowerCase();
    next();
});

module.exports = mongoose.model('User', userSchema, 'users');