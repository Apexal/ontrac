const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
    type: { type: String, enum: ['Grammar School', 'Middle School', 'High School'], default: 'High School' },
    name: { type: String, trim: true },
    address: String,
    imageUrl: String,
    description: String,
    website: String,
    scheduleAvailable: { type: Boolean, default: false },
    links: [{
        iconName: { type: String, default: 'link' },
        title: String,
        url: String
     }]
});

module.exports = { name: 'School', schema: schoolSchema };