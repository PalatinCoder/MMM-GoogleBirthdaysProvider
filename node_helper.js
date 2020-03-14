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

        // schedule data update
        this.scheduleUpdate();
    },

    stop: function() {
        this._log("Stopping helper");
    },

    // schedule next update.
    scheduleUpdate: function() {
        let self = this;

        // compute uodate intervall
        let nextLoad = 1 * 3600 * 1000; // 1h
        this._log(`Next update in ${nextLoad} milliseconds`);

        // schedule net update
        setTimeout(function() {
            self._refreshData();
            self.scheduleUpdate();
        }, nextLoad);
    },

    ical: icalGenerator({name: 'MMM-GoogleBirthdaysProvider', domain: 'mmm-googlebirthdaysprovider.local'}),

    _createIcalEvents: function(birthdays) {
        if (typeof birthdays == "undefined" ) {
            this._log("birthday list is undefined.");
            return;
        } else if (birthdays.length == 0) {
            this._log("birthday list is empty.");
            return;
        }
        this._log(`${birthdays.length} birthdays found.`);
        this.ical.clear()
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
        apiHelper.getBirthdays(this.path)
            .then(birthdays => this._createIcalEvents(birthdays))
            .catch(reason => {
                // TODO: Show notification on the mirror ?
                this._error(`_refreshData: ${reason.message}: ${reason.err || ''}`);
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
