const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../Mongo - Schemas/todos.js'));
const user_DB = mongoose.model('userList', require('../../Mongo - Schemas/user.js'));

router.post('/taskboard/menu/share/:uuid', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    
    const shareWith = JSON.parse(req.body.shareList);
    const toShare   = req.params.uuid;

    taskboard_DB.findOne({uuid: toShare})
        .then(board => {
            user_DB.findOne({uuid: req.user})
                .then((user) => {
                    var bar = new Promise((resolve, reject) => {
                        shareWith.forEach((userID, index, array) => {
                            user_DB.findOne({uuid: userID})
                                .then(userData => {
                                    setTimeout(() => {
                                        let flash = req.flash('messages');
                                        if (!board.shared.some(e => e.uuid === userID)) {
                                            board.shared.push({uuid: userData.uuid, type: 'full', sharedBy: {uuid: user.uuid, name: user.profile.name}});
                                            board.save();
                                            flash.push({type: "info", msg: "Successfully shared this board with " + userData.profile.name})
                                        }else {
                                            flash.push({type: "danger", msg: "You already have shared this board with " + userData.profile.name})
                                        }
                                        req.flash('messages', flash)
                                        if (index === array.length -1) resolve();
                                    }, 1);
                                })
                        })
                    });
                    
                    bar.then(function() {
                        resp.redirect("/taskboard/menu");
                    })
                })
        })
});

module.exports = router;