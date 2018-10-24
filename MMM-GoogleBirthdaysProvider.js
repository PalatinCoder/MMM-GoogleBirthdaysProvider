Module.register("MMM-GoogleBirthdaysProvider", {
    defaults: {},
    start: function() {
        Log.info(this.name + " is started")
        this.sendSocketNotification("SAY_HELLO")
    }
})
