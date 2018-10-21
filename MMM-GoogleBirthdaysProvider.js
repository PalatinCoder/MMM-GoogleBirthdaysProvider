Module.register("MMM-GoogleBirthdaysProvider", {
    defaults: {},
    start: function() {
        Log.info(this.name + " is started")
        this.sendSocketNotification("SAY_HELLO")
    },
    socketNotificationReceived: function(notification, payload) {
        Log.log(this.name + "received a socket notification: " + notification + " - Payload: " + payload)
    }
})