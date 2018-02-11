let mongoose = require("mongoose");


// Create a schema, with customized error messages.
let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: "`{PATH}` is required!"
    },
    password: {
        type: String,
        required: "`{PATH}` is required!"
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: false,
    }
});

// Create a model using the schema.
let Users = mongoose.model("Users", userSchema);

// Export the model.
module.exports = Users;