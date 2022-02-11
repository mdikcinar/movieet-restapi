const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        ref: 'Post',
    },
    list: [
        {
            _id: {
                type: String,
                ref: 'User',
            },
        }
    ]

});

const Like = mongoose.model('like', LikeSchema);
module.exports = Like;