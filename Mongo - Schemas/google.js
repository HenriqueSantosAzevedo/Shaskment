const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const googleData = new Schema({
    uuid: String,
    last_update: String,
    google: {
        "access_token": String,
        "token_type": String,
        "refresh_token": String,
        "scope": String,
        "expires_in": Number
    }
}, {
    collection: 'googleKeys'
})

module.exports = googleData;