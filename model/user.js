const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    _id: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: [true, 'This e-mail is already exist']
    },
    userName: {
        type: String,
        trim: true,
        unique: [true, 'This username is already exist'],
        maxLength: 30,
        minLength: 3,
        lowercase: true,
    },
    name: {
        type: String,
        maxLength: 30,
        minLength: 3
    },

    description: {
        type: String,
    },
    photoUrl: {
        type: String,
    },
    bannerPhotoUrl: {
        type: String,
    },
    notificationToken: {
        type: String,
    },
    followersCount: {
        type: Number,
        min: 0,
        default: 0
    },
    followingCount: {
        type: Number,
        min: 0,
        default: 0
    },
    postCount: {
        type: Number,
        min: 0,
        default: 0
    },
    watchedMoviesCount: {
        type: Number,
        min: 0,
        default: 0
    },
    watchlistCount: {
        type: Number,
        min: 0,
        default: 0
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    isPatron: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
});

const User = mongoose.model('user', userSchema);


module.exports = User;