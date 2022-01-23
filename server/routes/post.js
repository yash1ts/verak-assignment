const express = require('express');
const router = express.Router();
const { Post } = require('../models/Post');
const { auth } = require('../middleware/auth');
const { User } = require('../models/User');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' });
var admin = require("firebase-admin");
var serviceAccount = require("../key.json");
var fs = require('fs');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://debug-app-23bce.firebaseio.com"
});
const { getStorage } = require('firebase-admin/storage');
const { pushNotification } = require('./push');
const bucket = getStorage().bucket('debug-app-23bce.appspot.com');

router.post('/create', auth, (req, res) => {
    const data = {
        title: req.body.title,
        body: req.body.body,
        images: req.body.images,
        author: req.user.name,
    }
    const post = new Post(data);
    post.save();
    const payload = {
        title: `New post from ${data.author}`,
        message: data.body,
    }
    User.findById(req.user._id, (err, entry) => {
        if (err) return res.status(400).json({ status: 'failed', error: err.message });
        pushNotification(payload, entry.followers);
        return res.status(200).json({ status: 'success' });
    })
});

router.post('/image', auth, upload.single('image'), auth, (req, res) => {
    const filename = `./uploads/${req.file.filename}`;

    bucket.upload(`uploads/${req.file.filename}`, { destination: `Images/${req.file.filename}_${req.file.originalname}` },
        async (err, data) => {
            if (err) return res.status(500).json({ status: 'failed', error: err.message });
            const url = await data.getSignedUrl({ action: 'read', expires: '03-09-2050' });
            fs.unlinkSync(filename);
            return res.status(200).json({ status: 'success', url: url[0] });
        });

});

router.post('/like/:postId', auth, (req, res) => {
    const postId = req.params.postId;
    Post.findByIdAndUpdate(postId, { $addToSet: { likes: req.user.name } }, (err) => {
        if (err) return res.status(400).json({ status: 'failed', error: err.message });
        return res.status(200).json({ status: 'success' });
    });
})

router.get('/id/:postId', (req, res) => {
    const postId = req.params.postId;
    Post.findById(postId, (err, post) => {
        if (err) return res.status(400).json({ status: 'failed', error: err.message });
        return res.status(200).json({ status: 'success', post });
    })
})

router.get('/user/:userName', (req, res) => {
    const userName = req.params.userName;
    Post.find({ author: userName }).sort({ date: -1 }).exec((err, entry) => {
        if (err) return res.status(400).json({ status: 'failed', error: err.message });
        return res.status(200).json({status:'success', entry});
    });
})


module.exports = router;
