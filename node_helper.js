var NodeHelper = require("node_helper")
const moment = require("moment")
const icalGenerator = require("ical-generator")
const apiHelper = require("./google-api-helper");

module.exports = NodeHelper.create({
    requiresVersion: '2.6.0', // 2.6.0 got a fix for recurring events before 1970, which is pretty usefull for birthdays :D

    config: {
        refreshInterval: 0.5 * 60 * 60 * 24, // twice / day
    },

    start: function() {

        this._refreshData();

        var self = this;
        this.refreshInterval = setInterval(()=>{ self._refreshData() }, this.config.refreshInterval);

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
            var date = moment({ day: person.birthday.day,
                                month: person.birthday.month - 1,
                                year: person.birthday.year,
                                hour: 12, minute: 0 , second: 0} );
            this.ical.createEvent({
                start: date,
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
