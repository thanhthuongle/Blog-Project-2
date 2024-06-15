const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    role: {type: String, default: 'user'},  // admin, user, manager
    name: String,
    password: String,
    avatar: {type: String, default: '/image/avatarDefault.svg'},
    totalPost: {type: Number, default: 0},
    pendingPost: {type: Number, default: 0},
    approvedPost: {type: Number, default: 0}, 
    rejectedPost: {type: Number, default: 0},
}, {
    timestamps: true,
   });

module.exports = mongoose.model('User', User, 'users');
