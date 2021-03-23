const router = require('express').Router();

const api = require('./api');
const view = require('./view');

router.use('/api', api);
router.use('/', view);

module.exports = router;
