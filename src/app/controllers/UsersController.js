const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');
const UserLocalStorage = require('../../config/acc/account');
const { mongooseToObject } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

class UsersController{
    // [GET] users/:id/info
    async show(req, res, next){
        const userID = UserLocalStorage.getID();
        if(userID == req.params.id){
            if(isValidObjectId(userID)){
                if(isValidObjectId(req.params.id)){
                    try{
                        const user = await User.findById({_id: userID});
                        if(user){
                            res.render('users/showInfo', {
                                user: mongooseToObject(user),
                            })
                        }else{
                            console.log('ID người dùng không hợp lệ');
                            res.redirect('/');
                        }
                    }catch(err){
                        console.log('Tải thông tin người dùng thất bại!');
                        res.redirect('/');
                    }
                }else{
                    console.log('ID người dùng không hợp lệ');
                    res.redirect('/');
                }
            }else{
                console.log('ID người dùng không hợp lệ');
                res.redirect('/');
            }
        }else{
            // ID người dùng không khớp vs id yêu cầu => truy nhập trái phép
            console.log('ID người dùng không khớp vs id yêu cầu => truy nhập trái phép');
            res.redirect('/');
        }
    }

    // [GET] users/:id/posts
    async showPosts(req, res, next){
        let resUpdatePost = req.flash('resUpdatePost')[0] == 'true' ? true : false;
        let updatePostStatus = req.flash('updatePostStatus')[0] == 'true' ? true : false;
        let resDeletePost = req.flash('resDeletePost')[0] == 'true' ? true : false;
        let deletePostStatus = req.flash('deletePostStatus')[0] == 'true' ? true : false;
        let userID = UserLocalStorage.getID();

        if(userID == req.params.id){
            if(isValidObjectId(userID)){
                if(isValidObjectId(req.params.id)){
                    try{
                        const user = await User.findById({_id: userID});
                        if(user){
                            const posts = await Post.find({userID: userID});
                            res.render('users/showPosts', {
                                    user: mongooseToObject(user),
                                    posts: mutipleMongooseToObject(posts),
                                    resUpdatePost: resUpdatePost,
                                    updatePostStatus: updatePostStatus,
                                    resDeletePost: resDeletePost,
                                    deletePostStatus: deletePostStatus,
                                })
                        }else{
                            console.log('ID người dùng không hợp lệ');
                            res.redirect('/');
                        }
                    }catch(err){
                        console.log('Tải thông tin người dùng thất bại!');
                        res.redirect('/');
                    }
                }else{
                    console.log('ID người dùng không hợp lệ');
                    res.redirect('/');
                }
            }else{
                console.log('ID người dùng không hợp lệ');
                res.redirect('/');
            }
        }else{
            // ID người dùng không khớp vs id yêu cầu => truy nhập trái phép
            console.log('ID người dùng không khớp vs id yêu cầu => truy nhập trái phép');
            res.redirect('/');
        }

    }

    // [GET] users/:id/create
    async create(req, res, next){
        let resPost = req.flash('resPost')[0] == 'true' ? true : false;
        let createPostStatus = req.flash('createPostStatus')[0] == 'true' ? true : false;
        const userID = UserLocalStorage.getID();
        if(userID == req.params.id){
            if(isValidObjectId(userID)){
                if(isValidObjectId(req.params.id)){
                    try{
                        const user = await User.findById({_id: userID});
                        if(user){
                            res.render('users/createPost', {
                                user: mongooseToObject(user),
                                resPost: resPost,
                                createPostStatus: createPostStatus,
                            })
                        }else{
                            console.log('ID người dùng không hợp lệ');
                            res.redirect('/');
                        }
                    }catch(err){
                        console.log('Tải thông tin người dùng thất bại!');
                        res.redirect('/');
                    }
                }else{
                    console.log('ID người dùng không hợp lệ');
                    res.redirect('/');
                }
            }else{
                console.log('ID người dùng không hợp lệ');
                res.redirect('/');
            }
        }else{
            // ID người dùng không khớp vs id yêu cầu => truy nhập trái phép
            console.log('ID người dùng không khớp vs id yêu cầu => truy nhập trái phép');
            res.redirect('/');
        }
    }

}

module.exports = new UsersController;
 