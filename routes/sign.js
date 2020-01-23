const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
const path = require('path');




function redirectGoogle() {
    const filePath = path.join(__dirname + "/../api/google/");
    const scopes = JSON.parse(fs.readFileSync(path.join(filePath, 'scopes.json'), 'utf-8'));
    const client = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.client_id;
    const cl_uri = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.redirect_uris;

    let scopeString = ""
    scopes.forEach(scope => {
        scopeString = `${scopeString} ${scope}`
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopeString}&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${cl_uri[1]}&response_type=code&client_id=${client}`
}

router.get('/forgot-password', (req, res, next) => {
    res.render('forgot-password');
});

router.get('/signin', (req, res, next) => {
    const messages = req.flash('debug')[0]
    res.render('signin', {
        error: messages != undefined ? messages.error : [],
        username: messages != undefined ? messages.username : ""
    });
});

router.post('/signin', passport.authenticate('local.login', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}))


router.get('/signup', (req, res, next) => {
    const messages = req.flash('error');
    res.render('signup', {
        error: messages
    });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}))

router.get('/logout', require('../config/authentification').isLogedin(), (req, res, next) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/signin');
})

module.exports = router;