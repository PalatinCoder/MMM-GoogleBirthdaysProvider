var NodeHelper = require("node_helper")
const moment = require("moment")
const icalGenerator = require("ical-generator")
const apiHelper = require("./google-api-helper");

module.exports = NodeHelper.create({
    requiresVersion: '2.6.0', // 2.6.0 got a fix for recurring events before 1970, which is pretty usefull for birthdays :D

    start: function() {

        this._refreshData();

        this.expressApp.use("/" + this.name, (req, res) => {
            this.ical.serve(res)
        })

        this._log('Server is running')
    },

    stop: function() {
        this._log("Stopping helper");
    },
    
    ical: icalGenerator({name: 'MMM-GoogleBirthdaysProvider', domain: 'mmm-googlebirthdaysprovider.local'}),
    
    _createIcalEvents: function(birthdays) {
        birthdays.forEach(person => {
            var year = person.birthday.year || new Date().getFullYear();
            var date = moment([year, person.birthday.month - 1, person.birthday.day]);
            this.ical.createEvent({
                start: date,
                end: date.add(1,'day'),
                repeating: person.birthday.year ? { freq: 'YEARLY' } : undefined, // repeat yearly if a year is set
                summary: `${person.name}`,
                allDay: true
            });
        });
    },

    _refreshData: function() {
        this.ical.clear();
        apiHelper.getBirthdays(this.path)
            .then(birthdays => this._createIcalEvents(birthdays))
            .catch(reason => {
                // TODO: Show notification on the mirror ?
                this._error(`API Helper error: ${reason.message}: ${reason.err || ''}`);
            });
    },
    
    // custom logger utility to supress output in CI env
    _log: function(message) {
        if (process.env.NODE_ENV !== 'test') { console.log(`${this.name}: ${message}`) }
    },
    _error: function(message) {
        if (process.env.NODE_ENV !== 'test') { console.error(`${this.name}: ${message}`) }
    }
});
