const path = require('path');
const multer = require('multer');

const avatarStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, path.join(__dirname,'..','public','assets','avatars'));
    },
    filename: (req,file,cb)=>{
        cb(null, `${req.session.user.username}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const articleImageStorage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'assets', 'articles'),
    filename: (req, file, cb) => {
        cb(null, `${req.session.user.username}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const filterImage = (req, file, cb) => {
    if(file.originalname.match(/\.(jpg|jpeg|png)$/))
        cb(null, true);
    else
        cb(new Error("Invalid file extension"), false);
}

exports.avatarMulter = multer({
    storage: avatarStorage,
    fileFilter: filterImage
});

exports.articleImageMulter = multer({
    storage: articleImageStorage,
    fileFilter: filterImage
});