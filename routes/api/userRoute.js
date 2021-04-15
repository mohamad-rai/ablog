const router = require('express').Router();

const validator = require('../../controller/validations/UserValidation');
const {accessControl, adminAccess} = require('../../tools/generalTools');
const UserController = require('../../controller/UserController');

router.post('/create', validator.userValidationRules(), validator.validate, UserController.create);
router.post('/login', UserController.login);
router.get('/logout', UserController.logout);
router.get('/all', /*accessControl,*/ UserController.all);
router.put('/update/:id?', /*accessControl,*/ validator.updateValidationRules(), validator.validate, UserController.update);
router.patch('/update-password', accessControl, validator.updatePasswordValidation(), validator.validate, UserController.password);
router.post('/reset-password', adminAccess, UserController.resetPassword);
router.delete('/delete/:id', adminAccess, validator.deleteValidationRule(), validator.validate, UserController.delete);

module.exports = router;