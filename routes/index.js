var express = require('express');
var router = express.Router();

let Users = require("../models/Users");
let Snippets = require("../models/Snippets");

router.get('/', function(req, res) {
    res.render("authorization/login.hbs")
  })
  .post('/login', function(req, res, next) {
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
    let snippet = new Snippets({
        username: "manzey",
        snippetTitle: req.body.title,
        snippet: req.body.snippet
    })
    snippet.save()  
    res.redirect('/snippets')
})

router.post('/snippets/delete:id', function(req, res) {
    //console.log(req.params.id)
    Snippets.remove({"_id": req.params.id.replace(":", "")}).exec()
    res.redirect('/snippets')
})

router.post('/snippets/update:id', function(req, res) {
    console.log(req.params.id)

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