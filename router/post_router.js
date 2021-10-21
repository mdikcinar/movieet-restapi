const router = require('express').Router();
const postController = require('../controller/post_controller');
const authMiddleware = require('../middleware/auth_middleware');


///login olmuş kullanıcın verilen sayıdan başlayarak güncel tarih sırasına göre 5 tane kendi postlarını getirir.
//post listesini ve son listelenen postun numarasını döndürür.
//router.get('/me/:date/:number', authMiddleware, postController.getMyPosts);

// takip ettiği kişilerin tüm postları arasından verilen sayıdan başlayarak en güncel 5 tanesini getirir.
//post listesini ve son listelenen postun numarasını döndürür. 
router.get('/followed/:date/:number', authMiddleware, postController.getFollowedPosts);
router.get('/newfollowed/:date/:number', authMiddleware, postController.getNewFollowedPosts);
router.get('/show-more-followed/:topdate/:bottomdate/:number', authMiddleware, postController.showMoreFollowedPosts);

/// login olmuş kullanıcının post atma işlemi
router.post('/', authMiddleware, postController.sendPost);

router.delete('/:postID', authMiddleware, postController.deletePost);

router.get('/allbyid/:userID', authMiddleware, postController.getAllPostsByUserId);
//herokuapp.movieet.com/api/post/
router.get('/limitedbyid/:userId/:date/:number', postController.getLimitedPostByUserId);
//body -> post modeldeki şeyi koyuyon
router.get('/limited/:date/:number', postController.getAllPostsWithLimit);
router.get('/newlimited/:date/:number', postController.getNewAllPostsWithLimit);
router.get('/show-more-limited/:topdate/:bottomdate/:number', postController.showMoreAllPostsWithLimit);

module.exports = router;