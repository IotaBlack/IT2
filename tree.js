var baseURL = { api: 'https://api.github.com/repos/TheGrandCircuit/IT2/', raw: 'https://raw.githubusercontent.com/TheGrandCircuit/IT2/master/' }
var Descriptions = {}
async function getSha() {
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', baseURL.api + 'branches', true)
        xhr.onload = function () {
            resolve(
                JSON.parse(this.response)[0].commit.sha
            )
        }
        xhr.send()
    })
}

async function getRawTree() {
    var tree = await getSha()
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', baseURL.api + 'git/trees/' + tree + '?recursive=1', true)
        xhr.onload = function () {
            resolve(JSON.parse(this.response))
        }
        xhr.send()
    })
}

function parseTree(rawTree) {
    var tree = { content: {}, sha: rawTree.sha, url: rawTree.url }
    for (let i = 0; i < rawTree.tree.length; i++) {
        const element = rawTree.tree[i];
        /**@type {Array} */
        var path = element.path.split('/')
        if(path[path.length-1] == 'DESCRIPTION.TXT'){
            getDesc(path).then(loadDesc)
            continue
        }
        var target = tree
        for (let j = 0; j < path.length - 1; j++) {
            target = target.content[path[j]]
        }
        element.content = {}
        target.content[path[path.length - 1]] = element
    }
    return tree
}

async function loadTree() {
    var tree = parseTree(await getRawTree())
    return new Promise(resolve => {
        var div = document.getElementById('tree')
        /**@param item
         * @param {HTMLElement} parent */
        function loadContent(item, parent, indent) {
            var files = []
            for (const key in item.content) {
                const element = item.content[key];
                var DOMElement = document.createElement('div')
                DOMElement.classList.add('item')
                DOMElement.id = element.path

                var DOMElementButton = document.createElement('div')
                DOMElementButton.classList.add('treeButton')
                DOMElementButton.classList.add('closed')
                DOMElement.appendChild(DOMElementButton)
                DOMElementButton.innerHTML = '&#9634'
                if (element.type == 'tree') {
                    DOMElementButton.innerHTML = '&#9654'
                    DOMElementButton.addEventListener('click', e => {
                        if (e.target.classList.contains('closed')) {
                            e.path[1].classList.remove('closed')
                            e.target.classList.remove('closed')
                            e.target.classList.add('open')

                            e.target.innerHTML = '&#9660'

                        } else if (e.target.classList.contains('open')) {
                            e.target.classList.remove('open')
                            e.path[1].classList.add('closed')
                            e.target.classList.add('closed')

                            e.target.innerHTML = '&#9654'
                        }
                    })
                }

                var DOMElement2 = document.createElement('div')
                DOMElement2.innerHTML = element.path.split('/').pop()
                DOMElement2.dataset.path = element.path
                DOMElement2.classList.add('name')
                DOMElement2.addEventListener('click', e => {
                    viewDesc(e.target.dataset.path)
                })
                DOMElement.appendChild(DOMElement2)

                if (element.type == 'tree') {
                    DOMElement.classList.add('tree')
                    DOMElement.classList.add('closed')
                    parent.appendChild(DOMElement)
                    loadContent(element, DOMElement, indent + 1)
                }
                else {
                    files.push(DOMElement)
                }
            }
            for (let i = 0; i < files.length; i++) {
                parent.appendChild(files[i])
            }
        }
        loadContent(tree, div, 1)
        resolve()
    })

}

async function getDesc(path){
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', baseURL.raw + path, true)
        xhr.onload = function () {
            resolve(this.response)
        }
        xhr.send()
    })
}

async function loadDesc(text){
    var descriptions = text.split('#')
    for (let i = 1; i < descriptions.length; i += 2) {
        Descriptions[descriptions[i]] = descriptions[i+1].replace('\n','').trim();
        
    }
}

function viewDesc(path){
    var box = document.getElementById('desc')
    box.innerHTML = Descriptions[path] || 'This item has no description.'
}

loadTree()