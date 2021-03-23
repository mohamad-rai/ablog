const router = require('express').Router();

const {accessControl} = require('../../tools/generalTools');

router.get('/', accessControl, (req, res) => {
    res.render('dashboard/index', {title: "dashboard", data: req.session.user, user: req.session.user});
});

module.exports = router;