const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    userEmail: String, // The email of the user who this belongs to
    priority: { type: Number, min: 0, max: 3, default: 1 }, // How important this assignment is
    dueDate: { type: Date, default: Date.now }, // When it is due. SHOULD NEVER FALL BACK TO DEFAULT
    courseName: String, // Corresponds to user courses
    description: { type: String, default: 'Do something!' }, // The actual assignment
    link: String, // Optional link to outside resource
    completed: { type: Boolean, default: false } // Whether or not it was completed yet
});

module.exports = { name: 'Assignment', schema: assignmentSchema };