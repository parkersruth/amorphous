
function RuntimeError(message, row, col) {
  this.message = message;
}

function rgb_from_vec(vec) {
  rgb = vec.map(function(x) { return Math.round(x * 255); });
  return 'rgb(' + rgb.join(',') + ')';
}

function rand_choice(arr) {
  index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function equal(a, b) {
  if (a === null || b === null) return false;
  if (a === b) return true;
  if (typeof a != typeof b) return false;
  if (typeof a === 'object') {
    if (a.constructor.name != b.constructor.name) return false;
    if (a.constructor.name == 'Array') {
      if (a.length != b.length) return false;
      for (var i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    } else {
      for (var property in a) {
        if (a.hasOwnProperty(property)) {
          if (!b.hasOwnProperty(property)) return false;
          if (!equal(a[property], b[property])) {
            console.log('these are different: ', a[property], b[property]);
            return false;
          }
        }
      }
      return true;
    }
  }
  return false;
}

function lessThan(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a.startsWith(b);
  } else {
    return false;
    // throw new RuntimeError('Can\'t calculate ' + a + ' < ' + b);
  }
}

function greaterThan(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a > b
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a.endsWith(b);
  } else {
    return false;
    // throw new RuntimeError('Can\'t calculate ' + a + ' > ' + b);
  }
}

function lessThanEqual(a, b) {
  return lessThan(a, b) || equal(a, b)
}

function greaterThanEqual(a, b) {
  return greaterThan(a, b) || equal(a, b)
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function resymbolize(code) {
  code = code.replaceAll('&gt;', '>')
  code = code.replaceAll('&lt;', '<')
  code = code.replaceAll('&amp;', '&')
  return code
}
