'use strict';

const request = require('superagent');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const User = require('../model/user.js');
const Collection = require('../model/collection.js');

require('jest');

const url = 'http://localhost:3000';
const exampleUser = {
  username: 'exampleuser',
  password: '1234', 
  email: 'exampleuser@test.com',
};

const exampleCollection = {
  name: 'test collection1 name',
  desc: 'test collection1 desc',
};

describe('Collection Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Collection.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/collection', () => { 
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
    afterEach(done => {
      delete exampleCollection.userID;
      if (this.tempCollection) {
        Collection.remove({})
          .then(() => done())
          .catch(done);
        return;
      }
      done();
    });

    it('should return a collection when posted with valid body and token', done => {
      request.post(`${url}/api/collection`)
        .send(exampleCollection)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(exampleCollection.desc);
          expect(res.body.name).toEqual(exampleCollection.name);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });
    it('should return a 401 status when submitted without token', done => {
      request.post(`${url}/api/collection`)
        .send(exampleCollection)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return with a 400 status code without valid body', done => {
      request.post(`${url}/api/collection`)
        .set({ Authorization: `Bearer ${this.tempToken}` })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });
  
  describe('GET: /api/collection/:collectionId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
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
      exampleCollection.userID = this.tempUser._id.toString();
      new Collection(exampleCollection).save()
        .then( collection => {
          this.tempCollection = collection;
          done();
        })
        .catch(done);
    });
    afterEach( () => {
      delete exampleCollection.userID;
    });

    it(' with a valid body it should get a collection', done => {
      request.get(`${url}/api/collection/${this.tempCollection._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleCollection.name);
          expect(res.body.desc).toEqual(exampleCollection.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });
    it('without a token should return 401 status', done => {
      request.get(`${url}/api/collection/${this.tempCollection._id}`)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('should return 404 if id not found', done => {
      request.get(`${url}/api/collection/989`)
        .set({ Authorization: `Bearer ${this.tempToken}` })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('PUT /api/collection/:collectionId', () => {
    beforeEach(done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });
    beforeEach(done => {
      exampleCollection.userID = this.tempUser._id.toString();
      new Collection(exampleCollection).save()
        .then(collection => {
          this.tempCollection = collection;
          done();
        })
        .catch(done);
    });
    afterEach(() => {
      delete exampleCollection.userID;
    });

    it('should update a collection', done => {
      const updatedCollection = {
        name: 'test name updated',
      };
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .send(updatedCollection)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(updatedCollection.name);
          expect(res.body.desc).toEqual(exampleCollection.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });
    it('without a token should return a 401', done => {
      const updatedCollection = {
        name: 'test name updated',
      };
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .send(updatedCollection)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
    it('return 404 if id not found', done => {
      const updatedCollection = {
        name: 'test name updated',
      };
      request.put(`${url}/api/collection/989`)
        .send(updatedCollection)
        .set({ Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
    it('should return 400 is submitted without valid body', done => {
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .set({ Authorization: `Bearer ${this.tempToken}` })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });

  describe('routes other than /api/collection', () => {
    it('should return 404', done => {
      request.get(`${url}/api/gallery`)
        .set({ Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });
});