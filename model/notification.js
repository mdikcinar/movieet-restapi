const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    sender: {
        type: String,
        ref: 'User',
    },
    senderUsername: {
        type: String,
    },
    receiver: {
        type: String,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment', 'mention'],
    },
    postID: {
        type: Schema.ObjectId,
        ref: 'Post',
    },

}, { timestamps: true });

const Notification = mongoose.model('notification', NotificationSchema);
module.exports = Notification;