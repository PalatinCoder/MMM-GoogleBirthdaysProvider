Module.register("MMM-CardDavBirthdaysProvider", {
    defaults: {},
    start: function() {
        this.sendSocketNotification('CONFIG', this.config);
        Log.info(this.name + " is started");
    },
    getDom: function() {
		let self = this
		var wrapper = document.createElement("div");
		wrapper.id = "carddav";
		wrapper.style.display = "none";
		return wrapper
	},
})
