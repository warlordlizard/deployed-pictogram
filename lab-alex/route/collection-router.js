'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('pictogram:collection-router');

const Collection = require('../model/collection.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const collRouter = module.exports = Router();

collRouter.post('/api/collection', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/collection');
  if (!req.body.name) return next(createError(400, 'bad request'));

  req.body.userID = req.user._id;
  new Collection(req.body).save()
    .then( collection => res.json(collection))
    .catch(next);
});

collRouter.get('/api/collection/:collectionId', bearerAuth, function(req, res, next) {
  debug('GET: /api/collection/:collectionId');

  Collection.findById(req.params.collectionId)
    .then( collection => res.json(collection))
    .catch(next);
});

collRouter.delete('/api/collection/:collectionId', bearerAuth, function (req, res, next) {
  debug('DELETE: /api/collection/:collectionId');
  if(!req.params.collectionId) return next(createError(404, err.message));

  Collection.findByIdAndRemove(req.params.collectionId, bearerAuth)
    .then( () => res.send(204))
    .catch(next);
});

collRouter.put('/api/collection/:collectionId', bearerAuth, jsonParser, function (req, res, next) {
  debug('PUT: api/collection/:collectionId');
  if (!req.body.name) return next(createError(400, 'bad request'));

  Collection.findByIdAndUpdate(req.params.collectionId, req.body, { new:true})
    .then(collection => res.json(collection))
    .catch(err => next(err));
});