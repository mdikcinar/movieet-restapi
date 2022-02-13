const Post = require('../model/post');
const { WatchedMovie } = require('../model/watchedMovie');
const { WatchedTv } = require('../model/watchedMovie');
const { WatchlistMovie } = require('../model/watchedMovie');
const { WatchlistTv } = require('../model/watchedMovie');
const { Followings } = require('../model/followers');
const ReportedPosts = require('../model/reportedPost');
const User = require('../model/user');
var FCM = require('fcm-node');
const Like = require('../model/like');
const Comment = require('../model/comment');
const Notification = require('../model/notification');
const createError = require('http-errors');
var ObjectID = require('mongodb').ObjectId;



const getFollowedPosts = async (req, res, next) => {
    try {
        console.log('Get followed posts');
        const followed = await Followings.findOne({ '_id': req.user._id });
        var result;
        var user = req.user;
        if (followed) {

            if (req.params.date == 0) {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $in: followed.list }
                }).sort({ 'createdAt': -1 })
                    .limit(Number(req.params.number));

            } else {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $in: followed.list }
                }).sort({ 'createdAt': -1 })
                    .limit(Number(req.params.number)).where('createdAt').lt(req.params.date);
            }


        }
        if (result) {
            result = await fillIsUserLiked(req, result);
            return res.status(200).json({ result: result });
        } else {
            return res.status(200).json({ result: [] });
        }
    } catch (err) {
        next(err);
    }
};
const getNewFollowedPosts = async (req, res, next) => {
    try {
        console.log('Get new followed posts');
        const followed = await Followings.findOne({ '_id': req.user._id });
        var result;
        var user = req.user;
        if (req.params.date == 0) {
            result = await Post.find({
                "_id": { $nin: user.hiddenPosts },
                "owner": { $in: followed.list }
            }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number));

        } else {
            result = await Post.find({
                "_id": { $nin: user.hiddenPosts },
                "owner": { $in: followed.list }
            }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number)).where('createdAt').gt(req.params.date);
        }


        if (result) {
            result = await fillIsUserLiked(req, result);
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found');
    } catch (err) {
        next(err);
    }
};
const showMoreFollowedPosts = async (req, res, next) => {
    try {
        console.log('Show more followed posts ' + req.params.topdate + ' ' + req.params.bottomdate);
        const followed = await Followings.findOne({ '_id': req.user._id });
        var user = req.user;
        var result = await Post.find({
            "_id": { $nin: user.hiddenPosts },
            "owner": { $in: followed.list }
        }).sort({ 'createdAt': -1 })
            .limit(Number(req.params.number)).where('createdAt').gt(req.params.bottomdate).lt(req.params.topdate);

        if (result) {
            result = await fillIsUserLiked(req, result);
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no show more post found');
    } catch (err) {
        next(err);
    }
};

const getLimitedPostByUserId = async (req, res, next) => {
    try {
        console.log('Get limited posts by user id: ' + req.params.userId);
        var user = req.user;
        var result;
        if (user) {
            if (req.params.date == 0) {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": req.params.userId
                }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": req.params.userId
                }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
            }
        } else {
            if (req.params.date == 0) {
                result = await Post.find({ "owner": req.params.userId }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({ "owner": req.params.userId }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
            }
        }

        if (result) {
            result = await fillIsUserLiked(req, result);
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found for user id: ' + req.params.userId);
    } catch (err) {
        next(err);
    }
};

const sendPost = async (req, res, next) => {
    try {
        const post = new Post(req.body);
        post._id = new ObjectID();
        post.owner = req.user._id;
        const user = req.user;
        const result = await post.save();
        if (result) {
            console.log('Post has been added to db');
            user.postCount++;
            const movieModel = {
                _id: req.body.movieUuid,
                moviePosterUrl: req.body.moviePhotoUrl,
                ownerRate: req.body.ownerVote
            };
            var movieCollection;
            var movieWatchlistCollection;
            if (req.body.mediaType == 'movie') {
                movieCollection = WatchedMovie;
                movieWatchlistCollection = WatchlistMovie;
            } else {
                movieCollection = WatchedTv;
                movieWatchlistCollection = WatchlistTv;
            }
            const exist = await movieCollection.findOne(
                {
                    _id: user._id,
                    movieList: { $elemMatch: { _id: movieModel._id } },
                }
            );
            if (!exist) {
                const result = await movieCollection.findOne(
                    {
                        _id: user._id,
                    }
                );
                if (result) {
                    result.movieList.push(movieModel);
                    await result.save();
                } else {
                    const tempMovie = new movieCollection({
                        _id: user._id,
                    });
                    tempMovie.movieList.push(movieModel);
                    await tempMovie.save();
                }
                user.watchedMoviesCount++;
                console.log('movie added to watched list');
            } else {
                console.log('movie already exist in watched list');
            }
            const isExistInWatchlist = await movieWatchlistCollection.findOne(
                {
                    _id: req.user._id,
                    movieList: { $elemMatch: { _id: movieModel._id } },
                },
            );
            if (isExistInWatchlist) {
                await isExistInWatchlist.updateOne(
                    {
                        $pull: { movieList: { _id: movieModel._id } },
                    },
                );
                user.watchlistCount--;
                console.log('movie deleted in watchlist');
            } else {
                console.log('movie couldnt find in watchlist');
            }
            await user.save();
            return res.status(200).json(result);
        }
        throw createError(501, 'adding post failed');
    } catch (err) {
        next(err);
    }

};

const deletePost = async (req, res, next) => {
    try {
        const deletePostID = req.params.postID;
        const user = req.user;
        const result = await Post.findOne({ _id: deletePostID });
        if (result) {
            if (result.owner == user._id) {
                await result.deleteOne();
                user.postCount--;
                await user.save();
                await Comment.deleteMany({ postID: deletePostID });
                await Like.findOneAndDelete({ _id: deletePostID });
                await ReportedPosts.findOneAndDelete({ postId: deletePostID });
                await Notification.deleteMany({ postID: deletePostID }).then(function () {
                    console.log("Notifications deleted"); // Success
                }).catch(function (error) {
                    console.log(error); // Failure
                });
                console.log('Post is deleted: ' + req.params.postID)
                return res.status(200).json({ 'message': 'true' });
            } else {
                return res.status(200).json({ 'message': 'You are not allowed to delete this post.' });
            }
        } else {
            return res.status(200).json({ 'message': 'Post couldnt find.' });
        }

    } catch (err) {
        next(err);
    }

};
const reportPost = async (req, res, next) => {
    try {
        console.log('Report post method called');
        var report;
        if (req.user) {
            report = new ReportedPosts(
                {
                    reporter: req.user._id,
                    postId: req.params.postId,
                    cause: req.params.cause,
                }
            );
        } else {
            report = new ReportedPosts(
                {
                    postId: req.params.postId,
                    cause: req.params.cause,
                }
            );
        }

        const result = await report.save();
        if (result) {
            return res.status(200).json(true)
        } else {
            return res.status(200).json(false);
        }

    } catch (err) {
        next(err);
    }

};

const likePost = async (req, res, next) => {
    try {
        var postID = req.body['postID'];
        const exist = await Like.findOne({
            _id: postID,
            list: { $elemMatch: { _id: req.user._id } },
        });
        const post = await Post.findOne({
            _id: postID,
        });
        if (post) {
            if (exist) {
                exist.list.remove(req.user._id);
                await exist.save();
                post.likeCount--;
                await post.save();
                return res.status(200).json({ 'likeCount': post.likeCount, 'isUserLiked': false });
            }
            else {
                const postLikes = await Like.findOne({
                    _id: postID,
                });
                if (postLikes) {
                    postLikes.list.push({ _id: req.user._id });
                    await postLikes.save();
                } else {
                    const like = new Like();
                    like._id = postID;
                    like.list.push({ _id: req.user._id });
                    await like.save();
                }
                post.likeCount++;
                await post.save();
                const targetUser = await User.findOne({ _id: post.owner });
                const targetNotificationToken = targetUser.notificationToken;
                if (targetNotificationToken) {
                    sendLikeNotification(targetNotificationToken, req.user.userName,);
                }
                await createNotification(targetUser._id, req.user._id, req.user.userName, 'like', post._id);
                return res.status(200).json({ 'likeCount': post.likeCount, 'isUserLiked': true });
            }
        }
        else {
            return res.status(200).json('post not exist');
        }

    } catch (err) {
        next(err);
    }
};

const createNotification = async (receiver, sender, senderUsername, type, postID) => {
    const notification = new Notification();
    notification.receiver = receiver;
    notification.sender = sender;
    notification.senderUsername = senderUsername;
    notification.type = type;
    notification.postID = postID;
    await notification.save();
};
const addComment = async (req, res, next) => {
    console.log('add comment worked');
    try {
        const postID = req.body['postID'];
        if (postID) {
            console.log(postID)
            const post = await Post.findOne({ _id: ObjectID(postID) });
            if (post) {
                post.commentCount++;
                await post.save();
                const comment = new Comment(req.body);
                comment._id = new ObjectID();
                comment.owner = req.user._id;
                const result = await comment.save();
                if (comment.owner != post.owner) {
                    const targetUser = await User.findOne({ _id: post.owner });
                    const targetNotificationToken = targetUser.notificationToken;
                    sendCommentNotification(targetNotificationToken, req.user.userName, comment.commentTxt);
                    await createNotification(targetUser._id, req.user._id, req.user.userName, 'comment', post._id);
                }
                const repliedTo = comment.repliedTo;
                if (repliedTo) {
                    const repliedToUser = await User.findOne({ _id: repliedTo });
                    const repliedToUserNotificationToken = repliedToUser.notificationToken;
                    sendCommentNotification(repliedToUserNotificationToken, req.user.userName, comment.commentTxt);
                    await createNotification(repliedToUser._id, req.user._id, req.user.userName, 'comment', post._id);
                }
                if (result) {
                    return res.status(200).json(comment._id);
                }
            } else {
                return res.status(200).json('post not exist');
            }

        }


    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {

    try {
        const commentID = req.params.commentID;
        if (commentID) {
            const comment = await Comment.findOne({ _id: ObjectID(commentID) });
            if (comment) {
                const post = await Post.findOne({ _id: ObjectID(comment.postID) });
                if (post) {
                    post.commentCount--;
                    await post.save();
                }
                const result = await comment.deleteOne();
                if (result) {
                    return res.status(200).json(true);
                }
            }

        }
    } catch (err) {
        next(err);
    }
};


const fillIsUserLiked = async (req, postList) => {
    console.log('fill user liked worked');
    for (var i in postList) {
        const like = await Like.findOne({ _id: postList[i]._id, list: { $elemMatch: { _id: req.user._id } }, });
        if (like) {
            postList[i].isUserLiked = true;
        } else {
            postList[i].isUserLiked = false;
        }
    }
    return postList;
};

const sendLikeNotification = async (targetNotificationToken, likedUserName) => {
    console.log('Send notification worked');
    var serverKey = process.env.notification_server_key; //put your server key here
    var fcm = new FCM(serverKey);

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: targetNotificationToken,
        notification: {
            title: 'New like',
            body: likedUserName + ' is liked your post.'
        },
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Send notification: Something has gone wrong!");
        } else {
            console.log("Notification successfully sent with response: ", response);
        }
    });
}
const sendCommentNotification = async (targetNotificationToken, commendedUserName, comment) => {
    console.log('Send notification worked');
    var serverKey = process.env.notification_server_key; //put your server key here
    var fcm = new FCM(serverKey);

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: targetNotificationToken,
        notification: {
            title: 'A new comment',
            body: commendedUserName + ': ' + comment,
        },
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Send notification: Something has gone wrong!");
        } else {
            console.log("Notification successfully sent with response: ", response);
        }
    });
}

const getAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('get all posts with limit date: ' + req.params.date);
        var user = req.user;
        if (user) {
            var result;
            if (req.params.date == 0) {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $nin: user.blocked }
                }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $nin: user.blocked }
                }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
            }
            if (result) {
                result = await fillIsUserLiked(req, result);
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        } else {
            var result;
            if (req.params.date == 0) {
                result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
            }
            if (result) {
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        }

    } catch (err) {
        next(err);
    }

}
const getNewAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('get new all posts with limit date: ' + req.params.date);
        var user = req.user;
        if (user) {
            var result;
            if (req.params.date == 0) {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $nin: user.blocked }
                }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({
                    "_id": { $nin: user.hiddenPosts },
                    "owner": { $nin: user.blocked }
                }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.date).limit(Number(req.params.number));
            }
            if (result) {
                result = await fillIsUserLiked(req, result);
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        } else {
            var result;
            if (req.params.date == 0) {
                result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
            } else {
                result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.date).limit(Number(req.params.number));
            }
            if (result) {
                result = await fillIsUserLiked(req, result);
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        }


    } catch (err) {
        next(err);
    }

}
const showMoreAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('Show more all posts with limit date: ' + req.params.topdate + ' ' + req.params.bottomdate);
        var user = req.user;
        if (user) {
            var result = await Post.find({
                "_id": { $nin: user.hiddenPosts },
                "owner": { $nin: user.blocked }
            }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.bottomdate).lt(req.params.topdate).limit(Number(req.params.number));
            if (result) {
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        } else {
            var result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.bottomdate).lt(req.params.topdate).limit(Number(req.params.number));
            if (result) {
                result = await fillIsUserLiked(req, result);
                return res.status(200).json({ result: result });
            }
            throw createError(404, 'there is no post found');
        }

    } catch (err) {
        next(err);
    }

}

const getComments = async (req, res, next) => {
    try {
        console.log('Get limited comments post id: ' + req.params.postID);

        var result;
        if (req.params.date == 0) {
            result = await Comment.find({
                "postID": req.params.postID,
            }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
        } else {
            result = await Comment.find({
                "postID": req.params.postID,
            }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
        }


        if (result) {
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found for user id: ' + req.params.userId);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendPost,
    deletePost,
    reportPost,
    getFollowedPosts,
    getNewFollowedPosts,
    showMoreFollowedPosts,
    getLimitedPostByUserId,
    getAllPostsWithLimit,
    getNewAllPostsWithLimit,
    showMoreAllPostsWithLimit,
    likePost,
    addComment,
    deleteComment,
    getComments
}