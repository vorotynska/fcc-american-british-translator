'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const text = req.body.text;
      const locale = req.body.locale;
      if (text === "") {
        return res.send({
          error: "No text to translate"
        });
      }
      if (!text || !locale) {
        return res.send({
          error: "Required field(s) missing"
        });
      }
      if (locale === "american-to-british" || locale === "british-to-american") {
        const translated = translator.translation(locale, text);
        return res.json({
          text: text,
          translation: translated
        });
      } else {
        return res.send({
          error: "Invalid value for locale field"
        });
      }
    });
};