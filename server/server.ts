import experss from 'express';

const app: experss.Express = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.info(`Server is running on port ${port}`)
});

