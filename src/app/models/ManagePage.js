const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManagePage = new Schema({
    totalPost: { type: Number, default: 0 },
    totalUser: { type: Number, default: 0 },
    totalManager: { type: Number, default: 0 },
    approvedPost: { type: Number, default: 0 },
    pendingPost: { type: Number, default: 0 },
    rejectedPost: { type: Number, default: 0 },
}, {
    timestamps: true,
   });

module.exports = mongoose.model('ManagePage', ManagePage, 'managePage');