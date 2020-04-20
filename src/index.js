const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage,generateLocationMessage } = require('../src/utils/messages');
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDicrectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDicrectoryPath));


io.on('connection', (socket)=>{
    console.log('New WebSocket Connection');

    socket.on('join', ({ username,room }, callback)=>{

        const {error,user} =  addUser({id:socket.id,username,room});
        if(error){
            return callback(error);
        }
        socket.join(user.room);

        socket.emit('welcomeMessage', generateMessage(user.username,'Welcome!'));
        socket.broadcast.to(user.room).emit('welcomeMessage', generateMessage(`${user.username} has joined!`));

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (msg, callback)=>{
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);

        io.to(user.room).emit('welcomeMessage',generateMessage(user.username,msg));
        callback();
    })


    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('welcomeMessage', generateMessage(user.username,`${user.username} has left!`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
   
})



server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})