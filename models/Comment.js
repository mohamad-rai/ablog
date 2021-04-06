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
    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
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