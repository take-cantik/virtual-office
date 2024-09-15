import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
const port = 3000;

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

  // 接続が切れた時のイベント
  socket.on('disconnect', () => {
    console.info('disconnected!');
  });
});


httpServer.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

