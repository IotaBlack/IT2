/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')
var ctx = cvs.getContext('2d')


var size = { x: 100 + 1, y: 100 + 1 }
//canvas target size
var cvsSize = { x: 700, y: 700 }
var scale = scale = { x: Math.round(cvsSize.x / size.x), y: Math.round(cvsSize.y / size.y) }
cvs.style.width = cvs.width = size.x * scale.x
cvs.style.height = cvs.height = size.y * scale.y
var speed = 10
var iterationsPerFrame = speed
var iterationsToDo = 1
var absoluteSpeed = true
var animationFrameID = 0
/**@type {Canvas} */
var dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))
dcvs.scale = scale



var Debug = false
var gridcolors = [[255, 255, 255, 255],
[0, 0, 0, 255],
[0, 255, 0, 255]]
/**@type {Grid}*/
var maze = new Grid(size.x, size.y, 1, 2)
/**@type {Generator} */
var generator
var generatorStr = "Caver(1, 1, maze, 1, 0)"
var input = {
    setSpeed: function (value) {
        speed = parseFloat(value)
        iterationsPerFrame = speed
    },
    start: function () {
        Setup()
    },
    setGenerator: function (generatorstring) {
        generatorStr = generatorstring
    },
    setSize: function (newsize) {
        size = { x: newsize - newsize % 2 + 1, y: newsize - newsize % 2 + 1 }
    }
}


function Setup() {
    scale = { x: Math.round(cvsSize.x / size.x), y: Math.round(cvsSize.y / size.y) }
    cvs.style.width = cvs.width = size.x * scale.x
    cvs.style.height = cvs.height = size.y * scale.y
    dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))
    dcvs.scale = scale


    maze = new Grid(size.x, size.y, 1, 2)
    generator = eval(generatorStr)
    Draw()
    cancelAnimationFrame(animationFrameID)
    Tick()
}

function flood() {
    //generator = flooder(1, 1, size.x - 2, size.y - 2, maze)
    generator = A_Star(1, 1, size.x - 2, size.y - 2, maze, 0, 2, 3, 1)
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
        animationFrameID = requestAnimationFrame(Tick)
    }
}

cvs.addEventListener('mousemove', e => {

    if (!(e.buttons & 3)) { return }

    var pos = { x: Math.floor(e.offsetX / scale.x), y: Math.floor(e.offsetY / scale.y) }
    var val = 0
    if (e.buttons == 1) {

        dcvs.setColor([0, 0, 0, 255])

        val = 1
    } else if (e.buttons == 2) {
        dcvs.setColor([255, 255, 255, 255])

        val = 0
    }

    var offsets = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]

    for (let i = 0; i < offsets.length; i++) {
        const offset = offsets[i];
        dcvs.rect(pos.x + offset.x, pos.y + offset.y, 1, 1)

        maze.grid[pos.x + offset.x][pos.y + offset.y] = val

    }

    ctx.putImageData(dcvs.src, 0, 0)
})


