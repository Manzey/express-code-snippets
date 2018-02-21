let express = require('express')
let router = express.Router()
let passwordHash = require('password-hash')

let Users = require('../models/Users')
let Snippets = require('../models/Snippets')

/**
 * First page handling, along with logging in.
 * Using hash to verify if password is correct.
 */
router.get('/', function (req, res) {
  res.render('authorization/login')
})
  .post('/login', function (req, res, next) {
    Users.find({'username': req.body.username.toLowerCase()}).exec().then(function (user) {
      if (user === undefined || user.length === 0) {
            // If user does not exist, say so
        const manualRender = req.flash('ERROR', 'User does not exist!', false)
        manualRender(function (error) {
          if (error) throw error
          res.render('authorization/login')
        })
      } else if (!(passwordHash.verify(req.body.password, user[0].password))) {
            // If password does not match
        const manualRender = req.flash('ERROR', 'Password is wrong!', false)
        manualRender(function (error) {
          if (error) throw error
          res.render('authorization/login')
        })
      } else {
            // If user exist and password match, login and create session.
        req.session.userID = user[0]._id
        req.flash('SUCCESS', 'You are now logged in!', '/snippets')
      }
    })
  })
/**
 * Handling for logout, setting the sessions userID to null which means you're logged out.
 * Before logging out, you're prompted with a confirmation box. (Yes/no)
 */
router.get('/logout', function (req, res) {
  res.render('authorization/logout')
})
    .post('/logout', function (req, res) {
      req.session.userID = null
      req.flash('SUCCESS', 'You are now logged out!', '.')
    })

/**
 * Registration handling - upon getting, you're prompted with a form.
 * When posting, check if user exists and if password meets criteria, then create the user in the database.
 */
router.get('/register', function (req, res) {
  res.render('authorization/register.hbs')
})
  .post('/register', async function (req, res, next) {
    // Check if username is taken.
    let userExists = true
    await Users.find({'username': req.body.username.toLowerCase()}).exec().then(function (user) {
      if (user === undefined || user.length === 0) {
        userExists = false
      }
    })
    // Validate input
    let password = req.body.password
    let confirmPass = req.body.confirmPass
    if (userExists) {
        // Username is taken.
      const manualRender = req.flash('ERROR', 'Username is taken!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('authorization/register', {username: req.body.username})
      })
    } else if (req.body.username.length < 5) {
        // Username is too short.
      const manualRender = req.flash('ERROR', 'Username is too short!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('authorization/register', {username: req.body.username})
      })
    } else if (!req.body.username.match(/^[0-9a-z]+$/)) {
              // Username contains non-alphanumberic characters.
      const manualRender = req.flash('ERROR', 'Username contains non-alphanumberic characters!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('authorization/register', {username: req.body.username})
      })
    } else if (password !== confirmPass) {
        // If passwords do not match
      const manualRender = req.flash('ERROR', 'Passwords do not match!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('authorization/register', {username: req.body.username})
      })
    } else if (password.length < 7) {
        // If password length is shorter than 7
      const manualRender = req.flash('ERROR', 'Password is too short!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('authorization/register', {username: req.body.username})
      })
    } else {
        // Create the user.
      let user = new Users({
        username: req.body.username.toLowerCase(),
        password: passwordHash.generate(req.body.password)
      })
      user.save()
      req.flash('SUCCESS', 'You successfully registered your account!<br>Please login to proceed!', '.')
    }
  })

/**
 * Check if user is logged in or not, then render the template.
 */
router.get('/snippets', function (req, res) {
  let logged
  if (req.session.userID === undefined || req.session.userID === null) {
    logged = false
  } else {
    logged = true
  }

  Snippets.find({}).exec().then(function (snippet) {
    res.render('snippets/viewSnipp', { snippets: snippet, loggedIn: logged })
  })
})

