var express = require('express');
var router = express.Router();

let Users = require("../models/Users");
let Snippets = require("../models/Snippets");

router.get('/', function(req, res) {
    res.render("authorization/login")
  })
  .post('/login', function(req, res, next) {
    Users.find({"username": req.body.username}).exec().then(function(user) {
        if (user === undefined || user.length == 0) {
            // If user does not exist, say so
            res.render('authorization/login', {loginError: 'User does not exist!'})
        } else if (req.body.password !== user[0].password) {
            // If password does not match
            res.render('authorization/login', {loginError: 'Password is wrong!'})
        } else {
            // If user exist and password match, login and create session.
            res.redirect('/snippets')
        }
     })    
})

router.get('/register', function(req, res) {
    res.render("authorization/register.hbs")
  })
  .post('/register', async function(req, res, next) {
    // Check if username is taken.
    let userExists = true
    await Users.find({"username": req.body.username}).exec().then(function(user) {
        if (user === undefined || user.length == 0) {
            userExists = false
        }
     })
    // Validate input
    let password = req.body.password
    let confirmPass = req.body.confirmPass
    if (userExists) {
        // Username is taken.
        res.render('authorization/register', {username: req.body.username, registerError: "Username is taken!"});
    } else if (req.body.username.length < 5) {
        // Username is too short.
        res.render('authorization/register', {username: req.body.username, registerError: "Username is too short!"});
    } else if (password !== confirmPass) {
        // If passwords do not match
        res.render('authorization/register', {username: req.body.username, registerError: "Passwords do not match!"});
    } else if (password.length < 7) {
        // If password length is shorter than 7
        res.render('authorization/register', {username: req.body.username, registerError: "Password is too short!"});
    } else {
        // Create the user.
        let user = new Users({
            username: req.body.username,
            password: req.body.password
        })
        user.save()   
        res.redirect('.') 
    }    
})

router.get('/snippets', function(req, res) {
    Snippets.find({}).exec().then(function(snippet) {
       res.render('snippets/viewSnipp', { snippets: snippet });
    })
    
})

router.get('/snippets:id', function(req, res) {
    //res.send("This is the page where the snippet with the id = " + req.params.id)
    Snippets.find({"_id": req.params.id.replace(":", "")}).exec().then(function(snippet) {
        res.render('snippets/viewSpecificSnipp', { snippets: snippet, date: snippet[0].createdAt });
        //console.log(snippet[0].createdAt)
     })
})

router.get('/snippets/create', function(req, res) {
    res.render("snippets/createSnipp");
})
.post('/snippets/create', function(req, res) {
    // If title are shorter than 5 letters, try again! (Whitespace are excluded)
    if (req.body.title.replace(/\s+/g, '').length < 5) {
        res.render('snippets/createSnipp', {snippet: req.body.snippet, createError: "Title is too short! (It must be longer than 5)!"});
    } else {
    let snippet = new Snippets({
        username: "manzey",
        snippetTitle: req.body.title,
        snippet: req.body.snippet
    })
    snippet.save()  
    res.redirect('/snippets')
    }
})

router.post('/snippets/delete:id', function(req, res) {
    // Remove the snippet from the database.
    Snippets.remove({"_id": req.params.id.replace(":", "")}).exec()
    res.redirect('/snippets')
})

router.post('/snippets/update:id', function(req, res) {
    // Update the snippet in the database.
    Snippets.update(
        {"_id": req.params.id},
        { $set: { "snippetTitle": req.body.title } }
      )
      .update(
        {"_id": req.params.id},
        { $set: { "snippet": req.body.snippet } }
      )
      .update(
        {"_id": req.params.id},
        { $set: { "updatedAt": Date.now() } }
      ).exec()   
    
    res.redirect('/snippets')    
})

module.exports = router;