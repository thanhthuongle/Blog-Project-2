const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const route = require('./route');
const db = require('./config/db');

const app = express();
const port = 3000;

app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    helpers: {
        sum: (a, b) => a + b,
        diff: (a, b) => a - b,
        checkColorStatus: (a) => {
            if(a == 'approved') return 'rgb(9, 207, 9)';
            else if(a == 'pending') return 'rgb(201, 201, 8)';
            else return 'rgb(183, 12, 12)';
        },
        checkStatus: (a) => {
            if(a == 'approved') return 'Đã duyệt';
            else if(a == 'pending') return 'Chờ duyệt';
            else return 'Từ chối';
        },
        managerCheckStatus: (a) => {
            if(a == 'approved') return 'Bài đăng đã duyệt';
            else if(a == 'pending') return 'Bài đăng đang chờ duyệt';
            else return 'Bài đăng đã từ chối';
        },     
        checkRoleAdmin: (a) => {
            if(a == 'user') return true; // a đại diện cho tên của người quản lý
            else return false;
        },
    },
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));
app.use(methodOverride('_method'));

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
// localStorage.setItem('SGHBUserName', 'user1');
// localStorage.setItem('SGHBUserID', '66376e07f405df60d38ce655');

db.connect();

route(app);

app.listen(port, () => {
    console.log(`Server is running and listening at http://localhost:${port}`);
});