const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');
const { mongooseToObject } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class UsersController{
    // [GET] users/:id/info
    show(req, res, next){
        User.findById({_id: req.params.id})
            .then(user => {
                res.render('users/showInfo', {
                    user: mongooseToObject(user),
                })
            })
    }

    // [GET] users/:id/posts
    showPosts(req, res, next){
        let resUpdatePost = req.flash('resUpdatePost')[0] == 'true' ? true : false;
        let updatePostStatus = req.flash('updatePostStatus')[0] == 'true' ? true : false;
        let resDeletePost = req.flash('resDeletePost')[0] == 'true' ? true : false;
        let deletePostStatus = req.flash('deletePostStatus')[0] == 'true' ? true : false;
        Promise.all([
            User.findById({_id: req.params.id}),
            Post.find({userID: req.params.id}),
        ]).then(([user, posts]) => {
            res.render('users/showPosts', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
                resUpdatePost: resUpdatePost,
                updatePostStatus: updatePostStatus,
                resDeletePost: resDeletePost,
                deletePostStatus: deletePostStatus,
            })
        })
    }

    // [GET] users/:id/create
    create(req, res, next){
        Promise.all([
            User.findById({_id: req.params.id}),
            Post.find({userId: req.params.id}),
        ]).then(([user, posts]) => {
            let resPost = req.flash('resPost')[0] == 'true' ? true : false;
            let createPostStatus = req.flash('createPostStatus')[0] == 'true' ? true : false;
            res.render('users/createPost', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
                resPost: resPost,
                createPostStatus: createPostStatus,
            })
        })
    }

}

module.exports = new UsersController;
 