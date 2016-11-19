const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
    type: { type: String, enum: ['Grammar School', 'Middle School', 'High School'], default: 'High School' },
    name: { type: String, trim: true },
    description: String,
    website: String
});

module.exports = { name: 'School', schema: schoolSchema };