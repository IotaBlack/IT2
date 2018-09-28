/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')
var ctx = cvs.getContext('2d')


var size = { x: 100 + 1, y: 100 + 1 }
//canvas target size
var cvsSize = {}
var scale = {}
var iterationsPerFrame = 10
var iterationsToDo = 1
/**@type {Canvas} */
var dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))



var running = false
var Debug = false
var gridcolors = [[255, 255, 255, 255],
[0, 0, 0, 255],
[0, 255, 0, 255]]
/**@type {Maze}*/
var maze
/**@type {Generator} */
var generator
var generatorStr = "alert('Select a generator')"
var input = {
    setSpeed: function (value) {
        iterationsPerFrame = value
    },
    start: function () {
        Setup()
    },
    setGenerator: function (generatorstring) {
        generatorStr = generatorstring
    },
    setSize: function (newsize) {
        size = { x: newsize - newsize % 2 + 1, y:newsize - newsize % 2 + 1 }
    }
}


function Setup() {
    //canvas target size
    cvsSize = { x: 700, y: 700 }
    scale = { x: Math.ceil(cvsSize.x / size.x), y: Math.ceil(cvsSize.y / size.y) }
    cvs.style.width = cvs.width = size.x * scale.x
    cvs.style.height = cvs.height = size.y * scale.y
    dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))
    dcvs.scale = scale


    maze = new Grid(size.x, size.y, 1, 2)
    generator = eval(generatorStr)
    Draw()
    if (!running) {
        Tick()
        running = true
    }
}

function flood(){
    generator = flooder(1,1,maze)
    Tick()
}

function Draw() {
    for (i = 0; i < maze.size.x; i++) {
        for (j = 0; j < maze.size.y; j++) {
            dcvs.setColor(gridcolors[maze.grid[i][j]], [255, 0, 0, 255])
            dcvs.rect(i, j, 1, 1)
        }
    }
    ctx.putImageData(dcvs.src, 0, 0)
}
function Tick() {
    iterationsToDo += iterationsPerFrame
    while (iterationsToDo >= 1) {
        iterationsToDo--
        ret = generator.next()
    }
    //Draw()
    ctx.putImageData(dcvs.src, 0, 0)
    if (!ret.done) {
        requestAnimationFrame(Tick)
    } else { running = false }
}

