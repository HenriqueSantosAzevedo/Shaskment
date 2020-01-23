const express = require('express');
const router  = express.Router();

const fs = require('fs')
const path = require('path');
const colors = JSON.parse(fs.readFileSync(path.join(__dirname, 'color.json'), 'utf-8'))
const uuid = require('uuid');
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../Mongo - Schemas/todos.js'));
const user_DB = mongoose.model('userList', require('../../Mongo - Schemas/user.js'));

router.post('/taskboard/menu/create', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    let tasks = req.body['group-a']

    if(tasks != undefined) {
        for(let i = 0; i < tasks.length; i++) {
            tasks[i].color = colors[tasks[i].state].title;
        }
    }

    const uid = uuid(req.body.name);

    user_DB.findOne({uuid: req.user})
        .then(user => {
            new taskboard_DB({
                name: req.body.name,
                des: req.body.des,
                tasks: tasks,
                uuid: uid,
                date: new Date(),
                shared: [],
                creator: {
                    "name": user.profile.name,
                    "uuid": user.uuid
                }
            }).save();
            resp.redirect("/taskboard/menu");
        })
});

module.exports = router;