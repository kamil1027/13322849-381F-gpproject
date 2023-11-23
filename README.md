Online shop system

Group: 86
Name: 
Hung Kam Fung (13322849)

Application link: https://three81f-gp.onrender.com

********************************************
# Mongo collection
*User*
{
	"username": string,
  	"password": string,
	"email": string,
	"age": string,
	"phone": string,
	"area": string,
  	"icon": "base64 png", (default having the png)
	"createAt" date
}

*history*
{
	"username": string,
	"cart": [string],
	"createdAt": date
}

*product*
{
	"name": string,
	"inventory": string,
	"price": int,
	"like": int,
	"image": "base64 png",
	"createdAt": date
}

*comment*
{
	"product": id ref from product_id,
	"username": string,
	"comment": string,
	"createdAt": date,
}

********************************************
# Middleware
1. loadUserDataMiddleware
Used for login
If header contains session{
	If find the user data from user collection base on req.session.username{
		return username, base64icon
	}
	else{
		req.user=null
	}
}
else{
	req.user=null
}

2. cartMiddleware
Pre-loading req.session.cart and total price of each req.session.cart.price, since req.session.cart is the array.
Cart ["string", "string", "string"...]

********************************************
# Login

**Login flow**

1. Click login in index page
- redirect to login page

2. Click login in login page
- redirect to index page
- Find the postData (username and password) in mongo db
If postData = mongodb data {
	login success
}
else {
	fail, show alert "Login failed. Please try again." and resubmit again
}

- save the session (req.session.username) to user browsers
- login and sign in is changed to the icon, username and a dropdown which contains profile and sign out.

testing user
username: admin
password: 123

********************************************
# Logout
In the home page, each user can log out their account by clicking Sign out.
It would clear the session (req.session.username) to null

********************************************
# CRUD service
- Create
In the shop, there are three create flow which are
- create-order-flow
- Signup flow
- comment

**Register user flow**
1. Click sign up
- Fill in all of the information, make sure the username would no duplicate
- If it is duplicate username, then it would fail, then re-fill in and re-submit the data again

After sign up, it would store the session (req.session.username) to client browsers (Auto login) and create the records to Mongose database

Redirecting to the index page, login and sign in is changed to the icon, username and a dropdown which contains profile and sign out.

User data in mongo
{
	"username": "admin",
  	"password": "123",
  	"icon": "base64 png", (default having the png)
	"createAt" date
}

**Create order flow**
- Whatever you login or not, it can also create order, therefore it has 2 flows for create order function

*Login user*
1. Click product page
- There are product page and other information would mention in read part.

2. Click Add cart
- add cart has the value of the product item, and it would store the information of the product as a session in user browsers.
- At the upper right corner, the cart is updated and it would show the information of the clicking product after clicking the cart.
- There are two button which are clear cart and checkout
clear cart would set the cart session data(req.session.cart) to null

3. Click checkout
- checkout page, would detailly metion in read part

4. Click Check-out
- It can just click PAY NOW, no function in here, just UI

5. Click PAY NOW
- Render to create-order page, showing the name of the product and the order time and username.
- complete the order flow, the cart session (req.session.username) would set to null.
(Need to click other page, this is the bug, btw i don't know how to fix QoQ
Had try setting await)
Create order {
	username = req.session.username
	username = req.session.base64icon
	cart = [req.session.cart] (For each)
}

*Non-login user*
- Monstly same as the login user, the difference is the last step

1. Click product page
2. Click Add cart
3. Click checkout
4. Click Check-out

5. Click PAY NOW
- Render to create-order page, auto generate a user account to the customer and showing the user account, order date and product info.

User account (Only username and password) {
	username: Guset + 8 string with random A-Z and int0-9 
    randompassword = 8 string with random A-Z
}
It could be changed after, would mention in update part.

- complete the order flow, the cart session (req.session.cart) would set to null and auto login the account (save the req.session.username to user browser)

Create order {
	username = Guset + 8 string with random A-Z and int0-9
	username = randompassword = 8 string with random A-Z
	cart = [req.session.cart] (For each)
}

**Comment**
1. Login account
- Only login user can login, if no login, it would show 
"If you would like to comment here, Please login first."

2. Click product

3. View more
- showing the data of the information... would mention in read part

4. Leave a comment in the comment button

5. Post NOW
- Would create a comment data in comment collection
- Redirect back to product/:id page
Should see the comment data

********************************************
# CRUD service

**Product page**
Product page has two page which read data from Mongodb with following data
{
	"name": string,
	"inventory": string,
	"price": int,
	"like": int,
	"image": "base64 png",
}

1. Click product page
- Showing all of the product with following data from mongodb
- Pagination function
--> if the product obejct more than 12, it would display 2 page
- Please test it, i had created 14 items for this function.

2. Click View more base on the _id from product model
- finding the data in product collection, and showing the specify product data base on the _id from view mroe button of the last page.
- finding the data in comment collection, and showing all comment data
Logic of comment
if have comment{
	show all comment
}
else {
	Show the text with no comments
}

Login logic of comment
if login (req.session.username){
	show comment textbox and POST NOW button
}
else{
	show text "If you would like to comment here, Please login first."
}

- Please test it in Monitor product, i had created 6 comments for this function or kept creating more and more comments for pagination

**Profile Page**
1. Login
2. Click Profile from the upper right corner
- Find the data of the user with following data from the User collection of mongodb
{
	"username": string,
  	"password": string,
	"email": string,
	"age": string,
	"phone": string,
	"area": string,
  	"icon": "base64 png", (default having the png)
	"createAt" date
}

- Find the data of the user order history with following data from the History collection of mongodb
{
	"username": string,
	"cart": [string],
	"createdAt": date
}

Login of the order history 
If have order{
	show all of the order history and a delete order button with value (_id of the order, would metion in delete part)
}
else{
	show the text "No items bought in history."
}

- Show the below data in profile page

********************************************
# CRUD service

**Profile Page**
1. Login
2. Click Profile from the upper right corner
Two update flow are here

- Upload Icon flow
--> Choosing a Image file (PNG / JPG) and click upload
--> Server would trafer the image file to Base64
--> Update icon field from the user collection of mongodb base on username (req.session.username)

update profile flow
--> Click update
--> redirect to the updateprofile page (Same as the signup page UI)
-->Update all data unless icon from the user collection of mongodb base on username (req.session.username)

********************************************
# CRUD service
Two delete flow would use in two pages which are
- Profile page
- Product-Info page
(Need to finish the order flow or comment before delete flow)

**Profile Page**
- Login
- Click Profile from the upper right corner
In the upper, there is all order history data.
In the left side of the date, there is the delete order button with _id of order.

- Click delete order button
Delete the order history button base on the _id from history collection of mongodb

**Product-Info page**
- Click / Enter product
- Click View more
There are the delete button under the comment
The delete button contains the _id of comment value

- Click the delete button
Delete the delete button base on the _id from comment collection of mongodb

********************************************
# Restful
In this project, there are one HTTP request, get because restful API is not neccessary for my website.

**Product-info page**
1. Get
	Get request is used for finding the product
	Path URL: /product/:id
	Test: "curl -X GET http://localhost:3000/product/65433bcccf5fc604666277a9"
