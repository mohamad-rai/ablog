const {check, validationResult} = require('express-validator');

exports.articleValidation = () => [
    check('title').notEmpty().isLength({min: 3}).trim().escape(),
    check('content').notEmpty().isLength({min: 50}).escape()
];
exports.updateValidation = () => [
    check('title').notEmpty().isLength({min: 3}).trim().escape().optional(),
    check('content').notEmpty().isLength({min: 50}).escape().optional(),
    check('author').notEmpty().optional(),
    check('id').custom((val, {req})=>{
        if(!req.params.id)
            throw new Error("article id is required");
        return true;
    })
];
exports.singleValidation = check('id').custom((val, {req})=>{
    if(!req.params.id)
        throw new Error("article id is required");
    return true;
});
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push(`${err.param}: ${err.msg}`));
    return res.status(422).json({
        errors: extractedErrors
    });
}