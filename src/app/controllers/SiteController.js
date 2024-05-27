const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');
const ManagePage = require('../models/ManagePage');

const { mongooseToObject } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { query } = require('express');
const page_size = 6;

 

class SiteController{
    
    // [GET] /     // trang chủ
    async index(req, res, next){
        // console.log(req.query);
        const q = req.query.q;
        let sort = req.query.sort;
        if(sort == 'date') sort = 'createdAt';
        let holdQuery = '';
        let conditionFind ={}, conditionSort={};

        if(q){
            conditionFind = { $text: { $search: q }, status: 'approved'};
            if(sort){
                conditionSort = {score: { $meta: "textScore" }, [sort]: -1};
                holdQuery = `?sort=${sort}&q=${q}`;
            } else {
                conditionSort = { score: { $meta: "textScore" } };
                holdQuery = `?q=${q}`;
            }
        }else{
            conditionFind = { status: 'approved' };
            if(sort){
                conditionSort = {[sort]: -1}; 
                holdQuery = `?sort=${sort}`;
            }
        }

        let noEnd = true;
        const userId = UserLocalStorage.ID;
        const managePage = await ManagePage.findOne({});
        const countDoc = managePage.approvedPost;
        let page = [];
        let countPage = parseInt(countDoc / page_size);
        if(countDoc % page_size != 0) countPage += 1;
        if(countPage == 1) noEnd = false;
        for(let i = 1; i <= countPage; i++){
            page.push({ind: i, holdQuery: holdQuery});
        }
        if(!userId){
            try{
                const posts = await Post.find(conditionFind).limit(page_size).sort(conditionSort);
                res.render('home', {
                    posts: mutipleMongooseToObject(posts),
                    page: page,    
                    checkPage: 1,
                    noEnd: noEnd,
                    q: q,
                    holdQuery: holdQuery,
                })
            }catch(err){
                next(err);
            }
        } else{
            Promise.all([
                User.findById({_id: userId}),
                Post.find(conditionFind).limit(page_size).sort(conditionSort),
            ]).then(([user, posts]) => {
                res.render('home', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                    page: page,    
                    checkPage: 1,
                    noEnd: noEnd,
                    q: q,
                    holdQuery: holdQuery,
                })
            }).catch(next);
        }
        // res.render('home');
    }

    // [GET] /sign_in     // đăng nhập
    signIn(req, res){
        res.render('auth/signIn');
    }

    // [GET] /page/:page      // phân trang
    async page(req, res, next){
        const q = req.query.q;
        let sort = req.query.sort;
        if(sort == 'date') sort = 'createdAt';
        let holdQuery = '';
        let conditionFind ={}, conditionSort={};

        if(q){
            conditionFind = { $text: { $search: q }, status: 'approved' };
            if(sort){
                conditionSort = {score: { $meta: "textScore" }, [sort]: -1};
                holdQuery = `?sort=${sort}&q=${q}`;
            } else {
                conditionSort = { score: { $meta: "textScore" } };
                holdQuery = `?q=${q}`;
            }
        } else{
            conditionFind = { status: 'approved' };
            if(sort){
                conditionSort = {[sort]: -1}; 
                holdQuery = `?sort=${sort}`;
            }
        }

        let noEnd = true;
        const userId = UserLocalStorage.ID;
        const checkPage = parseInt(req.params.page);
        const managePage = await ManagePage.findOne({});
        const countDoc = managePage.approvedPost;
        let page = [];
        let countPage = parseInt(countDoc / page_size);
        if(countDoc % page_size != 0) countPage += 1;

        if(checkPage == countPage) noEnd = false;

        for(let i = 1; i <= countPage; i++)
            page.push({ind: i, holdQuery: holdQuery});

        if(checkPage <=1 || isNaN(checkPage) || checkPage > countPage) res.redirect('/');

        if(!userId){
            try{
                const posts = await Post.find(conditionFind).skip((req.params.page - 1) * page_size).limit(page_size).sort(conditionSort);
                res.render('home', {
                    posts: mutipleMongooseToObject(posts),
                    page: page,
                    noHome: true,
                    noEnd: noEnd,
                    checkPage: checkPage,
                    q: q,
                    holdQuery: holdQuery,
                })
            }catch(err){
                next(err);
            }
        
        }else{
            try{
                const user = await User.findById({_id: userId});
                const posts = await Post.find(conditionFind).skip((req.params.page - 1) * page_size).limit(page_size).sort(conditionSort);
                res.render('home', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                    page: page,
                    noHome: true,
                    noEnd: noEnd,
                    checkPage: checkPage,
                    q: q,
                    holdQuery: holdQuery,
                })
            }catch(err){
                next(err);
            }
        }
    }
}

module.exports = new SiteController;
 