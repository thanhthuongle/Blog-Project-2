const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    postID: String,
    userID: String,
    contentComment: String,
    // parentCommentID
}, {
    timestamps: true,
   });

module.exports = mongoose.model('Comment', Comment, 'comment');
