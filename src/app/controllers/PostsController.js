const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');
const { mongooseToObject } = require('../../util/mongoose');
const {mutipleMongooseToObject} = require('../../util/mongoose');

class PostsController{
    // [GET] /posts/{{this._id}}
    async show(req, res, next){
        try{
            const user = await User.findById({_id: UserLocalStorage.ID});
            const post = await Post.findById({_id: req.params.id});
            res.render('posts/readPost', {
                user: mongooseToObject(user),
                post: mongooseToObject(post),
            })
        }catch(err){
            next(err);
        }
    }


    // [POST] posts/store
    store(req, res, next){
        const userID = UserLocalStorage.ID;
        const post = new Post(req.body);
        let postStatus = false;
        User.findById({_id: userID})
            .then(user => {
                post.userID = user._id;
                post.save()
                    .then(() => {
                        // console.log('Tạo bài viết thành công!');
                        user.totalPost += 1;
                        user.pendingPost += 1;
                        user.save();
                        postStatus = true;
                        res.render('users/createPost', {
                            user: mongooseToObject(user),
                            postStatus: postStatus,
                            resPost: true,
                        })
                    })
                    .catch(err => {
                        postStatus = false;
                        console.log('Tạo bài viết thất bại!', err);
                        res.render('users/createPost', {
                            user: mongooseToObject(user),
                            postStatus: postStatus,
                            resPost: true,
                        })
                    });
            
            // tính toán thêm về TH lày 
            }).catch(err => {
                postStatus = false;
                console.log('Tạo bài viết thất bại do id người dùng không hợp lệ!', err);
                res.redirect('/',);
            })
    }

    // [GET] posts/:id/edit
    edit(req, res, next){
        Promise.all([
            User.findOne({_id: UserLocalStorage.ID}),
            Post.findById({_id: req.params.id}),
        ]).then(([user, post]) => {
            res.render('posts/editPost', {
                user: mongooseToObject(user),
                post: mongooseToObject(post),
            })
        }).catch(next);
    }

    // [PUT] posts/:id
    async update(req, res, next){
        try {
            const user = await User.findOne({_id: UserLocalStorage.ID});
            await Post.updateOne({_id: req.params.id, userID: UserLocalStorage.ID}, req.body);
            const posts = await Post.find({userID: UserLocalStorage.ID});
            res.render('users/showPosts', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
            });
        } catch (error) {
            next(error);
        }
    }

    // [DELETE] posts/:id
    async delete(req, res, next){
        try {
            const user = await User.findOne({_id: UserLocalStorage.ID});
            const post = await Post.findOne({_id: req.params.id, userID: UserLocalStorage.ID});
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            const postDeleted = await Post.deleteOne({_id: req.params.id, userID: UserLocalStorage.ID});
            if (postDeleted.deletedCount === 1) {
                user.totalPost -= 1;
                if(post.status == "pending") 
                    user.pendingPost -= 1;
                else if(post.status == "approved")
                    user.approvedPost -= 1;
                else 
                    user.rejectedPost -= 1;
                await user.save();
                const posts = await Post.find({userID: UserLocalStorage.ID});
                res.render('users/showPosts', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                });
            } else {
                res.status(404).send("No post was deleted");
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostsController; 
