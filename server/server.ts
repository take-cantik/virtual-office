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

  // meイベントで自分のsocket.idを返す
  socket.emit('me', socket.id);

  socket.on('calluser', ({ userToCall, signalData, from, name }) => {
    console.info('calluser', userToCall, signalData, from, name);
    io.to(userToCall).emit('calluser', { signal: signalData, from, name });
  });

  socket.on('answercall', (data) => {
    console.info('answercall', data);
    io.to(data.to).emit('callaccepted', data.signal);
  });

   // 接続が切れた時のイベント
  socket.on('disconnect', () => {
    console.info('disconnected!' + socket.id);
    socket.broadcast.emit('callended');
  });
});


httpServer.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

