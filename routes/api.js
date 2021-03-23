const router = require('express').Router();

const user = require('./api/userRoute');

router.use('/user', user);

module.exports = router;