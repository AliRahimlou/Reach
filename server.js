const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();
const server = require('http').createServer(app)
const io = require("socket.io")(server)



// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));
// Serve up static assets (usually on heroku)


// Define API routes here
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/posts', require('./routes/posts'));
app.use('/chat', require('./routes/chat'));

//Define Models here
const { Chat } = require("./models/Chat");

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

io.on('connection', socket => {
  console.log('made socket connection', socket.id);

  socket.on("Input Chat Message", msg => {
    
    connectDB.then(db => {
      try {
          let chat = new Chat({ message: msg.chatMessage, sender:msg.userID, type: msg.type })

          chat.save((err, doc) => {
            if(err) return res.json({ success: false, err })

            Chat.find({ "_id": doc._id })
            .populate("sender")
            .exec((err, doc)=> {

                return io.emit("Output Chat Message", doc);
            })
          })
      } catch (error) {
        console.error(error);
      }
    })
   })

})

server.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});
// io.on('connection', (socket) => {
//   console.log('made socket connection', socket.id)

//   socket.on('chat', function (data) {
//     io.sockets.emit('chat', data);
//     console.log('chat data: ' + data.message)
//   });

//   socket.on('typing', function (data) {
//     socket.broadcast.emit('typing', data)
//     // console.log('working')
//   })

//   socket.on('user image', function (msg) {
//     //Received an image: broadcast to all
//     socket.broadcast.emit('user image', socket.nickname, msg);
//   });
// })
