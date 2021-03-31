const persianDate = require('persian-date');

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

exports.viewAll = async (req,res)=>{
    const articles = await articlesToView({});
    if(!articles)
        return res.status(500).json({error: "خطای سرور"});
    res.render('index', {title: "index", data: articles});
}
exports.viewMe = async (req,res)=>{
    const articles = await articlesToView({author: req.session.user._id});
    if(!articles)
        return res.status(500).json({error: "خطای سرور"});
    res.render('dashboard/index', {title: "Dashboard", data: {...req.session.user, articles}});
}
exports.viewSingle = async (req, res) => {
    const article = await articlesToView({_id: req.params.id});
    if(!article)
        return res.status(500).json({error: "خطای سرور"});
    res.render('index', {title: article[0].title, page: 'single-article', data: article[0]});
}

const articlesToView = async condition => {
    try{
        const articles = await Article.find(condition).populate('author').sort({created_at: -1}).lean();
        let favs = 0;
        for(const article of articles){
            const createdAt = article.created_at;
            article.created_at =  new persianDate(createdAt.valueOf())
                .format('LLLL');
            article.content = unescape(article.content);
            favs += article.favs;
        }
        articles.sumFavs = favs;
        return articles;
    } catch (err) {
        console.log(err);
        return false;
    }
}