var NodeHelper = require("node_helper")
const icalGenerator = require("ical-generator")
const ical = icalGenerator({name: 'MMM-GoogleBirthdaysProvider'})

module.exports = NodeHelper.create({
    start: function() {

        this.expressApp.use("/" + this.name, (req, res) => {
            ical.serve(res)
        })

        console.log(this.name + ' server is running')
    }
});
