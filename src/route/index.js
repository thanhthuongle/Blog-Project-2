const siteRouter = require('./site');
const postsRouter = require('./posts');
const usersRouter = require('./users');

function route(app){
    app.use('/users', usersRouter);
    app.use('/posts', postsRouter);
    app.use('/', siteRouter);
}

module.exports = route;