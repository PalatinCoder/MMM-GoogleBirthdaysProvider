const {google} = require('googleapis');
const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
    
readAuthenticationFiles = function(modulePath) {
    return new Promise((resolve, reject) => {
        Promise.all([
            readFile(`${modulePath}/google-api-credentials/credentials.json`),
            readFile(`${modulePath}/google-api-credentials/token.json`)
        ]).then(values => {
            var credentials = JSON.parse(values[0]);
            var token = JSON.parse(values[1]);
            resolve({credentials, token});
        }).catch(reason => {
            reject(reason);
        });
    });
};

exports.getBirthdays = function(modulePath) {
    return new Promise((resolve, reject) => {
        readAuthenticationFiles(modulePath)
            .then(AuthDetails => {
                // Setup OAuth Client
                const { client_secret, client_id, redirect_uris } = AuthDetails.credentials.installed;
                const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
                OAuth2Client.setCredentials(AuthDetails.token);
                return OAuth2Client;
            })
            .then(auth => {
                // Get the data from the API
                const service = google.people({version: 'v1', auth});
                service.people.connections.list({
                    resourceName: 'people/me',
                    personFields: 'names,birthdays',
                    pageSize: 2000 // nasty hardcoded value, maybe support pagination sometime
                }, (err, res) => {
                    if (err) reject({message: 'API Error', err});
                    
                    const connections = res.data.connections;
                    if (!connections) reject({message: 'No Connections found', err: ''});

                    birthdays = [];
                    connections.forEach(person => {
                        if(person.birthdays && person.birthdays.length > 0) {
                            birthdays.push({
                                name: person.names[0].displayName,
                                birthday: person.birthdays[0].date,
                            });
                        }
                    });
                    resolve(birthdays);
                });
            }).catch(reason => {
                reject({message: 'API Error', err: reason});
            });
    });
}
