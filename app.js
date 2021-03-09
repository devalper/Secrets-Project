// REQUIRING OUR DEPENDENCIES
const express = require('express');
const ejs = require('ejs');

// DECLARING OUR EXPRESS APP
const app = express();

// SETTING EJS
app.set('view engine', 'ejs');

// SETTING BODY-PARSER
app.use(express.urlencoded({ extended: true }));

// SETTING OUR STATIC FOLDER
app.use(express.static('public'));




// LISTEN TO PORT
app.listen(3000, () => {

    console.log('Server has started on port 3000');
  
  });