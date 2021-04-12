const bcrypt = require('bcrypt');

const User = require('../models/User');

exports.create = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({result: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
}
exports.all = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({err: "Server Error"});
    }
}
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if (!user) return res.json({error: "کاربری با این مشخصات پیدا نشد x-x"});
        bcrypt.compare(req.body.password, user.password)
            .then(checkPassword => {
                if (!checkPassword) return res.json({error: "کاربری با این مشخصات پیدا نشد x_x"});

                req.session.user = user;
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
}
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect(302, '/login');
};
exports.update = async (req, res) => {
    try {
        const id = req.params.id || req.session.user._id;
        const update = await User.findOneAndUpdate(
            {_id: id},
            req.body,
            {
                new: true,
                rawResult: true
            }
        );
        if (update.ok) {
            req.session.user = update.value;
            return res.json({result: true});
        }
        res.json({result: false});
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({error: "Server Error"});
    }
}
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
        const id = req.params.id || req.session.user._id || null;
        const deleteUser = await User.deleteOne({_id: id});
        if (!deleteUser.deletedCount)
            return res.status(404).json({error: "You are not exist my friend"});
        req.session.destroy();
        res.json({result: true});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "Server Error"});
    }
};