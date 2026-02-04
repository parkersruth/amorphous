
const mainCanvas = document.getElementById('myCanvas');
const mainContext = mainCanvas.getContext('2d');
const startstopbtn = document.getElementById('startstopbtn');
const stepnumlabel = document.getElementById('stepnum');

let step = 0;
let start_time = window.performance.now();
let requestId;
let mousedowntime = 0;
const b = new Blob(mainCanvas, mainContext);
b.scatter(8000);
b.cells = shuffle(b.cells);
setExample(0);
// setExample(1);

// TODO handle drag events as well
mainCanvas.addEventListener("click", function(event) {
  b.click_handler(event);
});

mainCanvas.addEventListener("mousedown", function(event) {
  mousedowntime = window.performance.now();
});

mainCanvas.addEventListener("mousemove", function(event) {
  if (event.which == 1) {
    if (window.performance.now() - mousedowntime > 100) {
      b.click_handler(event);
    }
  }
});


// TODO: don't trigger the kepress if the user is typing code.
// window.addEventListener("keypress", function(event) {
//   b.keypress_handler(event);
// });

b.process();


function setExample(num) {
  const pings = [testPing0, testPing1, testPing2, testPing3];
  ace.edit("editor").setValue(pings[num], -1);
  compile();

  for (var i = 0; i < 4; i++) {
    let id = 'ex' + i + 'btn';
    elem = document.getElementById(id);
    elem.setAttribute('selectified', i == num);
  }
}

function animate() {
  step++;
  b.process(Math.ceil(b.cells.length / 7));
  // b.process()

  if (step % 60 == 0) {
    var delay = window.performance.now() - start_time;
    var fps = Math.round(60000 / delay);
    document.getElementById("fps").innerHTML = fps + " fps";
    start_time = window.performance.now();
  }     
  stepnumlabel.innerHTML = "stepnum: " + step;

  if (b.playing) {
    requestId = requestAnimationFrame(animate);
  }
}

function compile() {
  console.clear();
  const pingCode = ace.edit("editor").getValue();
  console.log(pingCode);
  const c = new Compiler(pingCode);
  dna = c.compile()
  console.log(dna);
  b.reset(dna);
  stepnumlabel.innerHTML = "stepnum " + 0;
  _start();
}

function startstop() {
  if (b.playing) {
    _stop();
  } else {
    _start();
  }
}

function _start() {
  if (!b.playing) {
    b.playing = true;
    startstopbtn.className = "stopbtn";
    startstopbtn.innerHTML = "STOP";
    animate();
  }
}

function _stop() {
  if (b.playing) {
    b.playing = false;
    startstopbtn.className = "startbtn";
    startstopbtn.innerHTML = "START";
    cancelAnimationFrame(requestId);
  }
}

function reset() {
  b.reset();
}
