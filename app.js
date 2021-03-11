// REQUIRING OUR DEPENDENCIES
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


// DECLARING OUR EXPRESS APP
const app = express();

// SETTING EJS
app.set('view engine', 'ejs');

// SETTING BODY-PARSER
app.use(express.urlencoded({ extended: true }));

// SETTING OUR STATIC FOLDER
app.use(express.static('public'));

//DATABASE CREATION STEPS WITH MONGOOSE

// 1) CREATE NEW DATABASE INSIDE MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// 2) CREATE NEW SCHEMA
const userSchema = new mongoose.Schema({

  email: String,
  password: String
});

// 2-a) ADDING ENCRYPTION PLUGIN BEFORE CREATING OUR MODEL
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


// 3) CREATE NEW MODEL (our collection) BASED ON OUR SCHEMA

const User = new mongoose.model('User', userSchema);


// SETTING OUR GET ROUTES

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/register', (req, res) => {
  res.render("register");
});

// SETTING OUR POST ROUTES

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        } else {
          console.log("Please check your password and try again.");
        }
      } else {
        console.log("User not found, please check your email and try again or register.");
      }
    }
  });
});


// LISTEN TO PORT
app.listen(3000, () => {

  console.log('Server has started on port 3000');

});
