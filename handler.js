'use strict';
const fs = require('fs');
const querystring = require('querystring');
const { App } = require('./app');
const COMMENTS_PATH = `${__dirname}/data/todo.json`;

const CONTENT_TYPES = require('./public/lib/mimeTypes');

const serveBadRequestPage = function(req, res) {
  res.statusCode = 404;
  res.end('Page not found');
};

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticPage = function(req, res, next) {
  const filename = req.url === '/' ? '/index.html' : req.url;

  if (!fs.existsSync(`./public${filename}`)) {
    return next();
  }
  let fileContent = fs.readFileSync(`${STATIC_FOLDER}${filename}`);
  const [, extension] = filename.split('.');
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fileContent);
};

const todos = [];

const createNewTask = function(req, res) {
  const todo = querystring.parse(req.body);
  todo.items = todo.items.map((item, index) => {
    return { item, id: index + 1 };
  });
  todo['id'] = todos.length + 1;
  todos.push(todo);

  fs.writeFileSync(COMMENTS_PATH, JSON.stringify(todos));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todos));
};

const readBody = function(req, res, next) {
  let userDetails = '';
  req.on('data', chunk => {
    userDetails += chunk;
    return userDetails;
  });
  req.on('end', () => {
    req.body = userDetails;
    next();
  });
};

const methodNotAllowed = function(req, res) {
  res.statusCode = 405;
  res.end();
};

const app = new App();

app.use(readBody);
app.get('', serveStaticPage);
app.post('createNewTask', createNewTask);
app.get('', serveBadRequestPage);
app.post('', serveBadRequestPage);
app.use(methodNotAllowed);

module.exports = { app };