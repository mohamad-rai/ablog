const router = require('express').Router();

router.get('/', (req, res) => {
    const pageScript = ["/javascripts/dashboard.js"];
    res.render('dashboard/index', {title: "Dashboard", pageScript, data: req.session.user});
});
router.get('/new-article', (req, res) => {
    const pageScript = [
        "/dashboard/assets/libs/summernote/dist/summernote-bs4.min.js",
        "/dashboard/assets/libs/summernote/dist/lang/summernote-fa-IR.min.js",
        "/javascripts/summernote.js"
    ];
    const pageStyle = ["/dashboard/assets/libs/summernote/dist/summernote-bs4.css"];
    res.render('dashboard/index', {
        title: "New Article",
        page: "add-article",
        data: req.session.user,
        pageScript,
        pageStyle
    });
});

module.exports = router;