const Post = require('../models/Post');
const User = require('../models/User');
const UserLocalStorage = require('../../config/acc/account');
const ManagePage = require('../models/ManagePage');
const mongoose = require('mongoose');

const { mongooseToObject } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { query } = require('express');
const page_size = 6;

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

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
        const userId = UserLocalStorage.getID();
        const managePage = await ManagePage.findOne({});  
        const countDoc = managePage.approvedPost;
        let page = [];
        let countPage = parseInt(countDoc / page_size);
        if(countDoc % page_size != 0) countPage += 1;
        if(countPage == 1) noEnd = false;
        for(let i = 1; i <= countPage; i++){
            page.push({ind: i, holdQuery: holdQuery});
        }

        if(isValidObjectId(userId)){
            const user = await User.findById({_id: userId});
            if(!user){
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
            }else{
                try{
                    const posts = await Post.find(conditionFind).limit(page_size).sort(conditionSort);
                    res.render('home', {
                        user: mongooseToObject(user),
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
            }
        }else{
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
        }
    }

    // [GET] /sign_in     // đăng nhập
    async signIn(req, res, next){
        const userID = UserLocalStorage.getID();
        if(isValidObjectId(userID)){
            try{
                const user = await User.findById({_id: userID});
                if(user){
                    // da dang nhap
                    res.redirect('/'); 
                } else{
                    localStorage.setItem('SGHBUserID', '');
                    const invalid = req.flash('invalid')[0] == 'true'? true: false;
                    res.render('auth/signIn',{
                        authPage: true,
                        invalid: invalid,
                    });
                }
            } catch(err){
                next(err);
            }
        }else{
            localStorage.setItem('SGHBUserID', '');
            const invalid = req.flash('invalid')[0] == 'true'? true: false;
            res.render('auth/signIn',{
                authPage: true,
                invalid: invalid,
            });
        }
        
    }

    // [GET] /sign_up     // đăng ký
    async signUp(req, res){
        const userID = UserLocalStorage.getID();
        const userName = req.flash('userName');
        if(isValidObjectId(userID)){
            try{
                const user = await User.findById({_id: userID});
                if(user){
                    // da dang nhap
                    res.redirect('/'); 
                } else{
                    localStorage.setItem('SGHBUserID', '');
                    res.render('auth/signUp',{
                        authPage: true,
                        userName: userName,
                    });
                }
            }catch(err){
                next(err);
            }
        }else{
            localStorage.setItem('SGHBUserID', '');
            res.render('auth/signUp',{
                authPage: true,
                userName: userName,
            });
        }
    }

    // [GET] /sign_out    // đăng xuất
    signOut(req, res){
        localStorage.setItem('SGHBUserID', '');
        res.redirect('/');
    }

    // [POST] /sign_in    // xử lý đăng nhập
    async postSignIn(req, res, next){
        // console.log(req.body); 
        // res.json(req.body); 
        const userName = req.body.userNameInput; 
        const password = req.body.passwordInput;
        const user = await User.findOne({name: userName, password: password});
        if(!user){
            // thong tin dang nhap khong dung

            // console.log(userName);
            // console.log(password);
            // console.log('Sai thong tin dang nhap');
            // res.json(user);

            req.flash('invalid', 'true');
            res.redirect('/sign_in');
        } else{
            // thong tin dang nhap dung
            // console.log(user._id.toString());
            localStorage.setItem('SGHBUserID', user._id.toString());
            res.redirect('/');
        }

            
    }

    // [POST] /sign_up    // xử lý đăng ký
    async postSignUp(req, res, next){
        // console.log(req.body); 
        // res.json(req.body);
        const userName = req.body.userNameInput;
        const password = req.body.passwordInput;
        const checkuser = await User.findOne({name: userName});
        const managePage = await ManagePage.findOne({});
        if(checkuser){
            // ten dang nhap da ton tai
            req.flash('userName', userName);
            res.redirect('/sign_up')
        } else{
            // ten dang nhap chua ton tai
            const newUser = new User();
            newUser.name = userName;
            newUser.password = password;
            managePage.totalUser += 1;
            await newUser.save();
            await managePage.save();
            const user = await User.findOne({name: userName, password: password});
            localStorage.setItem('SGHBUserID', user._id.toString());
            res.redirect('/');
        }
        
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
        const userId = UserLocalStorage.getID();
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

        if(isValidObjectId(userId)){
            try{
                const user = await User.findById({_id: userId});
                const posts = await Post.find(conditionFind).skip((req.params.page - 1) * page_size).limit(page_size).sort(conditionSort);
                if(user){
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
                }else{
                    localStorage.setItem('SGHBUserID', '');
                    res.render('home', {
                        posts: mutipleMongooseToObject(posts),
                        page: page,
                        noHome: true,
                        noEnd: noEnd,
                        checkPage: checkPage,
                        q: q,
                        holdQuery: holdQuery,
                    })
                }
            }catch(err){
                next(err);
            }
        }else{
            localStorage.setItem('SGHBUserID', '');
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
        }
    }
}

module.exports = new SiteController;
 