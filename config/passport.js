const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uuid = require('uuid');


const user = mongoose.model('user', require('../Mongo - Schemas/user.js'));

passport.serializeUser(function (user_id, done) {
    done(null, user_id)
});

passport.deserializeUser(function (user_id, done) {
    done(null, user_id)
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'passwd',
    passReqToCallback: true
},
    function (req, name, password, done) {
        user.find({
            $or: [
                { 'profile.name': name },
                { 'profile.email': req.body.email }
            ]
        })
            .then((userData) => {
                if (userData.length > 0) return done(null, null, { message: "Email is already used." })
                if (req.body.item_checkbox != 'option1') return done(null, null, { message: "Accept Terms and Conditions" })

                
                const newUser = {
                    'uuid': uuid(name),
                    'pass': encryptPassword(password),
                    'page': {theme: 'light'},
                    'profile': {
                        'name': name,
                        'email': req.body.email,
                        'friends': [],
                        'status': "Hey there. I'm new here!"
                    }
                }

                const data = new user(newUser);
                data.save();

                done(null, newUser.uuid)
            }).catch((e) => { done(null, null, { message: e }) });
    }
))

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd',
    passReqToCallback: true
},
    function (req, name, password, done) {
        user.findOne({ 'profile.email': name })
            .then(data => {

                if (data != null) {
                    const isValid = validPassword(password, data.pass);
                    if (isValid) {
                        done(null, data.uuid)
                    } else {
                        done(null, false, req.flash("debug", {"error": ["Invalid password"], "username": name}));
                    }
                } else {
                    done(null, false, req.flash("debug", {"error": ["No user found"], "username": name}));
                }
            })
            .catch(err => {
                done(null, null, { message: err.error });
            })
    }
))




function encryptPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}

function validPassword(password, toComp) {
    return bcrypt.compareSync(password, toComp);
}