const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RoleSchema = new  Schema({
    name: { type: String, required: true , unique: true  }
});

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;