const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradedItemSchema = new Schema({
    userEmail: String, // The email of the user who this belongs to
    type: { type: String, enum: ['test', 'quiz', 'project'] },
    priority: { type: Number, min: 0, max: 3, default: 1 }, // How important this assignment is
    dueDate: { type: Date, default: Date.now }, // When it is due. SHOULD NEVER FALL BACK TO DEFAULT
    courseName: String, // Corresponds to user courses
    title: { type: String, default: 'Graded Item' },
    description: { type: String }, // Long description of item
    links: { type: Array, default: [] }, // Optional link(s) to outside resources
});

module.exports = { name: 'GradedItem', schema: gradedItemSchema };