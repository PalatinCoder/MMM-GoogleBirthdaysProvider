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

        console.log(this.name + ' server is running')
    }
});
