const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schedule = new Schema({
    uuid: String,
    scheduleList: []
}, {
    collection: 'schedule'
})

module.exports = schedule;