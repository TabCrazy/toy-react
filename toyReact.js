/**
 * Dom节点处理
 */
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }
    appendChild(component) {
        this.root.appendChild(component.root)
    }
}
/**
 * 文本节点处理
 */
class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
}
/**
 * Comonpent 实现
 */
export class Component {
    constructor() {
        // 创建一个绝对空的对象
        this.props = Object.create(null)
        this.children = []
        this._root = null
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    appendChild(component) {
        this.children.push(component)
    }
    get root () {
        if (!this._root) {
            this._root = this.render().root
        }
        return this._root
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
        el.setAttribute(attributes[attribute])
    }
    // 子节点处理
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === "string") {
                child = new TextWrapper(child)
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
export function render(element, parentElement) {
    return parentElement.appendChild(element.root)
}
