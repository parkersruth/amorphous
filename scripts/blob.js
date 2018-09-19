
class Blob {

  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;

    this.w = canvas.width;
    this.h = canvas.height;

    this.playing = false;
    this.dna;
  }

  scatter(num_cells) {
    this.cell_grid = {};
    this.cells = [];

    const area = this.w * this.h;
    const r = Math.sqrt(0.465 * area / (Math.PI * num_cells)) - 200 / num_cells;
    const l = r * Math.sqrt(2);
    var live_cells = [];

    this.place_cell(this.w / 2, this.h / 2, r, l, live_cells);
    while (true) {
      if (live_cells.length == 0) {
        break;
      }
      var live = live_cells[0];
      var i = 0;
      while (true) {
        i++;
        if (i == 11) {
          live_cells.shift();
          break;
        }
        var dr = Math.random() * 2 * r + 2 * r,
            theta = Math.random() * 2 * Math.PI,
            dx = dr * Math.cos(theta),
            dy = dr * Math.sin(theta),
            newx = live.x + dx,
            newy = live.y + dy;
        if (newx > this.w - r || newx < r || newy > this.h - r || newy < r) {
          continue;
        }
        if (this.place_cell(newx, newy, r, l, live_cells)) {
          break
        }
      }
    }
  }

  place_cell(x, y, r, l, live_cells) {
    var col = Math.floor(x / l);
    var row = Math.floor(y / l);
    var pals = [];

    for (var dcol = -3; dcol <= 3; dcol++) {
      for (var drow = -3; drow <= 3; drow++) {
        var larry = this.cell_grid[col+dcol];
        if (larry != undefined) {
          var cell = larry[row+drow];
          if (cell != undefined) {
            var dx = x - cell.x, dy = y - cell.y,
                dist = Math.hypot(dx, dy);
            if (dist < r + cell.r) {
              return false;
            }
            if (dist < 2 * r + 2 * cell.r) {
              pals.push(cell);
            }
          }
        }
      }
    }

    var newCell = new Cell(x, y, r);
    pals.forEach( function(pal) {
      newCell.pals.push(pal);
      pal.pals.push(newCell);
    });
    live_cells.push(newCell);
    if (this.cell_grid[col] == undefined) {
      this.cell_grid[col] = {};
    }
    this.cell_grid[col][row] = newCell;
    this.cells.push(newCell);
    return true;
  }

  nearest(x, y) {
    // TODO: reduce redundancy with place_cell method
    var col = Math.floor(x / (this.cells[0].r * Math.sqrt(2)));
    var row = Math.floor(y / (this.cells[0].r * Math.sqrt(2)));
    var closest_dist, closest_cell;
    for (var dcol = -2; dcol <= 2; dcol++) {
      for (var drow = -2; drow <= 2; drow++) {
        var larry = this.cell_grid[col+dcol];
        if (larry != undefined) {
          var cell = larry[row+drow];
          if (cell != undefined) {
            var dx = x - cell.x, dy = y - cell.y,
                dist = Math.hypot(dx, dy);
            if (closest_dist == undefined || dist < closest_dist) {
              closest_dist = dist;
              closest_cell = cell;
            }
          }
        }
      }
    }
    return closest_cell;
  }

  process(n = this.cells.length) {
    // this.clear();
    for (var i = 0; i < n; i++) {
      const cell = this.cells.pop();
      cell.process();
      cell.render(this.context);
      this.cells.unshift(cell);
    }
  }

  click_handler(event) {
    const cell = this.nearest(event.layerX, event.layerY);
    if (cell != undefined) {
      var trigmen = document.getElementById("triggerMenu");
      var trig = trigmen.options[trigmen.selectedIndex].value;
      cell.trigger(new Ping(trig));
    }
  }

  keypress_handler(event) {
    if (event.key == " ") {
      startstop();
    }
  }

  reset(dna) {
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].initialize(dna);
      this.cells[i].trigger(new Ping('_init'))
    }
  }

  // clear() {
  //   this.context.clearRect(0, 0, b.w, b.h);
  //   this.context.fillStyle = 'rgb(255, 255, 255)';
  //   this.context.fillRect(0, 0, b.w, b.h);
  // }

}
