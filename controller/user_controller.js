const User = require('../model/user');
var mongoose = require('mongodb');
const createError = require('http-errors');
const { WatchedMovie } = require('../model/watchedMovie');
const { WatchedTv } = require('../model/watchedMovie');
const { WatchlistTv } = require('../model/watchedMovie');
const { WatchlistMovie } = require('../model/watchedMovie');
const { Followers } = require('../model/followers');
const { Followings } = require('../model/followers');
var FCM = require('fcm-node');
require('dotenv').config();

const getAllUsers = async (req, res, next) => {
    try {
        const result = await User.find();
        if (result) return res.status(200).json(result);
        throw createError(404, 'Find operation could not worked.');

    }
    catch (err) {
        next(err);
    }

};
const getUserById = async (req, res, next) => {
    try {
        console.log('Get user by id worked: ' + req.params.id);
        const result = await User.findOne({ '_id': req.params.id });
        if (result) {
            return res.status(200).json(result);
        }
        throw createError(404, 'there is no user found by id: ' + req.params.id);
    } catch (err) {
        next(err);
    }

}

const getCurrentUser = async (req, res, next) => {
    console.log('Get current user worked')
    res.json(req.user);
}

const getUserByEmail = async (req, res, next) => {
    try {
        const result = await User.find({ email: req.params.email });
        if (result) {
            return res.status(200).json(result);
        }
        throw createError(404, 'there is no user found by email: ' + req.params.email);
    } catch (err) {
        next(err);
    }

}
const updateUser = async (req, res, next) => {
    try {
        console.log('Update user worked')
        const result = await User.findOneAndUpdate({ '_id': req.user._id }, {
            userName: req.body.userName,
            name: req.body.name,
            description: req.body.description,
            photoUrl: req.body.photoUrl,
            bannerPhotoUrl: req.body.bannerPhotoUrl
        }, { new: true, runValidators: true })
        //const result = await User.findByIdAndUpdate(req.user._id,req.body,{new:true,runValidators:true});
        if (result) {
            return res.status(200).json(result);
        }
        throw createError(404, 'Patch operation could not performed on user id: ' + req.user._id);

    } catch (err) {
        next(err);
    }

}
const updateSubscriptions = async (req, res, next) => {
    try {
        const isSubscribed = req.body.isSubscribed;
        const isPatron = req.body.isPatron;
        console.log('isPatron: ' + isPatron);
        console.log('isSubscribed: ' + isSubscribed);
        const result = await User.findOneAndUpdate({ '_id': req.user._id }, {
            isSubscribed: isSubscribed,
            isPatron: isPatron
        })
        //const result = await User.findByIdAndUpdate(req.user._id,req.body,{new:true,runValidators:true});
        if (result) {
            return res.status(200).json({ 'message': true });
        }
        throw createError(404, 'Save subscription operation could not performed on user id: ' + req.user._id);

    } catch (err) {
        next(err);
    }

}
const updateNotificationToken = async (req, res, next) => {
    try {
        const token = req.body.token;
        const result = await User.findOneAndUpdate({ '_id': req.user._id }, {
            notificationToken: token,
        })
        //const result = await User.findByIdAndUpdate(req.user._id,req.body,{new:true,runValidators:true});
        if (result) {
            console.log('notification token updated: ' + req.user._id);
            return res.status(200).json({ 'message': true });
        }
        throw createError(404, 'Update notification token operation could not performed on user id: ' + req.user._id);

    } catch (err) {
        next(err);
    }

}

const deleteUser = async (req, res, next) => {
    try {
        const result = await User.findOneAndRemove(req.user.userID);
        if (result) {
            return res.status(200).json(result);
        }

        throw createError(404, 'Delete operation could not performed on user id:' + req.user.userID);
    } catch (err) {
        next(err);
    }

}

