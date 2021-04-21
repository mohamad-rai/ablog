const persianDate = require('persian-date');

const Comment = require('../models/Comment');
const Article = require('../models/Article');
exports.create = async (req, res) => {
    try {
        const article = await Article.findOne({_id: req.body.article}).lean();
        req.body.status = article.author.toString() === req.session.user._id;
        const newComment = new Comment({...req.body, writer: req.session.user._id});
        await newComment.save();
        res.json({result: true, comment: newComment});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'خطای سرور'});
    }
};
exports.all = async (req, res) => {
    try {
        const condition = {};
        condition[req.params.type] = req.params.id;
        const comments = await Comment.find(condition);
        res.json(comments);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'خطای سرور'});
    }
};
exports.single = async (req, res) => {
    try {
        const comment = await Comment.find({_id: req.params.id});
        req.json(comment);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'خطای سرور'});
    }
};
exports.update = async (req, res) => {
    try {
        const update = await Comment.findOneAndUpdate({_id: req.params.id}, req.body);
        if (update.ok) return res.json({result: true});
        res.status(400).json({error: 'کامنت پیدا نشد'});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'خطای سرور'});
    }
};
exports.delete = async (req, res) => {
    try {
        const deleted = await Comment.deleteOne({_id: req.params.id});
        if (deleted.deletedCount) return res.json({result: true});
        res.status(404).json({error: 'کامنت پیدا نشد'});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'خطای سرور'});
    }
};
exports.acceptComment = async (req, res) => {
    try {
        const acceptedComment = await Comment.updateOne(
            {_id: req.params.id},
            {status: true},
            {
                new: true,
                rawResult: true
            }
        );
        if (acceptedComment.ok)
            return res.json({result: true});
        res.status(400).json({error: "کامنت پیدا نشد"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "خطای سرور"});
    }
}

exports.viewArticleComments = async (req, res, next) => {
    const comments = await Comment.find({article: req.params.article})
        .populate('article')
        .populate('writer')
        .lean()
        .exec();
    for (const comment of comments)
        comment.created_at = new persianDate(comment.created_at.valueOf()).format('LLLL');
    const pageScript = ["/javascripts/dashboard.js"];
    res.render('dashboard/index', {
        title: "Comments",
        page: 'comment-management',
        data: {comments},
        pageScript
    });
}