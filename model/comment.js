const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    owner: {
        type: String,
        ref: 'User',
    },
    repliedTo: {
        type: String,
        ref: 'User',
    },
    postID: {
        type: Schema.ObjectId,
        ref: 'Post',
    },
    commentTxt: {
        type: String,
        maxLength: 500,
    },

}, { timestamps: true });

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;