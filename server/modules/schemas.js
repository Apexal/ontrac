const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SCHEMA NAMES MUST BE IN PascalCase
module.exports = {
    TestItem: {
        id: Number,
        title: String
    }
};