const {check, validationResult} = require('express-validator');

exports.userValidationRules = () => [
    check('first_name', "First Name must have more than 3 character")
        .isLength({min: 3}).notEmpty().trim().escape(),
    check('last_name', "Last Name must have more than 3 character")
        .isLength({min: 3}).notEmpty().trim().escape(),
    check('email')
        .notEmpty().isEmail().normalizeEmail().trim().escape(),
    check('gender', "gender is required")
        .notEmpty().trim().escape(),
    check('mobile', "mobile number must have 11 or more character")
        .notEmpty().isLength({min: 11}).trim().escape(),
    check('username', "user name must have more than 3 character")
        .notEmpty().isLength({min: 4}).trim().escape(),
    check('password', "password must have more than 5 character")
        .notEmpty().isLength({min: 6}).trim().escape(),
    check('role')
        .notEmpty().trim().escape().optional()
];
exports.updateValidationRules = () => [
    check('first_name', "First Name must have more than 3 character")
        .isLength({min: 3}).notEmpty().trim().escape().optional(),
    check('last_name', "Last Name must have more than 3 character")
        .isLength({min: 3}).notEmpty().trim().escape().optional(),
    check('email')
        .notEmpty().isEmail().normalizeEmail().trim().escape().optional(),
    check('gender', "gender is required")
        .notEmpty().trim().escape().optional(),
    check('mobile', "mobile number must have 11 or more character")
        .notEmpty().isLength({min: 11}).trim().escape().optional(),
    check('username', 'user name must have more than 3 character')
        .notEmpty().isLength({min: 4}).trim().escape().optional(),
    check('role')
        .notEmpty().trim().escape().optional(),
    check('id').custom((val, {req}) => {
        if (!req.params.id && !req.session.user)
            throw new Error("user id is required");
        return true;
    })
];
exports.updatePasswordValidation = () => [
    check('password', 'کلمه عبور باید ۶ کاراکتر یا بیشتر باشد.')
        .notEmpty().isLength({min: 6}).trim().escape().optional(),
    check('password').custom((val, {req}) => {
        if (val !== req.body.confirmPassword)
            throw new Error("کلمه عبور با تایید آن برابر نیست");
        return true;
    })
]
exports.deleteValidationRule = () => check('id').custom((val, {req}) => {
    if (!req.params.id && !req.session.user)
        throw new Error("user id is required");
    return true;
})
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push(`${err.param}: ${err.msg}`));
    return res.status(422).json({
        errors: extractedErrors
    });
}