const mongoose = require('mongoose');
const user_DB = mongoose.model('userList', require('../Mongo - Schemas/user.js'));
const taskboard_DB = mongoose.model('todos', require('../Mongo - Schemas/todos.js'));

let offlineCounter = [];

module.exports = function(socket) {
    const user = socket.handshake.session.passport.user;
    let data = offlineCounter.filter(e => e.uuid == user);

    if(data.length > 0) {
        clearTimeout(data[0].function);
        user_DB.findOne({uuid: user})
        .then((userData) => {
            userData.profile.online = true;
            userData.save();
        })
        offlineCounter = offlineCounter.filter(e => e.uuid != user);
    }

    socket.on('disconnect', function() {
        offlineCounter.push({uuid: user, function: setTimeout(function() {
            offlineCounter = offlineCounter.filter(e => e.uuid != user);
            user_DB.findOne({uuid: user}).then((userData) => {userData.profile.online = false; userData.save()})
        }, 20000)})
    })

    socket.on('user.requests', function() {
        user_DB.findOne({uuid: user})
            .then((userData) => {
                userData.pending.forEach(data => {
                    user_DB.findOne({uuid: data})
                        .then((userData) => {
                            socket.emit('user.requests', {uuid: userData.uuid, profile: userData.profile})
                        });
                });
            })
    });

    socket.on('user.requests.accept', function(userID) {
        user_DB.findOne({uuid: user})
            .then((userData) => {
                userData.pending = userData.pending.filter(e => e != userID);
                userData.profile.friends.push({uuid: userID, date: new Date()});
                userData.save();
            })

        user_DB.findOne({uuid: userID})
            .then((userData) => {
                userData.pending = userData.pending.filter(e => e != user);
                userData.profile.friends.push({uuid: user, date: new Date()});
                userData.save();
            })
    });

    socket.on('user.requests.decline', function(userID) {
        user_DB.findOne({uuid: user})
            .then((userData) => {
                userData.pending = userData.pending.filter(e => e != userID);
                userData.save();
                console.log(userData)
            })
    });

    
}

function sendMessage(socket, type, msg) {
    socket.emit('user.toast', {type: type, msg:msg});
}