const RENDER_TO_DOM = Symbol('render ot dom')
/**
 * Comonpent 实现
 */
export class Component {
    constructor() {
        // 创建一个绝对空的对象
        this.props = Object.create(null)
        this.children = []
        this._root = null
        this._range = null
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    appendChild(component) {
        this.children.push(component)
    }
    get vdom() {
        return this.render().vdom
    }
    // get vchildren() {
    //     return this.children.map(child => child.vdom)
    // }
    // render dom 方法
    [RENDER_TO_DOM](range) {
        this._range = range
        this._vdom = this.vdom
        this._vdom[RENDER_TO_DOM](range)
    }
    update() {
        let isSameNode = (oldNodes, newNodes) => {
            // 类型不同
            if (oldNodes.type !== newNodes.type) {
                return false
            }
            // 对比属性（props）
            for (let name in newNodes.props) {
                if (newNodes.props[name] !== oldNodes.props[name]) {
                    return false
                }
            }
            // 属性数量
            if(Object.keys(oldNodes.props).length > Object.keys(newNodes.props).length){
                return false
            }
            // 比对文本节点
            if (newNodes.type === '#text' && newNodes.content !== oldNodes.content) {
                return false
            }
            return true
        }
        let update = (oldNodes, newNodes) => {
            // 对比要素type，props，children
            // #text content
            if(!isSameNode(oldNodes, newNodes)) {
                newNodes[RENDER_TO_DOM](oldNodes._range)
                return
            }
            newNodes._range = oldNodes._range
            // 处理child
            let newChildren = newNodes.vchildren
            let oldChildren = oldNodes.vchildren
            if (!newChildren || !newChildren.length) {
                return
            }
            let tailRange = oldChildren[oldChildren.length - 1]._range

            for(let i = 0; i < newChildren.length; i++) {
                let newChild = newChildren[i]
                let oldChild = oldChildren[i]
                if(i < oldChildren.length) {
                    update(oldChild, newChild)
                } else {
                    let range = document.createRange()
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    range.setEnd(tailRange.endContainer, tailRange.endOffset)
                    newChild[RENDER_TO_DOM](range)
                    tailRange = range
                }
            }
        }
        let newVdom = this.vdom
        update(this._vdom, newVdom)
        this._vdom = newVdom
    }
    // 重新绘制
    /*rerender() {
        let oldRange = this._range
        let range = document.createRange()
        range.setStart(oldRange.startContainer, oldRange.startOffset)
        range.setEnd(oldRange.startContainer, oldRange.startOffset)
        this[RENDER_TO_DOM](range)

        oldRange.setStart(range.endContainer, range.endOffset)
        oldRange.deleteContents()
    }*/
    // setState
    setState(newState) {
        if (this.state === null || typeof this.state !== 'object') {
            this.state = newState
            this.update()
            return
        }
        let merge = (oldState, newState) => {
            for (let i in newState) {
                if (oldState[i] === null || typeof oldState[i] !== "object") {
                    oldState[i] = newState[i]
                } else {
                    merge(oldState[i], newState[i])
                }
            }
        }
        merge(this.state, newState)
        this.update()
    }
}

function relaceContent(range, node) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.deleteContents()
    range.setStartBefore(node)
    range.setEndAfter(node)
}

/**
 * Dom节点处理
 */
class ElementWrapper extends Component {
    constructor(type) {
        super(type)
        this.type = type
        this.root = document.createElement(type)
    }
    get vdom() {
        this.vchildren = this.children.map(child => child.vdom)
        return this
    }
    [RENDER_TO_DOM](range) {
        this._range = range
        let root = document.createElement(this.type)
        // 处理Attribute
        for (let name in this.props) {
            let value = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                // 事件处理
                const event = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase())
                root.addEventListener(event, value)
            } else if(name === 'className') {
                // class类名处理
                root.setAttribute('class', value)
            } else {
                // 普通属性处理
                root.setAttribute(name, value)
            }
        }
        if(!this.vchildren) {
            this.vchildren = this.children.map(child => child.vdom)
        }
        // 处理 children
        for (let child of this.vchildren) {
            const childRange = document.createRange()
            childRange.setStart(root, root.childNodes.length)
            childRange.setEnd(root, root.childNodes.length)
            child[RENDER_TO_DOM](childRange)
        }

        // range.insertNode(root)
        relaceContent(range, root)
    }
}
/**
 * 文本节点处理
 */
class TextWrapper extends Component {
    constructor(content) {
        super(content)
        this.type = "#text"
        this.content = content
    }
    get vdom () {
        return this
    }
    [RENDER_TO_DOM](range) {
        this._range = range
        let root = document.createTextNode(this.content)
        relaceContent(range, root)
    }
}

/**
 * 节点创建
 * @param {*} type 类型
 * @param {*} attributes 属性
 * @param  {...any} children 子节点
 */
export function createElement(type, attributes, ...children) {
    let el
    if (typeof type === "string") {
        el = new ElementWrapper(type)
    } else {
        el = new type
    }
    // 属性节点处理
    for (let attribute in attributes) {
        el.setAttribute(attribute, attributes[attribute])
    }
    // 子节点处理
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === "string") {
                child = new TextWrapper(child)
            }
            if (child === null) {
                continue
            }
            // 对 {this.children} 处理
            if (typeof child === "object" && child instanceof Array) {
                // 多层级递归处理
                insertChildren(child)
            } else {
                el.appendChild(child)
            }
        }
    }
    insertChildren(children)
    return el
}
/**
 * render实现
 * @param {*} element 通过createElement生成的Dom节点
 * @param {*} parentElement 根节点
 */
export function render(component, parentElement) {
    // return parentElement.appendChild(element.root)
    const range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
}
