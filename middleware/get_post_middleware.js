const User = require('../model/user');
const admin = require('../config/firebase_config');
require('dotenv').config();


const fillUserIfExist = async (req, res, next) => {
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
            }
        }
        return next();
    } catch (err) {
        return next();
    }
}
module.exports = fillUserIfExist