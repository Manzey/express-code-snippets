let mongoose = require("mongoose");
// sUpErS3cR3tP4ssW0rd132
const CONNECTION_STRING = 'mongodb://manzey:sUpErS3cR3tP4ssW0rd132@ds229448.mlab.com:29448/manzey'

module.exports =  async function() {
    let db = await mongoose.connect(CONNECTION_STRING);

    db.connection.on("connected", function() {
        console.log("Mongoose connection open.");
    });

    db.connection.on("error", function(err) {
        console.error("Mongoose connection error: ", err);
    });

    db.connection.on("disconnected", function() {
        console.log("Mongoose connection disconnected.");
    });

    process.on("SIGINT", function() {
        db.connection.close(function() {
            console.log("Mongoose connection disconnected through app termination.");
            process.exit(0);
        });
    });

    return db;
};