// module.exports = function(io) {
//     io.on('connection', (socket) => {
//         console.log(socket);
//
//         var message = socket.handshake.query['message'];
//         console.log(message);
//
//         io.to(socket.id).emit('message', 'hehe from server');
//     });
// };

var redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

// module.exports = function(io) {
//     var collaborations = [];
//
//     var socketIdToSessionId = [];
//
//     var sessionPath = '/temp_sessions';
//
//     io.on('connection', (socket) => {
//
//         let sessionId = socket.handshake.query['sessionId'];
//
//         socketIdToSessionId[socket.id] = sessionId;
//
//         if (!(sessionId in collaborations)) {
//             collaborations[sessionId] = {
//                 'participants': []
//             };
//         }
//
//         collaborations[sessionId]['participants'].push(socket.id);
//
//         socket.on('change', delta => {
//             console.log('change' + socketIdToSessionId[socket.id] + " " + delta);
//             let sessionId = socketIdToSessionId[socket.id];
//             if (sessionId in collaborations) {
//                 let participants = collaborations[sessionId]['participants'];
//                 for (let i = 0; i < participants.length; i++) {
//                     if (socket.id != participants[i]){
//                         io.to(participants[i]).emit('change', delta);
//                     }
//                 }
//             } else {
//                 console.log("WARNING: cannot tie socket_id to any collaboration!");
//             }
//         });
//
//         // handle cursorMove events
//         socket.on('cursorMove', cursor => {
//             console.log('cursorMove' + socketIdToSessionId[socket.id] + " " + cursor);
//             let sessionId = socketIdToSessionId[socket.id];
//             cursor = JSON.parse(cursor);
//             cursor['socketId']  = socket.id;
//
//             if (sessionId in collaborations) {
//                 let participants = collaborations[sessionId]['participants'];
//                 for (let i = 0; i < participants.length; i++) {
//                     if (socket.id != participants[i]){
//                         io.to(participants[i]).emit('cursorMove', JSON.stringify(cursor)); // don't forget this!
//                     }
//                 }
//             } else {
//                 console.log("WARNING: cannot tie socket_id to any collaboration!");
//             }
//         });
//
//     });
// };

// redis edition
module.exports = function(io) {
    var collaborations = [];

    var socketIdToSessionId = [];

    var sessionPath = '/temp_sessions';

    io.on('connection', (socket) => {

        let sessionId = socket.handshake.query['sessionId'];

        socketIdToSessionId[socket.id] = sessionId;

        if (sessionId in collaborations) {
            // session exists
            console.log("session exists");
            collaborations[sessionId]['participants'].push(socket.id);
        } else {
            console.log("session does not exist");
            redisClient.get(sessionPath + '/' + sessionId, function (data) {
                console.log("data is " + data);
               if (data) {
                   // session come back
                   console.log("Session terminated previously; pulling back from Redis.");
                   collaborations[sessionId] = {
                       'cachedChangeEvents': JSON.parse(data),
                       'participants': []
                   };
               } else {
                   // brand new session
                   console.log("Creating new session");
                   collaborations[sessionId] = {
                       'cachedChangeEvents': [],
                       'participants': []
                   };
               }
               collaborations[sessionId]['participants'].push(socket.id);
            });

        }


        socket.on('change', delta => {
            console.log('change ' + socketIdToSessionId[socket.id] + " " + delta);
            let sessionId = socketIdToSessionId[socket.id];

            if (sessionId in collaborations) {
                collaborations[sessionId]['cachedChangeEvents'].push(["change", delta, Date.now()]);
            }
            if (sessionId in collaborations) {
                let participants = collaborations[sessionId]['participants'];
                for (let i = 0; i < participants.length; i++) {
                    if (socket.id != participants[i]){
                        io.to(participants[i]).emit('change', delta);
                    }
                }
            } else {
                console.log("WARNING: change cannot tie socket_id to any collaboration!");
            }
        });

        // handle cursorMove events
        socket.on('cursorMove', cursor => {
            console.log('cursorMove' + socketIdToSessionId[socket.id] + " " + cursor);
            let sessionId = socketIdToSessionId[socket.id];
            cursor = JSON.parse(cursor);
            cursor['socketId']  = socket.id;

            if (sessionId in collaborations) {
                let participants = collaborations[sessionId]['participants'];
                for (let i = 0; i < participants.length; i++) {
                    if (socket.id != participants[i]){
                        io.to(participants[i]).emit('cursorMove', JSON.stringify(cursor)); // don't forget this!
                    }
                }
            } else {
                console.log("WARNING: cursor cannot tie socket_id to any collaboration!");
            }
        });

        socket.on('restoreBuffer', () => {
            let sessionId = socketIdToSessionId[socket.id];
            console.log('restoring buffer for session: ' + sessionId + ', socket: ' + socket.id);
            if (sessionId in collaborations) {
                let changeEvents = collaborations[sessionId]['cachedChangeEvents'];
                for (let i = 0; i < changeEvents.length; i++) {
                    socket.emit(changeEvents[i][0], changeEvents[i][1]);
                }
            }
        });

        socket.on('disconnect', function() {
           let sessionId = socketIdToSessionId[socket.id];
           console.log('socket' + socket.id + 'disconnected.');

           if (sessionId in collaborations) {
               let participants = collaborations[sessionId]['participants'];
               let index = participants.indexOf(socket.id);
               if (index >= 0) {
                   participants.splice(index, 1);
                   if (participants.length == 0) {
                       console.log("Last participant left. Storing in Redis");
                       let key = sessionPath + "/" + sessionId;
                       let value = JSON.stringify(collaborations[sessionId]['cachedChangeEvents']);
                       redisClient.set(key, value, redisClient.redisPrint);
                       redisClient.expire(key, TIMEOUT_IN_SECONDS);
                       delete collaborations[sessionId];
                   }
               }
           }
        });
    });
};
