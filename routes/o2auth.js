const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const googleData = mongoose.model('googleData', require('../Mongo - Schemas/google.js'))
const md5 = require('md5');
const path = require('path');
const fs = require('fs');
const request = require('request')
const { google } = require('googleapis');

const filePath = path.join(__dirname + "/../api/google/");
const scopes = JSON.parse(fs.readFileSync(path.join(filePath, 'scopes.json'), 'utf-8'));
const client = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.client_id;
const cl_uri = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.redirect_uris;
const client_secret = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.client_secret;

router.get('/oauth2callback', (req, res, next) => {
    const code = req.query.code;
    const codePath = `code=${code}&client_id=${client}&client_secret=${client_secret}&redirect_uri=${cl_uri[1]}&grant_type=authorization_code`;

    request.post('https://www.googleapis.com/oauth2/v4/token', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: codePath,
        method: 'Post'
    }, (err, resp, body) => {
        if (err) return console.log(err);

        try {
            const userData = JSON.parse(resp.body);

            const uuid = 'uuid'
            const options = {
                uuid: req.user,
                last_update: new Date(),
                "google": userData
            };

            const data = new googleData(options);

            data.save();
            res.redirect('/')
        } catch (e) {

        }
    });
})

async function checkGoogleKey(params) {
    return new Promise((resolve, reject) => {
        googleData.findOne({ 'uuid': params })
            .then(data => {
                if (data == null) {
                    reject();
                } else {
                    resolve(data);
                }
            })
    })
}

module.exports = router;