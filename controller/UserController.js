const bcrypt = require('bcrypt');

const User = require('../models/User');

exports.create = async (req, res) => {
    try {
        const userExist = await checkUsername(req.body.username);
        if(userExist) return res.status(403).json({err: "نام کاربری از قبل وجود دارد"});
        const newUser = new User(req.body);
        await newUser.save();
        res.json({result: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
exports.all = async (req, res) => {
    try {
        const users = await User.find({$nin: ['superAdmin', 'admin']});
        res.json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({err: "Server Error"});
    }
};
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if (!user) return res.json({error: "کاربری با این مشخصات پیدا نشد x-x"});
        bcrypt.compare(req.body.password, user.password)
            .then(checkPassword => {
                if (!checkPassword) return res.json({error: "کاربری با این مشخصات پیدا نشد x_x"});

                res.locals.sessionUser = req.session.user = user;
                res.json({result: true});
            })
            .catch(bcryptError => {
                console.log(bcryptError.message);
                return res.status(500).json({error: "خطای سرور -_-"});
            });
    } catch (err) {
        if (err) {
            console.log(err.message);
            return res.status(500).json({error: "server error -_-"});
        }
    }
};
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect(302, '/login');
};
exports.update = async (req, res) => {
    try {
        const id = req.params.id || req.session.user._id;
        const userExist = await checkUsername(req.body.username);
        if(userExist && userExist._id.toString() !== id) return res.status(403).json({err: "نام کاربری از قبل وجود دارد"});
        const update = await User.findOneAndUpdate(
            {_id: id},
            req.body,
            {
                new: true,
                rawResult: true
            }
        );
        if (update.ok) {
            if(!req.params.id) res.locals.sessionUser = req.session.user = update.value;
            return res.json({result: true});
        }
        res.json({result: false});
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({error: "Server Error"});
    }
};
exports.password = async (req, res) => {
    try {
        const checkPassword = await bcrypt.compare(req.body.oldPassword, req.session.user.password);
        if (!checkPassword) return res.json({error: "current password is not match with user password"});
        console.table(req.body);
        try {
            const update = await User.findOneAndUpdate(
                {_id: req.session.user._id},
                {password: req.body.password},
                {
                    new: true,
                    rawResult: true
                }
            );
            if (update.ok) {
                req.session.destroy();
                return res.json({result: true});
            }
            res.json({error: "خطایی در دریافت اطلاعات رخ داده، لطفا به ادمین سرور گزارش دهید"});
        } catch (updateError) {
            console.log(updateError);
            return res.status(500).json({error: "Server Error"});
        }
    } catch (err) {
        return res.status(500).json({error: "Server Error"});
    }

};
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteUser = await User.deleteOne({_id: id});
        if (!deleteUser.deletedCount)
            return res.status(404).json({error: "You are not exist my friend"});
        res.json({result: true});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
    }
};
exports.resetPassword = async (req, res) => {
    try{
        const getUser = await User.findOne({_id: req.body.userId});
        const update = await User.findOneAndUpdate(
            {_id: req.body.userId},
            {password: getUser.mobile},
            {rawResult: true}
        );
        if (update.ok) return res.json({result: true});
        res.json({error: "خطایی در دریافت اطلاعات رخ داده، لطفا سرور را بررسی کنید."});
    } catch (err) {
        return res.status(500).json({error: "Server Error"});
    }
}

exports.viewUsers = async (req, res) => {
    const filterUsers = ['superAdmin'];
    if(req.session.user.role !== 'superAdmin') filterUsers.push('admin');
    const users = await User.find({role: {$nin: filterUsers}})
    const pageScript = ["/javascripts/dashboard.js"];
    res.render('dashboard/index', {
        title: "Users",
        page: 'user-management',
        pageScript,
        data: {...req.session.user, users}
    });
};
exports.updateUser = async (req,res) => {
    const user = await User.findOne({_id: req.params.id});
    const pageScript = ["/javascripts/dashboard.js"];
    res.render('dashboard/index',{
        title: "Update User",
        page: "update-user",
        pageScript,
        data: {user}
    });
}

const checkUsername = async username => await User.findOne({username});