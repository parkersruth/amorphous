
DEFAULT_DECAY = 5;

function CompilerError(message, row, col) {
  this.message = message;
  this.row = row;
  this.col = col;
}

function PingDef(name, args, body) {
  this.name = name || '';
  this.args = args || [];
  this.body = body || '';
}

class Compiler {

  // TODO: make documentation!
    /**
     * Adds two numbers
     * @param {Number} a
     * @param {Number} b
     * @return {Number} the sum of a and b
     */
  constructor(pingCode) {
    this.tokenizer = new Tokenizer(pingCode);
    this.tokens = this.tokenizer.tokenize();
    this.index = 0;
    this.pingdefs = [];
  }

  advance() {
    if (this.matches('eof')) {
      this.error('tried to advance beyond eof');
    }
    this.index++;
  }

  get token() {
    return this.tokens[this.index]
  }

  error(message) {
    window.alert(message+" at row "+this.token.row+", column "+this.token.col);
    console.log(this.pingdefs);
    throw new CompilerError(message, this.token.row+1, this.token.col);
  }

  compile() {
    while (!this.matches('eof')) {
      this.matchDefinition();
    }
    const dna = new Map();
    for (var i = 0; i < this.pingdefs.length; i++) {
      // console.log(pingdef);
      var pingdef = this.pingdefs[i]
      console.log(pingdef.body);
      dna.set(pingdef.name, new Function('cell', 'ping', pingdef.body));
    }

    var trigmen = document.getElementById("triggerMenu");
    while (trigmen.options.length > 0) {
      trigmen.remove(trigmen.options[0])
    }
    for (pingdef of this.pingdefs) {
      if (!pingdef.name.startsWith('_')) {
        trigmen.add(new Option(pingdef.name, pingdef.name));
      }
    }

    return dna;
  }

  matchDefinition() {
    let pingdef = new PingDef
    this.match('aux', '@');

    const name = this.match('identifier');
    pingdef.name = name;

    this.variables = [];
    this.args = this.matchList('identifier');
    for (let olddef of this.pingdefs) {
      if (olddef.name == name && olddef.args.length == this.args.length) {
        this.error('ping named ' + name + ' already defined');
      }
    }
    pingdef.args = this.args;
    // TODO: error if args are repeated
    this.pingdefs.push(pingdef);
    const body = this.matchBlock();
    pingdef.body = body
  }

  matchList(type) {
    const list = [];
    this.match('aux', '(');
    while (!this.matches('aux', ')')) {
      if (this.matches('eof')) {
        this.error('encountered eof while scanning list');
      }
      if (type) {
        var entry = this.match(type);
      } else {
        var entry = this.matchExpression();
      }
      list.push(entry);
      if (this.matches('aux', ',')) {
        this.match('aux', ',');
      } else if (!this.matches('aux', ')')) {
        this.error('expected , or ) while scanning list');
      }
    }
    this.match('aux', ')');
    return list;
  }

  matchBlock(indent=0) {
    const variables = this.variables;
    let block = '';
    this.match('brace', '{');
    while (!this.matches('brace', '}')) {
      if (this.matches('eof')) {
        this.error('encountered eof while scanning block');
      }
      block += this.matchStatement(indent);
    }
    this.match('brace', '}');
    this.variables = variables;
    return block;
  }

