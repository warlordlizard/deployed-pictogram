'use strict';

const request = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

const Image = require('../model/image.js');
const Collection = require('../model/collection.js');
const User = require('../model/user.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com',
};

const exampleColl = {
  name: 'example collection name',
  desc: 'example collection desc',
};

const exampleImg = {
  name: 'example image',
  desc: 'example image desc',
  image: `${__dirname}/../data/cat.jpg`,
};

describe('Image Routes', function() {
  beforeAll( done => serverToggle.serverOn(server, done));
  afterAll( done => serverToggle.serverOff(server, done));
  afterEach( done => {
    Promise.all([
      Image.remove({}),
      User.remove({}),
      Collection.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });
  describe('POST: /api/collection/:collectionId/Image', function() {
    describe('with a valid token and data', function() {
      beforeEach( done => {
        new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            return user.generateToken();
          })
          .then( token => {
            this.tempToken = token;
            done();
          })
          .catch(done);
      });
      beforeEach( done => {
        exampleColl.userID = this.tempUser._id.toString();
        new Collection(exampleColl).save()
          .then( collection => {
            this.tempColl = collection;
            done();
          })
          .catch(done);
      });
      afterEach( done => {
        delete exampleColl.userID;
        done();
      });

      it('should return an object that contains img url', done => {
        request.post(`${url}/api/collection/${this.tempColl._id}/image`)
          .set({ Authorization: `Bearer ${this.tempToken}`})
          .field('name', exampleImg.name)
          .field('desc', exampleImg.desc)
          .attach('image', exampleImg.image)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleImg.name);
            expect(res.body.desc).toEqual(exampleImg.desc);
            expect(res.body.collectionID).toEqual(this.tempColl._id.toString());
            expect(typeof res.body.imageURI).toEqual('string');
            done();
          });
      });
    });
  });
});