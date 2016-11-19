const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { type: Number },
    email: { type: String, trim: true, unique: true },
    grade: { type: Number, enum: [9, 10, 11, 12], default: 9 },
    name: {
        first: { type: String, trim: true },
        last: { type: String, trim: true },
        nickname: { type: String, trim: true },
    },
    school: { type: Schema.ObjectId, ref: 'School' },
    bio: { type: String, trim: true },
    registered_date: { type: Date, default: Date.now },
    preferences: Object,
    setup_status: {
        acceptedTOS: { type: Boolean, default: false },
        choseSchool: { type: Boolean, default: false },
        uploadedSchedule: { type: Boolean, default: false },
    },
    /* 
        0 - Active
        1 - Locked
        2 - Disabled
    */
    account_status: { type: Number, default: 0}
});

// Instance methods
userSchema.methods.findSchoolmates = (cb) => {
    return this.model('User').find({ school: this.school }, cb);
};

userSchema.virtual('name.full').get(() => { 
    return this.firstName + ' ' + this.lastName;
 });

module.exports = { name: 'User', schema: userSchema };