var NodeHelper = require("node_helper")
const icalGenerator = require("ical-generator")
const ical = icalGenerator({name: 'MMM-GoogleBirthdaysProvider'})
const apiHelper = require("./google-api-helper");

module.exports = NodeHelper.create({
    start: function() {

        apiHelper.getBirthdays(this.path)
            .then(birthdays => {
                birthdays.forEach(person => {
                    // TODO: this need refactoring really really bad,
                    // but I had to be quick by the time I implemented this :see_no_evil:
                    var date = new Date();
                    date.setUTCFullYear((new Date).getUTCFullYear());
                    date.setUTCMonth(person.birthday.month - 1);
                    date.setUTCDate(person.birthday.day);
                    ical.createEvent({
                        start: date,
                        summary: `${person.name} hat Geburtstag`,
                        allDay: true
                    })
                })
            })
            .catch(reason => {
                // TODO: Show notification on the mirror ?
                this._error(`API Helper error: ${reason.message}: ${reason.err || ''}`);
            })

        this.expressApp.use("/" + this.name, (req, res) => {
            ical.serve(res)
        })

        this._log('Server is running')
    },

	stop: function() {
        this._log("Stopping helper");
    },
    

    // custom logger utility to supress output in CI env
    _log: function(message) {
        if (process.env.NODE_ENV !== 'test') { console.log(`${this.name}: ${message}`) }
    },
    _error: function(message) {
        if (process.env.NODE_ENV !== 'test') { console.error(`${this.name}: ${message}`) }
    }
});
