'use strict';

const express = require('express');
const debug = require(
  'debug'
)('pictogram:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const authRouter = require('./route/auth-route.js');
const collRouter = require('./route/collection-router.js');
const imgRouter = require('./route/image-route.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(collRouter);
app.use(imgRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up on ${PORT}`);
});
server.isRunning = true;