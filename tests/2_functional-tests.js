const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

const ambiStrings = require("../components/ambiTestStrings")
    .ambiStringsAndTranslations;

chai.use(chaiHttp);

let Translator = require('../components/translator.js');

suite('Functional Tests', () => {
    test("Test /api/translate POST request with text and locale fields", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                text: ambiStrings[1][0],
                locale: "american-to-british"
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "translation",
                        "Return value should contain translation property"
                    );
                    assert.property(
                        res.body,
                        "text",
                        "Return value should contain text value with the original text"
                    );
                    assert.equal(res.body.translation, ambiStrings[1][2]);
                    done();
                }
            });
    });
    test("Test /api/translate POST request with invalid locale field", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                text: ambiStrings[1][0],
                locale: "to-british"
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "error",
                        "Return value should contain error property"
                    );
                    assert.equal(res.body.error, "Invalid value for locale field");
                    done();
                }
            });
    });
    test("Test /api/translate POST request with missing text field", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                locale: "american-to-british"
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "error",
                        "Return value should contain error property"
                    );
                    assert.equal(res.body.error, "Required field(s) missing");
                    done();
                }
            });
    });
    test("Test /api/translate POST request with missing locale field", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                text: ambiStrings[1][0]
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "error",
                        "Return value should contain error property"
                    );
                    assert.equal(res.body.error, "Required field(s) missing");
                    done();
                }
            });
    });
    test("Test /api/translate POST request with empty text field", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                text: "",
                locale: "american-to-british"
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "error",
                        "Return value should contain error property"
                    );
                    assert.equal(res.body.error, "No text to translate");
                    done();
                }
            });
    });
    test("Test /api/translate POST request with text that needs no translation", (done) => {
        chai
            .request(server)
            .post("/api/translate")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                text: "Hello",
                locale: "american-to-british"
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "translation",
                        "Return value should contain translation property"
                    );
                    assert.property(
                        res.body,
                        "text",
                        "Return value should contain text value with the original text"
                    );
                    assert.equal(res.body.translation, "Everything looks good to me!");
                    done();
                }
            });
    });
});