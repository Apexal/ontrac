const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, trim: true, index: true },
    grade: { type: Number, enum: [9, 10, 11, 12], default: 9 },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    nickname: { type: String, trim: true },
    school: [{ type: Schema.ObjectId, ref: 'School' }],
    bio: { type: String, trim: true },
    registered_date: { type: Date, default: Date.now },
    preferences: Object,
    /* 
        0 - Active
        1 - Locked
        2 - Disabled
    */
    account_status: { type: Number, default: 0 },
    set_up: { type: Boolean, default: false }
});

// Instance methods
userSchema.methods.findSchoolmates = (cb) => {
    return this.model('User').find({ school: this.school }, cb);
};

userSchema.virtual('fullName').get(() => { 
    return this.firstName + ' ' + this.lastName;
 });

module.exports = { name: 'User', schema: userSchema };