var baseURL = { api: 'https://api.github.com/repos/TheGrandCircuit/IT2/', raw: 'https://raw.githubusercontent.com/TheGrandCircuit/IT2/master/' }
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

        var target = tree
        for (let j = 0; j < path.length - 1; j++) {
            target = target.content[path[j]]
            target.content = {}
        }
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
                DOMElement.id = element.path
                
                var DOMElementButton = document.createElement('div')
                DOMElementButton.classList.add('treeButton')
                DOMElementButton.innerHTML = element.type == 'tree' ? '&#9658' : '&#9634'
                DOMElement.appendChild(DOMElementButton)
                
                var DOMElement2 = document.createElement('div')
                DOMElement2.innerHTML = element.path
                DOMElement2.classList.add('item')
                DOMElement.appendChild(DOMElement2)
                
                                var DOMElementIndent = document.createElement('div')
                                DOMElementIndent.classList.add('indent')
                                DOMElement.appendChild(DOMElementIndent)
                
                if (element.type == 'tree') {
                    DOMElement.classList.add('tree')
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

loadTree()