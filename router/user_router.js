const router = require('express').Router();
const userController = require('../controller/user_controller');
const authMiddleware = require('../middleware/auth_middleware');

///Kullanıcılar için REST işlemleri. (listAll, listOneById, Update, Delete, append)
//createErrorda sadece message alanına erişebiliyorum. Status code vs erişilmiyor.
router.get('/', userController.getAllUsers);
///bu admin kısmında olursa iyi olur.
// Ama takip eden insanları getirmek için bir fonk yazılmalı.

router.get('/me', authMiddleware, userController.getCurrentUser);
router.patch('/me', authMiddleware, userController.updateUser);
router.patch('/me', authMiddleware, userController.updateUser);
router.patch('/me/subscriptions', authMiddleware, userController.updateSubscriptions);
router.patch('/me/notification-token', authMiddleware, userController.updateNotificationToken);
router.delete('/me', authMiddleware, userController.deleteUser);
//router.get('/:id',userController.getUserById);
//router.post("/google", authMiddleware.authGoogle, userController.googleSignup);

router.get('/bymail/:email', authMiddleware, userController.getUserByEmail);
router.get('/byid/:id', userController.getUserById);

//Follow
router.get('/isFollowing/:id', authMiddleware, userController.isFollowing);
router.post('/follow/:id', authMiddleware, userController.followUser);
router.post('/unfollow/:id', authMiddleware, userController.unfollowUser);
//Block && Report
router.post('/block/:id', authMiddleware, userController.blockUser);
//router.post('/report/:id', userController.reportUser);

//get users movie list with id
router.get('/movielist/:id/:isMovie/:isWatchList/:date/:number', userController.getMovieList);
//add new movie to list
router.post('/addToList/:isMovie/:isWatchList', authMiddleware, userController.addToList);
router.delete('/deleteFromList/:isMovie/:isWatchList', authMiddleware, userController.deleteFromList);

//find a user
router.get('/search/:str', authMiddleware, userController.searchUser);

module.exports = router;