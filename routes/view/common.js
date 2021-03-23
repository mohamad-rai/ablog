const router = require('express').Router();

const {loginChecker} = require('../../tools/generalTools');

router.get('/login', loginChecker, (req,res)=>{
    res.render('index', {page: 'login', title:'Login'});
});
router.get('/register', loginChecker, (req,res)=>{
    res.render('index', {page: 'register', title:'Register'});
});
// router.get('/', (req,res)=>{
//     return res.render('index', {title: "index"});
// });

module.exports = router;