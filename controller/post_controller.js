const Post = require('../model/post');
const User = require('../model/user');
const { WatchedMovie } = require('../model/watchedMovie');
const { WatchedTv } = require('../model/watchedMovie');
const { WatchlistMovie } = require('../model/watchedMovie');
const { WatchlistTv } = require('../model/watchedMovie');
const { Followings } = require('../model/followers');
const createError = require('http-errors');



const getFollowedPosts = async (req, res, next) => {
    try {
        console.log('Get followed posts');
        const followed = await Followings.findOne({ '_id': req.user._id });
        var result;
        if (req.params.date == 0) {
            result = await Post.find({ "owner": { $in: followed.list } }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number));

        } else {
            result = await Post.find({ "owner": { $in: followed.list } }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number)).where('createdAt').lt(req.params.date);
        }


        if (result) {
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found');
    } catch (err) {
        next(err);
    }
};
const getNewFollowedPosts = async (req, res, next) => {
    try {
        console.log('Get new followed posts');
        const followed = await Followings.findOne({ '_id': req.user._id });
        var result;
        if (req.params.date == 0) {
            result = await Post.find({ "owner": { $in: followed.list } }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number));

        } else {
            result = await Post.find({ "owner": { $in: followed.list } }).sort({ 'createdAt': -1 })
                .limit(Number(req.params.number)).where('createdAt').gt(req.params.date);
        }


        if (result) {
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
        var result = await Post.find({ "owner": { $in: followed.list } }).sort({ 'createdAt': -1 })
            .limit(Number(req.params.number)).where('createdAt').gt(req.params.bottomdate).lt(req.params.topdate);

        if (result) {
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
        var result;
        if (req.params.date == 0) {
            result = await Post.find({ "owner": req.params.userId }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
        } else {
            result = await Post.find({ "owner": req.params.userId }).sort({ 'createdAt': -1 }).where('createdAt').lt(req.params.date).limit(Number(req.params.number));
        }
        if (result) {
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

const getAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('get all posts with limit date: ' + req.params.date);
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
    } catch (err) {
        next(err);
    }

}
const getNewAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('get new all posts with limit date: ' + req.params.date);
        var result;
        if (req.params.date == 0) {
            result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).limit(Number(req.params.number));
        } else {
            result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.date).limit(Number(req.params.number));
        }
        if (result) {
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found');
    } catch (err) {
        next(err);
    }

}
const showMoreAllPostsWithLimit = async (req, res, next) => {
    try {
        console.log('Show more all posts with limit date: ' + req.params.topdate + ' ' + req.params.bottomdate);
        var result = await Post.find({ published: true }).sort({ 'createdAt': -1 }).where('createdAt').gt(req.params.bottomdate).lt(req.params.topdate).limit(Number(req.params.number));
        if (result) {
            return res.status(200).json({ result: result });
        }
        throw createError(404, 'there is no post found');
    } catch (err) {
        next(err);
    }

}

const getAllPostsByUserId = async (req, res, next) => {
    try {

        const result = await Post.find({ "owner": req.params.userID }).limit(Number(req.params.number)).sort({ 'createdAt': -1 })
            .where('createdAt').lt(req.params.date);


        if (result) {
            const lastDate = result[(result.length) - 1].createdAt;
            return res.status(200).json({ result: result, sonGetirilenPostTarihi: lastDate });
        }
        throw createError(404, 'there is no post found for user id: ' + req.params.userID);
    } catch (err) {
        next(err);
    }

}
module.exports = {
    sendPost,
    deletePost,
    getFollowedPosts,
    getNewFollowedPosts,
    showMoreFollowedPosts,
    getAllPostsByUserId,
    getLimitedPostByUserId,
    getAllPostsWithLimit,
    getNewAllPostsWithLimit,
    showMoreAllPostsWithLimit
}