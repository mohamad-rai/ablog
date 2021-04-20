const router = require('express').Router();

const user = require('./api/userRoute');
const file = require('./api/fileRoute');
const article = require('./api/articleRoute');
const comment = require('./api/commentRoute');

router.use('/user', user);
router.use('/file', file);
router.use('/article', article);
router.use('/comment', comment);

module.exports = router;