const followUser = async (req, res, next) => {

    try {
        if (req.user._id == req.params.id) return res.status(200).json({ message: 'You can not follow yourself' });

        const exist = await Followings.findOne({
            _id: req.user._id,
            list: { $elemMatch: { _id: req.params.id } },
        })

        if (!exist) {
            const currentUserFollowingList = await Followings.findOne(
                {
                    _id: req.user._id,
                }
            );
            const targetUser = await User.findOne(
                {
                    _id: req.params.id,
                }
            );
            const targetUserFollowerList = await Followers.findOne(
                {
                    _id: req.params.id,
                }
            );
            if (currentUserFollowingList) {
                console.log('Current user following list found.')
                currentUserFollowingList.list.push({ _id: req.params.id });
                await currentUserFollowingList.save();
            } else {
                console.log('Current user following list created.')
                const tempList = new Followings({
                    _id: req.user._id,
                });
                tempList.list.push({ _id: req.params.id });
                console.log(tempList);
                await tempList.save();
            }
            if (targetUserFollowerList) {
                console.log('Target user followers list found.')
                targetUserFollowerList.list.push({ _id: req.user._id });
                await targetUserFollowerList.save();
            } else {
                console.log('Target user followers list created.')
                const tempList = new Followers({
                    _id: req.params.id,
                });
                tempList.list.push({ _id: req.user._id });
                console.log(tempList);
                await tempList.save();
            }

            req.user.followingCount++;
            targetUser.followersCount++;
            await targetUser.save();
            await req.user.save();
            const targetNotificationToken = targetUser.notificationToken;
            if (targetNotificationToken) {
                sendFollowNotification(req.user.userName, targetUser.notificationToken);
            }
            console.log('Follow counts changed.');
            res.status(201).json({ 'message': true });
        } else {
            res.json({ 'message': 'already exist' });
        }

    } catch (error) {
        console.log('follow user err: ' + error)
        next()
    }

}

const sendFollowNotification = async (followedUsername, targetNotificationToken) => {
    console.log('Send notification worked');
    var serverKey = process.env.notification_server_key; //put your server key here
    var fcm = new FCM(serverKey);

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: targetNotificationToken,
        notification: {
            title: 'New follower',
            body: followedUsername + ' is followed you.'
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
const unfollowUser = async (req, res, next) => {

    try {
        if (req.user._id == req.params.id) return res.status(200).json({ message: 'You can not unfollow yourself' });

        const currentUserslist = await Followings.findByIdAndUpdate(
            req.user._id,
            {
                $pull: { list: { _id: req.params.id } },
            },
            { safe: true, upsert: true });
        if (currentUserslist) {
            console.log('Currentuser list: ' + currentUserslist);
            req.user.followingCount--;
            await req.user.save();
            //await currentUserslist.save();
        }
        const targetUserslist = await Followers.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { list: { _id: req.user._id } },
            },
            { safe: true, upsert: true });

        if (targetUserslist) {
            const targetUser = await User.findOne(
                {
                    _id: req.params.id,
                }
            );
            console.log('TargetUserslist list: ' + targetUserslist);
            targetUser.followersCount--;
            await targetUser.save();
            //await targetUserslist.save();
        }

        console.log('Follow counts changed.');
        res.status(201).json({ 'message': true });


    } catch (error) {
        console.log('follow user err: ' + error)
        next()
    }

}
const isFollowing = async (req, res, next) => {

    try {
        if (req.user._id == req.params.id) return res.status(200).json({ message: 'You can not follow yourself' });

        const result = await Followings.findOne({
            _id: req.user._id,
            list: { $elemMatch: { _id: req.params.id } },
        })
        console.log('Is following: ' + result)
        if (result) {
            return res.status(200).json(true);
        } else {
            return res.status(200).json(false);
        }
    } catch (error) {
        next()
    }

}
const searchUser = async (req, res, next) => {
    try {
        let colName = req.params.str;
        console.log('Search user with ' + colName);
        let regex = new RegExp(colName, 'i');
        var query = { $and: [{ _id: { $ne: req.user._id } }, { $or: [{ userName: regex }, { name: regex }] }] };
        const userList = await User.find(query).limit(5);
        res.status(200).json(userList);
    } catch (err) {
        next(err)
    }
}

