import express from 'express';

const app: express.Express = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

