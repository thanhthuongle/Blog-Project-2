const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const UserLocalStorage = require('../../config/acc/account');
const ManagePage = require('../models/ManagePage');
const { mongooseToObject } = require('../../util/mongoose');
const {mutipleMongooseToObject} = require('../../util/mongoose');

const adminName = 'user1'; // Tên người dùng admin

class PostsController{
    // [GET] /posts/{{this._id}}
    async show(req, res, next){
        try{ 
            let likeStatus;
            if(await Like.findOne({postID: req.params.id, userID: UserLocalStorage.ID}))
                likeStatus = true;
            else
                likeStatus = false;
            const user = await User.findById({_id: UserLocalStorage.ID});
            const post = await Post.findById({_id: req.params.id});
            const comments = await Comment.aggregate([
                {
                    $match: {postID: req.params.id}
                },
                {
                    $addFields: {
                        userID: { $toObjectId: '$userID' } // Chuyển đổi kiểu dữ liệu của userID sang ObjectId
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userID',
                        foreignField: '_id',
                        as: 'userComment',
                    }
                },
                {
                    $project:{
                        'userComment.avatar': 1,
                        'userComment.name': 1,
                        'contentComment': 1,
                        '_id': 0,
                    }
                }
            ]);
            res.render('posts/readPost', {
                comments: comments,
                user: mongooseToObject(user),
                post: mongooseToObject(post),
                likeStatus: likeStatus,
                countComment: comments.length,
                
            })
        }catch(err){
            next(err);
        }
    }


    // [POST] posts/store
    async store(req, res, next){
        const userID = UserLocalStorage.ID;
        const post = new Post(req.body);
        const content = stripHtml(post.contentHtml);
        post.content = content;
        let postStatus = false;
        const managePage = await ManagePage.findOne({});
        User.findById({_id: userID})
            .then(user => {
                post.userID = user._id;
                post.save()
                    .then(() => {
                        // console.log('Tạo bài viết thành công!');
                        user.totalPost += 1;
                        user.pendingPost += 1;
                        user.save();
                        managePage.totalPost += 1;
                        managePage.pendingPost += 1;
                        managePage.save();
                        postStatus = true; 
                        // req.flash('info', 'THÀNH CÔNG!');
                        // res.redirect('/');
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
            
            // todo: tính toán thêm về TH lày 
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
            let dataModify = req.body;
            dataModify.content = stripHtml(dataModify.contentHtml);
            const post = await Post.findOne({_id: req.params.id, userID: UserLocalStorage.ID});
            const managePage = await ManagePage.findOne({});
            const updatePost = await Post.updateOne({_id: req.params.id, userID: UserLocalStorage.ID}, dataModify);
            if(updatePost.modifiedCount == 1){
                if(post.status == 'approved'){
                    post.status = 'pending';
                    user.approvedPost -= 1;
                    user.pendingPost += 1;
                    managePage.approvedPost -= 1;
                    managePage.pendingPost += 1;
                    await post.save();
                    await user.save();
                    await managePage.save();
                } else if(post.status == 'rejected'){
                    post.status = 'pending';
                    user.rejectedPost -= 1;
                    user.pendingPost += 1;
                    managePage.rejectedPost -= 1;
                    managePage.pendingPost += 1;
                    await post.save();
                    await user.save();
                    await managePage.save();
                }
            }
            const posts = await Post.find({userID: UserLocalStorage.ID});
            res.render('users/showPosts', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
                resUpdatePost: true,
                updatePostStatus: updatePost.acknowledged,
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
            const managePage = await ManagePage.findOne({});
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            const postDeleted = await Post.deleteOne({_id: req.params.id, userID: UserLocalStorage.ID});
            if (postDeleted.deletedCount == 1) {
                user.totalPost -= 1;
                managePage.totalPost -= 1;
                if(post.status == "pending") {
                    user.pendingPost -= 1;
                    managePage.pendingPost -= 1;
                }else if(post.status == "approved"){
                    user.approvedPost -= 1;
                    managePage.approvedPost -= 1;
                }else {
                    user.rejectedPost -= 1;
                    managePage.rejectedPost -= 1;
                }
                await user.save();
                await managePage.save();
                const posts = await Post.find({userID: UserLocalStorage.ID});
                res.render('users/showPosts', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                    resDeletePost: true,
                    deletePostStatus: true,
                });
            } else {
                // res.status(404).send("No post was deleted");
                const posts = await Post.find({userID: UserLocalStorage.ID});
                res.render('users/showPosts', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                    resDeletePost: true,
                    deletePostStatus: false,
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, ''); // Loại bỏ các tag HTML để lấy dữ liệu dưới dạng text
}

module.exports = new PostsController; 
