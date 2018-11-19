

const alt_default_dna = `
this.queue = [];
for (var i = 0; i < 3; i++) {
  this.data.color[i] += Math.random() * 0.2 - 0.1;
}
`;

const default_dna = `
var yupindeedy = false;
if (this.queue.length > 0) {
  // console.log(this.queue);
  yupindeedy = true;
}
var colormap = {};
while (this.queue.length > 0) {
  var key = this.queue.pop().toString();
  var val = colormap[key];
  if (val == undefined) {
    colormap[key] = 1;
  } else {
    colormap[key] = val + 1;
  }
}
if (yupindeedy) {
}
var highest = 0;
var best = this.data.color.toString();
for (var color in colormap) {
  if (colormap.hasOwnProperty(color)) {
    if (colormap[color] > highest) {
      best = color;
      highest = colormap[color];
    }
  }
}
if (this.data.color.toString() != best) {
  this.data.color = best.split(',');
  this.send(this.data.olor);
}
`;


function Ping(name, decay, ...args) {
  this.name = name;
  this.decay = decay || 0;
  this.args = args || [];
  this.id = Math.random();
}

function copyPing(ping) {
  const newping = new Ping(ping.name, ping.decay, ...ping.args);
  newping.id = ping.id;
  return newping;
}


class Cell {

  constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.pals = [];
      this.initialize();
  }

  initialize(dna) {
    this.queue = [];
    this.antiqueue = [];
    this.data = {color: [.8, .8, .8]}; // TODO: only allow string keys
    this.temp = {};
    if (dna) {
      this.dna = dna;
    }
    if (this.dna == null) {
      this.dna = new Map();
    }
    if (this.dna.get('_init') == null) {
      this.dna.set('_init', new Function('cell', 'ping', ''));
    }
  }

  get keys() {
    const keys = [];
    for (var key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  get vals() {
    const vals = [];
    for (var key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        vals.push(this.data[key]);
      }
    }
    return vals;
  }

  render(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = rgb_from_vec(this.data.color);
    context.fill();
  }

  send(ping) {
    this.pals.forEach(function(pal) {
      pal.enqueue(copyPing(ping));
    });
  }

  enqueue(ping) {
    if (this.queue.length > 1000) {
      window.alert('Queue size exceeded 1000. Please check for ping explosions.')
      throw "Explosion Detected";
    } else {
      for (var i = 0; i < this.queue.length; i++) {
        const oldping = this.queue[i];
        if (oldping.id === ping.id) return false;
      }
      this.queue.unshift(copyPing(ping));
      return true;
    }
  }

  process() {
    this.temp = {};
    const numpings = this.queue.length;
    for (var i = 0; i < numpings; i++) {
    // if (numpings > 0) {
      const ping = this.queue.pop();
      this.dna.get(ping.name)(this, ping);
    }
  }

  trigger(ping) {
    this.enqueue(ping);
  }

}
