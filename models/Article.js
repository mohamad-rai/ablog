const mongoose = require('mongoose');

const defaultSetting = {
    type: String,
    required: true,
    trim: true
};

const ArticleSchema = new mongoose.Schema({
    title: {
        ...defaultSetting,
        min: 3
    },
    content: {
        ...defaultSetting,
        min: 50
    },
    image: {
        ...defaultSetting,
        default: "article.png"
    },
    views:{
        type: Number,
        default: 0
    },
    favs: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

ArticleSchema.pre('findOneAndUpdate', function(next){
    this.set({updated_at: Date.now()});
    return next();
});

module.exports = mongoose.model('Article', ArticleSchema);