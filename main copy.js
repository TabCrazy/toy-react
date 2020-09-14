const arr = [1,2,3,4,5]
for(let i of arr) {
    console.log(i)
}

function createElement(tagName, attributes, ...children) {
    let e = document.createElement(tagName)
    for (let p in attributes) {
        e.setAttribute(p, attributes[p])
    }
    for (let child of children) {
        if (typeof child === 'string') {
            child = document.createTextNode(child)
        }
        e.appendChild(child)
    }
    return e
}
document.body.appendChild(<div id="dom-id" class="cls-op"><div>xxx</div><div>bc</div></div>)
