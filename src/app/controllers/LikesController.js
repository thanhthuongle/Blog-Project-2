const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');
class LikesController{
    // [PUT] /likes/{{post._id}}/{{user._id}}
    async update(req, res, next){
        try{
            const checkPost = await Post.findOne({_id: req.params.postID});
            const checkUser = await User.findOne({_id: req.params.userID});
            const checkLike = await Like.findOne({postID: req.params.postID, userID: req.params.userID});
            if(checkPost && checkUser){
                if(checkLike){
                    await Like.deleteOne({postID: req.params.postID, userID: req.params.userID});
                    checkPost.like -= 1;
                    await checkPost.save();
                } else{
                    const like = new Like({postID: req.params.postID, userID: req.params.userID});
                    await like.save();
                    checkPost.like += 1;
                    await checkPost.save();
                }
                res.redirect('/posts/' + req.params.postID);
            } else {
                res.status(404).redirect('/');
            }
        }catch(err){
            next(err);
        }
    }
}

module.exports = new LikesController();