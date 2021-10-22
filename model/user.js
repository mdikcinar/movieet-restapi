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
        sparse: true
    },
    name: {
        type: String,
        maxLength: 30,
        minLength: 3,
        sparse: true
    },

    description: {
        type: String,
        sparse: true,
    },
    photoUrl: {
        type: String,
        sparse: true
    },
    bannerPhotoUrl: {
        type: String,
        sparse: true
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