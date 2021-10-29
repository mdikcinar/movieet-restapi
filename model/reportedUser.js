const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportedUserSchema = new Schema({
    userId: {
        type: String,
        ref: 'User',
    },
    reporter: {
        type: String,
        ref: 'User',
    },
    cause: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RepoertedUsers = mongoose.model('reportedUser', ReportedUserSchema);
module.exports = RepoertedUsers;