const getMovieList = async (req, res, next) => {
    console.log('get movie list worked');
    try {
        const userid = req.params.id;
        const isMovie = req.params.isMovie;
        const isWatchList = req.params.isWatchList;
        console.log('userid:' + userid);
        console.log('isMovie:' + isMovie);
        console.log('isWatchlist:' + isWatchList);
        console.log('date:' + req.params.date);
        var result;
        if (isMovie == 'true') {
            if (isWatchList == 'true') {
                //result = await WatchlistMovie.findOne({ _id: userid }).select('movieList').sort({ 'createdAt': -1 }).limit(1);
                result = await watchlistQuery(WatchlistMovie, req);
            }
            else {
                //result = await WatchedMovie.findOne({ _id: userid }).select('movieList').sort({ 'createdAt': -1 }).limit(1);
                result = await watchlistQuery(WatchedMovie, req);
            }
        } else {
            if (isWatchList == 'true') {
                //result = await WatchlistTv.findOne({ _id: userid }).select('movieList').sort({ 'createdAt': -1 }).limit(1);
                result = await watchlistQuery(WatchlistTv, req);
            }
            else {
                //result = await WatchedTv.findOne({ _id: userid }).select('movieList').sort({ 'createdAt': -1 }).limit(1);
                result = await watchlistQuery(WatchedTv, req);
            }
        }
        if (result) {
            console.log({ result: result });
            res.status(200).json({ result: result });
        } else {
            console.log('list is empty');
            return res.status(200).json({ 'message': 'list is emtpy' });
        }
    } catch (err) {
        console.log('error get movie list   ' + err);
        return res.status(500).json({ 'message': err });
    }
}

const watchlistQuery = async function (movieCollection, req) {
    if (req.params.date == '0') {
        return await movieCollection.aggregate([
            {
                $match: { _id: req.params.id }
            },
            {
                $unwind: "$movieList"
            },
            {
                $sort: { 'movieList.createdAt': -1 }
            },
            {
                $limit: Number(req.params.number)
            },
            {
                $group: { _id: '$_id', movieList: { $push: '$movieList' } }

            },
            {
                $project: { movieList: 1, _id: 0 }

            }

        ]);
    } else {
        return await movieCollection.aggregate([
            {
                $match: { _id: req.params.id }
            },
            {
                $unwind: "$movieList"
            },
            {
                $match: { "movieList.createdAt": { $lt: new Date(req.params.date) } }
            },

            {
                $sort: { 'movieList.createdAt': -1 }
            },
            {
                $limit: Number(req.params.number)
            },
            {
                $group: { _id: '$_id', movieList: { $push: '$movieList' } }

            },
            {
                $project: { movieList: 1, _id: 0 }

            }

        ]);
    }

}

const addToList = async (req, res, next) => {
    console.log('add to list worked');
    try {
        let response = '';
        const isMovie = req.params.isMovie;
        const isWatchList = req.params.isWatchList;
        console.log('isMovie:' + isMovie);
        console.log('isWatchlist:' + isWatchList);

        const user = req.user;

        console.log('requested user: ' + user._id);

        const movieModel = {
            _id: req.body._id,
            moviePosterUrl: req.body.moviePosterUrl,
            ownerRate: req.body.ownerRate,
        };

        if (isMovie == 'true') {
            if (isWatchList == 'true') response = await checkItemExistanceAndPush(user._id, WatchlistMovie, movieModel);
            else response = await checkItemExistanceAndPush(user._id, WatchedMovie, movieModel);

        }
        else {
            if (isWatchList == 'true') response = await checkItemExistanceAndPush(user._id, WatchlistTv, movieModel);
            else response = await checkItemExistanceAndPush(user._id, WatchedTv, movieModel);
        }

        if (response == 'movie already exist') {
            if (isWatchList == 'false') {
                await deleteInWatchlist(req, isMovie, movieModel);
                await user.save();
            }
            return res.json({ 'message': response });

        } else {
            if (isWatchList == 'false') {
                console.log('Watched countı arttır');
                user.watchedMoviesCount++;
                await deleteInWatchlist(req, isMovie, movieModel);
            } else if (isWatchList == 'true') {
                console.log('Watchlist countı arttır');
                user.watchlistCount++;
            }
            const result = await user.save();

            if (result) return res.status(201).json({ 'message': response });
            else return res.status(400).json({ 'message': false });
        }
    } catch (err) {
        console.log('error add movie to lists:   ' + err);
        return res.status(500).json({ 'message': false });
    }
}

