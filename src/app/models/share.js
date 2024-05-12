const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Share = new Schema({
    postID: String,
    userID: String,
    // socialMedia
}, {
    timestamps: true,
   });

module.exports = mongoose.model('Share', Share, 'share');