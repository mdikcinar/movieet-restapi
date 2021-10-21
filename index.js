const express = require('express');
var http = require("http");
require('./db/db_connection');
require('dotenv').config();

const app = express();
var server = require('http').Server(app);
var io = require("socket.io")(server);

const userRouter = require('./router/user_router');
const postRouter = require('./router/post_router');
const error = require('./middleware/errorhandle_middleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use(error.errorHandling);
app.use(error.notFoundPage);

app.listen(process.env.PORT, () => {
    console.log('Server listening port: ' + process.env.PORT);
});

/*server.listen(3000, () => {
    console.log('Server listening port:3000');
});


io.on('connection', function (socket) {
    id = socket.id;
    console.log('new connection ', id);

    socket.on('user', function () {
        console.log('user ' + socket.id + ' disconnected ');
    });

    socket.on('disconnect', function () {
        console.log('user ' + socket.id + ' disconnected ');
    });
}
);*/