function Grid(x, y, init, distance) {
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

Grid.prototype.fill = function (x, y, w, h, v) {
    for (i = x; i < w; i++) {
        for (j = y; j < h; j++) {
            this.grid[i][j] = v
        }
    }
}

Grid.prototype.getNeighborDirections = function (x, y, values, d) {
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
function* Caver(x, y, maze, target, trace, distance) {
    var pos = { x: x, y: y }
    var pathmem = []
    var distance = distance || 2
    var target = (target != undefined) ? target : 1
    var trace = (trace != undefined) ? trace : 0
    maze.grid[pos.x][pos.y] = trace


    var directions = []
    while (true) {
        yield
        directions = maze.getNeighborDirections(pos.x, pos.y, [target], distance)
        if (directions.length != 0) {
            direction = directions[Math.floor(Math.random() * directions.length)]

            for (let i = 0; i < distance; i++) {
                pathmem.push({ x: pos.x, y: pos.y })
                pos.x += direction.x
                pos.y += direction.y

                dcvs.setColor([0, 0, 255, 255])
                dcvs.rect(pos.x, pos.y, 1, 1)

                maze.grid[pos.x][pos.y] = trace

            }
        } else {
            for (let i = 0; i < distance; i++) {
                dcvs.setColor(gridcolors[trace])
                dcvs.rect(pos.x, pos.y, 1, 1)
                pos = pathmem.pop()
                if (!pos) { return }
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
function* Prim(x, y, maze, target, trace, distance) {
    pos = { x: x, y: y }
    maze = maze
    pathmem = []
    toExplore = [{ x: x, y: y }]
    distance = distance || 2
    target = (target != undefined) ? target : 1
    trace = (trace != undefined) ? trace : 0

    var directions = []
    while (true) {
        yield
        var pos = toExplore.splice(Random(0, toExplore.length - 1), 1)[0]
        if (!pos) {
            return
        }
        dcvs.setColor(gridcolors[trace])
        dcvs.rect(pos.x, pos.y, 1, 1)
        maze.grid[pos.x][pos.y] = trace

        directions = maze.getNeighborDirections(pos.x, pos.y, [trace], distance)

        var direction = directions[Random(0, directions.length - 1)]
        var pos2 = Object.assign({}, pos)
        for (let i = 0; i < distance && direction != undefined; i++) {
            pos2.x += direction.x
            pos2.y += direction.y

            dcvs.setColor(gridcolors[trace])
            dcvs.rect(pos2.x, pos2.y, 1, 1)

            maze.grid[pos2.x][pos2.y] = trace

        }

        directions = maze.getNeighborDirections(pos.x, pos.y, [target], distance)
        for (let i = 0; i < directions.length; i++) {
            direction = directions[i]
            var cell = { x: pos.x + direction.x * distance, y: pos.y + direction.y * distance }
            maze.grid[cell.x][cell.y] = 2
            toExplore.push(cell)
        }
    }
}

/**
 * 
 * @param {Maze} maze 
 */
function* Divider(maze, x1, y1, x2, y2, roomval = 0, wallval = 1, divideFuncWall = Random, divideFuncHole = Random) {
    if (x2 - x1 < 1 || y2 - y1 < 2) { return }

    var wallX = divideFuncWall(x1 + 1, x2 - 1)
    wallX = wallX - (wallX % 2)

    for (let i = y1; i < y2 + 1; i++) { maze.grid[wallX][i] = wallval }
    dcvs.setColor(gridcolors[wallval])
    dcvs.rect(wallX, y1, 1, y2 - y1 + 1)
    //yield

    var wallY = divideFuncWall(y1 + 1, y2 - 1)
    wallY = wallY - (wallY % 2)

    for (let i = x1; i < x2 + 1; i++) { maze.grid[i][wallY] = wallval }
    dcvs.setColor(gridcolors[wallval])
    dcvs.rect(x1, wallY, x2 - x1 + 1, 1)

    //yield

    var holes = []

    var y = divideFuncHole(y1, wallY - 1)
    y = y - (y % 2) + 1
    holes.push({ x: wallX, y: y })
    y = divideFuncHole(wallY + 1, y2)
    y = y - (y % 2) + 1
    holes.push({ x: wallX, y: y })
    var x = divideFuncHole(x1, wallX - 1)
    x = x - (x % 2) + 1
    holes.push({ x: x, y: wallY })
    x = divideFuncHole(wallX + 1, x2)
    x = x - (x % 2) + 1
    holes.push({ x: x, y: wallY })


    holes.splice(Random(0, holes.length - 1), 1)

    for (let i = 0; i < holes.length; i++) {
        maze.grid[holes[i].x][holes[i].y] = roomval

        dcvs.setColor(gridcolors[roomval])
        dcvs.rect(holes[i].x, holes[i].y, 1, 1)
        //yield
    }
    yield
    yield* Divider(maze, x1, y1, wallX - 1, wallY - 1, roomval, wallval, divideFuncWall, divideFuncHole)
    yield* Divider(maze, wallX + 1, y1, x2, wallY - 1, roomval, wallval, divideFuncWall, divideFuncHole)
    yield* Divider(maze, x1, wallY + 1, wallX - 1, y2, roomval, wallval, divideFuncWall, divideFuncHole)
    yield* Divider(maze, wallX + 1, wallY + 1, x2, y2, roomval, wallval, divideFuncWall, divideFuncHole)
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Maze} maze 
 */
function* flooder(x, y, maze, target, trace) {
    pos = { x: x, y: y }
    maze = maze
    pathmem = []
    toExplore = [{ x: x, y: y }]
    target = target || 0
    trace = trace || 2


    var directions = []
    while (true) {
        yield
        var pos = toExplore.shift()
        if (!pos) { return }
        dcvs.setColor([0, 0, 255, 255])
        dcvs.rect(pos.x, pos.y, 1, 1)
        maze.grid[pos.x][pos.y] = trace

        directions = maze.getNeighborDirections(pos.x, pos.y, [target], 1)
        for (let i = 0; i < directions.length; i++) {
            direction = directions[i]
            dcvs.setColor([255, 0, 0, 255])
            dcvs.rect((pos.x + direction.x), (pos.y + direction.y), 1, 1)
            maze.grid[pos.x + direction.x][pos.y + direction.y] = trace
            toExplore.push({ x: pos.x + direction.x, y: pos.y + direction.y })
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
