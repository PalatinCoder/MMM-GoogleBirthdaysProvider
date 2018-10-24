var NodeHelper = require("node_helper")
const icalGenerator = require("ical-generator")
const ical = icalGenerator({name: 'MMM-GoogleBirthdaysProvider'})

module.exports = NodeHelper.create({
    start: function() {
        console.log(this.name + ' helper is started')
        this.expressApp.use("/" + this.name, (req, res) => {
            ical.serve(res)
        })
    },
    socketNotificationReceived: function(notification, payload) {
        console.log(this.name + " helper received socket notification: " + notification + " - Payload: " + payload)
        this.sendSocketNotification("ECHO", notification)
    },
});
