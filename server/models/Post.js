const mongoose = require('mongoose');
const Schema = mongoose.Schema;

  const blogSchema = new Schema({
    title:  String, 
    author: {type: String, index: true},
    body:   String,
    images: Array,
    date: { type: Date, default: Date.now },
    likes: Array,
  });

const Post = mongoose.model('Post', blogSchema);

module.exports = { Post }