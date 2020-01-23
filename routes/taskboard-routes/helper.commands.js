
const mongoose = require('mongoose');
const taskboard_DB = mongoose.model('todos', require('../../Mongo - Schemas/todos.js'));

function test(element) {
    return new Promise((resolve, reject) => {
        taskboard_DB.findOne({uuid: element.uuid})
        .then((data) => {
            if(data != null) data.type = element.type;
            resolve(data);
            
        })
        .catch((err) => reject(err))
    })
}

module.exports = {
    getTabelComplete: function(labelIds = Array) {
        return new Promise((resolve, reject) => {
            let promiseArray = [];

            labelIds.forEach(element => {
                promiseArray.push(test(element))
            });

            Promise.all(promiseArray)
                .then(results => {
                    resolve(results)
                }).catch(err => {reject(err)})
        });
    },


}