const deleteFromList = async (req, res, next) => {
    console.log('delete from list worked');
    try {
        let response = '';
        const isMovie = req.params.isMovie;
        const isWatchList = req.params.isWatchList;
        const movieId = req.body.movieID;

        const user = req.user;

        console.log('requested user: ' + user._id);

        if (isMovie == 'true') {
            if (isWatchList == 'true') response = await checkItemExistanceAndPull(user._id, WatchlistMovie, movieId);
            else response = await checkItemExistanceAndPull(user._id, WatchedMovie, movieId);

        }
        else {
            if (isWatchList == 'true') response = await checkItemExistanceAndPull(user._id, WatchlistTv, movieId);
            else response = await checkItemExistanceAndPull(user._id, WatchedTv, movieId);
        }

        if (response == true) {
            if (isWatchList == 'false') {
                console.log('Watched countı azalt');
                user.watchedMoviesCount--;
            } else if (isWatchList == 'true') {
                console.log('Watchlist countı azalt');
                user.watchlistCount--;
            }
            const result = await user.save();

            if (result) return res.status(200).json({ 'message': true });
            else return res.status(400).json({ 'message': false });
        } else {
            return res.json({ 'message': 'movie couldnt find in list' });
        }

    } catch (err) {
        console.log('error delete movie from lists:   ' + err);
        return res.status(500).json({ 'message': false });
    }
}

const deleteInWatchlist = async function (req, isMovie, movieModel) {
    if (isMovie == 'true') {
        movieWatchlistCollection = WatchlistMovie;
    } else {
        movieWatchlistCollection = WatchlistTv;
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
        req.user.watchlistCount--;
        console.log('movie deleted in watchlist');
    } else {
        console.log('movie couldnt find in watchlist');
    }
}

const checkItemExistanceAndPush = async function (userid, movieCollection, movieModel) {

    const exist = await movieCollection.findOne(
        {
            _id: userid,
            movieList: { $elemMatch: { _id: movieModel._id } },
        }
    );
    if (!exist) {
        const result = await movieCollection.findOne(
            {
                _id: userid,
            }
        );
        var addedMovie;
        if (result) {
            result.movieList.push(movieModel);
            addedMovie = result.movieList.at(-1);
            await result.save();
        } else {
            const tempMovie = new movieCollection({
                _id: userid,
            });
            tempMovie.movieList.push(movieModel);
            addedMovie = tempMovie.movieList.at(-1);
            await tempMovie.save();
        }
        console.log('movie added to list: ' + addedMovie);
        return addedMovie.createdAt;
    } else {
        console.log('movie already exist');
        return 'movie already exist';
    }
}
const checkItemExistanceAndPull = async function (userid, movieCollection, movieId) {

    const isExist = await movieCollection.findOne(
        {
            _id: userid,
            movieList: { $elemMatch: { _id: movieId } },
        },
    );
    if (isExist) {
        await isExist.updateOne(
            {
                $pull: { movieList: { _id: movieId } },
            },
        );
        console.log('movie deleted from list');
        return true;

    } else {
        console.log('movie couldnt find in list');
        return false;
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    updateSubscriptions,
    updateNotificationToken,
    getCurrentUser,
    deleteUser,
    followUser,
    unfollowUser,
    addToList,
    deleteFromList,
    getMovieList,
    searchUser,
    isFollowing

}