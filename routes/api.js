const router = require('express').Router();

const user = require('./api/userRoute');
const file = require('./api/file');

router.use('/user', user);
router.use('/file', file);

module.exports = router;