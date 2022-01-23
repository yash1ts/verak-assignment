const express = require("express");
const app = express();
const cors = require('cors');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/prod");

const mongoose = require("mongoose");
const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(cors())


app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/users', require('./routes/users'));
app.use('/api/post', require('./routes/post'));
app.use('/api/subscribe', require('./routes/subscribe'));

// Set static folder   
// All the javascript and css files will be read and served from this folder
// app.use(express.static("client/build"));

// index.html for all page routes    html or routing and naviagtion
// app.get("*", (req, res) => {
// res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
// });

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});
