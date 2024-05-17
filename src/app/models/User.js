const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    role: {type: String, default: 'user'},  // admin, user, manager
    name: String,
    password: String,
    avatar: {type: String, default: 'https://scontent-hkg1-1.xx.fbcdn.net/v/t1.30497-1/143086968_2856368904622192_1959732218791162458_n.png?stp=cp0_dst-png_p40x40&_nc_cat=1&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeH1381gwedxTXsiC0Xeo-peso2H55p0AlGyjYfnmnQCUZMMj6EYcOio77m1_ChBpA-PE96D0YrlnrqfxkZsoNJ7&_nc_ohc=C0FEU6wOyRwQ7kNvgH2sHTS&_nc_ht=scontent-hkg1-1.xx&oh=00_AfBOJFDY-DObJDdTjF-QOQN-bF8QsZ3bgayRykaMFJNcRA&oe=665EBA78'},
    totalPost: {type: Number, default: 0},
    pendingPost: {type: Number, default: 0},
    approvedPost: {type: Number, default: 0}, 
    rejectedPost: {type: Number, default: 0},
}, {
    timestamps: true,
   });

module.exports = mongoose.model('User', User, 'users');
