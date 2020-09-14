import { createElement, Component, render } from './toyReact'

class MyComponent extends Component {
    render() {
        return (
            <div>
                <h1>my component</h1>
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
