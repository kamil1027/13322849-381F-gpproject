const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./model/user");
const Product = require("./model/product");
const History = require("./model/history");
const multer = require("multer");
const randomstring = require("randomstring");
const app = express();
const port = 3000;

//Settings-1
mongoose.connect("mongodb+srv://admin:123@cluster0.fdxxd0z.mongodb.net/gp");
app.set("view engine", "ejs");
app.set("views", "./views");

//Settings-2
app.use(express.static("./public"));
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    name: "session",
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
  })
);

//Middleware
const loadUserDataMiddleware = (req, res, next) => {
  if (req.headers.cookie && req.headers.cookie.includes("session")) {
    const loggedInUsername = req.session.username;
    if (loggedInUsername) {
      User.findOne({ username: loggedInUsername })
        .then((user) => {
          if (user && user.icon) {
            const username = user.username;
            const base64icon = user.icon.data.toString("base64");
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

const cartMiddleware = (req, res, next) => {
  res.locals.cart = req.session.cart || [];

  const totalPrice = res.locals.cart.reduce((total, product) => {
    return total + product.price;
  }, 0);
  res.locals.totalPrice = totalPrice;
  next();
};

app.use(cartMiddleware);
app.use(loadUserDataMiddleware);

//function
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG images are allowed"));
    }
  },
});

function getProductById(productId) {
  return Product.findById(productId).exec();
}

//Test DB connection
var db = mongoose.connection;
db.on("open", function () {
  console.log("MongoDB Connection Successed");
});

db.on("error", function () {
  console.log("MongoDB Connection Error");
});

app.get("/", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const username = req.user.username;
    const base64icon = req.user.base64icon;
    res.render("index", { username, base64icon });
  } else {
    const username = null;
    const base64icon = null;
    res.render("index", { username, base64icon });
  }
});

