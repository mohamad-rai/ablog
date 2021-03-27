const router = require('express').Router();

const user = require('./api/userRoute');
const file = require('./api/fileRoute');
const article = require('./api/articleRoute');

router.use('/user', user);
router.use('/file', file);
router.use('/article', article);

module.exports = router;