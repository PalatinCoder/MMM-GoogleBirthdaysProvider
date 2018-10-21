var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
    start: function() {
        console.log(this.name + ' helper is started')
    },
    socketNotificationReceived: function(notification, payload) {
        console.log(this.name + " helper received socket notification: " + notification + " - Payload: " + payload)
        this.sendSocketNotification("ECHO", notification)
    }
})