  matchStatement(indent) {
    let statement = '';
    statement += ('  '.repeat(indent));
    if (this.matches('keyword', 'PUTS')) {
      this.match('keyword', 'PUTS');
      statement += 'console.log(' + this.matchExpression() + ')';
    } else if (this.matches('keyword', 'NQUE')) {
      this.match('keyword', 'NQUE');
      statement += 'cell.enqueue(';
      statement += this.matchPing();
      statement += ')';
    } else if (this.matches('keyword', 'PING')) {
      this.match('keyword', 'PING');
      statement += 'cell.send(';
      statement += this.matchPing();
      statement += ')';
    } else if (this.matches('keyword', 'IF')) {
      statement += this.matchConditional(indent)
    } else if (this.matches('keyword', 'LOOP')) {
      statement += this.matchLoop(indent);
    } else if (this.matches('executable')) {
      statement += this.match('executable');
    } else {
      const value = this.matchValue();
      statement += value + '=';
      if (this.matches('aux', '->')) {
        this.match('aux', '->');
        statement += this.matchExpression();
      } else if (this.matches('aux', '+=')) {
        this.match('aux', '+=');
        statement += 'add(' + value + ',' + this.matchExpression() + ')';
      } else if (this.matches('aux', '-=')) {
        this.match('aux', '-=');
        statement += 'subtract(' + value + ',' + this.matchExpression() + ')';
      } else if (this.matches('aux', '*=')) {
        this.match('aux', '*=');
        statement += 'multiply(' + value + ',' + this.matchExpression() + ')';
      } else if (this.matches('aux', '/=')) {
        this.match('aux', '/=');
        statement += 'divide(' + value + ',' + this.matchExpression() + ')';
      }
    }
    statement += '\n';
    return statement;
  }

  matchAssignment() {
    const ops = ['+=','-=','*=','/=']
    if (this.matches('aux') && ops.includes(this.token.content)) {
      return this.match('aux');
    }
    if (this.matches('aux', '->')) {
      this.match('aux', '->');
      return '=';
    } else {
      this.error('expected assignment operator but found ' + this.token);
    }
  }

  matchPing() {
    this.match('aux', '.');
    if (this.matches('aux', '?')) {
      this.match('aux', '?');
      return 'ping';
    }
    const name = this.match('identifier');
    const data = this.matchList();
    const decay = this.matchDecay();
    // TODO: error if invalid ping definition
    return 'new Ping(' + ['"' + name + '"', decay, ...data].join(', ') + ')';
  }

  matchDecay() {
    if (this.matches('aux', '#')) {
      this.match('aux', '#');
      return this.match('number');
    }
    return DEFAULT_DECAY;
  }

  matchConditional(indent) {
    this.match('keyword', 'IF');
    let conditional = 'if (' + this.matchBoolean() + ') {\n';
    conditional += this.matchBlock(indent + 1);
    conditional += '  '.repeat(indent) + '}';
    while (this.matches('keyword', 'ELIF')) {
      this.match('keyword', 'ELIF');
      conditional += ' else if (' + this.matchBoolean() + ') {\n';
      conditional += this.matchBlock(indent + 1);
      conditional += '  '.repeat(indent) + '}';
    }
    if (this.matches('keyword', 'ELSE')) {
      this.match('keyword', 'ELSE');
      conditional += ' else {\n';
      conditional += this.matchBlock(indent + 1);
      conditional += '  '.repeat(indent) + '}';
    }
    return conditional;
  }

  matchBoolean() {
    let boolean = '';
    while (true) {
      if (this.matches('aux', '[')) {
        this.match('aux', '[');
        boolean += '( ' + this.matchBoolean() + ')';
        this.match('aux', ']');
      } else {
        boolean += this.matchComparison();
      }
      if (this.matches('aux', '&&') || this.matches('aux', '||')) {
        boolean += this.match('aux');
        continue;
      }
      return boolean;
    }
  }

  matchLoop(indent) {
    this.match('keyword', 'LOOP');
    const iterable = this.matchData();
    this.match('keyword', 'WITH');
    const variable = this.matchVariable(true);
    let loop = 'for (' + variable + ' of ' + iterable + ' ) {\n'
    if (this.matches('keyword', 'IF')) {
      loop += this.matchConditional(indent + 1);
    } else {
      loop += this.matchBlock(indent + 1);
    }
    loop += '  '.repeat(indent) + '}';
    return loop;
  }

  matchValue() {
    if (this.matches('aux', '!')) {
      this.match('aux', '!');
      return 'cell.data[' + this.matchData() + ']'
      // TODO: escape strings?
    } else if (this.matches('aux', '?')) {
      this.match('aux', '?');
      const arg = this.match('literal');
      if (!this.args.includes(arg)) {
        this.error('no ping attribute ' + arg);
      }
      return 'ping.args[' + this.args.indexOf(arg) + ']';
    } else if (this.matches('identifier')) {
      return this.matchVariable(true);
    } else {
      this.error('invalid value ' + this.token);
    }
  }

