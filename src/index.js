const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {getUser ,addUser ,removeUser ,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000 || process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new WebSocket happend')

    socket.on('join', ({ username, room } , callback) => {
        const {error , user} = addUser({id:socket.id , username ,room})
      
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message', generateMessage('Welcome!') , 'Server')
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`) ,'Server')
        io.to(user.room).emit('roomData' , {
            room:user.room ,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(message) ,user.username)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps/place/${coords.latitude},${coords.longitude}`) ,user.username)
        callback()
    })

    socket.on('disconnect', () => {
        const user =removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} disconnected`) , 'Server')
            io.to(user.room).emit('roomData' , {
                room:user.room ,
                users:getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log('server is up on port ' + port)
})