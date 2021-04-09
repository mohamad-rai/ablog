const persianDate = require('persian-date');
const he = require('he'); //HTML entities
const clipper = require('text-clipper').default;

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
    res.render('index', {title: "index", data: {articles, clipper}});
}
exports.viewMe = async (req,res)=>{
    const page = req.route.path === "/articles" ? "article-management" : "main";
    const pageScript = ["/javascripts/dashboard.js"];
    const articles = await articlesToView({author: req.session.user._id});
    if(!articles)
        return res.status(500).json({error: "خطای سرور"});
    res.render('dashboard/index', {title: "Dashboard", page, pageScript, data: {...req.session.user, articles, clipper}});
}
exports.viewSingle = async (req, res) => {
    const article = await articlesToView({_id: req.params.id});
    if(!article)
        return res.status(500).json({error: "خطای سرور"});
    res.render('index', {title: article[0].title, page: 'single-article', data: article[0]});
}
exports.viewUpdate = async (req,res) => {
    const article = await Article.findById(req.params.id);
    article.content = he.unescape(article.content);
    const pageScript = [
        "https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/js/froala_editor.pkgd.min.js",
        "/dashboard/assets/libs/froala-editor/js/languages/fa.js",
        "/dashboard/assets/libs/froala-editor/js/plugins/image.min.js",
        "/javascripts/dashboard.js"
    ];
    const pageStyle = ["https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/css/froala_editor.pkgd.min.css"];
    res.render('dashboard/index', {
        title: "Update Article",
        page: "update-article",
        data: {...req.session.user, article},
        pageScript,
        pageStyle
    });
}

const articlesToView = async condition => {
    try{
        const articles = await Article.find(condition).populate('author').sort({created_at: -1}).lean();
        let favs = 0;
        for(const article of articles){
            const createdAt = article.created_at;
            article.created_at =  new persianDate(createdAt.valueOf())
                .format('LLLL');
            const updatedAt = article.updated_at;
            article.updated_at =  new persianDate(updatedAt.valueOf())
                .format('LLLL');
            article.content = he.unescape(article.content);
            favs += article.favs;
        }
        articles.sumFavs = favs;
        return articles;
    } catch (err) {
        console.log(err);
        return false;
    }
}