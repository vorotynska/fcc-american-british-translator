const chai = require('chai');
const assert = chai.assert;

const ambiStrings = require("../components/ambiTestStrings")
    .ambiStringsAndTranslations;
const biamStrings = require("../components/biamTestStrings")
    .biamStringsAndTranslations;

const Translator = require('../components/translator.js');

const translator = new Translator();
const ambi = "american-to-british";
const biam = "british-to-american";

suite('Unit Tests', () => {
    suite("Translate to British English", () => {
        ambiStrings.forEach((ambiS) => {
            test(`Translate "${ambiS[0]}"`, () => {
                assert.equal(
                    translator.preHighlightTranslation(ambi, ambiS[0]).sentence,
                    ambiS[1]
                );
            });
        });
    });
    suite("Translate to American English", () => {
        biamStrings.forEach((biamS) => {
            test(`Translate "${biamS[0]}"`, () => {
                assert.equal(
                    translator.preHighlightTranslation(biam, biamS[0]).sentence,
                    biamS[1]
                );
            });
        });
    });
    suite("Highlight translated parts", () => {
        test(`Highlight the translated parts of "${ambiStrings[0][0]}"`, () => {
            assert.equal(
                translator.translation(ambi, ambiStrings[0][0]),
                ambiStrings[0][2]
            );
        });
        test(`Highlight the translated parts of "${ambiStrings[1][0]}"`, () => {
            assert.equal(
                translator.translation(ambi, ambiStrings[1][0]),
                ambiStrings[1][2]
            );
        });
        test(`Highlight the translated parts of "${biamStrings[0][0]}"`, () => {
            assert.equal(
                translator.translation(biam, biamStrings[0][0]),
                biamStrings[0][2]
            );
        });
        test(`Highlight the translated parts of "${biamStrings[1][0]}"`, () => {
            assert.equal(
                translator.translation(biam, biamStrings[1][0]),
                biamStrings[1][2]
            );
        });
    });
});

//  test('Test POST to /api/translate', (done) => {
//    chai
//      .request(server)
//      .post('/api/translate')
//      .set('content-type', 'application/x-www-form-urlencoded')
//      .send({
//        text: 'Mangoes are my favorite fruit.',
//        locale: 'american-to-british'
//      })
//  })