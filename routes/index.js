const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const user = mongoose.model('user', require('../Mongo - Schemas/user.js'));

router.get('/', require('../config/authentification').isLogedin(), (req, resp, next) => {
    user
        .findOne({uuid: req.user})
        .then((data) => {
            resp.render('index', {
                Title: '',
                theme: data.page.theme
            })
        })
});

module.exports = router;