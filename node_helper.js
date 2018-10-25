var NodeHelper = require("node_helper")
const icalGenerator = require("ical-generator")
const ical = icalGenerator({name: 'MMM-GoogleBirthdaysProvider'})

module.exports = NodeHelper.create({
    start: function() {

        ical.createEvent({
            // dummy event, always 24h in the future
            start: new Date(new Date().getTime() + 3600000*24),
            summary: 'No Birthdays yet..',
            allDay: true
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
