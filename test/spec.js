const replace = require('mock-require');
/* replace the base node_helper from MM, so the tests can run standalone */
replace("node_helper", "./fixtures/node_helper.js");

const NodeHelper = require("../node_helper");
const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const expect = chai.expect;

chai.use(chaiHttp);

describe('GoogleBirthdaysProvider', function() {
    it('should be tested');
});

describe('the server', function() {
    var helper = new NodeHelper();
    before('set up the express app', () => {
        app = express();
        helper.setName('MMM-GoogleBirthdaysProvider');
        helper.setExpressApp(express());
    });

    this.beforeEach('start the helper', () => { helper.start() });
    this.afterEach('stop the helper', () => { helper.stop() });

    it('serves the correct url', done => {
        chai.request(helper.expressApp)
            .get('/MMM-GoogleBirthdaysProvider')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
        });
    });
    it('serves the correct mime type and charset', done => {
        chai.request(helper.expressApp)
            .get('/MMM-GoogleBirthdaysProvider')
            .end((err, res) => {
                expect(res).to.have.header('content-type', 'text/calendar; charset=utf-8');
                done();
        });
    });
});

describe('the generated ical feed', function() {
    it('has the correct timezone');
    it('contains all events');
});