const bcrypt = require("bcrypt");
exports.loginChecker = (req, res, next) => {
    if (!req.session.user)
        return next();
    res.redirect("/dashboard");
}
exports.accessControl = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect(303, `/login`);
}
exports.adminAccess = (req, res, next) => {
    if(req.session.user && req.session.user.role === "admin" || req.session.user.role === "superAdmin")
        return next();
    res.redirect(303, '/dashboard');
}
exports.encrypt = (content, saltRound = 10) => bcrypt.genSalt(saltRound)
    .then(salt => {
        return bcrypt.hash(content, salt)
            .then(hash => {
                return {result: true, hash};
            })
            .catch(err => {
                return {result: false, err};
            });
    })
    .catch(err => {
        return {result: false, err};
    });