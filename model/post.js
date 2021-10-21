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
    owner: {
        type: String,
    }

}, { timestamps: true });

const Post = mongoose.model('post', postSchema);

module.exports = Post;