function Grid(x, y, init, distance) {
    this.grid = []
    this.size = { x: x, y: y }
    this.distance = distance || 2
    this.directiondefinitions = {
        north: { x: 0, y: -1 },
        south: { x: 0, y: +1 },
        east: { x: +1, y: 0 },
        west: { x: -1, y: 0 },
        northEast: { x: +1, y: -1 },
        northWest: { x: -1, y: -1 },
        southEast: { x: +1, y: +1 },
        southWest: { x: -1, y: +1 }
    }

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

maze.fill(1, 1, size.x - 1, size.y - 1, 0)
Draw()


/**
 * @param {Number} x X coord to check from
 * @param {Number} y Y coord to check from
 * @param {Number} [d] Distance from point to check from
 * @param {function} isAllowed 
 * @param {Boolean} [diagonal] 
 * @param {Boolean} [advanced] 
 * @returns {{x:Number,y:Number}[]} An array of the valid directions
 */
Grid.prototype.getNeighborDirections = function (x, y, isAllowed, d, diagonal, advanced) {
    d = d || this.distance
    var directions = []
    if (this.grid[x - d] && isAllowed(this.grid[x - d][y])) { directions.push(this.directiondefinitions.west) }
    if (this.grid[x + d] && isAllowed(this.grid[x + d][y])) { directions.push(this.directiondefinitions.east) }
    if (isAllowed(this.grid[x][y - d])) { directions.push(this.directiondefinitions.north) }
    if (isAllowed(this.grid[x][y + d])) { directions.push(this.directiondefinitions.south) }
    if (diagonal) {
        if (advanced) {//Dont cut corners
            if (this.grid[x - d] && isAllowed(this.grid[x][y - d]) && isAllowed(this.grid[x - d][y]) && isAllowed(this.grid[x - d][y - d])) { directions.push(this.directiondefinitions.northWest) }
            if (this.grid[x + d] && isAllowed(this.grid[x][y - d]) && isAllowed(this.grid[x + d][y]) && isAllowed(this.grid[x + d][y - d])) { directions.push(this.directiondefinitions.northEast) }
            if (this.grid[x - d] && isAllowed(this.grid[x][y + d]) && isAllowed(this.grid[x - d][y]) && isAllowed(this.grid[x - d][y + d])) { directions.push(this.directiondefinitions.southWest) }
            if (this.grid[x + d] && isAllowed(this.grid[x][y + d]) && isAllowed(this.grid[x + d][y]) && isAllowed(this.grid[x + d][y + d])) { directions.push(this.directiondefinitions.southEast) }
        } else {//Cut corners
            if (this.grid[x - d] && isAllowed(this.grid[x - d][y - d])) { directions.push(this.directiondefinitions.northWest) }
            if (this.grid[x + d] && isAllowed(this.grid[x + d][y - d])) { directions.push(this.directiondefinitions.northEast) }
            if (this.grid[x - d] && isAllowed(this.grid[x - d][y + d])) { directions.push(this.directiondefinitions.southWest) }
            if (this.grid[x + d] && isAllowed(this.grid[x + d][y + d])) { directions.push(this.directiondefinitions.southEast) }
        }
    }
    return directions
}

/**
 * @param {Number} x 
 * @param {Number} y 
 * @param {Grid} maze 
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
        directions = maze.getNeighborDirections(pos.x, pos.y, v => v == target, distance)
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
 * @param {Number} x 
 * @param {Number} y 
 * @param {Grid} maze 
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

        directions = maze.getNeighborDirections(pos.x, pos.y, v => v == trace, distance)

        var direction = directions[Random(0, directions.length - 1)]
        var pos2 = Object.assign({}, pos)
        for (let i = 0; i < distance && direction != undefined; i++) {
            pos2.x += direction.x
            pos2.y += direction.y

            dcvs.setColor(gridcolors[trace])
            dcvs.rect(pos2.x, pos2.y, 1, 1)

            maze.grid[pos2.x][pos2.y] = trace

        }

        directions = maze.getNeighborDirections(pos.x, pos.y, v => v == target, distance)
        for (let i = 0; i < directions.length; i++) {
            direction = directions[i]
            var cell = { x: pos.x + direction.x * distance, y: pos.y + direction.y * distance }
            maze.grid[cell.x][cell.y] = 2
            toExplore.push(cell)
        }
    }
}

/**
 * @param {Grid} maze 
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
 * @param {Number} x2 
 * @param {Number} y2 
 * @param {Grid} maze 
 * @param {Number} target 
 * @param {Number} trace 
 */
function* flooder(x, y, x2, y2, maze, target, trace) {
    var pos = { x: x, y: y }
    var toExplore = [{ x: x, y: y }]
    target = target || 0
    trace = trace || 2

    var pathGrid = new Grid(maze.size.x, maze.size.y, null, 1)
    pathGrid.grid[x][y] = true
    var directions = []
    while (true) {
        yield
        if (absoluteSpeed) { iterationsPerFrame = Math.max(1, toExplore.length) * speed }
        var pos = toExplore.shift()
        if (!pos) { break }
        dcvs.setColor([0, 0, 255, 255])
        dcvs.rect(pos.x, pos.y, 1, 1)
        maze.grid[pos.x][pos.y] = trace

        directions = maze.getNeighborDirections(pos.x, pos.y, v => v == target, 1, true, true)
        for (let i = 0; i < directions.length; i++) {
            var direction = directions[i]
            dcvs.setColor([255, 0, 0, 255])
            dcvs.rect((pos.x + direction.x), (pos.y + direction.y), 1, 1)
            maze.grid[pos.x + direction.x][pos.y + direction.y] = trace
            toExplore.push({ x: pos.x + direction.x, y: pos.y + direction.y })
            pathGrid.grid[pos.x + direction.x][pos.y + direction.y] = { x: pos.x, y: pos.y }
        }
    }

    yield* reconstructPath(x2, y2, pathGrid.grid)
}


/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} x2 
 * @param {Number} y2 
 * @param {Grid} maze 
 * @param {Number} target 
 * @param {Number} trace 
 * @param {Number} trace2 
 * @param {Number} g
 */
