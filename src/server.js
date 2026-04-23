require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT || 3002);

app.listen(port, () => {
  console.log(`API: http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
});
