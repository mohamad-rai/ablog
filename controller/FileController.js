const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {avatarMulter, articleImageMulter} = require('../tools/uploadTools');
const User = require('../models/User');
const Article = require('../models/Article');
const Config = require('../config/const');
const uploadImage = require('../tools/froala-image');

const errorHandler = (err, res) => {
    if (err instanceof multer.MulterError) {
        console.log(err);
        res.status(500).json(JSON.stringify({error: "خطای سرور"}));
        return false;
    } else if (err) {
        console.log(err);
        res.status(400).json(JSON.stringify({error: "ورودی اشتباه است"}));
        return false;
    }
    return true;
}

exports.avatar = (req, res) => {
    const upload = avatarMulter.single('avatar');

    upload(req, res, async err => {
        if(!errorHandler(err, res)) return;
        try {
            let userId = req.session.user._id;
            let imageName = req.session.user.avatar;
            if(req.body.userId){
                userId = req.body.userId;
                imageName = req.body.avatar;
            }
            const updatedUser = await User.findByIdAndUpdate(userId, {avatar: req.file.filename}, {new: true});
            const preFile = path.join(__dirname, '..', 'public', 'assets', 'avatars', imageName);
            if(
                imageName &&
                imageName !== Config.DEFAULT_AVATAR &&
                fs.existsSync(preFile)
            )
                fs.unlinkSync(preFile);
            if(!req.body.userId) res.locals.user = req.session.user = updatedUser;
            res.json({result: true});
        } catch (err) {
            console.log(err);
            res.status(500).json({error: "خطای سرور"});
        }
    });
}

exports.articleImage = (req, res) => {
    const upload = articleImageMulter.single('articlePhoto');

    upload(req, res, async err => {
        if(!errorHandler(err, res)) return;
        const condition = {_id: req.body.articleId};
        if(req.session.user.role !== 'admin' && req.session.user.role !== 'superAdmin')
            condition.author = req.session.user._id;
        try {
            const updatedArticle = await Article.findOneAndUpdate(
                condition,
                {image: req.file.filename});
            if(updatedArticle.image && updatedArticle.image !== Config.DEFAULT_ARTICLE_IMAGE)
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'assets', 'articles', updatedArticle.image));
            res.json({result: true, link: `/assets/articles/${req.file.filename}`});
        } catch (err) {
            console.log(err);
            res.status(500).json({error: "خطای سرور"});
        }
    })
}

exports.base64ToImage = (req, res) => {
    // const bitmap = new Buffer(req.body.articlePhoto, 'base64');
    // fs.writeFileSync("../public/assets/articles/")
    uploadImage(req, function(err, data) {

        if (err) {
            return res.status(404).json(err);
        }

        res.json(data);
    });
}