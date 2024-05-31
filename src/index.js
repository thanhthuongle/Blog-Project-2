const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
var flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');


const route = require('./route');
const db = require('./config/db');

const app = express();
const port = 3000;


app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));
app.use(flash());
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Hàm để lấy tên ngày trong tuần bằng tiếng Việt
function getVietnameseDayOfWeek(dayIndex) {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayIndex];
}
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    helpers: {
        sum: (a, b) => a + b,
        diff: (a, b) => a - b,
        checkPageHome: (a) => {
            if(a == 1) return true;
            return false;
        },
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
        checkStatusApprove: (a) => {
            if(a == 'approved') return true;
            else return false;
        },  
        checkRoleAdmin: (a) => {
            if(a == 'admin') return true; // a đại diện cho tên của người quản lý
            else return false;
        },
        formatTime: (datetime) => {
            const date = new Date(datetime);

            // Lấy các phần của  giờ
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
          
            // Định dạng Thời gian theo định dạng hh:mm:ss
            return `${hours}:${minutes}:${seconds}`;
        },
        formatDate: (datetime) => {
            const date = new Date(datetime);

            // Lấy các phần của ngày tháng
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // tháng trong JS bắt đầu từ 0
            const year = date.getFullYear();
          
            // Định dạng ngày tháng theo đinh dạng dd/mm/yyyy
            return `${day}/${month}/${year}`;
        },
        formatDateTime: (datetime) => {
            const date = new Date(datetime);

            const dayOfWeek = getVietnameseDayOfWeek(date.getDay());
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            // Định dạng ngày tháng theo yêu cầu
            return `${dayOfWeek} ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        },
        limitComment: (a) => {
            return a < 5;
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