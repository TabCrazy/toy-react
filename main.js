import { createElement, Component, render } from './toyReact'

class MyComponent extends Component {
    constructor() {
        super()
        this.state = {
            userName: 'TabTang',
            age: 30
        }
    }
    render() {
        return (
            <div>
                <h1>My Component</h1>
                <h2>Name: {this.state.userName}</h2>
                <h3>Age: {this.state.age.toString()}</h3>
                {this.children}
            </div>
        )
    }
}
render(<MyComponent id="dom-id" class="cls-op">
    <div>xxx</div>
    <div>bc</div>
    <div></div>
  </MyComponent>, document.getElementById('app'))
