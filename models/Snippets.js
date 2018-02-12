let mongoose = require("mongoose");
let moment = require("moment");

let snippetSchema = new mongoose.Schema({
    username: {
        type: String,
        required: "`{PATH}` is required!"
    },
    snippetTitle: {
        type: String,
        required: "`{PATH}` is required!"
    },
    snippet: {
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
let Snippets = mongoose.model("Snippets", snippetSchema);

// Export the model.
module.exports = Snippets;