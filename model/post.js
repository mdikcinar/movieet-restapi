const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    mediaType: {
        type: String
    },
    content: {
        type: String
    },
    movieName: {
        type: String
    },
    moviePhotoUrl: {
        type: String
    },
    movieUuid: {
        type: String
    },
    ownerVote: {
        type: String
    },
    movieVoteAverage: {
        type: String
    },
    movieReleaseDate: {
        type: String
    },
    movieMediaType: {
        type: String
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    isUserLiked: {
        type: Boolean,
        default: false
    },
    owner: { type: String, ref: 'User' },

}, { timestamps: true });

const Post = mongoose.model('post', postSchema);

module.exports = Post;