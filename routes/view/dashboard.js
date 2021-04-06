const router = require('express').Router();

const ArticleController = require('../../controller/ArticleController');

router.get('/profile', (req, res) => {
    const pageScript = ["/javascripts/dashboard.js"];
    res.render('dashboard/index', {title: "Dashboard", page: "profile", pageScript, data: req.session.user});
});
router.get('/new-article', (req, res) => {
    const pageScript = [
        "https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/js/froala_editor.pkgd.min.js",
        "/dashboard/assets/libs/froala-editor/js/languages/fa.js",
        "/dashboard/assets/libs/froala-editor/js/plugins/image.min.js",
        "/javascripts/dashboard.js"
    ];
    const pageStyle = ["https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/css/froala_editor.pkgd.min.css"];
    res.render('dashboard/index', {
        title: "New Article",
        page: "add-article",
        data: req.session.user,
        pageScript,
        pageStyle
    });
});
router.get('/articles', ArticleController.viewMe);
router.get('/articles/:id', ArticleController.viewUpdate);
router.get('/test', (req, res) => {
    const pageStyle = []
    const pageScript = [];
    res.render('dashboard/index', {
        title: "test",
        page: "test",
        data: req.session.user,
        pageScript,
        pageStyle
    });
});
router.get('/', ArticleController.viewMe);
module.exports = router;