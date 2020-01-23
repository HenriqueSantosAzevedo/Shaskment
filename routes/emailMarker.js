const express = require('express');
const router = express.Router();

const commands = require('../api/google/commands.js');
const mongoose = require('mongoose');
const google = mongoose.model('googleData', require('../Mongo - Schemas/google.js'));
const user = mongoose.model('user', require('../Mongo - Schemas/user.js'));

router.post('/email/removeLabel/:labelList', require('../config/authentification').isLogedin(), (req, resp, next) => {
    google
        .findOne({
            uuid: req.user
        })
        .then((googleData) => {
            const auth = require('../api/google/auth.js')(googleData);

            const list = JSON.parse(req.body.list);
            list.forEach(item => {
                commands.removeLabel(auth, item, [req.params.labelList])
            })

            resp.redirect(req.body.location)
        });
});

router.post('/email/addLabel/:labelList', require('../config/authentification').isLogedin(), (req, resp, next) => {
    google
        .findOne({
            uuid: req.user
        })
        .then((googleData) => {
            const auth = require('../api/google/auth.js')(googleData);
            const list = JSON.parse(req.body.list);
            list.forEach(item => {
                commands.addLabel(auth, item, [req.params.labelList])
            })
            resp.redirect(req.body.location)
        });
});

module.exports = router;