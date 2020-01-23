const express = require('express');
const router  = express.Router();

const fs = require('fs')
const path = require('path');
const colors = JSON.parse(fs.readFileSync(path.join(__dirname, 'color.json'), 'utf-8'))
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../Mongo - Schemas/todos.js'));
const user_DB = mongoose.model('userList', require('../../Mongo - Schemas/user.js'));


router.get('/taskboard/menu', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    taskboard_DB.find({'creator.uuid': req.user})
        .then((result) => {
            const flash = req.flash('messages');
            taskboard_DB.find({'shared': {$elemMatch: {uuid: req.user}}})
                .then((result2) => {
                    if(result.length == 0 && result2.length == 0) {
                        resp.render('taskboard/taskmenu', {COLORS: JSON.stringify(colors),msgList: flash})
                    }else {
                        const TASKBOARDS = result.filter(id => id != null) || [];
                        const SHARED     = JSON.parse(JSON.stringify(result2)).filter(id => id != null) || [];
                        
                        new Promise((resolve, reject) => {
                            if(SHARED.length > 0) {
                                SHARED.forEach((item, index, array) => {
                                    item.from = item.shared.filter(e => e.uuid === req.user)[0].sharedBy
                                    if (index === array.length -1) resolve();
                                })
                            } else {
                                resolve();
                            }
                        }).then((data) => {
                            resp.render('taskboard/taskmenu', {
                                TASKBOARDS: TASKBOARDS,
                                SHARED: SHARED,
                                SHARED_BY: SHARED,
                                COLORS: JSON.stringify(colors),
                                msgList: flash
                            })
                        })
                    }
                })
        })
});

module.exports = router;