/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')
var ctx = cvs.getContext('2d')


var size = { x: 700 + 1, y: 700 + 1 }
//canvas target size
var cvsSize = { x: 700, y: 700 }
var scale = { x: Math.ceil(cvsSize.x / size.x), y: Math.ceil(cvsSize.y / size.y) }
var iterationsPerFrame = 100
var iterationsToDo = 0
cvs.style.width = cvs.width = size.x * scale.x
cvs.style.height = cvs.height = size.y * scale.y

/**@type {Canvas} */
var dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))



var running = false
var Debug = false
var gridcolors = [[255, 255, 255, 255],
[0, 0, 0, 255],
[0, 255, 0, 255]]
/**@type {Maze}*/
var maze
/**@type {Caver} */
var generator


function Setup() {
    maze = new Maze(size.x, size.y, 1, 2)
    generator = new Prim(1, 1, maze, 1, 0)
    Draw()
    if (!running) {
        Tick()
        running = true
    }
}

function Draw() {
    for (i = 0; i < maze.size.x; i++) {
        for (j = 0; j < maze.size.y; j++) {
            dcvs.setColor(gridcolors[maze.grid[i][j]], [255, 0, 0, 255])
            dcvs.rect(i * scale.x, j * scale.y, scale.x, scale.y)
        }
    }
    ctx.putImageData(dcvs.src, 0, 0)
}
function Tick() {
    generator.run(iterationsPerFrame)
    ctx.putImageData(dcvs.src, 0, 0)

    if (!generator.finished) {
        requestAnimationFrame(Tick)
    }
}

function Maze(x, y, init, distance) {
    this.grid = []
    this.size = { x: x, y: y }
    this.distance = distance || 2
    this.directiondefinitions = { left: { x: -1, y: 0 }, right: { x: +1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: +1 } }

    for (i = 0; i < x; i++) {
        this.grid[i] = []
        for (j = 0; j < y; j++) {
            this.grid[i][j] = init
        }
    }
}

Maze.prototype.getNeighborDirections = function (x, y, values, d) {
    d = d || this.distance
    var directions = []
    if (this.grid[x - d] && values.includes(this.grid[x - d][y])) { directions.push(this.directiondefinitions.left) }
    if (this.grid[x + d] && values.includes(this.grid[x + d][y])) { directions.push(this.directiondefinitions.right) }
    if (values.includes(this.grid[x][y - d])) { directions.push(this.directiondefinitions.up) }
    if (values.includes(this.grid[x][y + d])) { directions.push(this.directiondefinitions.down) }


    return directions
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Maze} maze 
 * @param {Number} distance 
 * @param {Number} target 
 * @param {Number} trace 
 */
function Caver(x, y, maze, target, trace, distance) {
    this.pos = { x: x, y: y }
    this.maze = maze
    this.pathmem = []
    this.finished = false
    this.distance = distance || 2
    this.target = (target != undefined) ? target : 1
    this.trace = (trace != undefined) ? trace : 0
    this.maze.grid[this.pos.x][this.pos.y] = 0
}
Caver.prototype.run = function (steps) {
    var directions = []
    var step = steps
    while (!this.finished & step > 0) {
        step--
        directions = this.maze.getNeighborDirections(this.pos.x, this.pos.y, [this.target], this.distance)
        if (directions.length != 0) {
            direction = directions[Math.floor(Math.random() * directions.length)]

            for (let i = 0; i < this.distance; i++) {
                this.pathmem.push({ x: this.pos.x, y: this.pos.y })
                this.pos.x += direction.x
                this.pos.y += direction.y

                dcvs.setColor([0, 0, 255, 255])
                dcvs.rect(this.pos.x * scale.x, this.pos.y * scale.y, scale.x, scale.y)

                this.maze.grid[this.pos.x][this.pos.y] = this.trace

            }
        } else {
            for (let i = 0; i < this.distance; i++) {

                dcvs.setColor(gridcolors[this.trace])
                dcvs.rect(this.pos.x * scale.x, this.pos.y * scale.y, scale.x, scale.y)
                this.pos = this.pathmem.pop()
                if (!this.pos) {
                    this.finished = true
                    break
                }
            }
        }
    }
}


/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Maze} maze 
 */
