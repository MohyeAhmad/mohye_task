const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
   role: { type: Schema.Types.ObjectId, required :true ,required  :true , ref: 'Role' }
});
const User = mongoose.model('User' ,UserSchema );
module.exports = User;
