const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema({
    //postID = _id
    userID: String,
    thumbnail: String,
    title: String,
    description: String,
    content: String,
    contentHtml: String,
    like: {type: Number, default: 0},
    share: {type: Number, default: 0},
    comment: {type: Number, default: 0},
    status: {type: String, default: 'pending'}, // pending, approved, rejected
    reviewerID: String, // thuộc tính tồn tại khi bài viết đã được xem xét
    reviewerName: String, // thuộc tính tồn tại khi bài viết đã được xem xét
    reviewTime: Date, // thuộc tính tồn tại khi bài viết đã được xem xét
}, {
    timestamps: true,
   })

   Post.index({title: 'text', 'content': 'text', description: 'text'}, {weights: {title: 5, content: 3, description: 1}})

module.exports = mongoose.model('Post', Post, 'posts');