function Prim(x, y, maze, target, trace, distance) {
    this.pos = { x: x, y: y }
    this.maze = maze
    this.pathmem = []
    this.toExplore = [{ x: x, y: y }]
    this.finished = false
    this.distance = distance || 2
    this.target = (target != undefined) ? target : 1
    this.trace = (trace != undefined) ? trace : 0
}
Prim.prototype.run = function (steps) {
    var directions = []
    var step = steps
    while (!this.finished & step > 0) {
        step--
        var pos = this.toExplore.splice(Random(0, this.toExplore.length - 1), 1)[0]
        if (!pos) {
            this.finished = true
            break
        }
        dcvs.setColor(gridcolors[this.trace])
        dcvs.rect(pos.x * scale.x, pos.y * scale.y, scale.x, scale.y)
        this.maze.grid[pos.x][pos.y] = this.trace

        directions = this.maze.getNeighborDirections(pos.x, pos.y, [this.trace], this.distance)

        var direction = directions[Random(0,directions.length-1)]
        var pos2 = Object.assign({}, pos)
        for (let i = 0; i < this.distance && direction != undefined; i++) {
            pos2.x += direction.x
            pos2.y += direction.y

            dcvs.setColor(gridcolors[this.trace])
            dcvs.rect(pos2.x * scale.x, pos2.y * scale.y, scale.x, scale.y)

            this.maze.grid[pos2.x][pos2.y] = this.trace

        }

        directions = this.maze.getNeighborDirections(pos.x, pos.y, [this.target], this.distance)
        for (let i = 0; i < directions.length; i++) {
            direction = directions[i]
            var cell = { x: pos.x + direction.x*this.distance, y: pos.y + direction.y*this.distance }
            this.maze.grid[cell.x][cell.y] = 2
            this.toExplore.push(cell)
        }
    }
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Maze} maze 
 */
function flooder(x, y, maze, target, trace) {
    this.pos = { x: x, y: y }
    this.maze = maze
    this.pathmem = []
    this.toExplore = [{ x: x, y: y }]
    this.finished = false
    this.target = target || 0
    this.trace = trace || 2
}
flooder.prototype.run = function (steps) {
    var directions = []
    var step = steps
    while (!this.finished & step > 0) {
        step--
        var pos = this.toExplore.shift()
        if (!pos) {
            this.finished = true
            break
        }
        dcvs.setColor([0, 0, 255, 255])
        dcvs.rect(pos.x * scale.x, pos.y * scale.y, scale.x, scale.y)
        this.maze.grid[pos.x][pos.y] = this.trace

        directions = this.maze.getNeighborDirections(pos.x, pos.y, [this.target], 1)
        for (let i = 0; i < directions.length; i++) {
            direction = directions[i]
            this.toExplore.push({ x: pos.x + direction.x, y: pos.y + direction.y })
        }
    }
}

/**
 * 
 * @param {Maze} maze 
 */
function saveMaze(maze) {
    /**@type {Number[]}*/
    var maze1D = maze.grid.flat()

    var mazeArray = []

    var byte = 0
    var byteStr = ''
    while (maze1D.length) {
        var cell = maze1D.pop()
        byteStr += cell
        if (byteStr.length == 32) {
            var num = parseInt(byteStr, 2)
            mazeArray[byte++] = num
            byteStr = ''
        }
    }
    var num = parseInt(byteStr, 2)
    mazeArray[byte++] = num
    byteStr = ''

    return { width: maze.grid.length, height: maze.grid[0].length, src: mazeArray }
}

function loadMaze(maze) {
    var rawString = ''
    var grid = []
    for (let i = 0; i < maze.src.length - 1; i++) {
        rawString += maze.src[i].toString(2).padStart(32, '0')
    }
    rawString += maze.src[maze.src.length - 1].toString(2).
        rawString = rawString.substr(0, maze.height * maze.width)
    var row = 0
    while (rawString.length) {
        var segment = rawString.substr(0, maze.width)
        rawString = rawString.substr(maze.width)

        segment = segment.split('')
        grid[row] = []
        let length = segment.length
        for (let i = 0; i < length; i++) {
            grid[row][i] = parseInt(segment.shift())
        }
        row++
    }

    return grid

}

/**
 * 
 * @param {Number} max 
 * @param {Number} min 
 */
function Random(min, max) {
    let range = max - min + 1
    let value = Math.random() * range + min

    return Math.floor(value)
}

Setup()