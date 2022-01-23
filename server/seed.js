var fs = require('fs');
const config = require("./config/prod");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const { Post } = require('./models/Post');
const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const users = JSON.parse(
fs.readFileSync(`${__dirname}/dummy_users.json`, "utf-8")
);

const posts = JSON.parse(
fs.readFileSync(`${__dirname}/dummy_posts.json`, "utf-8")
);

// Import into DB
const importData = async () => {
    try {
      await User.create(users);
      await Post.create(posts);
      console.log("Data Imported...");
      process.exit();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Delete data
  const deleteData = async () => {
    try {
      await User.deleteMany();
      await Post.deleteMany();
      console.log("Data Destroyed...");
      process.exit();
    } catch (err) {
      console.error(err);
    }
  };
  
  if (process.argv[2] === "-i") {
    importData();
  } else if (process.argv[2] === "-d") {
    deleteData();
  }

