/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')
var ctx = cvs.getContext('2d')


var size = { x: 100 + 1, y: 100 + 1 }
var scale = { x: 7, y: 7 }
var iterationsPerFrame = 10
var iterationsToDo = 0
cvs.style.width = cvs.width = size.x * scale.x
cvs.style.height = cvs.height = size.y * scale.y

/**@type {Canvas} */
var dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))



var running = false
var Debug = false
var Grid = []
var gridcolors = [[255, 255, 255, 255],
[0, 0, 0, 255],
[0, 255, 0, 255]]
var maze
var Caver1


function Setup() {


    for (i = 0; i < size.x; i++) {
        Grid[i] = []
        for (j = 0; j < size.y; j++) {
            Grid[i][j] = 1
        }
    }
    maze = new Maze(Grid, 2)
    Caver1 = new caver(1, 1, maze)
    for (i = 0; i < Grid.length; i++) {
        for (j = 0; j < Grid.length; j++) {
            dcvs.setColor(gridcolors[Grid[i][j]])
            dcvs.rect(i * scale.x, j * scale.y, scale.x, scale.y)
        }
    }
    if (!running) {
        Tick()
        running = true
    }
}

var stepsize = 10

function Draw(){
    for (i = 0; i < size.x; i++) {
        for (j = 0; j < size.y; j++) {
            dcvs.setColor(gridcolors[Grid[i][j]])
            dcvs.rect(i * scale.x, j * scale.y, scale.x, scale.y)
        }
    }
}
function Tick() {
    Caver1.run(stepsize)
    ctx.putImageData(dcvs.src, 0, 0)

    if (!Caver1.finished) {
        requestAnimationFrame(Tick)
    }
}

function Maze(grid, distance) {
    this.grid = grid
    this.distance = distance || 2
    this.directiondefinitions = { left: { x: -1, y: 0 }, right: { x: +1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: +1 } }
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
function caver(x, y, maze, distance, target, trace) {
    this.pos = { x: x, y: y }
    this.maze = maze
    this.pathmem = []
    this.finished = false
    this.distance = distance || 2
    this.maze.grid[this.pos.x][this.pos.y] = 0
    this.target = (target != undefined) ? target : 1
    this.trace = trace || 0
}
caver.prototype.run = function (steps) {
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
 * @param {Number[]} maze 
 */
function saveMaze(maze) {
    /**@type {Number[]}*/
    var maze1D = maze.flat()

    var length = Math.floor(maze1D.length / 32)
    length += (maze1D.length % 32) ? 1 : 0

    var mazeArray = []

    var byte = 0
    var bit = 0
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

    return { width: maze.length, height: maze[0].length, src: mazeArray }
}

function loadMaze(maze) {
    var rawString = ''
    var grid = []
    for (let i = 0; i < maze.src.length; i++) {
        rawString += maze.src[i].toString(2)
    }

    var row = 0
    while (rawString.length) {
        var segment = rawString.substr(0, maze.width)
        rawString = rawString.substr(maze.width)

        segment = segment.split('')
        grid[row] = []
        for (let i = 0; i < segment.length; i++) {
            grid[row][i] = segment.shift()
        }
        row++
    }

    return grid

}

Setup()