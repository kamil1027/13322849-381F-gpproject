const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const User = require('./model/user');
const app = express()
const port = 3000

mongoose.connect('mongodb+srv://admin:123@cluster0.fdxxd0z.mongodb.net/gp')
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static("./public"));

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
    name: 'session',
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60000}
  }));

//Test DB connection
var db = mongoose.connection;
db.on('open', function (){
    console.log('MongoDB Connection Successed')});

db.on('error', function(){
    console.log('MongoDB Connection Error');
});

app.get('/', (req, res) => {
    if (req.headers.cookie && req.headers.cookie.includes('session')) {
        res.render('index-auth', req.query);
    } else {
        res.render('index', req.query);
    }
});

app.get('/product', (req, res) => {
    res.render('product', req.query);
})

app.get('/profile', (req, res) => {
    if (req.headers.cookie.includes('session')){
        res.render('profile', req.query);
    }
    else {
        res.redirect('/')
    }
})

//Login function & signin & signout
app.get('/login', (req, res) => {
    const loginFailed = req.query.loginFailed === 'true';
    res.render('login', { loginFailed });
  });
  
app.post('/login', function (req, res, next) {
    var postData = {
        username: req.body.username,
        password: req.body.password,
    };
  
    User.findOne({
        username: postData.username,
        password: postData.password,
    })
      .then(function (data) {
        if (data) {
            req.session.username = postData.username;
            res.render('index-auth', req.query);
        } else {
            const loginFailed = true;
            res.redirect(`/login?loginFailed=${loginFailed}`);
        }
      })
      .catch(function (err) {
            throw err;
      });
});

app.get('/signup', (req, res) => {
  const usernameExists = req.query.usernameExists === 'true';
  res.render('signup', { usernameExists });
});

app.post('/signup', function (req, res) {
  var postData = {
    username: req.body.username,
    password: req.body.password,
    age: req.body.age,
    area: req.body.area,
    email: req.body.email,
    phone: req.body.phone
  };

  User.findOne({ username: postData.username })
    .exec()
    .then((data) => {
        if (data) {
            const usernameExists = true;
            res.redirect(`/signup?usernameExists=${usernameExists}`);
        } else {
            User.create(postData)
            .then((data) => {
                console.log('Sign up Success');
                req.session.username = postData.username;
                res.render('index-auth', req.query);
            })
          .catch((err) => {
                throw err;
            });
        }
    })
    .catch((err) => {
        throw err;
    });
});

app.get('/signout', (req, res) => {
    req.session.destroy();
    res.clearCookie('session');
    res.redirect('/');
});

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log("Example app listening on port " + port)
})