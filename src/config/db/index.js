const mongoose = require('mongoose');

const uri = `mongodb+srv://lethanhthuongldp:mWTKSrkgyrbS5TPX@clusterblogwebproject2.4cuitlu.mongodb.net/database_blogwebproject2?retryWrites=true&w=majority&appName=ClusterBlogWebProject2`;
async function connect() {
    try{
        await mongoose.connect(uri);
        console.log('Connect database successfully');
    } catch (error) {
        console.log('Connect failure');
    }
}

module.exports = { connect };