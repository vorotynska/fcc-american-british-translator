const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {
    /**
     * Method to translate any expressions in the given text. Capitalization is ignored, even after punctuation.
     * @param {String} language - Which language to translate into.
     * @param {String} text - The text to be translated
     * @returns {Object} The whole text but with expressions translated, their start and end indices, and the new parts in a string.
     */
    expressions(language, text) {
        var textArrayExpression = [text];
        var match,
            indexPairs = [],
            newExpressions = [];
        var i = 0;
        var lanObj =
            language === "british-to-american" ? britishOnly : americanOnly;
        // Check each key in given language dictionary against the whole text using regex and translate it and push it into an array.
        Object.entries(lanObj).forEach(([key, val]) => {
            let regex = new RegExp("\\b" + key + "\\b", "gi");
            let strArr = text.match(regex);
            if (strArr) {
                newExpressions.push(val);
                textArrayExpression.push(textArrayExpression[i].replace(regex, val));
                i++;
            }
        });
        // Find where the translated expressions start and end in the new string.
        Object.entries(lanObj).forEach(([key, val]) => {
            let regex = new RegExp(val, "gi");
            while ((match = regex.exec(textArrayExpression[i]))) {
                indexPairs.push([match.index, match.index + val.length]);
            }
        });
        const translation = {
            sentence: textArrayExpression[i],
            indices: indexPairs.sort(),
            new: newExpressions
        };
        return translation;
    }

    /**
     * Method to translate words that aren't expressions. Ignores capitalization, even after punctuation.
     * @param {String} language Which language to translate into
     * @param {Object} text The text to be translated, must come from expression method, as it also containes indices to take into account as well as the new parts in an array.
     * @returns {Object} Translated text and which parts that are new.
     */
    words(language, text) {
        var lanObj =
            language === "british-to-american" ?
            this.flipObj(americanToBritishSpelling) :
            americanToBritishSpelling;
        var match,
            textArrayWord = [text.sentence],
            newWords = [];
        var i = 0;
        Object.entries(lanObj).forEach(([key, val]) => {
            let reWord = "\\b" + key + "\\b";
            let regex = new RegExp(reWord, "gi");
            while ((match = regex.exec(textArrayWord[i]))) {
                // Skip expressions that have already been translated.
                if (match.index in text.indices) {
                    continue;
                }
                newWords.push(val);
                textArrayWord.push(textArrayWord[i].replace(regex, val));
                i++;
            }
        });
        const translation = {
            sentence: textArrayWord[i],
            new: [...text.new, ...newWords]
        };
        return translation;
    }

    /**
     * Method to translate various titles. The first letter in titles, in both american english and british english, are capitalized which is why
     * @param {String} language Which language to translate into
     * @param {Object} text The text to be translated and the new parts from the words method.
     * @returns {Object} The translated text and which parts that are new.
     */
    titles(language, text) {
        var lanObj =
            language === "british-to-american" ?
            this.flipObj(americanToBritishTitles) :
            americanToBritishTitles;
        var textArrayTitle = [text.sentence];
        var newTitles = [];
        var match;
        var i = 0;
        Object.entries(lanObj).forEach(([key, val]) => {
            var regex = new RegExp("\\b" + key + "\\b", "gi");
            if (language === "american-to-british") {
                regex = new RegExp(
                    "\\b" + this.escapeRegExp(key).split("\\")[0] + "(?:\\.|||\\b)",
                    "gi"
                );
            }
            if ((match = text["sentence"].match(regex))) {
                var capTitle = this.capitalizeTitles(val);
                textArrayTitle.push(textArrayTitle[i].replace(regex, capTitle));
                newTitles.push(capTitle);
                i++;
            }
        });
        const translation = {
            sentence: textArrayTitle[textArrayTitle.length - 1],
            new: [...text.new, ...newTitles]
        };
        return translation;
    }

    /**
     * A method to escape certain characters so that they can be used in a regular expression.
     * @param {String} string Any string
     * @returns {String} To be used in a regular expression
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    /**
     * Method to translate between english and american conventions of writing time.
     * @param {String} language Which language to translate into
     * @param {Object} text The text to translate and the new parts from the titles method
     * @returns {Object} The translated text and which parts that are new.
     */
    time(language, text) {
        var pattern =
            language === "british-to-american" ?
            "(0?[1-9]|1[012])(.)([0-5][0-9])" :
            "(0?[1-9]|1[012])(:)([0-5][0-9])";
        var charReplacement = language === "british-to-american" ? ":" : ".";
        var regex = new RegExp(pattern, "g");
        var match,
            newTime = [];
        if ((match = text["sentence"].match(regex))) {
            match.forEach((m) =>
                newTime.push(m.replace(regex, "$1" + charReplacement + "$3"))
            );
            //      newTime.push(...match);
        }
        const translatedTime = text["sentence"].replace(
            regex,
            "$1" + charReplacement + "$3"
        );
        const translation = {
            sentence: translatedTime,
            new: [...text.new, ...newTime]
        };
        return translation;
    }

    /**
     * Consolidated method that translates a text string in the correct order.
     * @param {String} language Which language to translate into
     * @param {String} text The text to translate
     * @returns {Object} The translated text and which parts are new.
     */
    preHighlightTranslation(language, text) {
        const expressions = this.expressions(language, text);
        const words = this.words(language, expressions);
        const titles = this.titles(language, words);
        const time = this.time(language, titles);
        return time;
    }

    /**
     * The main method to call from api.js
     * @param {String} language Which language to translate into.
     * @param {Object} text The object from the method 'preHighlighTranslation'
     * @returns The translated sentence, where translated parts are encased in <span class="highlight">...</span>
     */
    translation(language, text) {
        const translation = this.preHighlightTranslation(language, text);
        if (translation.sentence === text) {
            return "Everything looks good to me!";
        }
        return this.highlighter(translation.sentence, translation.new, language);
    }

    /**
     * Get a flipped object.
     * @param {Object} obj An object with key: value pairs
     * @returns {Object} An object where 'obj' has flipped, i.e. {value: key}
     */
    flipObj(obj) {
        var ret = {};
        for (var key in obj) {
            ret[obj[key]] = key;
        }
        return ret;
    }

    /**
     * Capitalizes first letter in a string.
     * (https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript/53930826#53930826)
     * @param {String} str String
     * @returns {String} The same string but with the first letter capitalized
     */
    capitalizeTitles(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     *
     * @param {String} newText The already translated text from previous methods.
     * @param {Array} newParts The parts of the translated text that are new (i.e. words, expressions, titles and time)
     * @param {String} language Which language to translate into
     * @returns {String} The string with the new parts highlighted (<span></span>)
     */
    highlighter(newText, newParts, language) {
        if (!newParts) {
            return newText;
        }
        var highlightedText = [newText];
        for (let i = 0; i < newParts.length; i++) {
            var regex = new RegExp("\\b" + newParts[i].split(".")[0] + "\\b", "gi");
            if (language === "american-to-british") {
                regex = new RegExp(
                    "\\b" +
                    this.escapeRegExp(newParts[i]).split("\\")[0] +
                    "(?:\\.|||\\b)",
                    "gi"
                );
            }
            if (newParts[i].match(/(0?[1-9]|1[012])(\.)([0-5][0-9])/)) {
                regex = new RegExp("\\b" + this.escapeRegExp(newParts[i]) + "\\b", "g");
                highlightedText[i + 1] = highlightedText[i].replace(
                    regex,
                    '<span class="highlight">' + newParts[i] + "</span>"
                );
            } else if (newParts[i].match(/(0?[1-9]|1[012])(\:)([0-5][0-9])/)) {
                regex = new RegExp("\\b" + newParts[i] + "\\b", "g");
                highlightedText[i + 1] = highlightedText[i].replace(
                    regex,
                    '<span class="highlight">' + newParts[i] + "</span>"
                );
            } else {
                highlightedText[i + 1] = highlightedText[i].replace(
                    regex,
                    '<span class="highlight">' +
                    this.escapeRegExp(newParts[i]).split("\\")[0] +
                    "</span>"
                );
            }
        }
        return highlightedText[highlightedText.length - 1];
    }
}


module.exports = Translator;