import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app: express.Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket'
});
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  // 接続時のイベント
  console.info('connected!' + socket.id);

  socket.on('sendMessage', (message: string) => {
    console.info(`message: ${message}`);
    io.emit('chat', message);
  });

  socket.on('knock', (room) => {
    console.log(socket.id + ' is knocking room [' + room + ']');
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = (clientsInRoom === undefined) ? 0 : clientsInRoom.size;
    socket.emit('knocked response', numClients, room);

    socket.on('create', () => {
      console.log(socket.id + ' created room [' + room +']');
      socket.join(room);
      socket.emit('created', room);
    });

    socket.on('join', () => {
      console.log(socket.id + ' joined room [' + room + ']');
      socket.join(room);
      io.sockets.in(room).emit('joined', room, socket.id);
    });

    socket.on('allow', () => {
      console.log('room host allowed joining');
      socket.in(room).emit('allowed');
      socket.emit('allowed');
    });

    socket.on('message', (description) => {
      if (description.type === 'offer') {
        console.log('offer');
        socket.to(room).emit('offer', description);
      } else if (description.type === 'answer') {
        console.log('answer');
        socket.to(room).emit('answer', description);
      } else if (description.type === 'candidate') {
        console.log('candidate');
        socket.to(room).emit('candidate', description);
      } else {
        console.log('[ERROR] We can not read this message.');
      }
    });
  })

   // 接続が切れた時のイベント
  socket.on('disconnect', () => {
    console.info('disconnected!' + socket.id);
  });
});


httpServer.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

