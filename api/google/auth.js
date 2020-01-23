const { google } = require('googleapis');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname);
const credentials = JSON.parse(fs.readFileSync(path.join(filePath, 'client.json'), 'utf-8'));

module.exports = function(data = Object) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
    oAuth2Client.setCredentials(data.google);
    return oAuth2Client;
}