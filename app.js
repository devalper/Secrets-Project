// REQUIRING OUR DEPENDENCIES
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


// DECLARING OUR EXPRESS APP
const app = express();

// SETTING EJS
app.set('view engine', 'ejs');

// SETTING BODY-PARSER
app.use(express.urlencoded({ extended: true }));

// SETTING OUR STATIC FOLDER
app.use(express.static('public'));

// SETTING express-session
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

// INITIALIZING passport
app.use(passport.initialize());
app.use(passport.session());


//DATABASE CREATION STEPS WITH MONGOOSE

// 1) CREATE NEW DATABASE INSIDE MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true); // for fixing the deprecation warning

// 2) CREATE NEW SCHEMA
const userSchema = new mongoose.Schema({

  email: String,
  password: String,
  googleId: String
});

// SET UP passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

// SET UP findOrCreate
userSchema.plugin(findOrCreate);



// 3) CREATE NEW MODEL (our collection) BASED ON OUR SCHEMA

const User = new mongoose.model('User', userSchema);

// SIMPLIFIED passport/passport-local CONFIGURATION
passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// CONFIGURING passport GOOGLE STRATEGY
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
  (accessToken, refreshToken, profile, cb) => {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));

// SETTING OUR GET REQUESTS

app.get('/', (req, res) => {
  res.render("home");
});

//GOOGLE AUTHENTICATION REQUEST
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });


app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.get('/secrets', (req, res) => {

  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {

  req.logout();
  res.redirect('/');
});

// SETTING OUR POST ROUTES
// USING PASSPORT FOR SALTING-HASHING(passport does it automatically), AUTHENTICATION AND COOKIES

app.post('/register', (req, res) => {

  User.register({ username: req.body.username }, req.body.password, (err, user) => {

    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secrets');
      });
    }

  });

});

app.post('/login', (req, res) => {

  const user = new User({

    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {

    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secrets');
      });
    }

  });

});


// LISTEN TO PORT
app.listen(3000, () => {

  console.log('Server has started on port 3000');

});
