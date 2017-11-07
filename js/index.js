class Background {
  constructor(ctx, props) {
    this.ctx = ctx
    this.dimension = props.dimension
  }

  draw() {
    let ctx = this.ctx
    ctx.fillStyle = '#2d3142'
    ctx.fillRect(0, 0, this.dimension.width, this.dimension.height)
  }

  stepState() { return false }
}

function abs(x) {
  if(x > 0) return x;
  return -x;
}

var getRandomColor = function(){
  return  '#' +
    (function(color){
    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
      && (color.length == 6) ?  color : arguments.callee(color);
  })('');
}

class UI {
  constructor(ctx) {
    this.ctx = ctx;
    this.color = '#ff0000';
    this.changecolor = 0;
  }

  draw() {
    let a = 50;
    this.ctx.beginPath();
    this.ctx.moveTo(a,a-10);
    this.ctx.bezierCurveTo(a+12,a-30,a+30,a-10,a+20,a+5);
    this.ctx.lineTo(a,a+25);
    this.ctx.lineTo(a-20,a+5);
    this.ctx.bezierCurveTo(a-30,a-10,a-12,a-30,a,a-10);
    this.ctx.closePath();
    if(this.changecolor == 0) this.ctx.fillStyle = this.color;
    else this.ctx.fillStyle = getRandomColor();
    this.ctx.fill();
  }

}

class Obj {
  constructor(ctx, props) {
    this.ctx = ctx;
    this.center = props.center;
    this.width = props.width;
    this.change = 0;
    this.cnt = 0;
    this.intv = 0;
    this.changecolor = 0;
    this.color = getRandomColor();
  }

  draw() {
    let ctx = this.ctx;
    if(this.changecolor == 0) ctx.strokeStyle = this.color;
    else ctx.strokeStyle = getRandomColor();
    ctx.lineWidth = this.width / 2;
    ctx.strokeRect(this.center.x - this.width / 4, this.center.y - this.width / 4, this.width / 2, this.width / 2)
  }

  checkCollision(player) {
  //   console.log(player.center);
    // console.log(this.center);
     if (this.change == 1) {
       ++this.cnt;
       console.log(this.cnt);
     }

     if (this.cnt > this.intv) {
        this.resetPos();
        this.changecolor = (Math.random() < 0.2);
        this.color = getRandomColor();
        this.cnt = 0; this.change = 0;
      }

     if (this.change == 0 && abs(player.center.x - this.center.x) < 30 && abs(player.center.y - this.center.y) < 30 ) {
       this.change = 1;
       this.center = {x: -20, y: -20};
       this.intv = Math.random() * 50 + 10;

       player.changecolor = this.changecolor;
       player.color = this.color;

       console.log(player.center);
       console.log(this.center);
     }
  }

  resetPos() {
    this.center = { x: Math.random() * window.innerWidth * 0.8 + 20,
                    y: Math.random() * window.innerHeight * 0.8 + 20
                  };
  }

  setpState() {
    return true;qw
  }

}

class Border {
  constructor(ctx, props) {
    this.ctx = ctx
    this.topLeft = props.topLeft
    this.dimension = props.dimension
    this.width = props.width
  }

  draw() {
    let ctx = this.ctx
    ctx.strokeStyle = '#4f5d75'
    ctx.lineWidth = this.width
    ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.dimension.width, this.dimension.height)
  }

  stepState() { return this.cnt == 0; }
}


class Player {
  constructor(ctx, props) {
    this.ctx = ctx
    this.center = props.center
    this.width = props.width
    this.speed = props.speed
    this.commands = {}
    this.changecolor = 0;
    this.color = '#ef8354';
  }

  draw() {
    let ctx = this.ctx
    if(this.changecolor == 0) ctx.strokeStyle = this.color;
    else ctx.strokeStyle = getRandomColor();
    ctx.lineWidth = this.width / 2
    ctx.strokeRect(this.center.x - this.width / 4, this.center.y - this.width / 4, this.width / 2, this.width / 2)
  }

  stepState(keys) {
    let updated = false
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.center.y -= this.speed
      updated = true
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.center.x += this.speed
      updated = true
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      this.center.y += this.speed
      updated = true
    }
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.center.x -= this.speed
      updated = true
    }
    if(updated) {
      console.log(keys)
      console.log(updated)
    }
    return updated
  }
}


class Game {
  constructor(ctx, dimension) {
    this.ctx = ctx
    this.dimension = dimension

    this.background = new Background(ctx, {
      dimension: dimension
    })

    let lineWidth = 20
    this.border = new Border(ctx, {
      topLeft: {
        x: lineWidth / 2,
        y: lineWidth / 2
      },
      dimension: {
        width: dimension.width - lineWidth,
        height: dimension.height - lineWidth
      },
      width: lineWidth
    })

    this.obj = new Obj(ctx, {
      center: {
        x: dimension.width / 2,
        y: dimension.height / 2
      },
      width: 30
    })

    this.ui = new UI(ctx)

    this.player = new Player(ctx, {
      center: {
        x: dimension.width / 2,
        y: dimension.height / 2
      },
      width: 20,
      speed: 10
    })

    this.boundFn = {}
    this.boundFn.tick = this.tick.bind(this)

    this.states = {
      downKeys: new Set(),
      needRedraw: true
    }
  }

  draw() {
    this.background.draw()
    this.border.draw()
    this.player.draw()
    this.obj.draw()
    this.ui.draw()
  }

  keyDown(key) {
    this.states.downKeys.add(key)
    // console.log(this.states.downKeys)
  }

  keyUp(key) {
    this.states.downKeys.delete(key)
    // console.log(this.states.downKeys)
  }

  checkCollision() {
    if (this.player.center.x - this.player.width / 2 < this.border.width) {
      this.player.center.x = this.border.width + this.player.width / 2
      console.log('hit left')
    }
    if (this.player.center.x + this.player.width / 2 > this.border.dimension.width) {
      this.player.center.x = this.border.dimension.width - this.player.width / 2
      console.log('hit right')
    }
    if (this.player.center.y - this.player.width / 2 < this.border.width) {
      this.player.center.y = this.border.width + this.player.width / 2
      console.log('hit top')
    }
    if (this.player.center.y + this.player.width / 2 > this.border.dimension.height) {
      this.player.center.y = this.border.dimension.height - this.player.width / 2
      console.log('hit bottom')
    }
    return false
  }

  stepState() {
//    if (this.states.downKeys.size === 0) return false

    let updated = this.player.stepState(this.states.downKeys) || this.obj.setpState();
    // dummy operations just to give the idea of `|=`
    // updated |= this.border.stepState()
    // updated |= this.background.stepState()

    if (updated) {
      this.checkCollision()
      this.obj.checkCollision(this.player)
    }
    return updated
  }

  tick() {
    if (this.states.needRedraw) {
  //    console.log(this.player.center);
      this.draw()
    }

    this.states.needRedraw = this.stepState()
    window.requestAnimationFrame(this.boundFn.tick)
  }

  start() {
    this.tick()
  }
}


function bindKeys(game) {
  window.addEventListener('keydown', function(event) {
    game.keyDown(event.key)
  })
  window.addEventListener('keyup', function(event) {
    game.keyUp(event.key)
  })
}

function init() {
  let $canvas = document.getElementsByTagName('canvas')[0]
  $canvas.width = window.innerWidth
  $canvas.height = window.innerHeight

  let game = new Game(
    $canvas.getContext('2d'),
    {
      width: $canvas.width,
      height: $canvas.height
    }
  )
  bindKeys(game)
  game.start()
}


init()
