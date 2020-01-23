const mongoose = require('mongoose');
const user_DB = mongoose.model('userList', require('../Mongo - Schemas/user.js'));
const taskboard_DB = mongoose.model('todos', require('../Mongo - Schemas/todos.js'));

module.exports = function(socket) {
    const user = socket.handshake.session.passport.user;

    socket.on('getFriendsAvailable', (data) => {
        taskboard_DB.findOne({uuid: data.uuid})
            .then((result) => {
                user_DB.findOne({uuid: user})
                .then((userData) => {
                    friends = userData.profile.friends;
                    friends.forEach(async(friend_uuid) => {
                        if(!result.shared.some(e => e.uuid === friend_uuid.uuid)) {
                            user_DB.findOne({uuid: friend_uuid.uuid})
                                .then(async (data) => {
                                    socket.emit("addFriend", {name: data.profile.name, email: data.profile.email, uuid: data.uuid} )
                                });
                        }
                    });
                })
        })
    });
}