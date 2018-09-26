/**
 * @typedef {Object} Canvas
 * @property {ImageData} src
 * @property {Number} width
 * @property {Number} height
 * @property {Number[]} color
 * @function rect
 */

class Canvas {
    /**
     * @constructor
     * @param {ImageData} src
     */
    constructor(src) {
        this.src = src
        this.width = src.width
        this.heigth = src.height
        this.color = [0, 0, 0, 255]
        this.clearColor = [255,255,255,255]
        this.image = []

        for (let i = 0; i < this.width; i++) {
            this.image[i] = []

            for (let j = 0; j < this.heigth; j++) {
                this.image[i][j] = new Uint8Array(src.data.buffer,pointToIndex(i,j,src.width),4)
                this.image[i][j][3] = 255
            }
        }

        return this
    }
    /** @param {Number[]} c  */
    setColor(a,b) {
        var c =  a || b
        this.color = c.slice()
    }

    /** @param {Number} x 
     *  @param {Number} y 
     *  @param {Number} w 
     *  @param {Number} h 
     */
    rect(x, y, w, h) {
        x = Math.floor(x)
        y = Math.floor(y)
        w = Math.floor(w)
        h = Math.floor(h)
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let index = pointToIndex(i + x, j + y, this.width)
                this.src.data[index + 0] = this.color[0]
                this.src.data[index + 1] = this.color[1]
                this.src.data[index + 2] = this.color[2]
                this.src.data[index + 3] = this.color[3]
                /**this.image[i+x][j+y][0] = this.color[0]
                this.image[i+x][j+y][1] = this.color[1]
                this.image[i+x][j+y][2] = this.color[2]
                this.image[i+x][j+y][3] = this.color[3]**/
            }
        }
    }

    /** @param {Number} x
     *  @param {Number} y
     *  @param {Number} w
     *  @param {Number} h
     */
    clearRect(x, y, w, h,color) {
        x = Math.floor(x)
        y = Math.floor(y)
        w = Math.floor(w)
        h = Math.floor(h)
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let index = pointToIndex(i + x, j + y, this.width)
                this.src.data[index + 0] = this.clearColor[0]
                this.src.data[index + 1] = this.clearColor[1]
                this.src.data[index + 2] = this.clearColor[2]
                this.src.data[index + 3] = this.clearColor[3]
            }
        }
    }
}





function pointToIndex(x, y, w) { return (y * w + x) * 4 }