const express = require('express');
const router  = express.Router();

const fs = require('fs')
const path = require('path');
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../../Mongo - Schemas/todos.js'));
const user_DB = mongoose.model('userList', require('../../../Mongo - Schemas/user.js'));


router.get('/taskboard/board/:uuid', require('../../../config/authentification').isLogedin(), (req, resp, next) => {
    user_DB.findOne({uuid: req.user})
        .then((user) => {
            taskboard_DB.findOne({uuid: req.params.uuid})
                .then(data => {
                    resp.render('taskboard/taskboard', {
                        data: data,
                        msgList: req.flash('messages'),
                        theme: user.page.theme
                    });
                });
        })
});

module.exports = router;