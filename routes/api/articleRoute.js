const router = require('express').Router();

const {accessControl} = require('../../tools/generalTools');
const validator = require('../../controller/validations/ArticleValidation');
const ArticleController = require('../../controller/ArticleController');

router.get('/all', ArticleController.all);
router.get('/single/:id', validator.singleValidation);
router.post('/create', accessControl, validator.articleValidation(), validator.validate, ArticleController.create);
router.put('/update/:id', accessControl, validator.updateValidation(), validator.validate, ArticleController.update);
router.delete('/delete/:id', accessControl, validator.singleValidation, validator.validate, ArticleController.delete);