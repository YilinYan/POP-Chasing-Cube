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

  update() {
    this.draw()
  }
}

function abs(x) {
  if(x > 0) return x;
  return -x;
}
function lerp(a, b, c){
  return (b-a)*c + a
}

var getRandomColor = function(){
  return  '#' +
    (function(color){
    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
      && (color.length == 6) ?  color : arguments.callee(color);
  })('');
}

function Max(a, b) { if(a > b) return a
  return b
}

function Min(a, b) { if(a < b) return a
  return b
}

class UI {
  constructor(ctx) {
    this.ctx = ctx;
    this.color = '#ff0000';
    this.changecolor = 0;
  }

  update() {
    this.draw()
  }

  draw() {
    let a = 50;
    this.ctx.lineWidth = 1
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

class ObjSystem {
  constructor(ctx, props) {
    this.ctx = ctx
    this.objs = []
    this.queue = []
    this.qcnt = 0
    this.cnt = 0
    this.maxCnt = 5
  }

  insert(center, speed) {
    if(this.qcnt > this.maxCnt) return
    this.queue[this.qcnt] = new Obj(this.ctx, {})
    let a = this.queue[this.qcnt++]
    a.speed.x = speed.x || a.speed.x
    a.speed.y = speed.y || a.speed.y
    a.center.x = center.x + speed.x || a.center.x
    a.center.y = center.y + speed.y || a.center.y
  }

  update(player, border) {
//    console.log(this.cnt)
//    console.log(this.objs)
    if(this.cnt == 0) this.insert({}, {})

    for(var i = 0; i < this.qcnt && this.cnt < this.maxCnt; ++i) this.objs[this.cnt++] = this.queue[i]
    this.qcnt = 0
    for(var i = 0; i < this.cnt; ++i) {

      if(this.objs[i].checkCollision(player) == 1) {
  //      if(this.objs[i].changecolor == 1) ++this.maxCnt
        player.color = this.objs[i].color
        player.changecolor = this.objs[i].changecolor
        delete this.objs[i]
        --this.cnt
        for(var j = i; j < this.cnt; ++j)
          this.objs[j] = this.objs[j+1]
      }
    }

    for(var i = 0; i < this.cnt; ++i) {
    //    this.objs[0].update(player, border, this)
      this.objs[i].update(player, border, this)
//      console.log(this.objs[0].speed)

    //if(this.cnt > 1) this.objs[1].update(player, border, this)
    }
  }
}


var intv = 30
class Obj {
  constructor(ctx, props) {
    this.ctx = ctx;
    this.maxSpeed = 8;
    this.center = props.center || { x: Math.random() * window.innerWidth * 0.8 + 20,
                                    y: Math.random() * window.innerHeight * 0.8 + 20 }
    this.Swidth = props.width || 30
    this.Sheight = props.width || 30
    this.Lwidth = props.width || 30
    this.Rwidth = props.width || 30
    this.Uheight = props.width || 30
    this.Dheight = props.width || 30
    this.speed = props.speed || { x: Math.random() * this.maxSpeed * 2 - this.maxSpeed,
                                  y: Math.random() * this.maxSpeed * 2 - this.maxSpeed }
    this.changecolor = (Math.random() < 0.1);
    this.color = getRandomColor();
    this.LwidthChange = 0
    this.RwidthChange = 0
    this.UheightChange = 0
    this.DheightChange = 0
  }

  draw() {
    let ctx = this.ctx;
    if(this.changecolor == 0) ctx.fillStyle = this.color;
    else ctx.fillStyle = getRandomColor();
    ctx.lineWidth = this.width / 2;
    ctx.fillRect(this.center.x - this.Lwidth, this.center.y - this.Uheight,
      this.Lwidth + this.Rwidth, this.Uheight + this.Dheight)
  }

  update(player, border, objSystem) {
    this.check(border, objSystem)
    if(this.RwidthChange) {
      this.Rwidth = this.Swidth * (1 - Math.sin(this.RwidthChange / intv * 3.14))
      --this.RwidthChange
    }
    else this.Rwidth = this.Swidth
    if(this.LwidthChange) {
      this.Lwidth = this.Swidth * (1 - Math.sin(this.LwidthChange / intv * 3.14))
      --this.LwidthChange
    }
    else this.Lwidth = this.Swidth
    if(this.UheightChange) {
      this.Uheight = this.Swidth * (1 - Math.sin(this.UheightChange / intv * 3.14))
      --this.UheightChange
    }
    else this.Uheight = this.Swidth
    if(this.DheightChange) {
      this.Dheight = this.Swidth * (1 - Math.sin(this.DheightChange / intv * 3.14))
      --this.DheightChange
    }
    else this.Dheight = this.Swidth
    this.center.x += this.speed.x
    this.center.y += this.speed.y
    this.draw()
  }

  check(border, objSystem) {
//    console.log(this.speed)
    if(this.center.x < border.width + this.Lwidth ||
      this.center.x > border.dimension.width - this.Rwidth) {
        objSystem.insert (this.center,
                          {x: -this.speed.x, y: -this.speed.y})
        this.LwidthChange = intv * (this.center.x < border.width + this.Lwidth)
        this.RwidthChange = intv * (this.center.x > border.dimension.width - this.Rwidth)
        this.speed.x = -this.speed.x
        if(this.speed.y == 0) this.speed.y = 1
  //      this.speed.y += Math.random() * 4 - 2
  //      this.speed.y = Max(this.speed.y, -this.maxSpeed)
//        this.speed.y = Min(this.speed.y, this.maxSpeed)
    }

    else if(this.center.y < border.width + this.Uheight ||
      this.center.y > border.dimension.height - this.Dheight) {
        objSystem.insert (this.center,
                          {x: -this.speed.x, y: -this.speed.y})

        this.DheightChange = intv * (this.center.y < border.width + this.Uheight)
        this.UheightChange = intv * (this.center.y > border.dimension.height - this.Dheight)
        this.speed.y = -this.speed.y
        if(this.speed.x == 0) this.speed.x = 1
  //      this.speed.x += Math.random() * 4 - 2;
//        this.speed.x = Max(this.speed.x, -this.maxSpeed)
//        this.speed.x = Min(this.speed.x, this.maxSpeed)
    }
  }

  checkCollision(player) {
/*     if (this.change == 1) ++this.cnt;

     if (this.cnt > this.intv) {
        this.resetPos();
        this.changecolor = (Math.random() < 0.2);
        this.color = getRandomColor();
        this.speed.x = Math.random() * 10 - 5;
        this.speed.y = Math.random() * 10 - 5;
        this.cnt = 0;
        this.change = 0;
      }*/
     if (abs(player.center.x - this.center.x) < 50 && abs(player.center.y - this.center.y) < 50 ) {
       return 1
     }
     return 0
  }

  reset() {
    this.changecolor = (Math.random() < 0.2);
    this.color = getRandomColor();
    this.center = { x: Math.random() * window.innerWidth * 0.8 + 20,
                    y: Math.random() * window.innerHeight * 0.8 + 20
                  }

    this.center = { x: Math.random() * window.innerWidth * 0.8 + 20,
                    y: Math.random() * window.innerHeight * 0.8 + 20
                  }
  }

}

var curveintv = 20
class Border {
  constructor(ctx, props) {
    this.ctx = ctx
    this.topLeft = props.topLeft
    this.dimension = props.dimension
    this.width = props.width
    this.curve = 0
    this.ind = 0
    this.pos = 0
    this.inten = 0
    this.flag = 0
  }

  set(ind, pos) {
    this.curve = curveintv
    this.ind = ind
    this.inten = 10
    this.pos = pos
  }

  draw() {
    let ctx = this.ctx
//    ctx.strokeStyle = '#4f5d75'
//    ctx.lineWidth = this.width
//    ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.dimension.width, this.dimension.height)

    ctx.lineWidth = this.width * 2
    let add = -10
    this.ctx.fillStyle = '#4f5d75'
    {
      this.inten = 50 * (Math.sin(this.curve / curveintv * 3.14 * 2))
      if(this.curve > 0) --this.curve
      this.ctx.beginPath()
      this.drawLine(
               {x: this.dimension.width + add, y: 0},
               {x: this.dimension.width + add, y: this.pos},
               {x: this.dimension.width + this.inten + add, y: this.pos})
      this.drawLine(
               {x: this.dimension.width + this.inten + add, y: this.pos},
               {x: this.dimension.width + add, y: this.pos},
               {x: this.dimension.width + add, y: this.dimension.height + 50})
      this.ctx.lineTo(this.dimension.width + add + 50, this.dimension.height + 50)
      this.ctx.lineTo(this.dimension.width + add + 50, 0)
      this.ctx.lineTo(this.dimension.width + add, 0)
//      this.ctx.moveTo(this.dimension.width + 10 + add, 0)
      this.ctx.closePath()
      this.ctx.fill()
    }

/*    else {
      this.ctx.strokeStyle = '#4f5d75'
      this.ctx.beginPath()
      this.drawLine({x: this.dimension.width + 10, y: 0},
               {x: this.dimension.width + 10,  y: this.dimension.height + 50},
               {x: this.dimension.width + 10,  y: this.dimension.height + 50})
      this.ctx.stroke()
    }
    */

  }

  drawLine(A, B, C) {
    this.ctx.moveTo(A.x, A.y)
    this.ctx.quadraticCurveTo(B.x, B.y, C.x, C.y)
  }

  update() {
    this.draw()
  }

}

class Player {
  constructor(ctx, props) {
    this.ctx = ctx
    this.center = props.center
    this.width = props.width
    this.maxSpeed = 20
    this.speed = {x: 0, y: 0}
    this.commands = {}
    this.changecolor = 0
    this.color = '#ef8354'
  }

  draw() {
    let ctx = this.ctx
    if(this.changecolor == 0) ctx.strokeStyle = this.color;
    else ctx.strokeStyle = getRandomColor();
    ctx.lineWidth = this.width / 2
    ctx.strokeRect(this.center.x - this.width / 4, this.center.y - this.width / 4, this.width / 2, this.width / 2)
  }

  update(keys, border) {
    let a = 2
    let b = 0.5
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.speed.y -= a
    }
    else if (keys.has('ArrowDown') || keys.has('s')) {
      this.speed.y += a
    }
    else if(this.speed.y != 0) (this.speed.y > 0) ? this.speed.y -= b : this.speed.y += b

    if (keys.has('ArrowRight') || keys.has('d')) {
      this.speed.x += a
    }
    else if (keys.has('ArrowLeft') || keys.has('a')) {
      this.speed.x -= a
    }
    else if(this.speed.x != 0) (this.speed.x > 0) ? this.speed.x -= b : this.speed.x += b

    this.speed.x = Max(this.speed.x, -this.maxSpeed)
    this.speed.x = Min(this.speed.x, this.maxSpeed)
    this.speed.y = Max(this.speed.y, -this.maxSpeed)
    this.speed.y = Min(this.speed.y, this.maxSpeed)

    this.center.x += this.speed.x
    this.center.y += this.speed.y

//    console.log(border)
    let l = border.width
    let r = border.dimension.width
    let u = border.width
    let d = border.dimension.height
    let add = abs(this.speed.x) + abs(this.speed.y) + Math.random() * 20;
    if(this.center.x  > r - this.width / 2) {
        this.center.x = r - this.width / 2 - add;
        this.speed.x = -this.speed.x
        border.set(2, this.center.y)
    }
    if(this.center.x  < l + this.width / 2) {
        this.center.x = l + this.width / 2 + add;
        this.speed.x = -this.speed.x;
    }
    if(this.center.y > d - this.width / 2) {
        this.center.y = d - this.width / 2 - add;
        this.speed.y = -this.speed.y;
    }
    if(this.center.y < u + this.width / 2) {
        this.center.y = u + this.width / 2 + add;
        this.speed.y = -this.speed.y;
    }

    this.draw();
  }
/*
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
  }*/
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

    this.objSystem = new ObjSystem(ctx, {})
    this.objSystem.insert({}, {})


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
    this.background.update()
    this.border.update()
    this.player.update(this.states.downKeys, this.border)
    this.objSystem.update(this.player, this.border)
    this.ui.update()
  }

  keyDown(key) {
    this.states.downKeys.add(key)
    // console.log(this.states.downKeys)
  }

  keyUp(key) {
    this.states.downKeys.delete(key)
    // console.log(this.states.downKeys)
  }

/*  stepState() {
//    if (this.states.downKeys.size === 0) return false

    let updated = this.player.stepState(this.states.downKeys) || this.obj.stepState();
    // dummy operations just to give the idea of `|=`
    // updated |= this.border.stepState()
    // updated |= this.background.stepState()

    if (updated) {
      this.checkCollision()
      this.obj.checkCollision(this.player)
    }
    return updated
*/

  tick() {
    this.draw()
    window.requestAnimationFrame(this.boundFn.tick)
  }

  start() {
    this.background.draw();
    this.border.draw();

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

(function init() {
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
})()
