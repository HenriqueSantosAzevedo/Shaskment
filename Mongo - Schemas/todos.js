const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    uuid: String,
    name: String,
    tasks: Array,
    des: String,
    data: Date,
    creator: Object,
    shared: Array
}, {
    collection: 'todos'
})

module.exports = user;