function* A_Star(x, y, x2, y2, maze, target, trace, trace2, g) {
    var cell = { x: x, y: y }
    var openSet = [{ x: x, y: y, gCost: 0, hCost: heuristic(x, y, x2, y2) }]
    target = target || 0
    trace = trace || 2

    function heuristic(x, y, x2, y2) {
        var dx = Math.abs(x2 - x)
        var dy = Math.abs(y2 - y)
        //return dx + dy //manhattan
        return dx + dy - Math.min(dx,dy) //diagonal
        //return Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y))  //euclidean
    }

    var pathGrid = new Grid(maze.size.x, maze.size.y, null, 1)
    pathGrid.grid[x][y] = true
    //distance from start
    var GGrid = new Grid(maze.size.x, maze.size.y, null, 1)
    GGrid.grid[x][y] = 0
    var HGrid = new Grid(maze.size.x, maze.size.y, null, 1)
    HGrid.grid[x][y] = heuristic(x, y, x2, y2)
    var directions = []
    var openSetGrid = []
    for (let i = 0; i < maze.grid.length; i++) {
        openSetGrid[i] = []
    }

    while (true) {
        yield
        var min = 0
        for (let i = 0; i < openSet.length; i++) {
            const cell = openSet[i];
            min = (openSet[min].fcost > cell.fcost) ? i : min
        }
        var cell = openSet.splice(min, 1)[0]
        if (!cell || (cell.x == x2 && cell.y == y2)) { break }
        dcvs.setColor([0, 0, 255, 255])
        dcvs.rect(cell.x, cell.y, 1, 1)
        maze.grid[cell.x][cell.y] = trace

        directions = maze.getNeighborDirections(cell.x, cell.y, v => v == target || v == trace2, 1, true)
        for (let i = 0; i < directions.length; i++) {
            var direction = directions[i]
            dcvs.setColor([255, 0, 0, 255])
            dcvs.rect((cell.x + direction.x), (cell.y + direction.y), 1, 1)
            var ncell = { x: cell.x + direction.x, y: cell.y + direction.y }
            var gCost = cell.gCost + ((direction.x != 0 && direction.y != 0) ? g * 1.4 : g)
            var hCost = heuristic(cell.x + direction.x, cell.y + direction.y, x2, y2)
            ncell.gCost = gCost
            ncell.hCost = hCost
            ncell.fcost = gCost + hCost
            var index = 0
            if (maze.grid[ncell.x][ncell.y] == trace2) {
                if (openSetGrid[ncell.x][ncell.y].fcost > ncell.fcost) {
                    var ocell = openSetGrid[ncell.x][ncell.y]

                    ocell.gCost = ncell.gCost
                    ocell.hCost = ncell.hCost
                    ocell.fcost = ncell.fcost

                    pathGrid.grid[ncell.x][ncell.y] = { x: cell.x, y: cell.y }
                }

                continue
            }
            openSetGrid[ncell.x][ncell.y] = ncell
            pathGrid.grid[ncell.x][ncell.y] = { x: cell.x, y: cell.y }
            openSet.push(ncell)
            maze.grid[ncell.x][ncell.y] = trace2

        }
    }


    yield* reconstructPath(x2, y2, pathGrid.grid)
}

