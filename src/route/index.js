const siteRouter = require('./site');
const postsRouter = require('./posts');
const usersRouter = require('./users');
const likesRouter = require('./likes');
const commentsRouter = require('./comments');
const managersRouter = require('./managers');

function route(app){
    app.use('/managers', managersRouter);
    app.use('/comments', commentsRouter);
    app.use('/likes', likesRouter)
    app.use('/users', usersRouter);
    app.use('/posts', postsRouter);
    app.use('/', siteRouter);
}

module.exports = route;