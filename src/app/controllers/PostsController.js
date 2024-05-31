const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const UserLocalStorage = require('../../config/acc/account');
const ManagePage = require('../models/ManagePage');
const mongoose = require('mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const {mutipleMongooseToObject} = require('../../util/mongoose');

// const adminName = 'admin'; // Tên người dùng admin

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

class PostsController{
    // [GET] /posts/{{this._id}}    // doc bai viet co id = this._id
    async show(req, res, next){
        const userID = UserLocalStorage.getID();
        let post, comments, likeStatus;
        try{// tim thong tin bai viet va comment cua bai viet
            post = await Post.findById({_id: req.params.id});
            if(!post) {
                console.log('Không tìm thấy bài viết!');
                res.redirect('/');
            } else{
                comments = await Comment.aggregate([
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
            }
        } catch(err){
            next(err);
        }


        if(isValidObjectId(userID)){// xac thuc id tren localStorage
            try{
                const user = await User.findById({_id: userID});
                if(user){
                    if(await Like.findOne({postID: req.params.id, userID: userID})){
                        likeStatus = true;
                    } else{
                        likeStatus = false;
                    }
                    res.render('posts/readPost', {
                        user: mongooseToObject(user),
                        post: mongooseToObject(post),
                        comments: comments,
                        likeStatus: likeStatus,
                        countComment: comments.length,
                    })
                }else{
                    localStorage.setItem('SGHBUserID', ''); // Xóa dữ liệu trong localStorage
                    likeStatus = false;
                    res.render('posts/readPost', {
                        post: mongooseToObject(post),
                        comments: comments,
                        likeStatus: likeStatus,
                        countComment: comments.length,
                    })
                }
            }catch(err){
                next(err);
            }
        } else{
            localStorage.setItem('SGHBUserID', ''); // Xóa dữ liệu trong localStorage
            likeStatus = false;
            res.render('posts/readPost', {
                post: mongooseToObject(post),
                comments: comments,
                likeStatus: likeStatus,
                countComment: comments.length,   
            })
        }
    }

    // [POST] posts/:userID/store
    async store(req, res, next){
        // console.log(req.params.userID);
        // res.json(req.body);
        const userID = req.params.userID;
        const post = new Post(req.body);
        const content = stripHtml(post.contentHtml);
        post.content = content;
        
        try{
            const managePage = await ManagePage.findOne({});
            if(isValidObjectId(userID)){
                const user = await User.findById({_id: userID});
                if(user){
                    post.userID = userID;     
                    post.save()
                        .then(() => {
                            user.totalPost += 1;
                            user.pendingPost += 1;
                            managePage.totalPost += 1;
                            managePage.pendingPost += 1;
                            user.save();
                            managePage.save();
                            req.flash('resPost', 'true');
                            req.flash('createPostStatus', 'true');
                            res.redirect('/users/'+post.userID+'/create');
                        }).catch(err => {
                            console.log('Tạo bài viết thất bại!', err);
                            req.flash('resPost', 'true');
                            req.flash('createPostStatus', 'false');
                            res.redirect('/users/'+post.userID+'/create');
                        });  
                }else{
                    console.log('ID người dùng không hợp lệ!');
                    res.redirect('/');
                }
            }else{
                console.log('ID người dùng không hợp lệ!');
                res.redirect('/');
            }
        }catch(err){
            next(err);
        }
    }

    // [GET] posts/:id/edit
    async edit(req, res, next){
        const userID = UserLocalStorage.getID();
        if(isValidObjectId(userID)){
            try{
                const user = await User.findById({_id: userID});
                if(user){
                    try{
                        const post = await Post.findById({_id: req.params.id});
                        if(post.userID != userID){
                            res.redirect('/users/'+userID+'/posts');
                        }else{
                            res.render('posts/editPost', {
                                user: mongooseToObject(user),
                                post: mongooseToObject(post),
                            })
                        }
                    }catch(err){
                        next(err);
                    }
                }else{
                    localStorage.setItem('SGHBUserID', ''); // Xóa dữ liệu trong localStorage
                    res.redirect('/');
                }
            }catch(err){
                next(err);
            }
        }else{
            localStorage.setItem('SGHBUserID', ''); // Xóa dữ liệu trong localStorage
            res.redirect('/');
        }
    }

    // [PUT] posts/:id/:userID
    async update(req, res, next){
        // console.log(req.params.userID);
        // res.json(req.body);

        const userID = req.params.userID;
        let dataModify = req.body;
        dataModify.content = stripHtml(dataModify.contentHtml);

        if(isValidObjectId(userID)){
            try{
                const user = await User.findById({_id: userID});
                if(user){
                    try{
                        const post = await Post.findById({_id: req.params.id});
                        if(post.userID != userID){
                            res.redirect('/users/'+userID+'/posts');
                        }else{
                            const managePage = await ManagePage.findOne({});
                            const updatePost = await Post.updateOne({_id: req.params.id, userID: userID}, dataModify);
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
                            req.flash('resUpdatePost', 'true');
                            req.flash('updatePostStatus', updatePost.acknowledged.toString());
                            res.redirect('/users/'+userID+'/posts');
                        }
                    }catch(err){
                        req.flash('resUpdatePost', 'true');
                        req.flash('updatePostStatus', 'false');
                        res.redirect('/users/'+UserLocalStorage.getID()+'/posts');
                        next(err);
                    }
                }else{
                    console.log('ID người dùng không hợp lệ!');
                    res.redirect('/');
                }
            }catch(err){
                next(err);
            }
        }else{
            console.log('ID người dùng không hợp lệ!');
            res.redirect('/');
        }
    }

    // [DELETE] posts/:id/:userID
    async delete(req, res, next){
        // console.log(req.params.userID);
        // consolge.log(req.params.id);

        const userID = req.params.userID;
        const postID = req.params.id;
        if(isValidObjectId(userID)){
            if(isValidObjectId(postID)){
                try{
                    const user = await User.findById({_id: userID});
                    const post = await Post.findById({_id: postID});
                    const managePage = await ManagePage.findOne({});
                    if(user && post){
                        if(post.userID == userID){
                            try{
                                const postDeleted = await Post.deleteOne({_id: postID, userID: userID});
                                if(postDeleted.deletedCount == 1){
                                    user.totalPost -= 1;
                                    managePage.totalPost -= 1;
                                    if(post.status == 'pending'){
                                        user.pendingPost -= 1;
                                        managePage.pendingPost -= 1;
                                    }else if(post.status == 'approved'){
                                        user.approvedPost -= 1;
                                        managePage.approvedPost -= 1;
                                    }else{
                                        user.rejectedPost -= 1;
                                        managePage.rejectedPost -= 1;
                                    }
                                    await user.save();
                                    await managePage.save();
                                    req.flash('resDeletePost', 'true');
                                    req.flash('deletePostStatus', 'true');
                                    res.redirect('/users/'+userID+'/posts');
                                }else{
                                    req.flash('resDeletePost', 'true');
                                    req.flash('deletePostStatus', 'false');
                                    res.redirect('/users/'+UserLocalStorage.getID()+'/posts');
                                }
                            }catch(err){
                                req.flash('resDeletePost', 'true');
                                req.flash('deletePostStatus', 'false');
                                res.redirect('/users/'+UserLocalStorage.getID()+'/posts');
                                next(err);
                            }
                        }else{
                            console.log('ID người dùng không là chủ của bài viết!');
                            res.redirect('/');
                        }    
                    }else{
                        console.log('ID người dùng hoặc ID bài viết không hợp lệ!');
                        res.redirect('/');
                    }
                }catch(err){
                    next(err);
                }
            }else{
                console.log('ID bài viết không hợp lệ!');
                res.redirect('/');
            }
        }else{
            console.log('ID người dùng không hợp lệ!');
            res.redirect('/');
        }
    }
}

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, ''); // Loại bỏ các tag HTML để lấy dữ liệu dưới dạng text
}

module.exports = new PostsController; 
