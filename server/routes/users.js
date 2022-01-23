const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Token } = require('../models/Token');

var crypto = require('crypto');
const { auth } = require('../middleware/auth');
const { Post } = require('../models/Post');

router.get('/auth', auth, (req, res) => {
  res.status(200).json({
    isAuth: true,
    name: req.user.name,
  });
});

router.post('/register', async (req, res) => {
  User.findOne(
    {
      email: req.body.email,
    },
    async (err, existingUser) => {
      if (err) {
        return res
          .status(500)
          .json({ status:'failed', error:err.message});
      }
      if (existingUser) {
        return res
          .status(400)
          .json({ status:'failed', error: 'Username is already in use.' });
      }
      const user = new User(req.body);
      user.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        var token = new Token({
          _userId: user._id,
          token: crypto.randomBytes(16).toString('hex'),
        });
        token.save(function (err) {
          if (err) return res.status(500).json({ status: 'failed', error: err.message });
          return res.status(200).json({status:'success'});
        });
      });
    }
  );
});

router.post('/login', (req, res) => {
  User.findOne(
    {
      name: req.body.name,
    },
    (err, user) => {
      if (!user)
        return res.json({
          status:'failed',
          message: 'Auth failed, user not found',
        });
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({ loginSuccess: false, message: 'Wrong password' });

        user.generateToken((err, user) => {
          if (err) return res.status(500).json({ status: 'failed', error: err.message });
          res.cookie('w_authExp', user.tokenExp);
          res.cookie('w_auth', user.token)
            .status(200)
            .json({ status:'success', user });
        });
      });
    }
  );
});

router.post('/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {
      name: req.user.name,
    },
    {
      token: '',
      tokenExp: '',
    },
    (err, doc) => {
      if (err) return res.status(500).json({ status: 'failed', error: err.message });
      return res.status(200).json({ status: 'sucsess' });
    }
  );
});

router.post('/follow/:name', auth, async (req, res) => {
  const userName = req.params.name;
  const session = await User.startSession();
  session.startTransaction()
  try {
    let result = await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: userName } }).session(session);
    result = await User.findOneAndUpdate({ name: userName }, { $addToSet: { followers: req.user.name } }).session(session);
    if (!result) throw new Error('Not Found');
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ status: 'failed', error: err.message });
  }
});

router.get('/feeds', auth, (req, res) => {
  const order = req.query.order || 'popular';
  const userId = req.user._id;
  User.findById(userId, (err, entry) => {
    if (err) return res.status(400).json({ status: 'failed', error: err.message });
    const posts = Post.find({ author: { $in: entry.following } });
    if (order === 'popular') {
      posts.sort({ likes: -1 });
    }
    if (order === 'date') {
      posts.sort({ dates: -1 });
    }
    posts.exec((err, entry) => {
      if (err) return res.status(400).json({ status: 'failed', error: err.message });
      return res.status(200).json({status:'success', entry});
    })
  })
})

module.exports = router;
