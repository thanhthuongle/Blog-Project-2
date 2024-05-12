const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Like = new Schema({
    postID: String,
    userID: String,
}, {
    timestamps: true,
   });

module.exports = mongoose.model('Like', Like, 'like');
