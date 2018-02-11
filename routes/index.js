var express = require('express');
var router = express.Router();

let Users = require("../models/Users");

router.get('/', function(req, res) {
    res.render("authorization/login.hbs")
    //res.send('Login page');
  })
  .post('/login', function(req, res, next) {
    /*let user = new Users({
        username: req.body.username,
        password: req.body.password
    })
    user.save()
    */
    console.log(req.body)
    res.redirect('/snippets')
    
})

router.get('/register', function(req, res) {
    res.render("authorization/register.hbs")
  })
  .post('/register', function(req, res, next) {
    if (req.body.password === req.body.confirmPass) {
        let user = new Users({
            username: req.body.username,
            password: req.body.password
        })
        user.save()   
        res.redirect('/snippets') 
    } else {
        res.render('authorization/register', {username: req.body.username, registerError: "Passwords do not match!"});
    }

    
})

router.get('/snippets', function(req, res) {
    res.send("This is where you can view code snippets")
})

router.get('/snippets:id', function(req, res) {
    res.send("This is the page where the snippet with the id = " + req.params.id)
})

router.get('/snippets/create', function(req, res) {
    res.render("home/form.hbs");
})
.post('/snippets/create', function(req, res) {
    res.redirect('/snippets')
})

module.exports = router;