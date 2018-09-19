const testPing = `
@init()
  NQUE .paint((RAND, RAND, RAND))

@paint(color)
  IF !'color' <> ?'color'
    !'color' -> ?'color'
    PING .?
`

const testPing2 = `
\\ this is a comment
@init()
  IF !'color' <> (0.516, 0.902, 0.106)
    !'color' -> (0.516, 0.902, 0.106)
    PING .?

\\ path system
@path()
  NQUE .paint((0.154, 0.583, RAND), 'path', 3)

@paint(color, layer, radius)
  IF ?'radius' >> 0
    !'color' -> ?'color'
    !'layer' -> ?'layer'
    ?'radius' -= 1
    PING .?
`

const testPing3 = `\\ SAMPLE PROGRAM

\\ the _init method is triggered automatically on reset
@_init()
  start_color -> (0.516, 0.902, 0.106)
  !'color' -> start_color
  !'resetcolor' -> start_color
  !'layer_zero' -> 'standby'

\\ paint a region of layer one
@layer_one()
  NQUE ._layer((0.154, 0.583, 1.0), 'layer_one', 3)

\\ paint a region of layer two
@layer_two()
  NQUE ._layer((1, 0.64, 0.04), 'layer_two', 3)

@_layer(color, layer, radius)
  IF ?'radius' >> 0
    !'color' -> ?'color'
    !'resetcolor' -> ?'color'
    !?'layer' -> 'standby'
    !'layer_zero' -> NULL
    ?'radius' -= 1
    PING .?

\\ create a single propogating pulse
@pulse()
  color -> (RAND, RAND, RAND)
  LOOP KEYS WITH key
    IF key <= 'layer_'
      NQUE ._pulse_color(color, key)

@_pulse_color(color, layer)
  IF !?'layer' == 'standby'
    !?'layer' -> 'pulsing'
    NQUE ._resetcolor(?'layer', 1)
    !'color' -> ?'color'
    PING .?

@_resetcolor(layer, delay)
  IF !?'layer' == 'pulsing'
    IF ?'delay' >> 0
      ?'delay' -= 1
      NQUE .?
    ELSE
      !'color' -> !'resetcolor'
      !?'layer' -> 'standby'

\\ create node emanating repeated pulses
@blinker()
  NQUE .pulse()
  NQUE ._blink_delay(5)

@_blink_delay(delay)
  IF ?'delay' <= 0
    NQUE .blinker()
  ELSE
    ?'delay' -= 1
    NQUE .?
`

function TokenError(message, row, col) {
  this.message = message;
  this.row = row;
  this.col = col;
}

function Token(type, content, row, col) {
  this.type = type;
  this.content = content;
  this.row = row;
  this.col = col;
}

Token.prototype.toString = function () {
  return '(' + this.type + ', ' + this.content + ')';
};


class Tokenizer {

  constructor(source) {
    this.lines = source.split('\n');
    this.row = 0;
    this.col = 0;
    this.indent = 0;
    this.tokens = [];
    this.keywords = ['PUTS', 'PING', 'NQUE', 'RAND', 'NULL',
    'LOOP', 'WITH', 'KEYS', 'VALS',
    'IF', 'ELIF', 'ELSE',]
    this.doubleOperators = ['==','<>','>>','<<','>=','<=',
    '+=','-=','->','*=','/=',
    '&&', '||']
  }

  error(message) {
    throw new TokenError(message, this.row, this.col);
  }

  token(type, content) {
    const token = new Token(type, content, this.row, this.col);
    this.tokens.push(token);
    return token;
  }

  get line() {
    return this.lines[this.row];
  }

  get char() {
    const line = this.line;
    if (line == undefined) {
      return 'eof';
    }
    const char = line[this.col];
    if (char == undefined) {
      return 'eol'
    }
    return char;
  }

  getLine() {
    this.advance();
    this.skipSpace();
    const line = this.line.slice(this.col);
    this.col = this.line.length;
    return line;
  }

  atStart() {
    return this.row == 0 && this.col == 0;
  }

  advance() {
    if (this.char == 'eof') {
      this.error('tried to advance beyond eof');
    } else if (this.char == 'eol') {
      this.col = 0;
      this.row++;
    } else {
      this.col++;
    }
  }

  isSpace(s) {
    s = s || this.char;
    for (var i = 0; i < s.length; i++) {
      if (!' \t'.includes(s[i])) return false;
    }
    return true;
  }

