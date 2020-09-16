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
    // render dom 方法
    [RENDER_TO_DOM](range) {
        this._range = range
        this.render()[RENDER_TO_DOM](range)
    }
    // 重新绘制
    rerender() {
        let oldRange = this._range
		let range = document.createRange()
		range.setStart(oldRange.startContainer, oldRange.startOffset)
		range.setEnd(oldRange.startContainer, oldRange.startOffset)
		this[RENDER_TO_DOM](range)

		oldRange.setStart(range.endContainer, range.endOffset)
		oldRange.deleteContents()
    }
    setState(newState) {
        if (this.state === null || typeof this.state !== 'object') {
            this.state = newState
            this.rerender()
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
		this.rerender()
	}
    // get root () {
    //     if (!this._root) {
    //         this._root = this.render().root
    //     }
    //     return this._root
    // }
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
    // setAttribute(name, value) {
    //     if (name.match(/^on([\s\S]+)$/)) {
    //         // 事件处理
    //         const event = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase())
    //         this.root.addEventListener(event, value)
    //     } else if(name === 'className') {
    //         // class类名处理
    //         this.root.setAttribute('class', value)
    //     } else {
    //         // 普通属性处理
    //         this.root.setAttribute(name, value)
    //     }
    // }
    // appendChild(component) {
    //     const range = document.createRange()
    //     range.setStart(this.root, this.root.childNodes.length)
    //     range.setEnd(this.root, this.root.childNodes.length)
    //     range.deleteContents()
    //     component[RENDER_TO_DOM](range)
    //     // this.root.appendChild(component.root)
    // }
    get vdom() {
        return {
            type: this.type,
            props: this.props,
            children: this.children.map(child => child.vdom)
        }
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents()
        range.insertNode(this.root)
    }
}
/**
 * 文本节点处理
 */
class TextWrapper extends Component {
    constructor(content) {
        super(content)
        this.content = content
        this.root = document.createTextNode(content)
    }
    get vdom () {
        return {
            type: "#text",
            content: this.content
        }
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents()
        range.insertNode(this.root)
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
