const replace = require('mock-require');
/* replace the base node_helper from MM, so the tests can run standalone */
replace("node_helper", "./fixtures/node_helper.js");
replace("../google-api-helper", {
    getBirthdays: function(path) {
        return new Promise((resolve, reject) => {
            resolve([
                { name: 'Johannes Testmann', birthday: { year: 1993, month: 09, day: 22 }},
                { name: 'Elisabeth Testfrau', birthday: { year: 1991, month: 03, day: 06 }}
            ]);
        });
    }
});

// set the env so that the console logging is supressed
process.env.NODE_ENV = 'test';

const NodeHelper = require("../node_helper");
const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const expect = chai.expect;
const ical = require('ical');
const moment = require('moment');

const REQUEST_URL = '/MMM-GoogleBirthdaysProvider';

chai.use(chaiHttp);

describe('GoogleBirthdaysProvider', function() {
    it('should be tested');
});

describe('google-api-helper', () => {
    it('should be tested, shouldn\' it?');
});

describe('the public api', function() {
    var helper = new NodeHelper();
    before('set up the express app', () => {
        app = express();
        helper.setName('MMM-GoogleBirthdaysProvider');
        helper.setExpressApp(express());
    });

    this.beforeEach('start the helper', () => { helper.start() });
    this.afterEach('stop the helper', () => { helper.stop() });

    it('is served at the correct url', done => {
        chai.request(helper.expressApp)
            .get(REQUEST_URL)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
        });
    });
    it('has the correct mime type and charset', done => {
        chai.request(helper.expressApp)
            .get(REQUEST_URL)
            .end((err, res) => {
                expect(res).to.have.header('content-type', 'text/calendar; charset=utf-8');
                done();
        });
    });
    describe('the generated feed', function() {
        // assert that the served iCal feed can be parsed
        // the actual contents of the feed are unit-tested below
        it('is a valid iCal feed', done => {
            chai.request(helper.expressApp)
                .get(REQUEST_URL)
                .end((err, res) => {
                    var data = ical.parseICS(res.text);
                    expect(data).to.be.an('Object').that.is.not.empty;
                    done();
                });
        });
    })
});

describe('a created event (with a year set)', () => {
    var helper = new NodeHelper();
    helper._createIcalEvents([
            { name: 'Johannes Testmann', birthday: { year: 1993, month: 09, day: 22 }}
        ]);
    var event = helper.ical.events()[0];
    var start = event.start();
    var end = event.end();

    it('has a valid start date', () => expect(start).to.be.an.instanceof(moment, 'Start Date is not a moment object'));
    it('has the correct start date', () => {
        expect(start.year()).to.equal(moment().year());
        expect(start.month()+1).to.equal(09); // months are 0-indexed
        expect(start.date()).to.equal(22);
    });
    it('has a valid end date date', () => expect(end).to.be.an.instanceof(moment, 'End Date is not a moment object'));
    it('start and end date are equal', () => expect(start).to.equal(end))
    it('meets the conditions for a full day event', () => {
        // MagicMirror's calendar fetcher doesn't care about the actual full day property, so we have to trick it .. :/
        // Events are interpreted as full day if
        // a) The date string has only 8 Byte (4 byte year, 2 byte month, 2 byte day -> so no time in the date string)
        // b) (((end - start) % (24 * 60 * 60 * 1000)) === 0 && startDate.getHours() === 0 && startDate.getMinutes() === 0)
        //    which means it starts at midnight and the duration is a multiple of 24 hours
        expect((end.format("x") - start.format("x")) % (24 * 60 * 60 * 1000)).to.equal(0, 'Duration is not a multiple of 24');
        expect(start.hours()).to.equal(0, 'Hour is not 00');
        expect(start.minutes()).to.equal(0, 'Minutes are not 00');
        expect(start.seconds()).to.equal(0, 'Seconds are not 00');
    })
})