/**
 * Handling of viewing a specific snippet.
 * If the user owns the snippet, show the delete and update-button. If not only show the back.
 */
router.get('/snippets:id', async function (req, res) {
  let ownSnippet = false
  Snippets.find({'_id': req.params.id.replace(':', '')}).exec().then(async function (snippet) {
    await Users.find({'username': snippet[0].username.toLowerCase()}).exec().then(function (user) {
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found
      if (!(user === undefined || user.length === 0)) {
        if (req.session.userID + '' === user[0]._id + '') {
          ownSnippet = true
        }
      }
    })
    res.render('snippets/viewSpecificSnipp', {snippet: snippet[0], owner: ownSnippet})
  })
})

/**
 * Create snippets - render a form with a title and a textarea. Submit-button will check if
 * session is logged in. If it is, create a snippet.
 */
router.get('/snippets/create', function (req, res) {
  res.render('snippets/createSnipp')
})
.post('/snippets/create', async function (req, res) {
  if (!(req.session.userID === undefined || req.session.userID === null)) {
    let usernameUser = ''
    await Users.find({'_id': req.session.userID}).exec().then(function (user) {
      usernameUser = user[0].username.toLowerCase()
    })

        // If title are shorter than 5 letters, try again! (Whitespace are excluded)
    if (req.body.title.replace(/\s+/g, '').length < 5) {
              // Username is too short.
      const manualRender = req.flash('ERROR', 'Title is too short! (It must be longer than 5)!', false)
      manualRender(function (error) {
        if (error) throw error
        res.render('snippets/createSnipp', {snippet: req.body.snippet})
      })
    } else {
      let snippet = new Snippets({
        username: usernameUser,
        snippetTitle: req.body.title,
        snippet: req.body.snippet
      })
      snippet.save()
      req.flash('SUCCESS', 'You successfully created a snippet!', '/snippets')
    }
  } else {
    res.status(403).send("Sorry, you're not authorized to do that!")
  }
})

/**
 * Handling of deletion of snippets. If a post is made it will check if the logged in user on the session owns the snippet.
 * If it does, delete it.
 */
router.post('/snippets/delete:id', function (req, res) {
  Snippets.find({'_id': req.params.id.replace(':', '')}).exec().then(async function (snippet) {
    await Users.find({'username': snippet[0].username}).exec().then(function (user) {
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found
      if (!(user === undefined || user.length === 0)) {
        if (req.session.userID + '' === user[0]._id + '') {
          Snippets.remove({'_id': req.params.id.replace(':', '')}).exec()
          req.flash('SUCCESS', 'You successfully deleted the snippet!', '/snippets')
        } else {
          res.status(403).send("Sorry, you're not authorized to do that!")
        }
      }
    })
  })
})

/**
 * Handling of updating a snippet. Confirm ownership and then update it with its new values.
 */
router.post('/snippets/update:id', function (req, res) {
  Snippets.find({'_id': req.params.id.replace(':', '')}).exec().then(async function (snippet) {
    await Users.find({'username': snippet[0].username}).exec().then(function (user) {
            // If session.userID equals the creators ID - he is the owner of the snippet - first check if user was found
      if (!(user === undefined || user.length === 0)) {
                // Add '+ ""' to turn it into a string.
        if (req.session.userID + '' === user[0]._id + '') {
                    // Update the snippet in the database.
          Snippets.update(
                        {'_id': req.params.id},
                        { $set: { 'snippetTitle': req.body.title } }
                    )
                    .update(
                        {'_id': req.params.id},
                        { $set: { 'snippet': req.body.snippet } }
                    )
                    .update(
                        {'_id': req.params.id},
                        { $set: { 'updatedAt': Date.now() } }
                    ).exec()

          req.flash('SUCCESS', 'You successfully updated the snippet!', '/snippets')
        } else {
          res.status(403).send("Sorry, you're not authorized to do that!")
        }
      }
    })
  })
})

module.exports = router
