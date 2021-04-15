const mongoose = require('mongoose');
const schema = mongoose.Schema;
const {encrypt} = require('../tools/generalTools');

const defaultSetting = {
    type: String,
    required: true,
    trim: true
};

const UserSchema = new schema({
    first_name: {
        ...defaultSetting,
        minlength: 3
    },
    last_name: {
        ...defaultSetting,
        minlength: 3
    },
    gender: {
        ...defaultSetting,
        enum: ['male', 'female']
    },
    email: {
        ...defaultSetting,
        minlength: 7
    },
    mobile: {
        ...defaultSetting,
        minlength: 11
    },
    username: {
        ...defaultSetting,
        unique: true,
        minlength: 4,
    },
    password: {
        ...defaultSetting,
        minlength: 6,
        maxlength: 32
    },
    avatar: {
        ...defaultSetting,
        default: "user.png"
    },
    role: {
        ...defaultSetting,
        enum: ['superAdmin', 'admin', 'blogger'],
        default: "blogger"
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.methods.toJSON = function(){
    let user = this;
    user = user.toObject();
    // delete user.password;
    delete user.__v;
    return user;
}

UserSchema.pre('save', async function (next) {
    const user = this;
    const encryptResult = await encrypt(user.password);
    if(encryptResult.result) {
        user.password = encryptResult.hash;
        return next();
    }
    return next(encryptResult.err);
});

UserSchema.pre('findOneAndUpdate', async function (next){
    const user = this._update;
    console.log(user);
    if(user.password){
        const encryptResult = await encrypt(user.password);
        if(!encryptResult.result){
            console.log("ENCRYPT-ERROR:: ", encryptResult.err);
            return next(encryptResult.err);
        }
        user.password = encryptResult.hash;
    }
    user.updated_at = Date.now();
    next();
})

module.exports = mongoose.model('User', UserSchema);