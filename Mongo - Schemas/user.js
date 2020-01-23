const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    uuid: String,
    pass: String,
    page: Object,
    profile: {
        online: Boolean,
        email: String,
        name: String,
        image: String,
        friends: Array,
        status: String,
        company: String
    },
    pending: Array
}, {
    collection: 'userList'
})

module.exports = user;