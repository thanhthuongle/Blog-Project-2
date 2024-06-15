const mongoose = require('mongoose');

const uri = `your_uri_mongodb`
async function connect() {
    try{
        await mongoose.connect(uri);
        console.log('Connect database successfully');
    } catch (error) {
        console.log('Connect failure');
    }
}

module.exports = { connect };