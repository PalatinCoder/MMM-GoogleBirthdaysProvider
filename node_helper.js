var NodeHelper = require("node_helper")
const moment = require("moment")
const icalGenerator = require("ical-generator")
const apiHelper = require("./google-api-helper");

module.exports = NodeHelper.create({
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
            var date = moment({ day: person.birthday.day,
                                month: person.birthday.month - 1,
                                // year: person.birthday.year,
                                hour: 0, minute: 0 , second: 0} );
            this.ical.createEvent({
                start: date,
                summary: `${person.name} hat Geburtstag`,
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
