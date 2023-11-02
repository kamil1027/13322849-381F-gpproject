const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const User = require('./model/user');
const Product = require('./model/product')
const multer = require('multer');
const app = express()
const port = 3000

//Settings-1
mongoose.connect('mongodb+srv://admin:123@cluster0.fdxxd0z.mongodb.net/gp')
app.set('view engine', 'ejs');
app.set('views', './views');

//Settings-2
app.use(express.static("./public"));
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
    name: 'session',
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000
    }
  }));

//Middleware
const loadUserDataMiddleware = (req, res, next) => {
    if (req.headers.cookie && req.headers.cookie.includes('session')) {
      const loggedInUsername = req.session.username;
      if (loggedInUsername) {
        User.findOne({ username: loggedInUsername })
          .then((user) => {
            if (user && user.icon) {
              const username = user.username;
              const base64icon = user.icon.data.toString('base64');
              req.user = { username, base64icon }; // Attach user data to the request object
            } else {
              req.user = null;
            }
            next();
          })
          .catch((err) => {
            console.error(err);
            next(err);
          });
      } else {
        req.user = null;
        next();
      }
    } else {
      req.user = null;
      next();
    }
  };

app.use(loadUserDataMiddleware);
  
//Upload function
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(new Error('Only PNG images are allowed'));
      }
    },
  });

//Test DB connection
var db = mongoose.connection;
db.on('open', function (){
    console.log('MongoDB Connection Successed')});

db.on('error', function(){
    console.log('MongoDB Connection Error');
});

app.get('/', (req, res) => {
    if (req.user && req.user.username && req.user.base64icon) {
        const username = req.user.username;
        const base64icon = req.user.base64icon;
        res.render('index', { username, base64icon });
    } else {
        const username = null;
        const base64icon = null;
        res.render('index', { username, base64icon });
    }
  });

  app.get('/product', (req, res) => {
    if (req.user && req.user.username && req.user.base64icon) {
      const username = req.user.username;
      const base64icon = req.user.base64icon;
      Product.findOne()
        .then((product) => {
          if (product) {
            const name = product.name;
            const price = product.price;
            const inventory = product.inventory;
            const information = product.information;
            const like = product.Like; // Typo corrected to product.like
            console.log(product);
            res.render('product', { name, price, inventory, information, like, username, base64icon, query: req.query });
          } else {
            console.log('Product not found');
            res.render('product', { name: null, price: null, inventory: null, information: null, like: null, username, base64icon, query: req.query });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Internal Server Error');
        });
    } else {
      const username = null;
      const base64icon = null;
      Product.findOne()
        .then((product) => {
          if (product) {
            const name = product.name;
            const price = product.price;
            const inventory = product.inventory;
            const information = product.information;
            const like = product.like;
            const image = product.image;
            res.render('product', { name, price, inventory, information, like, image, username, base64icon, query: req.query });
          } else {
            console.log('Product not found');
            res.render('product', { name: null, price: null, inventory: null, information: null, like: null, image: null, username, base64icon, query: req.query });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Internal Server Error');
        });
    }
  });

//Profile page
app.get('/profile', (req, res) => {
    if (req.headers.cookie && req.headers.cookie.includes('session')) {
        const loggedInUsername = req.session.username;

        User.findOne({ username: loggedInUsername })
            .then((user) => {
                if (user) {
                    const username = user.username;
                    const age = user.age;
                    const email = user.email;
                    const phone = user.phone;
                    const area = user.area;
                    const createdAt = user.createdAt;
                    const icon = user.icon;
                    const base64icon = icon.data.toString('base64');
                    res.render('profile', { username, age, email, phone, area, createdAt, base64icon, query: req.query });
                } else {
                    console.log('User not found');
                    res.render('profile', { username: null, age: null, email: null, phone: null, area: null, createdAt: null, base64icon: null, query: req.query });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    } else {
        res.redirect('/');
    }
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No file uploaded');
      return;
    }
  
    const icon = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  
    // Update the user's icon in the database
    User.findOneAndUpdate(
      { username: req.session.username },
      { icon },
      { new: true }
    )
      .then((user) => {
        if (user) {
          res.redirect('/profile');
        } else {
          console.log('User not found');
          res.status(404).send('User not found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Internal Server Error');
      });
  });

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
            res.redirect('/')
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