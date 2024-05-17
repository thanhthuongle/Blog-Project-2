const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

class CommentsController{

    // [POST] /comments/:postID/:userID
    async createComment(req, res, next){
        try{
            const checkPost = await Post.findOne({ _id: req.params.postID });
            const checkUser = await User.findOne({ _id: req.params.userID });
            if(checkPost && checkUser){
                const newComment = new Comment(req.body);
                await newComment.save();
                checkPost.comment += 1;
                await checkPost.save();
                res.status(200).redirect('/posts/' + req.params.postID);
            } else{
                console.log('Post or User not found');
                res.status(404).redirect('/');
            }
        } catch(err){
            next(err);
        }
    }
}

module.exports = new CommentsController();
