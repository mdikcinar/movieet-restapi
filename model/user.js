const mongoose = require('mongoose');

var validateUsername = function (userName) {
    var re = /^[A-Za-z][A-Za-z0-9_]{3,18}$/;
    return re.test(userName)
};


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
        maxLength: 18,
        minLength: 3,
        lowercase: true,
        validate: [validateUsername, 'This username is not valid'],
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
    },
    role: {
        type: String,
        sparse: true
    },
    blocked: [String],
    hiddenPosts: [mongoose.Schema.ObjectId]
}, {
    timestamps: true,
});



const User = mongoose.model('user', userSchema);


module.exports = User;