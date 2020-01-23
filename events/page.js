const mongoose = require('mongoose');
const user_DB = mongoose.model('userList', require('../Mongo - Schemas/user.js'));
const taskboard_DB = mongoose.model('todos', require('../Mongo - Schemas/todos.js'));

module.exports = function(socket) {
    const user = socket.handshake.session.passport.user;

    socket.on('page.theme', function() {
        user_DB.findOne({uuid: user})
        .then((userData) => {
            socket.emit('page.theme', userData.page.theme)
        })
    })
}

