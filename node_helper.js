var NodeHelper = require("node_helper");
const moment = require("moment");
const icalGenerator = require("ical-generator");
const dav = require("tsdav");
var util = require("util");
var vCard = require("vcard");

module.exports = NodeHelper.create({
  requiresVersion: "2.6.0",

  start: function () {
    this._refreshData();

    this.expressApp.use("/" + this.name, (req, res) => {
      this.ical.serve(res);
    });

    this._log("Server is running");

    // schedule data update
    //this.scheduleUpdate();
    this.started = false;
    this.config = {};
  },

  stop: function () {
    this._log("Stopping helper");
  },

  // schedule next update.
  scheduleUpdate: function () {
    let self = this;

    // compute update intervall
    let nextLoad = 1 * 3600 * 1000; // 1h
    this._log(`Next update in ${nextLoad} milliseconds`);

    // schedule net update
    setTimeout(function () {
      self._refreshData();
      self.scheduleUpdate();
    }, nextLoad);
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this;
    if (notification === "CONFIG" && this.started == false) {
      this.config = payload;
      this.started = true;
      self.scheduleUpdate();
      self._refreshData();
    }
  },

  ical: icalGenerator({
    name: "MMM-CardDavBirthdaysProvider",
    domain: "mmm-carddavbirthdaysprovider.local"
  }),

  _createIcalEvents: function (birthdays) {
    if (typeof birthdays == "undefined") {
      this._log("birthday list is undefined.");
      return;
    } else if (birthdays.length == 0) {
      this._log("birthday list is empty.");
      return;
    }
    this._log(`${birthdays.length} birthdays found.`);
    this.ical.clear();
    now = moment();
    birthdays.forEach((person) => {
      this.ical.createEvent({
        start: person.birthday,
        repeating:
          person.birthday.year() < now.year() ? { freq: "YEARLY" } : undefined,
        summary: person.name,
        allDay: true
      });
    });
  },

  _bday2date: function (bday) {
    day = 0;
    month = 0;
    year = 0;
    if (typeof bday == "string") {
      parts = bday.split(/\D+/);
      console.log("PARTS " + util.inspect(parts));
      if (parts.length == 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts.length == 2) {
        month = parts[0];
        day = parts[1];
        now = moment();
        year = now.year;
      } else if (parts.length == 1) {
        if (parts[0].length == 8) {
          year = parts[0].slice(0, 4);
          month = parts[0].slice(4, 6);
          day = parts[0].slice(6, 8);
        } else {
          console.log("Part does not look like a date " + parts[0]);
          return;
        }
      } else {
        console.log("BDAY has " + parts.length + " parts");
        return;
      }
    } else if (typeof bday == "object") {
      return this._bday2date(bday.value);
    } else {
      console.log("Found BDAY of type " + typeof bday);
      return;
    }

    // birthdays without a year get assigned year 1604 by Apple.
    // we will treat any year before 1900 as "no year"
    if (year < 1900) {
      now = moment();
      if (month - 1 < now.month()) {
        year = now.year() + 1;
      } else {
        year = now.year();
      }
    }

    var date = moment({
      day: day,
      month: month - 1,
      year: year,
      hour: 12,
      minute: 0,
      second: 0
    });
    console.log(
      "BDAY2DATE( " +
        bday +
        " ) = " +
        year +
        "-" +
        month +
        "-" +
        day +
        "  " +
        util.inspect(date)
    );

    return date;
  },

  _getBirthdays: function () {
    return new Promise((resolve, reject) => {
      self = this;

      birthdays = [];

      (async () => {
        const client = new dav.DAVClient({
          serverUrl: self.config.serverUrl,
          credentials: self.config.credentials,
          authMethod: self.config.authMethod,
          defaultAccountType: "carddav"
        });

        await client.login();

        const addressBooks = await client.fetchAddressBooks();

        for (let i = 0; i < addressBooks.length; i++) {
          //console.log('Found address book name ' + addressBook.displayName);
          const vcards = await client.fetchVCards({
            addressBook: addressBooks[i]
          });
          for (let j = 0; j < vcards.length; j++) {
            var card = new vCard();
            card.readData(vcards[j].data, function (errstr, json) {
              if (errstr !== null) {
                console.log("ERROR card.readData  " + errstr);
                return;
              }
              if (json["BDAY"]) {
                birthdays.push({
                  name: json["FN"],
                  birthday: self._bday2date(json["BDAY"]),
                  book: addressBooks[i].displayName
                });
              }
            });
          }
        }
        birthdays.forEach((bday) => {
          console.log(
            bday.book + ": " + bday.name + " " + util.inspect(bday.birthday)
          );
        });
        console.log("RESOLVE");
        resolve(birthdays);
      })();
    }).catch((reason) => {
      reject({
        message: "Error",
        err: reason
      });
    });
  },

  _refreshData: function () {
    if (!this.started) {
      this._log("no data refresh, not started.");
      return;
    }
    this._getBirthdays()
      .then((birthdays) => this._createIcalEvents(birthdays))
      .catch((reason) => {
        // TODO: Show notification on the mirror ?
        this._error(`_refreshData: ${reason.message}: ${reason.err || ""}`);
      });
  },

  // custom logger utility to supress output in CI env
  _log: function (message) {
    console.log(`${this.name}: ${message}`);
  },

  _error: function (message) {
    console.error(`${this.name}: ${message}`);
  }
});
