/*global require, describe, it, beforeEach, afterEach*/
'use strict';
var mocks = require('../utils');
var request = require('supertest');
var express = require('express');
var sinon = require('sinon');
var bodyParser = require('body-parser');

var kArbitraryRoom = {'_id': '1', name: '', options: {p2p: true, data: ''}};
var kArbitraryService = {'_id': '1', rooms: [kArbitraryRoom]};
var kArbtiraryUser = {name: '1'};

describe('Users Resource', function() {
  var app,
      usersResource,
      serviceRegistryMock,
      nuveAuthenticatorMock,
      setServiceStub,
      cloudHandlerMock;

  beforeEach(function() {
    mocks.start(mocks.licodeConfig);
    cloudHandlerMock = mocks.start(mocks.cloudHandler);
    serviceRegistryMock = mocks.start(mocks.serviceRegistry);
    nuveAuthenticatorMock = mocks.start(mocks.nuveAuthenticator);
    setServiceStub = sinon.stub();
    usersResource = require('../../resource/usersResource');

    app = express();
    app.use(bodyParser.json());
    app.all('*', function(req, res, next) {
      req.service = setServiceStub();
      next();
    });
    app.get('/rooms/:room/users', usersResource.getList);
  });

  afterEach(function() {
    mocks.stop(mocks.licodeConfig);
    mocks.stop(cloudHandlerMock);
    mocks.stop(serviceRegistryMock);
    mocks.stop(nuveAuthenticatorMock);
    mocks.deleteRequireCache();
    mocks.reset();
  });

  describe('Get List', function() {
    it('should fail if service is not present', function(done) {
      serviceRegistryMock.getRoomForService.callsArgWith(2, kArbitraryRoom);
      request(app)
        .get('/rooms/1/users')
        .expect(404, 'Service not found')
        .end(function(err) {
          if (err) throw err;
          done();
        });
    });

    it('should fail if room is not found', function(done) {
      serviceRegistryMock.getRoomForService.callsArgWith(2, undefined);
      setServiceStub.returns(kArbitraryService);
      request(app)
        .get('/rooms/1/users')
        .expect(404, 'Room does not exist')
        .end(function(err) {
          if (err) throw err;
          done();
        });
    });

    it('should fail if CloudHandler does not respond', function(done) {
      serviceRegistryMock.getRoomForService.callsArgWith(2, kArbitraryRoom);
      setServiceStub.returns(kArbitraryService);
      cloudHandlerMock.getUsersInRoom.callsArgWith(1, 'timeout');
      request(app)
        .get('/rooms/1/users')
        .expect(503, 'Erizo Controller managing this room does not respond')
        .end(function(err) {
          if (err) throw err;
          done();
        });
    });

    it('should succeed if user exists', function(done) {
      serviceRegistryMock.getRoomForService.callsArgWith(2, kArbitraryRoom);
      setServiceStub.returns(kArbitraryService);
      cloudHandlerMock.getUsersInRoom.callsArgWith(1, [kArbtiraryUser]);
      request(app)
        .get('/rooms/1/users')
        .expect(200, JSON.stringify([kArbtiraryUser]))
        .end(function(err) {
          if (err) throw err;
          done();
        });
    });
  });
});
