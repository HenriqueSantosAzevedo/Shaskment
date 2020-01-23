const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const commands = require('../api/google/commands.js');
const mongoose = require('mongoose');
const google = mongoose.model('googleData', require('../Mongo - Schemas/google.js'));
const user = mongoose.model('user', require('../Mongo - Schemas/user.js'));

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


router.get('/email/in', require('../config/authentification').isLogedin(), (req, resp, next) => {

    google
        .findOne({
            uuid: req.user
        })
        .then((googleData) => {
            const auth = require('../api/google/auth.js')(googleData);
            commands
                .getLabelList(auth)
                .then((List) => {
                    console.log(req.query)

                    commands
                        .getEmailList(auth, req.query.pageToken != undefined ? req.query.pageToken : '', req.query.query != undefined ? req.query.query : '', 100)
                        .then((emailIds) => {
                            commands
                                .getEmail(auth, emailIds[0])
                                .then((emails) => {
                                    user
                                        .findOne({
                                            uuid: req.user
                                        })
                                        .then((theme) => {
                                            commands
                                                .getLabelData(auth, List)
                                                .then((labelList) => {

                                                    const label = labelList.find(function (element) {
                                                        return element.id == req.query.label;
                                                    });                                                    
                                                    
                                                    if(label.name.includes("/")){
                                                        label.name = label.name.split("/")[label.name.split("/").length-1];
                                                        label.name = label.name.charAt(0).toUpperCase() + label.name.slice(1).toLowerCase();
                                                    }

                                                    labelList = labelList.filter(function(element) {
                                                        if(element.labelListVisibility != 'labelHide' && !element.name.includes("/")) return element;
                                                    })

                                                    let Data = {
                                                        'Title': label.name,
                                                        'emailList': emails,
                                                        'labelList': labelList.reverse(),
                                                        'CurrentLabel': label,
                                                        'maxResults': emailIds[2],
                                                        'theme': theme.page.theme
                                                    }
                                                    if (emailIds[1] != undefined) Data.nextPage = emailIds[1];
                                                    resp.render('emails/in', Data);
                                                }).catch(err => {
                                                    resp.render("404", {ERROR: err})
                                                })
                                        }).catch(err => {
                                            resp.render("404", {ERROR: err})
                                        })
                                })
                                .catch(err => {
                                    resp.render("404", {ERROR: err})
                                })
                        }).catch(err => {
                            resp.render("404", {ERROR: err})
                        })
                }).catch(err => {
                    resp.render("404", {ERROR: err})
                })
        }).catch(err => {
            resp.redirect(redirectGoogle());
        })
});

router.get('/email/id/:id', require('../config/authentification').isLogedin(), (req, resp, next) => {

    google
        .findOne({
            uuid: req.user
        })
        .then((googleData) => {
            const auth = require('../api/google/auth.js')(googleData);
            commands
                .getLabelList(auth)
                .then((List) => {
                            commands
                                .getEmail(auth, [{id: req.params.id}])
                                .then((emails) => {
                                    user
                                        .findOne({
                                            uuid: req.user
                                        })
                                        .then((theme) => {
                                            commands
                                                .getLabelData(auth, List)
                                                .then((labelList) => {

                                                    labelList = labelList.filter(function(element) {
                                                        if(element.labelListVisibility == 'labelShow' && !element.name.includes("/")) return element;
                                                    })

                                            let Data = {
                                                'Title': 'Email: ' + (emails[0].subject != '' ? emails[0].subject : 'No Subject'),
                                                'message': emails[0],
                                                'labelList': labelList.reverse(),
                                                'CurrentLabel': {
                                                    color: {
                                                        backgroundColor: '#404E67',
                                                        textColor: '#ffffff'
                                                    }
                                                },
                                                'theme': theme.page.theme
                                            }

                                            commands.
                                                removeLabel(auth, req.params.id, ['UNREAD'])

                                            resp.render('emails/show', Data);
                                        }).catch(err => {
                                            resp.render("404")
                                        })
                                }).catch(err => {
                                    resp.render("404")
                                })
                        }).catch(err => {
                            resp.render("404", {error: "This email couldn't be found!"})
                        })
                }).catch(err => {
                    resp.render("404")
                })
        }).catch(err => {
            resp.redirect(redirectGoogle());
        })
});

module.exports = router;