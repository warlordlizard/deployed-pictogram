'use strict';

const request = require('superagent');
const User = require('../model/user.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser', 
  password: '12345', 
  email: 'exampleuser@test.com',
};

describe('Auth Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });
    describe('with an invalid body or no request body', function() {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });
  });
  describe('GET /api/signin', function() {
    describe('with a valid body', function() {
      beforeEach( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            done();
          })
          .catch(done);
      });
      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
          .auth('exampleuser', '12345')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });
    describe('if user cannot be authenticated', function() {
      it('should return 401 error', done => {
        request.get(`${url}/api/signin`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });
});
