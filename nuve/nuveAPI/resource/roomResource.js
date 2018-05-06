/*global exports, require*/
'use strict';
var roomRegistry = require('./../mdb/roomRegistry');
var serviceRegistry = require('./../mdb/serviceRegistry');
var cloudHandler = require('../cloudHandler');

var logger = require('./../logger').logger;

// Logger
var log = logger.getLogger('RoomResource');

/*
 * Gets the service and the room for the proccess of the request.
 */
var doInit = function (req, callback) {
    serviceRegistry.getRoomForService(req.params.room, req.service, function (room) {
        callback(room);
    });
};

/*
 * Get Room. Represents a determined room.
 */
exports.represent = function (req, res) {
    doInit(req, function (currentRoom) {
        if (req.service === undefined) {
            res.status(401).send('Client unathorized');
        } else if (currentRoom === undefined) {
            log.info('message: representRoom - room does not exits, roomId: ' + req.params.room);
            res.status(404).send('Room does not exist');
        } else {
            log.info('message: representRoom success, roomId: ' + currentRoom._id +
                ', serviceId: ' + req.service._id);
            res.send(currentRoom);
        }
    });
};

/*
 * Update Room.
 */
exports.updateRoom = function (req, res) {
    doInit(req, function (currentRoom) {
        if (req.service === undefined) {
            res.status(401).send('Client unathorized');
        } else if (currentRoom === undefined) {
            log.info('message: updateRoom - room does not exist + roomId: ' + req.params.room);
            res.status(404).send('Room does not exist');
        } else if (req.body.name === undefined) {
            log.info('message: updateRoom - Invalid room');
            res.status(400).send('Invalid room');
        } else {
            var id = '',
                array = req.service.rooms,
                index = -1,
                i;

            id += currentRoom._id;
            var room = currentRoom;

            room.name = req.body.name;
            var options = req.body.options || {};


            if (options.p2p) {
                room.p2p = true;
            }
            if (options.data) {
                room.data = options.data;
            }
            if (typeof options.mediaConfiguration === 'string') {
                room.mediaConfiguration = options.mediaConfiguration;
            }

            roomRegistry.updateRoom(id, room);

            for (i = 0; i < array.length; i += 1) {
                if (array[i]._id === currentRoom._id) {
                    index = i;
                }
            }
            if (index !== -1) {

                req.service.rooms[index] = room;
                serviceRegistry.updateService(req.service);
                log.info('message: updateRoom  successful, roomId: ' + id + ', serviceId: ' +
                    req.service._id);
                res.send('Room Updated');
            }
        }
    });
};

/*
 * Patch Room.
 */
exports.patchRoom = function (req, res) {
    doInit(req, function (currentRoom) {
        if (req.service === undefined) {
            res.status(401).send('Client unathorized');
        } else if (currentRoom === undefined) {
            log.info('message: pachRoom - room does not exist, roomId : ' + req.params.room);
            res.status(404).send('Room does not exist');
        } else {
            var id = '',
                array = req.service.rooms,
                index = -1,
                i;

            id += currentRoom._id;
            var room = currentRoom;

            if (req.body.name) room.name = req.body.name;
            if (req.body.options) {
              if (req.body.options.p2p) room.p2p = req.body.options.p2p;
              if (req.body.options.data) {
                  for (var d in req.body.options.data) {
                      room.data[d] = req.body.options.data[d];
                  }
              }
            }

            roomRegistry.updateRoom(id, room);

            for (i = 0; i < array.length; i += 1) {
                if (array[i]._id === currentRoom._id) {
                    index = i;
                }
            }
            if (index !== -1) {

                req.service.rooms[index] = room;
                serviceRegistry.updateService(req.service);
                log.info('message: patchRoom room successfully updated,  roomId: ' + id +
                    ', serviceId: ' + req.service._id);

                res.send('Room Updated');
            }
        }
    });
};


/*
 * Delete Room. Removes a determined room from the data base
 * and asks cloudHandler to remove it from erizoController.
 */
exports.deleteRoom = function (req, res) {
    doInit(req, function (currentRoom) {
        if (req.service === undefined) {
            res.status(401).send('Client unathorized');
        } else if (currentRoom === undefined) {
            log.info('message: deleteRoom - room does not exist, roomId: ' + req.params.room);
            res.status(404).send('Room does not exist');
        } else {
            var id = '',
                array = req.service.rooms,
                index = -1,
                i;

            id += currentRoom._id;
            roomRegistry.removeRoom(id);

            for (i = 0; i < array.length; i += 1) {
                if (array[i]._id === currentRoom._id) {
                    index = i;
                }
            }
            if (index !== -1) {
                req.service.rooms.splice(index, 1);
                serviceRegistry.updateService(req.service);
                log.info('message: deleteRoom - room successfully deleted, roomId: ' + id +
                    ', serviceId: ' + req.service._id);
                cloudHandler.deleteRoom(id, function () {});
                res.send('Room deleted');
            }
        }
    });
};
