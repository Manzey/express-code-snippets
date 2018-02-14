var express = require('express');
var router = express.Router();

let Users = require("../models/Users");
let Snippets = require("../models/Snippets");

router.get('/', function(req, res) {
    res.render("authorization/login")
  })
  .post('/login', function(req, res, next) {
    req.session.userID = ""  
    Users.find({"username": req.body.username.toLowerCase()}).exec().then(function(user) {
        if (user === undefined || user.length == 0) {
            // If user does not exist, say so
            res.render('authorization/login', {loginError: 'User does not exist!'})
        } else if (req.body.password !== user[0].password) {
            // If password does not match
            res.render('authorization/login', {loginError: 'Password is wrong!'})
        } else {
            // If user exist and password match, login and create session.
            console.log(user[0]._id)
            req.session.userID = user[0]._id
            req.flash('SUCCESS', 'You are now logged in!', "/snippets")
        }
     })    
})

router.get('/register', function(req, res) {
    res.render("authorization/register.hbs")
  })
  .post('/register', async function(req, res, next) {
    // Check if username is taken.
    let userExists = true
    await Users.find({"username": req.body.username.toLowerCase()}).exec().then(function(user) {
        if (user === undefined || user.length == 0) {
            userExists = false
        }
     })
    // Validate input
    let password = req.body.password
    let confirmPass = req.body.confirmPass
    if (userExists) {
        // Username is taken.
        const manualRender = req.flash('ERROR', "Username is taken!", false)
        manualRender(function(error) {
            if (error) throw error
            res.render('authorization/register', {username: req.body.username});
          })        
    } else if (req.body.username.length < 5) {
        // Username is too short.
        const manualRender = req.flash('ERROR', "Username is too short!", false)
        manualRender(function(error) {
            if (error) throw error
            res.render('authorization/register', {username: req.body.username});
          })
    } else if (password !== confirmPass) {
        // If passwords do not match
        const manualRender = req.flash('ERROR', "Passwords do not match!", false)
        manualRender(function(error) {
            if (error) throw error
            res.render('authorization/register', {username: req.body.username});
          })
    } else if (password.length < 7) {
        // If password length is shorter than 7
        const manualRender = req.flash('ERROR', "Password is too short!", false)
        manualRender(function(error) {
            if (error) throw error
            res.render('authorization/register', {username: req.body.username});
          })
    } else {
        // Create the user.
        let user = new Users({
            username: req.body.username.toLowerCase(),
            password: req.body.password
        })
        user.save()
        req.flash('SUCCESS', 'You successfully registered your account!<br>Please login to proceed!', ".")	   
    }    
})

router.get('/snippets', function(req, res) {
    Snippets.find({}).exec().then(function(snippet) {
       res.render('snippets/viewSnipp', { snippets: snippet });
    })
    
})

router.get('/snippets:id', async function(req, res) {
    //res.send("This is the page where the snippet with the id = " + req.params.id)
    Snippets.find({"_id": req.params.id.replace(":", "")}).exec().then(async function(snippet) {
        //console.log(snippet)
        let ownSnippet = false
        await Users.find({"username": snippet[0].username.toLowerCase()}).exec().then(function(user) { 
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found        
            if (!(user === undefined || user.length == 0)) {
                if (req.session.userID + "" === user[0]._id + "") {
                    ownSnippet = true
                }
            }
           //console.log(ownSnippet)
         })         
        res.render('snippets/viewSpecificSnipp', { snippets: snippet, date: snippet[0].createdAt, owner: ownSnippet});
        //console.log("f" + ownSnippet)
     })
})

router.get('/snippets/create', function(req, res) {
    res.render("snippets/createSnipp");
})
.post('/snippets/create', async function(req, res) {
    let usernameUser = ""
    await Users.find({"_id": req.session.userID}).exec().then(function(user) {
        usernameUser = user[0].username.toLowerCase()
     })
     
    // If title are shorter than 5 letters, try again! (Whitespace are excluded)
    if (req.body.title.replace(/\s+/g, '').length < 5) {
        res.render('snippets/createSnipp', {snippet: req.body.snippet, createError: "Title is too short! (It must be longer than 5)!"});
    } else {
    let snippet = new Snippets({
        username: usernameUser,
        snippetTitle: req.body.title,
        snippet: req.body.snippet
    })
    snippet.save()  
    res.redirect('/snippets')
    }
})

router.post('/snippets/delete:id', function(req, res) {
    Snippets.find({"_id": req.params.id.replace(":", "")}).exec().then(async function(snippet) {
        //console.log(snippet)
        let ownSnippet = false
        await Users.find({"username": snippet[0].username}).exec().then(function(user) { 
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found        
            if (!(user === undefined || user.length == 0)) {
                if (req.session.userID + "" === user[0]._id + "") {
                    // Remove the snippet from the database.
                    Snippets.remove({"_id": req.params.id.replace(":", "")}).exec()
                    res.redirect('/snippets')
                } else {
                    // Prompt a flash message here
                    req.flash('ERROR', 'You do not have permissions to delete this!', '/snippets' + req.params.id)	
                }
            } 
           //console.log(ownSnippet)
         })       
     }) 
})

router.post('/snippets/update:id', function(req, res) {
    Snippets.find({"_id": req.params.id.replace(":", "")}).exec().then(async function(snippet) {
        let ownSnippet = false
        await Users.find({"username": snippet[0].username}).exec().then(function(user) {
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found        
            if (!(user === undefined || user.length == 0)) {
                // Add '+ ""' to turn it into a string.
                if (req.session.userID + "" === user[0]._id + "") {
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
                } else {
                    // Prompt a flash message here               
                    //res.redirect('/snippets' + req.params.id)
                    req.flash('ERROR', 'You do not have permissions to update this!', '/snippets' + req.params.id)	
                }
            } 
           //console.log(ownSnippet)
         })       
     }) 

     // Add a post and a template TODO
     router.get('snippets/logout', function(req, res) {
        req.session.userID = ""
        req.flash('SUCCESS', 'You are now logged out!', "./.")	
    })

    
})

module.exports = router;