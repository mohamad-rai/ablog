const Article = require('../models/Article');

exports.create = async (req,res)=>{
    try{
        req.body.author = req.session.user._id;
        const newArticle = new Article(req.body);
        await newArticle.save();
        res.json({result: true, article: newArticle});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};

exports.all = async (req,res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};

exports.single = async (req,res) => {
    try {
        const article = await Article.find({_id: req.params.id});
        req.json(article);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};

exports.update = async (req,res) => {
    try {
        const update = await Article.findOneAndUpdate({_id: req.params.id}, req.body);
        if(update.ok)
            return res.json({result: true});
        res.status(400).json({error: "article not found"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};

exports.delete = async (req,res) => {
    try {
        const deleted = Article.deleteOne({_id: req.params.id});
        if(deleted.deletedCount)
            return res.json({result: true});
        res.status(404).json({error: "user not found"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
