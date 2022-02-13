const router = require('express').Router();
const postController = require('../controller/post_controller');
const authMiddleware = require('../middleware/auth_middleware');
const getPostMiddleware = require('../middleware/get_post_middleware');



router.get('/followed/:date/:number', authMiddleware, postController.getFollowedPosts);
router.get('/newfollowed/:date/:number', authMiddleware, postController.getNewFollowedPosts);
router.get('/show-more-followed/:topdate/:bottomdate/:number', authMiddleware, postController.showMoreFollowedPosts);

/// login olmuş kullanıcının post atma işlemi
router.post('/', authMiddleware, postController.sendPost);
router.get('/:postID', authMiddleware, postController.getPostWithID);

router.post('/report/:postId/:cause', getPostMiddleware, postController.reportPost);

router.delete('/:postID', authMiddleware, postController.deletePost);

//herokuapp.movieet.com/api/post/
router.get('/limitedbyid/:userId/:date/:number', getPostMiddleware, postController.getLimitedPostByUserId);
//body -> post modeldeki şeyi koyuyon
router.get('/limited/:date/:number', getPostMiddleware, postController.getAllPostsWithLimit);
router.get('/newlimited/:date/:number', getPostMiddleware, postController.getNewAllPostsWithLimit);
router.get('/show-more-limited/:topdate/:bottomdate/:number', getPostMiddleware, postController.showMoreAllPostsWithLimit);
router.post('/like', authMiddleware, postController.likePost);
router.post('/comment', authMiddleware, postController.addComment);
router.delete('/comment/:commentID', authMiddleware, postController.deleteComment);

router.get('/comment/:postID/:date/:number', authMiddleware, postController.getComments);

module.exports = router;