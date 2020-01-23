const mongoose = require('mongoose')
const googleData = mongoose.model('googleData', require('../Mongo - Schemas/google.js'));

module.exports = function() {
    googleData.find({})
        .then((data) => {
            data.forEach(data => {
                require('../api/google/refresh.js').refreshKey(data, data.uuid)
            })
        })
        .catch((data) => {
            console.log(data)
        })
}