const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const http = require("http");
const socketio = require('socket.io')
const { instrument } = require('@socket.io/admin-ui');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);

const lobbyRoutes = require('./routes/lobby-rts');
const userRoutes = require('./routes/user-rts');
const adminRoutes = require('./routes/admin-rts');

const servName = 'MHK';
const port = 5000;

const whiteList = [process.env.CLIENT_URL_HTTP, process.env.CLIENT_URL_HTTPS];
const corsOpts = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin: ${origin} not allowed by CORS.`));
    };
  },
  credentials: true
};

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: true,
  origins: [process.env.CLIENT_URL_HTTP, process.env.CLIENT_URL_HTTPS]
});

require('./io/io')(io);

app.use(cors(corsOpts));
app.use(express.json());
app.use(cookieParser());
// resave false so session will only be saved if something in the session changes, not on every req; saveuninit false so session not saved before a req where it doesn't need to be saved
// note: add cookie: {} to config session cookie
const store = new MongoDBStore({
  uri: process.env.DB_URL,
  collection: 'sessions'
});

app.use(session({
  secret: 'xyz',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { maxAge: 60 * 60 * 3000 } // 3hr
}));

// app.use((req, res, next) => {
//   // res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//   next();
// })

app.use('/api/user', userRoutes);
app.use('/api/lobby', lobbyRoutes);
app.use('/api/admin', adminRoutes);

// this will execute if any middleware before it throws an error
app.use((error, req, res, next) => {
  // check if a response has already been sent
  if (res.headerSent) {
    return next(error);
  };
  // send error code attached to the error object that was recieved, if any, or else send error code 500
  res.status(error.code || 500);
  // send a message to the client to show to the user
  res.json({message: error.message || 'An unknown error occurred!'});
});

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    server.listen(process.env.PORT || port, () => console.log(`${servName} listening on port ${port}`));
  })
  .catch(error => console.log(error));

// server.listen(process.env.PORT || port, () => console.log(`sgp server listening on port ${port}`)

instrument(io, { auth: false });