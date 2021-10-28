const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportedUserSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User',
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

const reportedUserModel = mongoose.model('reportedUser', ReportedUserSchema);
module.exports = reportedUserModel;