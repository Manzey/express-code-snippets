let mongoose = require('mongoose')
const CONNECTION_STRING = 'mongodb://manzey:sUpErS3cR3tP4ssW0rd132@ds229448.mlab.com:29448/manzey'

module.exports = function () {

  mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open.')
  })

  mongoose.connection.on('error', function (err) {
    console.error('Mongoose connection error: ', err)
  })

  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected.')
  })

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose connection disconnected through app termination.')
      process.exit(0)
    })
  })

  return mongoose.connect(CONNECTION_STRING)
}