function* reconstructPath(x, y, grid) {
    var path = []
    pos = { x: x, y: y }
    while (true) {
        yield
        dcvs.setColor([0, 255, 0, 255])
        dcvs.rect(pos.x, pos.y, 1, 1)
        path.push(pos)
        pos = grid[pos.x][pos.y]
        if (pos == true) { break }
    }
}

/**
 * 
 * @param {Grid} maze 
 */
function saveMaze(maze) {
    /**@type {Number[]}*/
    var maze1D = maze.grid.flat()


    var mazeStr = maze.size.x + ':' + maze.size.y + ';'

    var byteStr = ''
    while (maze1D.length) {
        var cell = maze1D.pop()
        byteStr += cell
        if (byteStr.length == 4) {
            var num = parseInt(byteStr, 2).toString(16)
            mazeStr += num
            byteStr = ''
        }
    }
    var num = parseInt(byteStr, 2).toString(16)
    mazeStr += num
    byteStr = ''

    return mazeStr
}

/**
 * 
 * @param {String} mazeStr 
 */
function loadMaze(mazeStr) {
    var grid = []

    var params = mazeStr.split(/[:;]/)
    var size = { x: params[0], y: params[1] }
    var hexString = params[2]
    var binaryString = ''
    while (hexString.length) {
        var num = hexString.substr(0, 1)
        hexString = hexString.substr(1)

        var bits = parseInt(num, 16).toString(2).padStart(4, 0)

        binaryString += bits

    }

    var last4 = binaryString.substr(binaryString.length - 4)
    binaryString = binaryString.substr(0, binaryString.length - 4)
    last4 = last4.substr(4 - (size.x * size.y) % 4)
    binaryString += last4

    var binaryArray = binaryString.split('')

    for (let x = 0; x < size.x; x++) {
        grid[x] = []
        for (let y = 0; y < size.y; y++) {
            grid[x][y] = binaryArray.pop()
        }
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


function HSVToRGB(h, s, v) {

    var c = v * s

    var x = c * (1 - Math.abs((h / 60) % 2) - 1)

    var m = v - c
    var rgb = {}
    if (h < 60) {
        rgb = { r: c, g: x, b: 0 }
    } else if (h < 120) {
        rgb = { r: x, g: c, b: 0 }
    } else if (h < 180) {
        rgb = { r: 0, g: c, b: x }
    } else if (h < 240) {
        rgb = { r: 0, g: x, b: c }
    } else if (h < 300) {
        rgb = { r: x, g: 0, b: c }
    } else if (h < 360) {
        rgb = { r: c, g: 0, b: x }
    }

    var r = Math.ceil((rgb.r + m) * 255)
    var g = Math.ceil((rgb.g + m) * 255)
    var b = Math.ceil((rgb.b + m) * 255)


    //return {r:r,g:g,b:b}
    return [r, g, b, 255]
}


function Drawheuristic(x, y) {
    function heuristic(x, y, x2, y2) {
        return Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y))
    }

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
            dcvs.setColor(HSVToRGB(heuristic(i, j, x, y), 1, 1))
            dcvs.rect(i, j, 1, 1)
        }
    }


}