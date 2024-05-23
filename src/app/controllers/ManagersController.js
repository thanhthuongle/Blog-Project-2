const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');

const {mutipleMongooseToObject} = require('../../util/mongoose');
const {mongooseToObject} = require('../../util/mongoose');

class ManagersController{
    
    // [GET] ['/', '/pedingPost']
    async showPending(req, res, next){
        try{
            const status = 'pending';
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
            res.render('managers/pendingPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                status: status,
            });
        } catch(error){
            next(error);
        }
    }

    // [GET] '/approvedPost'
    async showApproved(req, res, next){
        try{
            const status = 'approved';
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
            res.render('managers/approvedPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                status: status,
            });
        } catch(error){
            next(error);
        }
    }

    // [GET] '/rejectedPost'
    async showRejected(req, res, next){
        try{
            const status = 'rejected';
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
            res.render('managers/rejectedPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                status: status,
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
            let resApprove = false, approveStatus = false;
            let status = 'pending';
            if(post.status == 'pending'){
                post.status = 'approved';
                user.approvedPost += 1;
                user.pendingPost -= 1;
                post.reviewerID = manager._id.toString();
                post.reviewerName = manager.name;
                post.reviewTime = new Date();
                await post.save();
                await user.save();
            }
            if(post.status == 'approved'){
                resApprove = true;
                approveStatus = true;
            } else if(post.status == 'pending'){
                resApprove = true;
                approveStatus = false;
            }
            
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
            res.render('managers/pendingPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                status: status,
                resApprove: resApprove,
                approveStatus: approveStatus,
            });
        }catch(error){
            next(error);
        }
    }

    // [PUT] '/:managerID/reject/:postID'

    async rejectPost(req, res, next){
        try{
            const post = await Post.findOne({_id: req.params.postID});
            const manager = await User.findOne({_id: req.params.managerID});
            const user = await User.findOne({_id: post.userID});
            let resReject = false, rejectStatus = false;
            let status = 'pending';
            if(post.status == 'pending'){
                post.status = 'rejected';
                user.rejectedPost += 1;
                user.pendingPost -= 1;
                post.reviewerID = manager._id.toString();
                post.reviewerName = manager.name;
                post.reviewTime = new Date();
                await post.save();
                await user.save();
            }
            if(post.status == 'rejected'){
                resReject = true;
                rejectStatus = true;
            } else if(post.status == 'pending'){
                resReject = true;
                rejectStatus = false;
            }
            
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
            res.render('managers/pendingPost', {
                posts: mutipleMongooseToObject(posts),
                user: mongooseToObject(user),
                status: status,
                resReject: resReject,
                rejectStatus: rejectStatus,
            });
        }catch(error){
            next(error);
        }
    }
}

module.exports = new ManagersController;