  isAlpha(s) {
    s = s || this.char;
    if (s == 'eol' || s == 'eof') {
      return false;
    }
    for (var i = 0; i < s.length; i++) {
      if (!'abcdefghijklmnopqrstuvwxyz_'.includes(s[i].toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  isNum(s) {
    s = s || this.char;
    for (var i = 0; i < s.length; i++) {
      if (!'0123456789'.includes(s[i])) {
        return false;
      }
    }
    return true;
  }

  isAlphaNum(s) {
    s = s || this.char;
    if (s == 'eol' || s == 'eof') {
      return false;
    }
    for (var i = 0; i < s.length; i++) {
      if (!this.isAlpha(s[i]) && !this.isNum(s[i])) {
        return false;
      }
    }
    return true;
  }

  isOperator(s) {
    s = s || this.char;
    if (s.length == 1) {
      return '!#&(),.?@[]|~=><+-*/'.includes(s);
    } else if (s.lenvth == 2) {
      return ['==', '<>', '>>', '<<', '>=', '<=',
      '+=', '-=', '->', '*=', '/='].includes(s);
    } else {
      return false;
    }
  }

  skipSpace() {
    while (this.isSpace(this.char)) {
      this.advance();
    }
  }

  getLeadingSpace() {
    var leading = '';
    while (this.isSpace(this.char) || this.char == 'eol') {
      if (this.char == 'eol') {
        leading = '';
      } else {
        leading += this.char;
      }
      this.advance();
    }
    return leading;
  }

  calculateIndent(leading) {
    let count = 0;
    for (var i = 0; i < leading.length; i++) {
      const char = leading[i];
      if (char == '\t') {
        count += 1;
      } else if (char == ' ') {
        count += 0.5;
      }
    }
    return Math.floor(count);
  }

  changeIndent(newIndent) {
    const indentDiff = newIndent - this.indent;
    // if (indentDiff > 1 || indentDiff < -1) {
    //   this.indent -= Math.sign(indentDiff);
    //   // this.error('indent went from ' + this.indent + ' to ' + newIndent);
    // }
    this.indent = newIndent;
    return indentDiff;
  }

  nextToken() {
    // TODO: what about at the start

    // whitespace
    this.skipSpace();

    // indentation, comments, and eof
    while (this.char == '\\' || this.char == 'eol' || this.isSpace()) {
      if (this.char == '\\') {
        this.getLine();
      } else {
        const leading = this.getLeadingSpace();
        const newIndent = this.calculateIndent(leading);
        const indentDiff = this.changeIndent(newIndent);
        for (var i = 0; i < Math.abs(indentDiff); i++) {
          if (indentDiff > 0) {
            this.token('brace', '{');
          } else {
            this.token('brace', '}');
          }
        }
      }
      this.skipSpace();
    }

    // executable javascript
    if (this.char == '%') {
      const line = this.getLine();
      return this.token('executable', line);
    }

    // string literal
    if (this.char == '"' || this.char == "'") {
      const quote = this.char;
      let literal = '';
      this.advance();
      while (this.char != quote) {
        if (this.char == 'eof') {
          this.error('encountere eof while scanning string literal');
        }
        literal += this.char;
        this.advance();
      }
      this.advance();
      return this.token('literal', literal);
    }

    // identifiers
    if (this.isAlpha()) {
      let identifier = '';
      while (this.isAlphaNum()) {
        identifier += this.char;
        this.advance();
      }
      if (this.keywords.includes(identifier)) {
        return this.token('keyword', identifier);
      } else {
        return this.token('identifier', identifier);
      }
    }

    // numbers
    if (this.isNum()) {
      let number = '';
      let decimal = false;
      while (this.isNum() || (this.char == '.' && !decimal)) {
        number += this.char;
        if (this.char == '.') {
          decimal = true;
        }
        this.advance();
      }
      return this.token('number', number);
    }

    // single operators
    if ('!#(),.?@[]~'.includes(this.char)) {
      let operator = this.char;
      this.advance();
      return this.token('aux', operator);
    }

    // double operators
    if ('=><+-*/&|'.includes(this.char)) {
      let operator = this.char;
      this.advance();
      if (this.doubleOperators.includes(operator + this.char)) {
        operator += this.char;
        this.advance();
      }
      return this.token('aux', operator);
    }

    if (this.char == 'eof') {
      return this.token('eof', 'eof');
    }

    // BLAH! WHATEVER!
    let content = '';
    while (this.char != 'eol' && this.char != 'eof' &&
    !this.isSpace(this.char)) {
      content += this.char;
      this.advance();
    }

    return this.token('unknown', content);
  }

  tokenize() {
    while (this.char != 'eof') {
      this.nextToken();
    }
    return this.tokens;
  }

}
