let express = require('express')
let path = require('path')
let session = require('express-session')
let bodyParser = require('body-parser')
let router = require('./routes/index')
let exphbs = require('express-secure-handlebars')
let mongoose = require('./config/mongoose.js')
let flash = require('express-flash-notification')
let helmet = require('helmet')
let csp = require(`helmet-csp`)
let app = express()

/**
 * Opens a connection to the database.
 */
mongoose()

/**
 * Template engine configuration.
 * Using the secure version of handlebars with a XSS filter included and done automatically.
 */
app.engine('.hbs', exphbs({
  defaultLayout: 'default',
  extname: '.hbs',
  helpers: {
    ifvalue: function (conditional, options) {
      if (options.hash.value === conditional) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    }
  }

}))
app.set('view engine', '.hbs')

/**
 * Middlewares
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'stargate-secret-phrase-tealc-huehue',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12 // Cookie will survive for 12 hours.
  }
}))
// Helmet for setting security headers.
app.use(helmet())
// Set the CSP-header for security.
app.use(csp({
  directives: {
    defaultSrc: [`'self'`],
    imgSrc: [`'self'`, `imgur.com`]
  }
}))

app.use(flash(app))
app.use('/', router)

app.use(function (req, res, next) {
  res.status(404).send("Sorry, that item can't be found!")
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Sorry, something is broken!')
})

app.listen(8000, function () {
  console.log('App listening on port 8000!')
})
