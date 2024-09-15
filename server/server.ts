import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';

const app: express.Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket'
});
const peerServer = ExpressPeerServer(httpServer);
const port = 3000;

app.use('/peer', peerServer);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  // 接続時のイベント
  console.info('connected!');

  socket.on('sendMessage', (message: string) => {
    console.info(`message: ${message}`);
    io.emit('chat', message);
  });

  socket.onAny((event, data) => {
    socket.broadcast.emit(event, data);
  });

   // 接続が切れた時のイベント
  socket.on('disconnect', () => {
    console.info('disconnected!');
  });
});


httpServer.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

