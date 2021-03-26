const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploader = require('../tools/uploadTools');
const User = require('../models/User');
const Config = require('../config/const');

exports.avatar = (req, res) => {
    const upload = uploader.single('avatar');

    upload(req, res, async err => {
        if (err instanceof multer.MulterError) {
            console.log(err);
            return res.status(500).json({error: "خطای سرور"});
        } else if (err) {
            console.log(err);
            return res.status(400).json({error: "ورودی اشتباه است"});
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(req.session.user._id, {avatar: req.file.filename}, {new: true});
            if(req.session.user.avatar && req.session.user.avatar !== Config.DEFAULT_AVATAR)
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'assets', 'avatars', req.session.user.avatar));
            console.log(updatedUser);
            req.session.user = updatedUser;
            res.json({result: true});
        } catch (err) {
            console.log(err);
            res.status(500).json({error: "خطای سرور"});
        }
    });
}