/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')
var ctx = cvs.getContext('2d')


var numItems = 1000
var maxbit = (numItems - 1).toString(2).length
var scale = numItems > 1000 ? numItems / 1000 : 1
var iterationsPerFrame = 10
var iterationsToDo = 0
cvs.height = numItems / scale
cvs.width = numItems / scale

/**@type {Canvas} */
var dcvs = new Canvas(ctx.getImageData(0, 0, cvs.width, cvs.height))

var list = new Array(numItems)

for (let i = 0; i < numItems; i++) {
    //list[i] = Random(0,numItems) //random
    list[i] = i //line
    //list[i] = Math.pow(i,5)/Math.pow(numItems,4) //curve
    //list[i] = Math.pow(i-(numItems/2),5)/Math.pow(numItems/2,4)+numItems/2 //curve2
    //list[i] = (Math.sin(i/numItems*50)+1)*numItems/2 //sin
    //list[i] = ((Math.sin(i/numItems*20)+1)*(numItems/2)*.9)+((Math.sin(i/numItems*250)+1)*(numItems/2)*.1) //sin2
}

function shuffle(arr) {
    for (let i = 0; i < arr.length; i++) {
        var rInt = Random(0, arr.length - 1)
        tmp = arr[i]
        arr[i] = arr[rInt]
        arr[rInt] = tmp
    }
}



var sorts = {
    swap: function (a, i, j) {
        tmp = a[i]
        a[i] = a[j]
        a[j] = tmp

        dcvs.clearRect(i / scale, 0, 1, cvs.height)
        dcvs.clearRect(j / scale, 0, 1, cvs.height)
        dcvs.rect(i / scale, cvs.height - a[i] / scale, 1, a[i] / scale)
        dcvs.rect(j / scale, cvs.height - a[j] / scale, 1, a[j] / scale)
    },
    /**@param {Array} arr */
    bubble: function* (arr) {
        let index = 0
        let max = arr.length

        while (max) {
            for (let i = 0; i < max; i++) {
                yield { marker: 'red', index: i }
                if (arr[i] > arr[i + 1]) {
                    this.swap(arr, i, i + 1)
                }
            }
            max--
        }
    },

    /**@param {Array} arr */
    selection: function* (arr) {
        var minIdx, temp,
            len = arr.length;
        for (var i = 0; i < len; i++) {
            minIdx = i;
            yield { marker: 'green', index: i }
            for (var j = i + 1; j < len; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                    yield { marker: 'green', index: j }
                }
                yield { marker: 'red', index: j }
            }
            this.swap(list, i, minIdx)
        }
        return arr;
    },

    /**@param {Array} arr */
    insertion: function* (arr) {
        var i, len = arr.length, el, j;

        for (i = 1; i < len; i++) {
            // yield { marker: 'red', index: i }
            let val = arr[i]
            j = i
            while (j > 0 && val < arr[j - 1]) {

                yield { marker: 'red', index: j }

                this.swap(arr, j, j - 1)
                j--
            }
        }
    },

    /**@param {Array} arr */
    merge: function* (arr, left, right) {
        if (left < right) {

            let mid = Math.floor((right-left)/2)+left

            yield* this.merge(arr,left,mid)
            yield* this.merge(arr,mid+1,right)
            yield* this.merge.merge(arr,left,mid,right)


        }
    },

    /**@param {Array} arr */
    quick: function* (arr, left, right) {
        var pivot
        var partitionIndex


        if (left < right) {
            //Partition
            pivot = right
            this.swap(arr,Random(left,right),right);
            var pivotValue = arr[pivot]
                console.log(pivotValue)
                partitionIndex = left;
            yield { marker: 'red', index: pivot, value: pivotValue }
            for (var i = left; i < right; i++) {
                yield { marker: 'green', index: i }
                if (arr[i] < pivotValue) {
                    this.swap(arr, i, partitionIndex)

                    partitionIndex++;
                    yield { marker: 'blue', index: partitionIndex }
                }
            }

            this.swap(arr, right, partitionIndex)
            //sort left and right
            yield* this.quick(arr, left, partitionIndex - 1);
            yield* this.quick(arr, partitionIndex + 1, right);
        }
    },

    /**WIP */
    binaryQuick: function* (arr, left, right, bit) {
        var partitionIndex

        console.log(left, right)
        if (left < right) {
            //Partition

            partitionIndex = left;
            for (var i = left; i < right; i++) {
                yield { marker: 'green', index: i }
                if (!(arr[i] & (1 << maxbit - bit))) {
                    this.swap(arr, i, partitionIndex)

                    partitionIndex++;
                    yield { marker: 'blue', index: partitionIndex }
                }
            }

            this.swap(arr, right, partitionIndex)
            //sort left and right
            yield* this.binaryQuick(arr, left, partitionIndex - 1, bit + 1);
            yield* this.binaryQuick(arr, partitionIndex + 1, right, bit + 1);
        }
    },

    radixLSD: function* (arr,digits){
        let maxDigits = Math.max(...arr).toString(digits).length
        let buckets = Array(digits)
        
        for (let i = 1; i <= maxDigits; i++) {
            for (let i = 0; i < buckets.length; i++) {
                buckets[i] = []
            }
            for (let j = 0; j < arr.length; j++) {
                let num = arr[j];
                let digit = num.toString(digits).padStart(maxDigits,0)[maxDigits-i]
                
                buckets[parseInt(digit,digits)].push(num)
                yield { marker: 'red', index: j }
            }
            let result = buckets.flat()
            for (let i = 0; i < result.length; i++) {
                arr[i] = result[i];
                sorts.swap(arr,i,i)
                yield { marker: 'blue', index: i }
            }
        }


        yield

    }
}

