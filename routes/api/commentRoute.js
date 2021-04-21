const router = require('express').Router();

const CommentController = require('../../controller/CommentController');

router.post('/create', CommentController.create);
router.get('/all/:type/:id', CommentController.all);
router.get('/single/:id', CommentController.single);
router.delete('/delete/:id', CommentController.delete);
router.patch('/:id', CommentController.acceptComment);

module.exports = router;