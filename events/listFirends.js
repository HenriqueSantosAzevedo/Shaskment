const mongoose = require('mongoose');
const dateformat = require('dateformat');
const user_DB = mongoose.model('userList', require('../Mongo - Schemas/user.js'));

module.exports = function(socket) {
    const user = socket.handshake.session.passport.user;

    socket.on('list.friends', (data) => {
        user_DB.findOne({uuid: user})
        .then((userData) => {
            friends = userData.profile.friends;
            friends.forEach((friend) => {
                user_DB.findOne({uuid: friend.uuid})
                .then(async (data) => {
                    data = JSON.parse(JSON.stringify(data))
                    const date1 = friend.date;
                    const date2 = new Date();
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    data.profile.online = data.profile.online ? "Online" : "Offline";
                    data.date = diffDays + " days";
                    socket.emit("listFriend", data );
                });
            });
        })
    });

    socket.on('list.persons', () => {
        user_DB.find().then((list) => {
            list = list.filter(e => e != null).filter(e => e.uuid != user );
                user_DB.findOne({uuid: user})
                .then((userData) => {
                    friends = userData.profile.friends;
                    new Promise((resolve, reject) => {
                        list.forEach((item, index, array) => {
                            console.log(item)
                            socket.emit('addPerson', item)
                            if(index === array.length) resolve()
                        })
                    }).then(() => {
                        console.log("finished")
                    });
                })

        })
    });

    socket.on('request.friend', function(requestedUser) {
        user_DB.findOne({uuid: requestedUser})
            .then((data) => {
                if (!data.pending.some(e => e.uuid === user)) {
                    data.pending.push(user);
                    data.save();
                }
            })
    })

    socket.on('remove.friend', (data) => {
        user_DB.findOne({uuid: user})
            .then((userData) => {
                userData.profile.friends = userData.profile.friends.filter(e => e.uuid != data);
                userData.save()
            })
    
        user_DB.findOne({uuid: data})
            .then((userData) => {
                userData.profile.friends = userData.profile.friends.filter(e => e.uuid != user);
                userData.save()
            })
    });
}