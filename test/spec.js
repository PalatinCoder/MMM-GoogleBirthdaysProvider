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


describe('ical events', () => {
    describe('a created event', () => {
        var helper = new NodeHelper();
        helper._createIcalEvents([
            { name: 'Johannes Testmann', birthday: { year: 1965, month: 09, day: 22 }},
            { name: 'Elisabeth Testfrau', birthday: { month: 06, day: 13 }}
        ]);

        context('with a year set', () => {
            var event = helper.ical.events()[0];
            it('has a valid start date', () => expect(event.start()).to.be.an.instanceOf(moment, 'Start date is not a moment object'));
            it('has the correct start date', () => {
                expect(event.start().year()).to.equal(1965);
                expect(event.start().month()+1).to.equal(09); // months are 0-indexed
                expect(event.start().date()).to.equal(22);
            });
            it('has no end date', () => expect(event.end()).to.be.null);
            it('is a full day event', () => expect(event.allDay()).to.be.true);
            it('is repeating', () => expect(event.repeating()).to.be.have.property('freq', 'YEARLY'));
        });
        context('without a year set', () => {
            var event = helper.ical.events()[1];
            it('has a valid start date', () => expect(event.start()).to.be.an.instanceOf(moment, 'Start date is not a moment object'));
            it('has the correct start date', () => {
                expect(event.start().year()).to.equal(moment().year());
                expect(event.start().month()+1).to.equal(06); // months are 0-indexed
                expect(event.start().date()).to.equal(13);
            });
            it('has no end date', () => expect(event.end()).to.be.null);
            it('is a full day event', () => expect(event.allDay()).to.be.true);
            it('is not repeating', () => expect(event.repeating()).to.be.null);
        });
    });

    describe('a parsed event', () => {
        var helper = new NodeHelper();
        helper.ical.clear();
        helper._createIcalEvents([
            { name: 'Elisabeth Testfrau', birthday: { month: 06, day: 13 }},
            { name: 'Johannes Testmann', birthday: { year: 1965, month: 09, day: 22 }}
        ]);
        let icsString = helper.ical.toString();
        let data = ical.parseICS(icsString);
        let keys = [];

        // Get the keys -> keys[0] will be without year and keys[1] will be the one with a year
        for(var key in data) {
            keys.push(key);
        }

        context('with a year set', () => {
            let event = data[keys[1]];
            it('has a start date', () =>  expect(event.start).to.be.an.instanceOf(Date));
            it('has the correct start date', () => {
                expect(event.start.getFullYear()).to.equal(1965);
                expect(event.start.getMonth()+1).to.equal(09); // months are 0-indexed
                expect(event.start.getDate()).to.equal(22);
            });
            it('has no end date', () => expect(event.end).to.be.undefined);
            it('is a full day event');
            it('is repeating', () => expect(event).to.have.property('rrule'));
        });
        context('without a year set', () => {
            let event = data[keys[0]];
            it('has a start date', () =>  expect(event.start).to.be.an.instanceOf(Date));
            it('has the correct start date', () => {
                expect(event.start.getFullYear()).to.equal(moment().year());
                expect(event.start.getMonth()+1).to.equal(06); // months are 0-indexed
                expect(event.start.getDate()).to.equal(13);
            });
            it('has no end date', () => expect(event.end).to.be.undefined);
            it('is a full day event');
            it('is not repeating', () => expect(event).to.not.have.property('rrule'));
        });
    });
});
