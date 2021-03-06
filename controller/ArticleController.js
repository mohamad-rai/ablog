const persianDate = require('persian-date');
const he = require('he'); //HTML entities
const clipper = require('text-clipper').default;

const Article = require('../models/Article');
const Comment = require('../models/Comment');
const {ObjectId} = require("bson");

exports.create = async (req, res) => {
    try {
        req.body.author = req.session.user._id;
        const newArticle = new Article(req.body);
        await newArticle.save();
        res.json({result: true, article: newArticle});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
exports.all = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
exports.single = async (req, res) => {
    try {
        const article = await Article.findOne({_id: req.params.id});
        req.json(article);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
exports.update = async (req, res) => {
    try {
        const update = await Article.findOneAndUpdate(
            {_id: req.params.id},
            req.body,
            {
                new: true,
                rawResult: true
            });
        if (update.ok)
            return res.json({result: true});
        res.status(400).json({error: "article not found"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};
exports.delete = async (req, res) => {
    try {
        const deleted = await Article.deleteOne({_id: req.params.id});
        if (deleted.deletedCount)
            return res.json({result: true});
        res.status(404).json({error: "user not found"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Server Error"});
    }
};

exports.viewAll = async (req, res) => {
    let articles = await articlesToView({});
    if (!articles)
        return res.status(500).json({error: "???????? ????????"});
    let recommend = {};
    if (req.session.recommendedPosts && req.session.recommendedPosts.length > 0) {
        for (let i = 0; i < req.session.recommendedPosts.length; i++)
            articles[req.session.recommendedPosts[i]].recommend = true;
        recommend = {articles, recommends: req.session.recommendedPosts}
    } else {
        recommend = recommendPost(articles);
        req.session.recommendedPosts = [...recommend.recommends];
    }
    res.render('index', {title: "index", data: {...recommend, clipper}});
}
exports.viewMe = async (req, res) => {
    const page = req.route.path === "/articles" ? "article-management" : "main";
    const pageScript = ["/javascripts/dashboard.js"];
    const condition = {};
    if (req.session.user.role !== "admin" && req.session.user.role !== "superAdmin")
        condition.author = req.session.user._id;
    const articles = await articlesToView(condition);
    if (!articles)
        return res.status(500).json({error: "???????? ????????"});
    const countedComments = await commentCounter(articles);
    res.render('dashboard/index', {
        title: "Dashboard",
        page,
        pageScript,
        data: {...req.session.user, articles, countedComments, clipper}
    });
}
exports.viewSingle = async (req, res) => {
    const article = await articlesToView({_id: req.params.id});
    const comments = await getComments(req.params.id);
    if (!article)
        return res.status(500).json({error: "???????? ????????"});
    const pageScript = [
        "https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/js/froala_editor.pkgd.min.js",
        "/dashboard/assets/libs/froala-editor/js/languages/fa.js",
        "/dashboard/assets/libs/froala-editor/js/plugins/image.min.js"
    ];
    const pageStyle = ["https://cdn.jsdelivr.net/npm/froala-editor@3.1.0/css/froala_editor.pkgd.min.css"];
    res.render('index', {
        title: article[0].title,
        page: 'single-article',
        data: {article: article[0], comments},
        pageScript,
        pageStyle
    });
}
exports.viewUpdate = async (req, res) => {
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
exports.viewUserArticles = async (req, res) => {
    const articles = await articlesToView({author: req.params.id});
    const pageScript = ["/javascripts/dashboard.js"];
    if (!articles)
        return res.status(500).json({error: "???????? ????????"});
    const countedComments = await commentCounter(articles);
    res.render('dashboard/index', {
        title: "Articles",
        page: "article-management",
        pageScript,
        data: {...req.session.user, articles, countedComments, clipper}
    });
}

const articlesToView = async condition => {
    try {
        const articles = await Article.find(condition).populate('author').sort({created_at: -1}).lean();
        let favs = 0;
        for (const article of articles) {
            const createdAt = article.created_at;
            article.created_at = new persianDate(createdAt.valueOf())
                .format('LLLL');
            const updatedAt = article.updated_at;
            article.updated_at = new persianDate(updatedAt.valueOf())
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
const recommendPost = articles => {
    const recommends = [];
    for (let i = 1; i <= 4; i++) {
        while (true) {
            let random = ~~(Math.random() * (articles.length - 1)) + 1;
            if (!articles[random].recommend) {
                recommends.push(random);
                articles[random].recommend = true;
                break;
            }
        }
    }
    return {articles, recommends};
}
const getComments = async articleId => {
    try {
        const comments = await Comment.find({status: true, article: articleId}).populate('writer').lean().exec();
        for (const comment of comments) {
            const persianCreatedDate = new persianDate(comment.created_at.valueOf()).format('LL').split(' ');
            comment.created_at = `${persianCreatedDate[1]} ${persianCreatedDate[0]} ${persianCreatedDate[2]}`
        }
        return comments;
    } catch (err) {
        console.log(err);
        return false;
    }
}
const commentCounter = async articles => {
    const articleIds = [];
    for (const article of articles) articleIds.push(new ObjectId(article._id));
    const comments = await Comment.find({article: {$in: articleIds}}).lean();
    if (!comments) return [];
    const countedComments = articleIds.reduce((acc, curr) => (acc[curr] = 0 , acc), {});
    for (const comment of comments) countedComments[comment.article]++;
    return countedComments;
}