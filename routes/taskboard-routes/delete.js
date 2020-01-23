const express = require('express');
const router  = express.Router();

const fs = require('fs')
const path = require('path');
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../Mongo - Schemas/todos.js'));

router.get('/taskboard/menu/delete/:uuid', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    taskboard_DB.findOneAndDelete({uuid: req.params.uuid}).then((data) => {
        let flash = req.flash('messages');
        flash.push({type: "info", msg: "Successfully deleted"});
        req.flash('messages', flash);
        resp.redirect('/taskboard/menu');
    })
});

router.get('/taskboard/menu/remove/:uuid', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    let flash = req.flash('messages');
    taskboard_DB.findOne({uuid: req.params.uuid})
        .then((data) => {
            data.shared = data.shared.filter(e => e.uuid != req.user);
            data.save()
            flash.push({type: "info", msg: "Successfully disposed from board: " + data.name});
        })
        .finally((data) => {
            req.flash('messages', flash)
            resp.redirect('/taskboard/menu')
        })
});

module.exports = router;