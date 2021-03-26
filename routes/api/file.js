const router = require('express').Router();

const FileController = require('../../controller/FileController');

router.post('/avatar', FileController.avatar);

module.exports = router;