app.get("/product", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const username = req.user.username;
    const base64icon = req.user.base64icon;
    Product.find()
      .then((products) => {
        if (products.length > 0) {
          const productData = products.map((product) => ({
            id: product._id,
            name: product.name,
            price: product.price,
            inventory: product.inventory,
            information: product.information,
            like: product.like,
            image: product.image,
          }));
          res.render("product", {
            products: productData,
            username,
            base64icon,
            query: req.query,
          });
        } else {
          console.log("No products found");
          res.render("product", {
            products: [],
            username,
            base64icon,
            query: req.query,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    const username = null;
    const base64icon = null;

    Product.find()
      .then((products) => {
        if (products.length > 0) {
          const productData = products.map((product) => ({
            id: product._id,
            name: product.name,
            price: product.price,
            inventory: product.inventory,
            information: product.information,
            like: product.like,
            image: product.image,
          }));
          res.render("product", {
            products: productData,
            username,
            base64icon,
            query: req.query,
          });
        } else {
          console.log("No products found");
          res.render("product", {
            products: [],
            username,
            base64icon,
            query: req.query,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  }
});

app.get("/product/:id", (req, res) => {
  const productId = req.params.id;

  if (req.user && req.user.username && req.user.base64icon) {
    const username = req.user.username;
    const base64icon = req.user.base64icon;

    // Assuming you have a function to retrieve product information by ID
    getProductById(productId)
      .then((product) => {
        if (product) {
          res.render("info", { username, base64icon, product });
        } else {
          console.log("Product not found");
          res.render("info", { username, base64icon, product: null });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    const username = null;
    const base64icon = null;
    getProductById(productId)
      .then((product) => {
        if (product) {
          res.render("info", { username, base64icon, product });
        } else {
          console.log("Product not found");
          res.render("info", { username, base64icon, product: null });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  }
});

app.get("/checkout", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const username = req.user.username;
    const base64icon = req.user.base64icon;
    if (req.session.cart) {
      res.render("checkout", { username, base64icon });
    } else {
      res.redirect("index", { username, base64icon });
    }
  } else {
    const username = null;
    const base64icon = null;
    if (req.session.cart) {
      res.render("checkout", { username, base64icon });
    } else {
      res.redirect("index", { username, base64icon });
    }
  }
});

app.post("/add_cart/:pid", (req, res) => {
  const productId = req.params.pid;

  Product.findById(productId, "name price inventory image")
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).send("Product not found.");
      }
      req.session.cart = req.session.cart || [];
      req.session.cart.push({
        id: product._id,
        name: product.name,
        price: product.price,
        inventory: product.inventory,
        image: product.image,
      });
      res.redirect("/product");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving product from the database.");
    });
});

app.post("/clear_cart", (req, res) => {
  if (req.session.cart) {
    req.session.cart = null;
    res.redirect("/product");
  } else {
    res.redirect("/product");
  }
});

app.get("/payment", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const username = req.user.username;
    const base64icon = req.user.base64icon;
    if (req.session.cart) {
      res.render("payment", { username, base64icon });
    } else {
      res.redirect("index", { username, base64icon });
    }
  } else {
    const username = null;
    const base64icon = null;
    if (req.session.cart) {
      res.render("payment", { username, base64icon });
    } else {
      res.redirect("index", { username, base64icon });
    }
  }
});

app.post("/create_order", async (req, res) => {
  if (req.session.cart) {
    if (req.user && req.user.username && req.user.base64icon) {
      try {
        const postdata=null
        const username = req.user.username;
        const base64icon = req.user.base64icon;
        const cart = req.session.cart.map(product => product.name);
        const historydata = {
          username: username,
          cart: cart
        };
        History.create(historydata)
          .then((data) => {
          })
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        req.session.cart==null;
        res.render("complete_order", { username, base64icon, historydata, date: formattedDate, postdata});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Fail to update record to database");
      }
    } else {
      const randomusername = randomstring.generate({
        length: 12,
      });
      const randompassword = randomstring.generate({
        length: 8,
        charset: 'alphabetic'
      });
      postdata = {
        username: "Guest" + randomusername,
        password: randompassword
      };
      User.create(postdata)
        .then((data) => {
          req.session.username = postdata.username;
          try {
            const username = req.user ? req.user.username : postdata.username;
            const base64icon = req.user ? req.user.base64icon : null;
            const cart = req.session.cart.map(product => product.name);
            const historydata = {
              username: username,
              cart: cart
            };
            History.create(historydata)
              .then((data) => {
                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                req.session.cart = null;
                res.render("complete_order", {
                  username,
                  base64icon,
                  historydata,
                  date: formattedDate,
                  postdata
                });
              })
              .catch((error) => {
                console.error("Error:", error);
                res.status(500).send("Failed to update record to database");
              });
          } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Failed to update record to database");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          res.status(500).send("Failed to create user");
        });
    }
  }
  else {
    console.log('No cart items')
    res.redirect('/')
  }
});

//Profile page
app.get("/profile", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const loggedInUsername = req.session.username;

    User.findOne({ username: loggedInUsername })
      .then((user) => {
        if (user) {
          const username = user.username;
          const age = user.age;
          const email = user.email;
          const phone = user.phone;
          const area = user.area;
          const createdAtUser = user.createdAt;
          const icon = user.icon;
          const base64icon = icon.data.toString("base64");

          History.find({ username: loggedInUsername })
            .exec()
            .then((histories) => {
              if (histories && histories.length > 0) {
                const history_cart = histories.map((history) => history.cart);
                const createdAt = histories.map((history) => history.createdAt);
                const cart_id = histories.map((history) => history._id);

                res.render("profile", {
                  username,
                  age,
                  email,
                  phone,
                  area,
                  createdAtUser,
                  base64icon,
                  history_cart,
                  createdAt,
                  cart_id,
                  query: req.query,
                });
              } else {
                console.log("No history found for username:", loggedInUsername);
                res.render("profile", {
                  username,
                  age,
                  email,
                  phone,
                  area,
                  createdAtUser,
                  base64icon,
                  history_cart: [],
                  createdAt: [],
                  cart_id: [], // Ensure cart_id is defined even when there is no history
                  query: req.query,
                });
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send("Internal Server Error");
            });
        } else {
          console.log("User not found");
          const cart_id = []; // Define cart_id here

          res.render("profile", {
            username: null,
            age: null,
            email: null,
            phone: null,
            area: null,
            createdAtUser: null,
            base64icon: null,
            history_cart: null,
            createdAt: null,
            cart_id,
            query: req.query,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.redirect("/");
  }
});

app.post('/delete_order/:id', (req, res) => {
  const orderId = req.params.id; // Access the order ID from the route parameter

  History.deleteOne({ _id: orderId }) // Assuming the order ID is stored in the "_id" field
    .then(() => {
      console.log(orderId + " has been deleted");
      res.redirect('/profile');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error deleting order');
    });
});

app.get("/updateprofile", (req,res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const usernameExists = req.query.usernameExists === "true";
    res.render("updateprofile", { usernameExists })
  }
  else {
    res.redirect('/')
  }
})

app.post("/api/updateprofile", (req, res) => {
  if (req.user && req.user.username && req.user.base64icon) {
    const loggedInUsername = req.user.username;

    User.findOne({ username: loggedInUsername })
      .then((user) => {
        if (user) {
          // Update the user record with the form data
          user.username = req.body.username;
          user.password = req.body.password;
          user.age = req.body.age;
          user.area = req.body.area;
          user.email = req.body.email;
          user.phone = req.body.phone;

          user.save()
            .then(() => {
              res.redirect('/');
            })
            .catch((error) => {
              res.redirect('/');
            });
        } else {
          res.redirect('/error');
        }
      })
      .catch((error) => {
        res.redirect('/error');
      });
  } else {
    res.redirect('/');
  }
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded");
    return;
  }
  const icon = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };

  // Update the user's icon
  User.findOneAndUpdate(
    { username: req.session.username },
    { icon },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.redirect("/profile");
      } else {
        console.log("User not found");
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//Login function & signin & signout
app.get("/login", (req, res) => {
  const loginFailed = req.query.loginFailed === "true";
  res.render("login", { loginFailed });
});

app.post("/login", function (req, res, next) {
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
        res.redirect("/");
      } else {
        const loginFailed = true;
        res.redirect(`/login?loginFailed=${loginFailed}`);
      }
    })
    .catch(function (err) {
      throw err;
    });
});

app.get("/signup", (req, res) => {
  const usernameExists = req.query.usernameExists === "true";
  res.render("signup", { usernameExists });
});

app.post("/signup", function (req, res) {
  var postData = {
    username: req.body.username,
    password: req.body.password,
    age: req.body.age,
    area: req.body.area,
    email: req.body.email,
    phone: req.body.phone,
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
            console.log("Sign up Success");
            req.session.username = postData.username;
            res.render("index-auth", req.query);
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

app.get("/signout", (req, res) => {
  req.session.destroy();
  res.clearCookie("session");
  res.redirect("/");
});

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log("Example app listening on port " + port);
});
