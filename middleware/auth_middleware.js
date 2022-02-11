const User = require('../model/user');
const { Followings } = require('../model/followers');
const createError = require('http-errors');
const admin = require('../config/firebase_config');
require('dotenv').config();


const authCheck = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        if (token) {
            token = token.replace('Bearer ', '');
            const decodeValue = await admin.auth().verifyIdToken(token);
            if (decodeValue) {
                const isUserRegistered = await User.findOne({ '_id': decodeValue.uid });
                if (isUserRegistered) {
                    console.log('Request owner: ' + isUserRegistered._id);
                    req.user = isUserRegistered;
                    const users = await User.find();
                    for (var i = 0; i < users.length; i++) {
                        console.log(i);
                        const user = users[i];
                        const following = await Followings.findOne({ _id: user._id });
                        if (following) {
                            if (following.list.includes({ _id: user._id })) {
                                console.log('var');
                            } else {
                                following.list.push({ _id: user._id });
                                await following.save();
                            }
                        } else {
                            const tempList = new Followings({
                                _id: user._id,
                            });
                            tempList.list.push({ _id: user._id });
                            await tempList.save();
                        }
                    }
                }
                else {
                    console.log('User is not registered: ' + decodeValue.uid);
                    const newUser = new User({
                        '_id': decodeValue.uid,
                        'email': decodeValue.email,
                        'photoUrl': decodeValue.picture, 'name': decodeValue.name,
                    });
                    console.log('New user created: ' + newUser._id);
                    await newUser.save();
                    const following = new Followings({
                        '_id': decodeValue.uid, list: [
                            {
                                _id: decodeValue.uid,

                            }
                        ]
                    });
                    await following.save();
                    req.user = newUser;
                }
                return next();
            }

            return res.json({ 'message': 'Token is not valid.' });
        }
        else {
            throw createError(400, 'UnAuthorized.');
            //res.json({message:'Authorization must!'})
        }


    } catch (err) {
        next(err);
    }
}
module.exports = authCheck