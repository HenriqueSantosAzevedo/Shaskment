const mongoose = require('mongoose');
const {
    google
} = require('googleapis');
const googleData = mongoose.model('googleData', require('../../Mongo - Schemas/google.js'))
const gmail = google.gmail({
    version: 'v1'
});
const Base64 = require('js-base64').Base64;
const dateFormat = require('dateformat');
const parseMessage = require('gmail-api-parse-message');

function getMails(auth, element) {
    return new Promise((resolve, reject) => {
        gmail.users.messages.get({
            'userId': 'me',
            'id': element.id,
            'auth': auth

        }, (err, res) => {
            if (err || res == undefined) {return reject(err)}
            const parsedMessage = parseMessage(res.data);
            const date = (dateFormat(parsedMessage.headers.date, 'dd mmm yyyy'))

            functions
                .getLabelData(auth, parsedMessage.labelIds)
                .then((data) => {

                    const labels = data.filter(function (element) {
                        if(element.color == undefined) element.color = {'textColor': '#ffffff', 'backgroundColor': '#404E67'}
                        element.name = element.name.charAt(0).toUpperCase() + element.name.slice(1).toLowerCase();
                        return element.labelListVisibility == 'labelShow' && element.id != 'STARRED';
                    });
                    CustomEmail = {
                        'message_id': parsedMessage.id,
                        'subject': parsedMessage.headers.subject,
                        'labelIds': parsedMessage.labelIds,
                        'sender': parsedMessage.headers.from,
                        'snippet': parsedMessage.snippet,
                        'labels': labels,
                        'date': date,
                        'body': {
                            'textHtml': parsedMessage.textHtml,
                            'textPlain': parsedMessage.textPlain
                        }
                    }
        
                    resolve(CustomEmail)
                }).catch(err => reject(err))
        });
    });
}

functions = {
    checkGoogleKey: async function (params) {
        return new Promise((resolve, reject) => {
            googleData.findOne({
                    'uuid': params
                })
                .then(data => {
                    if (data == null) {
                        reject();
                    } else {
                        
                        resolve(data);
                    }
                })
        })
    },

    getLabelData: function (auth, labelIds) {
        return new Promise((resolve, reject) => {

            let promiseArray = [];
            labelIds.forEach(data => {
                if(data.id != undefined) promiseArray.push(getData(data))
            });
            Promise.all(promiseArray)
                .then(results => {
                    resolve(results)
                }).catch(err => {reject(err)})

            function getData(data) {
                return new Promise((resolve, reject) => {
                    gmail.users.labels.get({
                        'userId': 'me',
                        'id': data.id,
                        'auth': auth

                    }, (err, res) => {
                        if (err && res == undefined) return reject(err);
                        let label = res.data;
                            label.name = label.name.charAt(0).toUpperCase() + label.name.slice(1).toLowerCase();
                            if(data.children) label.children = data.children;
                            if(label.color == undefined) label.color = { textColor: '#ffffff', backgroundColor: '#404E67' }
                        resolve(label)
                    });
                })
            }
        });
    },

    getLabel: async function (auth, labelID) {
        return new Promise((resolve, reject) => {
            gmail.users.labels.get({
                'userId': 'me',
                'id': labelID,
                'auth': auth
            }, (err, res) => {
                if (err) reject(err);
                resolve(res.data);
            })
        })
    },

    getEmailList: async function (auth, page = String, query = String, maxResults = Number) {
        return new Promise((resolve, reject) => {
            
            gmail.users.messages.list({
                'userId': 'me',
                'auth': auth,
                'pageToken': page,
                'maxResults': maxResults,
                'q': query
            }, (err, res) => {
                if (err) reject(err);
                if (res != undefined) resolve([res.data.messages, res.data.nextPageToken, maxResults])
                resolve([[], null, 0]);
            })
        })
    },

    getEmail: async function (auth, id) {
        return new Promise((resolve, reject) => {

            //Main Function
            if (id == undefined) id = []
            let promiseArray = [];
            id.forEach(element => {
                promiseArray.push(getMails(auth, element))
            });
            Promise.all(promiseArray)
                .then(results => {
                    resolve(results)
                }).catch(err => {reject(err)})
        })
    },

    getLabelList: async function (auth) {
        return new Promise((resolve, reject) => {
            gmail.users.labels.list({
                userId: 'me',
                auth: auth
            }, (err, res) => {
                if (err) return null;
                const labels = res.data.labels;
                labelList = [];
                if (labels.length) {
                    labels.forEach((label) => {
                        label.name = label.name.charAt(0).toUpperCase() + label.name.slice(1).toLowerCase();
                        if(label.color == undefined) label.color = { textColor: '#ffffff', backgroundColor: '#404E67' }
                        labelList.push(label)
                    });
                    const children = labels.filter(item => item.name.includes("/")) || [];

                    children.forEach(item => {
                        const name = item.name.split("/")
                        const index = labelList.findIndex(label => label.name == name[0]);
                        
                        if(index != -1) { 
                            if(labelList[index].children == undefined) {
                                labelList[index].children = [];
                            }
                            item.name = name[name.length-1]
                            labelList[index].children.push(item);
                        }
                    })
                    
                    
                } else {}
                resolve(labelList);
            })
        })
    },

    removeLabel: function(auth, messageId = String,labelsToRemove = Array){
        gmail.users.messages.modify({
            'userId': 'me',
            'auth': auth,
            'id': messageId,
            "resource": {
                "removeLabelIds": labelsToRemove
            }
        });
    },
    addLabel: function(auth, messageId = String,labelsToRemove = Array){
        gmail.users.messages.modify({
            'userId': 'me',
            'auth': auth,
            'id': messageId,
            "resource": {
                "addLabelIds": labelsToRemove
            }
        });
    },

    sendMessage: function(auth = String, ){
        var base64EncodedEmail = Base64.encodeURI(email);
        var request = gapi.client.gmail.users.messages.send({
        'userId': userId,
        'resource': {
            'raw': base64EncodedEmail
        }
        });
        request.execute(callback);
    }
}

module.exports = functions;