const createError = require('http-errors');
const express = require('express');
const morgan = require("morgan");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./db/models');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const tagsRouter = require('./routes/tags');
const db = require('./db/models');

const cors = require('cors');
const { restoreUser } = require('./auth');
const { asyncHandler } = require('./routes/utils');
const app = express();

// view engine setup
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors({ origin: 'http://localhost:8080' }))
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// set up session middleware
const store = new SequelizeStore({ db: sequelize });

app.use(
  session({
    secret: 'theFastandtheCurious.sid',
    store,
    saveUninitialized: false,
    resave: false,
  })
);

// create Session table if it doesn't already exist
store.sync();



app.use(restoreUser)
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/tags', tagsRouter);

app.get('/', (req, res) => {
  res.render('index')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
