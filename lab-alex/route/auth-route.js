'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('pictogram:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const User = require('../model/user.js');
const createError = require('http-errors');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');
  if(!req.body.username) return next(createError(400, 'ValidationError'));
  
  let password = req.body.password;
  delete req.body.password;
  
  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
  console.log('req.body',req.body);
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  User.findOne({ username: req.auth.username })
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
});