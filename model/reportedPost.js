const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportedPostSchema = new Schema({
    postId: {
        type: Schema.ObjectId,
        ref: 'Post',
    },
    reporter: {
        type: String,
    },
    cause: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ReportedPosts = mongoose.model('reportedpost', ReportedPostSchema);
module.exports = ReportedPosts;