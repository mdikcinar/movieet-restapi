const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowersSchema = new Schema({
    _id: { type: String, ref: 'User' },
    list: [
        {
            _id: {
                type: String,
                ref: 'User',
            },
        }
    ]
});

const Followers = mongoose.model('follower', FollowersSchema);
const Followings = mongoose.model('following', FollowersSchema);
module.exports = { Followers: Followers, Followings: Followings };