sorts.merge.merge = function* (arr, left, mid, right) {
    let left1 = left
    let left2 = mid
    let right1 = mid + 1
    let right2 = right
    let result = []
    while ((left1 <= left2) && (right1 <= right2)) {
        if (arr[left1] <= arr[right1]) {
            result.push(arr[left1++])
            yield { marker: 'red', index: left1 }
        } else {
            result.push(arr[right1++])
            yield { marker: 'red', index: right1 }
        }
    }

    while (left1 <= left2) {
        result.push(arr[left1++])
        yield { marker: 'red', index: left1 }
    }

    while (left1 <= left2) {
        result.push(arr[right1++])
        yield { marker: 'red', index: right1 }
    }

    for (let i = 0; i < result.length; i++) {
        arr[left + i] = result[i];
        sorts.swap(arr,left+i,left+i)
        yield { marker: 'blue', index: left+i }
    }
}

var sort
var sort = sorts.bubble(list)
//var sort = sorts.selection(list)
//var sort = sorts.insertion(list)
//var sort = sorts.merge(list, 0, list.length-1)
//var sort = sorts.quick(list, 0, list.length - 1)
//var sort = sorts.binaryQuick(list, 0, list.length - 1, 1)
var sort = sorts.radixLSD(list,2)

var input = {
    shuffle: function(){
        shuffle(list)
        Draw()
    },

    changeSpeed: function(value){
        iterationsPerFrame = value
    },

    start: function(){
        update()
    },

    setSort: function(sortstring){
        sort = eval(sortstring  )
    }
}


var markers = {
    red: { color: [255, 0, 0, 255], index: -1 },
    green: { color: [0, 255, 0, 255], index: -1 },
    blue: { color: [0, 0, 255, 255], index: -1 },

}
function update() {
    let yieldval, marker
    clearMarkers()
    iterationsToDo += iterationsPerFrame

    while (iterationsToDo >= 1) {
        iterationsToDo--
        yieldval = sort.next()
        if (yieldval.value) {
            marker = yieldval.value.marker
            markers[marker].index = yieldval.value.index
        }
    }
    //Draw()
    if (!yieldval || !yieldval.done) {
        drawMarkers()
        requestAnimationFrame(update)
    } else {
        console.log('Done!')
        clearMarkers()
    }
    ctx.putImageData(dcvs.src, 0, 0)
}

function Draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    dcvs.clearRect(0, 0, cvs.width, cvs.height, [255, 255, 255, 255])
    for (let i = 0; i < list.length; i++) {
        ctx.fillRect(i / scale, cvs.height, 1, -list[i] / scale)
        dcvs.rect(i / scale, cvs.height - list[i] / scale, 1, list[i] / scale)
    }
    ctx.putImageData(dcvs.src, 0, 0)
}

function drawMarkers() {
    for (const key in markers) {
        var marker = markers[key];

        dcvs.setColor(marker.color)
        dcvs.rect(marker.index / scale,
            cvs.height - list[marker.index] / scale,
            1,
            list[marker.index] / scale)
    }
    dcvs.setColor([0, 0, 0, 255])
}
function clearMarkers() {
    dcvs.setColor([0, 0, 0, 255])
    for (const key in markers) {
        var marker = markers[key];
        dcvs.rect(marker.index / scale,
            cvs.height - list[marker.index] / scale,
            1,
            list[marker.index] / scale)

    }
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





Draw()
