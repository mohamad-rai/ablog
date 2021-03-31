const router = require('express').Router();

const {loginChecker} = require('../../tools/generalTools');
const ArticleController = require('../../controller/ArticleController');

router.get('/login', loginChecker, (req,res)=>{
    res.render('index', {page: 'login', title:'Login'});
});
router.get('/register', loginChecker, (req,res)=>{
    res.render('index', {page: 'register', title:'Register'});
});
router.get('/article/:id', ArticleController.viewSingle);
router.get('/', ArticleController.viewAll);

module.exports = router;