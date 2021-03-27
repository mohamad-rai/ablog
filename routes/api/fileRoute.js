const router = require('express').Router();

const FileController = require('../../controller/FileController');

router.post('/avatar', FileController.avatar);
router.post('/article-image', FileController.articleImage);

module.exports = router;