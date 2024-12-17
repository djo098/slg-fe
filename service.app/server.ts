// dummy server.ts, functionality usually used in a server.ts file
// - error handling
// - logging
// - authentication
// - authorization

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf'); // Anti-CSRF module
var csrfProtection = csrf({ cookie: true });

import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(csrfProtection);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});