const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');
const ManagePage = require('../models/ManagePage');

const {mutipleMongooseToObject} = require('../../util/mongoose');
const {mongooseToObject} = require('../../util/mongoose');

class ManagersController{
    
    // [GET] ['/', '/pedingPost']
    async showPending(req, res, next){
        try{
            const user = await User.findById({_id: UserLocalStorage.ID});
            user._id = user._id.toString();
            const posts = await Post.aggregate([
                {
                    $match: {status: 'pending'}
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
                        as: 'userPost',
                    }
                },
                {
                    $project: {
                        'title': 1,
                        '_id': 1,
                        'status': 1,
                        'createdAt': 1,
                        'userPost.name': 1,
                    }
                }
            ])
            const resApprove = req.flash('resApprove')[0] == 'true' ? true : false;
            const approveStatus = req.flash('approveStatus')[0] == 'true' ? true : false;
            const resReject = req.flash('resReject')[0] == 'true' ? true : false;
            const rejectStatus = req.flash('rejectStatus')[0] == 'true' ? true : false;
            const resDeletePost = req.flash('resDeletePost')[0] == 'true' ? true : false;
            const deletePostStatus = req.flash('deletePostStatus')[0] == 'true' ? true : false;
            res.render('managers/pendingPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                resApprove: resApprove,
                approveStatus: approveStatus,
                resReject: resReject,
                rejectStatus: rejectStatus,
                resDeletePost: resDeletePost,
                deletePostStatus: deletePostStatus,
            });
        } catch(error){
            next(error);
        }
    }

    // [GET] '/approvedPost'
    async showApproved(req, res, next){
        try{
            const user = await User.findById({_id: UserLocalStorage.ID});
            user._id = user._id.toString();
            const posts = await Post.aggregate([
                {
                    $match: {status: 'approved'}
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
                        as: 'userPost',
                    }
                },
                {
                    $project: {
                        'title': 1,
                        '_id': 1,
                        'status': 1,
                        'createdAt': 1,
                        'userPost.name': 1,
                        'reviewerName': 1,
                        'reviewTime': 1,
                    }
                }
            ])
            const resDeletePost = req.flash('resDeletePost')[0] == 'true' ? true : false;
            const deletePostStatus = req.flash('deletePostStatus')[0] == 'true' ? true : false;
            res.render('managers/approvedPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                resDeletePost: resDeletePost,
                deletePostStatus: deletePostStatus,
            });
        } catch(error){
            next(error);
        }
    }

    // [GET] '/rejectedPost'
    async showRejected(req, res, next){
        try{
            const user = await User.findById({_id: UserLocalStorage.ID});
            user._id = user._id.toString();
            const posts = await Post.aggregate([
                {
                    $match: {status: 'rejected'}
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
                        as: 'userPost',
                    }
                },
                {
                    $project: {
                        'title': 1,
                        '_id': 1,
                        'status': 1,
                        'createdAt': 1,
                        'userPost.name': 1,
                        'reviewerName': 1,
                        'reviewTime': 1,
                    }
                }
            ])
            const resDeletePost = req.flash('resDeletePost')[0] == 'true' ? true : false;
            const deletePostStatus = req.flash('deletePostStatus')[0] == 'true' ? true : false;
            res.render('managers/rejectedPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                resDeletePost: resDeletePost,
                deletePostStatus: deletePostStatus,
            });
        } catch(error){
            next(error);
        }
    }

    // [PUT] '/:managerID/approve/:postID'
    async approvePost(req, res, next){
        try{
            const post = await Post.findOne({_id: req.params.postID});
            const manager = await User.findOne({_id: req.params.managerID});
            const user = await User.findOne({_id: post.userID});
            const managePage = await ManagePage.findOne({});
            let resApprove = false, approveStatus = false;
            if(post.status == 'pending'){
                post.status = 'approved';
                user.approvedPost += 1;
                user.pendingPost -= 1;
                managePage.approvedPost += 1;
                managePage.pendingPost -= 1;
                post.reviewerID = manager._id.toString();
                post.reviewerName = manager.name;
                post.reviewTime = new Date();
                await post.save();
                await user.save();
                await managePage.save();
            }


            if(post.status == 'approved'){
                req.flash('resApprove', 'true');
                req.flash('approveStatus', 'true');
            } else if(post.status == 'pending'){
                req.flash('resApprove', 'true');
                req.flash('approveStatus', 'false');
            }
            
            res.redirect('/managers/pendingPost');
        }catch(error){
            req.flash('resApprove', 'true');
            req.flash('approveStatus', 'false');
            res.redirect('/managers/pendingPost');
            next(error);
        }
    }

    // [PUT] '/:managerID/reject/:postID'
    async rejectPost(req, res, next){
        try{
            const post = await Post.findOne({_id: req.params.postID});
            const manager = await User.findOne({_id: req.params.managerID});
            const user = await User.findOne({_id: post.userID});
            const managePage = await ManagePage.findOne({});
            let resReject = false, rejectStatus = false;
            if(post.status == 'pending'){
                post.status = 'rejected';
                user.rejectedPost += 1;
                user.pendingPost -= 1;
                managePage.rejectedPost += 1;
                managePage.pendingPost -= 1;
                post.reviewerID = manager._id.toString();
                post.reviewerName = manager.name;
                post.reviewTime = new Date();
                await post.save();
                await user.save();
                await managePage.save();
            }
            if(post.status == 'rejected'){
                req.flash('resReject', 'true');
                req.flash('rejectStatus', 'true');
            } else if(post.status == 'pending'){
                req.flash('resReject', 'true');
                req.flash('rejectStatus', 'false');
            }
            
            res.redirect('/managers/pendingPost');
            // const posts = await Post.aggregate([
            //     {
            //         $match: {status: 'pending'}
            //     },
            //     {
            //         $addFields: {
            //             userID: { $toObjectId: '$userID' } // Chuyển đổi kiểu dữ liệu của userID sang ObjectId
            //         }
            //     }, 
            //     {
            //         $lookup: {
            //             from: 'users',
            //             localField: 'userID',
            //             foreignField: '_id',
            //             as: 'userPost',
            //         }
            //     },
            //     {
            //         $project: {
            //             'title': 1,
            //             '_id': 1,
            //             'status': 1,
            //             'createdAt': 1,
            //             'userPost.name': 1,
            //         }
            //     }
            // ])
            // res.render('managers/pendingPost', {
            //     posts: mutipleMongooseToObject(posts),
            //     user: mongooseToObject(user),
            //     resReject: resReject,
            //     rejectStatus: rejectStatus,
            // });
        }catch(error){
            req.flash('resReject', 'true');
            req.flash('rejectStatus', 'false');
            res.redirect('/managers/pendingPost');
            next(error);
        }
    }

    // [DELETE] 'managers/:managerID/deletePost/:postID/:statusPost'
    async deletePost(req, res, next){
        console.log('managers/' + req.params.statusPost);
        try {
            let statusPost = 'pending';
            if(req.params.statusPost == 'approvedPost'){
                statusPost = 'approved';
            } else if(req.params.statusPost == 'rejectedPost'){
                statusPost = 'rejected';
            }
            const manager = await User.findOne({_id: req.params.managerID});
            const post = await Post.findOne({_id: req.params.postID});
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            const user = await User.findOne({_id: post.userID});
            const managePage = await ManagePage.findOne({});
            const postDeleted = await Post.deleteOne({_id: req.params.postID});
            if (postDeleted.deletedCount === 1) {
                user.totalPost -= 1;
                managePage.totalPost -= 1;
                if(post.status == "pending"){
                    managePage.pendingPost -= 1;
                    user.pendingPost -= 1;
                }else if(post.status == "approved"){
                    managePage.approvedPost -= 1;
                    user.approvedPost -= 1;
                }else{
                    managePage.rejectedPost -= 1;
                    user.rejectedPost -= 1;
                }
                await user.save();
                await managePage.save();
                req.flash('resDeletePost', 'true');
                req.flash('deletePostStatus', 'true');
                res.redirect('/managers/' + req.params.statusPost);

                // const posts = await Post.find({status: statusPost});
                // res.render('managers/' + req.params.statusPost, {
                //     user: mongooseToObject(manager),
                //     posts: mutipleMongooseToObject(posts),
                //     resDeletePost: true,
                //     deletePostStatus: true,
                // })
                
            } else {
                req.flash('resDeletePost', 'true');
                req.flash('deletePostStatus', 'false');
                res.redirect('/managers/' + req.params.statusPost);
                // res.status(404).send("No post was deleted");
                // const posts = await Post.find({status: statusPost});
                // res.render('managers/' + req.params.statusPost, {
                //     user: mongooseToObject(manager),
                //     posts: mutipleMongooseToObject(posts),
                //     resDeletePost: true,
                //     deletePostStatus: false,
                // })
            }
        } catch (error) {
            req.flash('resDeletePost', 'true');
            req.flash('deletePostStatus', 'false');
            res.redirect('/managers/' + req.params.statusPost);
            next(error);
        }
    }
}

module.exports = new ManagersController;
