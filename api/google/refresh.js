const request = require('request');
const path = require('path');
const fs = require('fs');
const colors = require('colors')
const filePath = path.join(__dirname);
const client = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.client_id;
const client_secret = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8')).web.client_secret;

const mongoose = require('mongoose');
const googleData = mongoose.model('googleData', require('../../Mongo - Schemas/google.js'))

function refresh(data, userUUID) {
    const codePath = `client_id=${client}&client_secret=${client_secret}&refresh_token=${data.google.refresh_token}&grant_type=refresh_token`;
    request.post('https://www.googleapis.com/oauth2/v4/token', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: codePath,
        method: 'Post'
    }, (err, resp) => {
        if (err) return console.log(err);

        try {
            const userData = JSON.parse(resp.body);

            googleData.findOne({ 'uuid': userUUID })
                .then((found) => {
                    found.last_update = new Date();
                    found.google.access_token = userData.access_token;
                    found.save();
                    console.log("User:", colors.blue(userUUID), "refresched")
                })
        } catch (e) {}
    });
}

module.exports = {
    refreshKey: function(data, userUUID) {
        refresh(data, userUUID)

        setInterval(function count() {
            refresh(data, userUUID);
        }, 3599800)
    }
}