  matchVariable(leftside) {
    const variable = this.match('identifier');
    if (leftside) {
      if (!this.variables.includes(variable)) this.variables.push();
    } else {
      if (!this.variables.includes(variable)) {
        this.error('variable ' + variable + ' not defined');
      }
    }
    return 'tempvar_' + variable;
  }

  matchComparison() {
    let comparison = ''
    const a = this.matchData();
    if (this.matches('aux', '==')) {
      this.match('aux', '==');
      comparison += 'equal';
    } else if (this.matches('aux', '<>')) {
      this.match('aux', '<>');
      comparison += '!equal';
    } else if (this.matches('aux', '<<')) {
      this.match('aux', '<<');
      comparison += 'lessThan';
    } else if (this.matches('aux', '>>')) {
      this.match('aux', '>>');
      comparison += 'greaterThan';
    } else if (this.matches('aux', '<=')) {
      this.match('aux', '<=');
      comparison += 'lessThanEqual';
    } else if (this.matches('aux', '>=')) {
      this.match('aux', '>=');
      comparison += 'greaterThanEqual';
    } else {
      this.error('expected comparison operator but found ' + this.token);
    }
    const b = this.matchData();
    comparison += '(' + a + ', ' + b + ')';
    return comparison;
  }

  matchExpression() {
    if (this.matches('aux', '[')) {
      this.match('aux', '[');
      let expression = '(' + this.matchExpression() + ')';
      this.match('aux', ']')
      return expression;
    }
    let expression = this.matchData();
    while (true) {
      if (this.matches('aux', '+')) {
        this.match('aux', '+');
        expression = 'add('+expression+','+this.matchExpression()+')'
      } else if (this.matches('aux', '-')) {
        this.match('aux', '-');
        expression = 'subtract('+expression+','+this.matchExpression()+')'
      } else if (this.matches('aux', '*')) {
        this.match('aux', '*');
        expression = 'multiply('+expression+','+this.matchExpression()+')'
      } else if (this.matches('aux', '/')) {
        this.match('aux', '/');
        expression = 'divide('+expression+','+this.matchExpression()+')'
      } else {
        break;
      }
    }
    return expression;

    // function more(self) {
    //   const ops = ['+', '-', '*', '/'];
    //   for (var i = 0; i < ops.length; i++) {
    //     if (self.matches('aux', ops[i])) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }
    // while (more(this)) {
    //   expression += ' ' + this.match();
    //   expression += ' ' + this.matchData();
    // }

  }

  matchData() {
    if (this.matches('aux', '-')) {
      this.match('aux', '-');
      return this.match('number');
    } else if (this.matches('number')) {
      return this.match('number');
    } else if (this.matches('aux', '(')) {
      return '[' + this.matchList().join(', ') + ']';
    } else if (this.matches('keyword', 'RAND')) {
      this.match('keyword', 'RAND');
      return 'Math.random()';
    } else if (this.matches('keyword', 'NULL')) {
      this.match('keyword', 'NULL');
      return 'undefined'
    } else if (this.matches('keyword', 'INFT')) {
      this.match('keyword', 'INFT');
      return 'Infinity'
    } else if (this.matches('keyword', 'KEYS')) {
      this.match('keyword', 'KEYS');
      return 'cell.keys';
    } else if (this.matches('keyword', 'VALS')) {
      this.match('keyword', 'VALS');
      return 'cell.vals'; // TODO: are pings data as well?
    } else if (this.matches('literal')) {
      return '"' + this.match('literal') + '"';
    } else {
      return this.matchValue();
    }
  }

  match(type, content) {
    if (!this.matches(type, content)) {
      this.error('expected ('+type+', '+content+')'+' but found '+this.token);
    }
    const token = this.token;
    this.advance();
    return token.content;
  }

  matches(type, content) {
    if (type != undefined && type != this.token.type) {
      return false;
    }
    if (content != undefined && content != this.token.content) {
      return false;
    }
    return true;
  }

}
