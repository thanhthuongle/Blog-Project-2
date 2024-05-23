const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');

const { mongooseToObject } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { query } = require('express');
const page_size = 12;

 

class SiteController{
    // [GET] /
    
    async index(req, res, next){
        // console.log(req.query);
        const q = req.query.q;
        let sort = req.query.sort;
        if(sort == 'date') sort = 'createdAt';
        let holdQuery = '';
        let conditionFind ={}, conditionSort={};

        if(q){
            conditionFind = { $text: { $search: q }};
            if(sort){
                conditionSort = {score: { $meta: "textScore" }, [sort]: -1};
                holdQuery = `?sort=${sort}&q=${q}`;
            } else {
                conditionSort = { score: { $meta: "textScore" } };
                holdQuery = `?q=${q}`;
            }
        }else if(sort) {
            //conditionFind = { status: 'approved' };
            conditionSort = {[sort]: -1}; 
            holdQuery = `?sort=${sort}`;
        }
        const userId = UserLocalStorage.ID;
        const countDoc = await Post.countDocuments();
        let page = [];
        let countPage = countDoc / page_size;
        if(countDoc % page_size != 0) countPage += 1;
        for(let i = 1; i <= countPage; i++){
            page.push({ind: i, holdQuery: holdQuery});
        }
        Promise.all([
            User.findById({_id: userId}),
            Post.find(conditionFind).limit(page_size).sort(conditionSort),
            // Post.find(conditionFind).skip(0).limit(page_size).sort(conditionSort), // todo: check lại thông số skip() 
        ]).then(([user, posts]) => {
            // console.log(posts);
            res.render('home', {
                user: mongooseToObject(user),
                posts: mutipleMongooseToObject(posts),
                page: page,    
                checkPage: 1,
                q: q,
                holdQuery: holdQuery,
            })
        }).catch(next);
        
        
        // res.render('home');
    }


    // [GET] /page/:page
    async page(req, res, next){
        const q = req.query.q;
        let sort = req.query.sort;
        if(sort == 'date') sort = 'createdAt';
        let holdQuery = '';
        let conditionFind ={}, conditionSort={};

        if(q){
            conditionFind = { $text: { $search: q } };
            if(sort){
                conditionSort = {score: { $meta: "textScore" }, [sort]: -1};
                holdQuery = `?sort=${sort}&q=${q}`;
            } else {
                conditionSort = { score: { $meta: "textScore" } };
                holdQuery = `?q=${q}`;
            }
        } else if(sort) {
            //conditionFind = { status: 'approved' };
            conditionSort = {[sort]: -1}; 
            holdQuery = `?sort=${sort}`;
        }

        const checkPage = parseInt(req.params.page);
        const userId = UserLocalStorage.ID;
        const countDoc = await Post.countDocuments();  //todo: chỉnh lại phân trang khi có tìm kiếm và sắp xếp
        let page = [];
        let countPage = countDoc / page_size;
        if(countDoc % page_size != 0) countPage += 1;
        for(let i = 1; i <= countPage; i++)
            page.push({ind: i, holdQuery: holdQuery});
        if(checkPage <=1 || isNaN(checkPage) || checkPage > countPage) res.redirect('/');
        else{
            try{
                const user = await User.findById({_id: userId});
                const posts = await Post.find(conditionFind).skip((req.params.page - 1) * page_size).limit(page_size).sort(conditionSort);
                res.render('home', {
                    user: mongooseToObject(user),
                    posts: mutipleMongooseToObject(posts),
                    page: page,
                    noHome: true,
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
 