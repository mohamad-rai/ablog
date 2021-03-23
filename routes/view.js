const router = require('express').Router();

const {accessControl} = require('../tools/generalTools');

const dashboard = require('./view/dashboard');
const common = require('./view/common');

router.use('/dashboard', accessControl, dashboard);
router.use('/', common);

module.exports = router;