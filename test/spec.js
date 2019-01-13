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
