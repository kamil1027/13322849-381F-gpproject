const express = require('express')
const app = express()
const port = 3000

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index-auth', req.query);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})