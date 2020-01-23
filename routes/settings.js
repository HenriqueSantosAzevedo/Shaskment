const express = require('express');
const router  = express.Router();

const mongoose = require('mongoose');
const user = mongoose.model('user', require('../Mongo - Schemas/user.js'));

router.get('/settings', require('../config/authentification').isLogedin(), (req, resp, next) => {
    user
        .findOne({uuid: req.user})
        .then((data) => {
            resp.render('settings', {
                Title: 'Settings',
                user: data,
                theme: data.page.theme
            })
        })    
});

router.post('/bar/:theme', require('../config/authentification').isLogedin(), async(req, resp, next) => {

    await user.updateOne({uuid: req.user}, {page: {theme: req.params.theme}});
    resp.redirect('/settings')
    
});

module.exports = router;