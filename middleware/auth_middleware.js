const User = require('../model/user');
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