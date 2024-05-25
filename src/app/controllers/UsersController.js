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
        Promise.all([
            User.findById({_id: req.params.id}),
            Post.find({userID: req.params.id}),
        ]).then(([user, posts]) => {
            res.render('users/showPosts', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
            })
        })
    }

    // [GET] users/:id/create
    create(req, res, next){
        Promise.all([
            User.findById({_id: req.params.id}),
            Post.find({userId: req.params.id}),
        ]).then(([user, posts]) => {
            res.render('users/createPost', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
                // messages: req.flash('info'),
            })
        })
    }

}

module.exports = new UsersController;
 