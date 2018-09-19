ace.define("ace/mode/ping_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var PingHighlightRules = function() {

    var keywords = "PUTS|PING|NQUE|IF|ELIF|ELSE|LOOP|WITH";

    var builtinConstants = "RAND|NULL|KEYS|VALS";

    var keywordMapper = this.createKeywordMapper({
        "constant.language": builtinConstants,
        "keyword": keywords
    }, "identifier");

    var integer = "(?:(?:[1-9]\\d*)|(?:0))";

    var intPart = "(?:\\d+)";
    var pointFloat = "(?:(?:" + intPart + ")|(?:" + intPart + "\\.))";
    var floatNumber = "(?:" + pointFloat + ")";

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "\\\\.*$"
        }, {
            token : "string",           // " string
            regex : '"',
            next : "qqstring"
        }, {
            token : "string",           // ' string
            regex : "'",
            next : "qstring"
        }, {
            token : "constant.numeric", // float
            regex : floatNumber
        }, {
            token : "constant.numeric", // integer
            regex : integer + "\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\*|\\/|<<|>>|&|\\||<>|<=|=>|==|=|->|!|@|.|"
        }, {
            token : "paren.lparen",
            regex : "[\\[\\(\\{]"
        }, {
            token : "paren.rparen",
            regex : "[\\]\\)\\}]"
        }, {
            token : "text",
            regex : "\\s+"
        } ],
        "qqstring" : [{
            token : "string",
            regex : '"|$',
            next  : "start"
        }, {
            defaultToken: "string"
        }],
        "qstring" : [{
            token : "string",
            regex : "'|$",
            next  : "start"
        }, {
            defaultToken: "string"
        }]
    };
};

oop.inherits(PingHighlightRules, TextHighlightRules);

exports.PingHighlightRules = PingHighlightRules;
});


ace.define("ace/mode/ping",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ping_highlight_rules","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var PingHighlightRules = require("./ping_highlight_rules").PingHighlightRules;
var Range = require("../range").Range;

var Mode = function() {
    this.HighlightRules = PingHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    // this.lineCommentStart = "\\";
    //
    // this.getNextLineIndent = function(state, line, tab) {
    //     var indent = this.$getIndent(line);
    //
    //     var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
    //     var tokens = tokenizedLine.tokens;
    //
    //     if (tokens.length && tokens[tokens.length-1].type == "comment") {
    //         return indent;
    //     }
    //
    //     if (state == "start") {
    //         var match = line.match(/^.*[\{\(\[:]\s*$/);
    //         if (match) {
    //             indent += tab;
    //         }
    //     }
    //
    //     return indent;
    // };
    //
    // var outdents = {
    //     "pass": 1,
    //     "return": 1,
    //     "raise": 1,
    //     "break": 1,
    //     "continue": 1
    // };
    //
    // this.checkOutdent = function(state, line, input) {
    //     if (input !== "\r\n" && input !== "\r" && input !== "\n")
    //         return false;
    //
    //     var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;
    //
    //     if (!tokens)
    //         return false;
    //     do {
    //         var last = tokens.pop();
    //     } while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
    //
    //     if (!last)
    //         return false;
    //
    //     return (last.type == "keyword" && outdents[last.value]);
    // };
    //
    // this.autoOutdent = function(state, doc, row) {
    //
    //     row += 1;
    //     var indent = this.$getIndent(doc.getLine(row));
    //     var tab = doc.getTabString();
    //     if (indent.slice(-tab.length) == tab)
    //         doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
    // };
    //
    // this.$id = "ace/mode/ping";
}).call(Mode.prototype);

exports.Mode = Mode;
});
