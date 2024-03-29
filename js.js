/* eslint-disable no-tabs */
// Sätter värde på alla dedär
var
  COLS = 26
var ROWS = 26
var EMPTY = 0
var SNAKE = 1
var FRUIT = 2
var LEFT = 0
var UP = 1
var RIGHT = 2
var DOWN = 3
var KEY_LEFT = 37
var KEY_UP = 38
var KEY_RIGHT = 39
var KEY_DOWN = 40
var canvas
var ctx
var keystate
var frames
var pauseGame = false
var scoreHistory = []
var score
var grid = null
var snake = null
var reqid = null
// gör boxen
grid = {

  width: null,
  height: null,
  _grid: null,

  init: function (d, c, r) {
    this.width = c
    this.height = r

    this._grid = []
    for (var x = 0; x < c; x++) {
      this._grid.push([])
      for (var y = 0; y < r; y++) {
        this._grid[x].push(d)
      }
    }
  },

  set: function (val, x, y) {
    this._grid[x][y] = val
  },

  get: function (x, y) {
    return this._grid[x][y]
  }
}

// Gör så att snek dör om han går utanför boxen
snake = {

  direction: null,
  last: null,
  _queue: null,

  init: function (d, x, y) {
    this.direction = d

    this._queue = []
    this.insert(x, y)
  },

  insert: function (x, y) {
    this._queue.unshift({ x: x, y: y })
    this.last = this._queue[0]
  },

  remove: function () {
    return this._queue.pop()
  }
}

// eslint-disable-next-line no-unused-vars
function playagain () {
  snake.direction = UP
  pauseGame = false
  scoreHistory.push(score)
  document.getElementById('ScoreHistory').innerText = scoreHistory.join('\n')
  window.cancelAnimationFrame(reqid)
  document.getElementById ("game-over").style.display='none'

  frames = 0

  init()
  loop()
}

function setFood () {
  var empty = []

  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      if (grid.get(x, y) === EMPTY) {
        empty.push({ x: x, y: y })
      }
    }
  }

  var randpos = empty[Math.round(Math.random() * (empty.length - 1))]
  grid.set(FRUIT, randpos.x, randpos.y)
}

// fixar canvaset för snek game
function main () {
  document.getElementById('background-audio').play()
  canvas = document.createElement('canvas')
  canvas.width = COLS * 20
  canvas.height = ROWS * 20
  ctx = canvas.getContext('2d')

  document.body.appendChild(canvas)

  ctx.font = '12px Helvetica'

  frames = 0
  keystate = {}

  document.addEventListener('keydown', function (evt) {
    keystate[evt.keyCode] = true
  })
  document.addEventListener('keyup', function (evt) {
    delete keystate[evt.keyCode]
  })

  init()
  loop()
}

// reset funktionen händer alltid när snek krockar med väggen eller sig själv
function init () {
  score = 0

  grid.init(EMPTY, COLS, ROWS)

  var sp = { x: Math.floor(COLS / 2), y: ROWS - 1 }
  snake.init(UP, sp.x, sp.y)
  grid.set(SNAKE, sp.x, sp.y)

  setFood()
}

// paussar spelet om du dör
function loop () {
  update()
  draw()
  if (!pauseGame) {
    reqid = window.requestAnimationFrame(loop, canvas)
  }
}

// Gör så att snek kan int gå in i sig själv
function update () {
  frames++
  console.log('text', frames)

  if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
    snake.direction = LEFT
  }
  if (keystate[KEY_UP] && snake.direction !== DOWN) {
    snake.direction = UP
  }
  if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
    snake.direction = RIGHT
  }
  if (keystate[KEY_DOWN] && snake.direction !== UP) {
    snake.direction = DOWN
  }

  if (frames % 7 === 0) {
    var nx = snake.last.x
    var ny = snake.last.y

	// Snek movements
    switch (snake.direction) {
      case LEFT:
        nx--
        break
      case UP:
        ny--
        break
      case RIGHT:
        nx++
        break
      case DOWN:
        ny++
        break
    }

    if (nx < 0 || nx > grid.width - 1 ||
	ny < 0 || ny > grid.height - 1 ||
  (grid.get(nx, ny) === SNAKE && score > 2)
    ) {
      // return init();
	  pauseGame = true
	  document.getElementById('gameover-audio').play()
      document.getElementById ("game-over").style.display='block'
    }
    // Alltid när snek äter så blir han större
    if (grid.get(nx, ny) === FRUIT) {
      score++
	  setFood()
	  document.getElementById("audio").play()
    } else {
      var tail = snake.remove()
      grid.set(EMPTY, tail.x, tail.y)
    }

    grid.set(SNAKE, nx, ny)
    snake.insert(nx, ny)
  }
}

// Stylar och ger färg till spelet
function draw () {
  var tw = canvas.width / grid.width
  var th = canvas.height / grid.height


  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      switch (grid.get(x, y)) {
        case EMPTY:
          ctx.fillStyle = '#fff'
          ctx.strokeStyle = 'rgb(180, 180, 180)'
          break
        case SNAKE:
          ctx.fillStyle = '#000'
          break
        case FRUIT:
          ctx.fillStyle = '#ff0000'
          break
      }
      ctx.fillRect(x * tw, y * th, tw, th)
      ctx.strokeRect(x * tw, y * th, tw, th)
    }
  }

  ctx.fillStyle = '#000'
  ctx.fillText('SCORE: ' + score, 10, canvas.height - 10)
}
