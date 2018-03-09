'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('pictogram:image-route');

const Image = require('../model/image.js');
const Collection = require('../model/collection.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const imgRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

function s3uploadProm(params) {
  debug('s3 upload prom');
  return new Promise((resolve) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

imgRouter.post('/api/collection/:collectionId/image', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/collection/:collectionId/image');
  if(!req.file) return next(createError(400, 'file not found'));
  if(!req.file.path) return next(createError(500, 'file not saved'));
  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Collection.findById(req.params.collectionId)
    .then( () => s3uploadProm(params))
    .then( s3data => {
      console.log('s3 response:', s3data);
      del([`${dataDir}/*`]);

      let imgData = {
        name: req.body.name,
        desc: req.body.desc,
        objectKey: s3data.Key,
        imageURI: s3data.Location,
        userID: req.user._id,
        collectionID: req.params.collectionId,
      };
      return new Image(imgData).save();
    })
    .then( img => res.json(img))
    .catch( err => next(err));
});

