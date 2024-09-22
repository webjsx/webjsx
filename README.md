# webjsx

webjsx is a lightweight virtual DOM library tailored for building modern web applications using JSX, with a strong emphasis on integrating seamlessly with Web Components. Inspired by React's declarative syntax, webjsx offers a minimalistic approach to creating, diffing, and rendering virtual nodes, enabling efficient DOM updates and enhancing developer productivity.

Unlike larger frameworks, webjsx leverages your existing knowledge of DOM APIs and JavaScript, making it easy to incorporate into your projects without a steep learning curve. Its focus on Web Components allows you to harness the full power of custom elements while enjoying the simplicity and expressiveness of JSX.

## Key Features

- **JSX Support:** Write declarative UI components using familiar JSX syntax, enhancing readability and maintainability.
- **Virtual DOM Diffing:** Efficiently updates the DOM by applying only the necessary changes, optimizing performance.
- **Web Components Integration:** Seamlessly create and manage custom Web Components with JSX-based rendering.
- **Fragment Support:** Group multiple elements without adding extra nodes to the DOM.
- **Event Handling:** Easily attach and manage event listeners directly within JSX.
- **Keyed Elements:** Optimize list rendering and element reordering with unique keys.
- **Custom Web Components:** Integrate and manage custom elements effortlessly.
- **Comprehensive Testing:** Ensure reliability with a robust suite of tests covering various aspects of the library.

## Installation

Install webjsx via npm:

```sh
npm install webjsx
```

## Getting Started

The easiest way to get started with webjsx is by setting up a project using your preferred build tools. Below is a basic example of how to create and render elements using webjsx with a focus on JSX and Web Components.

### Creating Elements with JSX

webjsx fully supports JSX syntax, enabling you to write more readable and maintainable code. Use the `createElement` function to create virtual DOM elements and the `applyDiff` function to render them to the real DOM.

```jsx
/** @jsx webjsx.createElement */
import { createElement, applyDiff, Fragment } from "webjsx";

// Define a simple virtual DOM element using JSX
const vdom = (
  <div id="container">
    <h1>Welcome to webjsx</h1>
    <p>This is a simple example.</p>
  </div>
);

// Select the container in the real DOM
const container = document.getElementById("app");

// Apply the virtual DOM diff to update the real DOM
applyDiff(container, vdom);
```

### Defining and Using Web Components with JSX

webjsx excels at integrating JSX with Web Components, allowing you to define custom elements and render them using JSX syntax.

```jsx
/** @jsx webjsx.createElement */
import { createElement, applyDiff, Fragment } from "webjsx";

// Define a custom Web Component
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ["title", "count"];
  }

  constructor() {
    super();
    this._count = 0;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title" || name === "count") {
      this.render();
    }
  }

  set count(val) {
    this._count = val;
    this.render();
  }

  get count() {
    return this._count;
  }

  render() {
    // Use webjsx's applyDiff to render JSX inside the Web Component
    const vdom = (
      <div>
        <h2>{this.getAttribute("title")}</h2>
        <p>Count: {this.count}</p>
      </div>
    );
    applyDiff(this, vdom);
  }
}

// Register the custom element
if (!customElements.get("my-element")) {
  customElements.define("my-element", MyElement);
}

// Create a virtual DOM with the custom Web Component
const vdom = (
  <my-element title="Initial Title" count={10}></my-element>
);

// Render the custom Web Component
const container = document.getElementById("app");
applyDiff(container, vdom);
```

### Handling Events in JSX

Attach event listeners directly within your JSX using standard HTML event attributes.

```jsx
/** @jsx webjsx.createElement */
import { createElement, applyDiff } from "webjsx";

// Define an event handler
const handleClick = () => {
  alert("Button clicked!");
};

// Create a button with an onclick event
const Button = () => {
  return <button onclick={handleClick}>Click Me</button>;
};

// Render the Button component
const container = document.getElementById("app");
applyDiff(container, <Button />);
```

### Using Fragments

Group multiple elements without introducing additional nodes to the DOM using `Fragment`.

```jsx
/** @jsx webjsx.createElement */
import { createElement, applyDiff, Fragment } from "webjsx";

const List = () => {
  return (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </Fragment>
  );
};

const container = document.getElementById("app");
applyDiff(container, <ul><List /></ul>);
```

## API Reference

### `createElement`

Creates a virtual DOM element.

**Usage:**

```jsx
createElement(type, props, ...children)
```

- `type`: `string` | `typeof Fragment`  
  The type of the element, e.g., `'div'`, `'span'`, or `Fragment` for grouping.
  
- `props`: `object | null`  
  An object containing attributes and properties for the element.
  
- `children`: `VNode | VNode[]`  
  The child elements or text content.

**Example:**

```jsx
createElement("div", { id: "main" }, "Hello, World!");
```

### `applyDiff`

Applies the differences between the new virtual node(s) and the existing DOM.

**Usage:**

```jsx
applyDiff(parent, newVirtualNode)
```

- `parent`: `Node`  
  The parent DOM node where the virtual nodes will be applied.
  
- `newVirtualNode`: `VNode | VNode[]`  
  A single virtual node or an array of virtual nodes.

**Example:**

```jsx
const vdom = createElement("p", { class: "text" }, "Updated Text");
applyDiff(container, vdom);
```

### `Fragment`

A special type used to group multiple elements without adding extra nodes to the DOM.

**Usage:**

```jsx
<Fragment>
  <Element1 />
  <Element2 />
</Fragment>
```

**Example:**

```jsx
<Fragment>
  <span>First</span>
  <span>Second</span>
</Fragment>
```

## Creating Web Components with JSX

webjsx simplifies the creation and rendering of Web Components using JSX. By leveraging the power of JSX, you can define complex custom elements with ease.

### Example: Creating a Counter Web Component

```jsx
/** @jsx webjsx.createElement */
import { createElement, applyDiff } from "webjsx";

// Define the custom Web Component
class CounterElement extends HTMLElement {
  static get observedAttributes() {
    return ["title", "count"];
  }

  constructor() {
    super();
    this._count = 0;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title" || name === "count") {
      this.render();
    }
  }

  set count(val) {
    this._count = val;
    this.render();
  }

  get count() {
    return this._count;
  }

  render() {
    // Render JSX inside the Web Component
    const vdom = (
      <div>
        <h2>{this.getAttribute("title")}</h2>
        <p>Count: {this.count}</p>
        <button onclick={this.increment.bind(this)}>Increment</button>
      </div>
    );
    applyDiff(this, vdom);
  }

  increment() {
    this.count += 1;
  }
}

// Register the custom element
if (!customElements.get("counter-element")) {
  customElements.define("counter-element", CounterElement);
}

// Create and render the CounterElement
const vdom = (
  <counter-element title="My Counter" count={0}></counter-element>
);

const container = document.getElementById("app");
applyDiff(container, vdom);
```

## Testing

webjsx comes with a comprehensive test suite to ensure reliability and correctness. The tests cover various aspects, including basic rendering, element management, event handling, fragments, keys handling, multiple updates, props handling, and integration with custom Web Components.

To run the tests:

```sh
npm test
```

Ensure that all tests pass before deploying your application.

## Building

webjsx is written in TypeScript and can be built using standard TypeScript and bundling tools.

### TypeScript Configuration

Ensure your `tsconfig.json` is set up to handle JSX and module resolution correctly.

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "webjsx.createElement",
    "jsxFragmentFactory": "webjsx.Fragment",
    "target": "es6",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Bundling with Webpack

Configure Webpack to handle JSX and TypeScript.

**webpack.config.js:**

```js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'webjsx.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [
              ['@babel/plugin-transform-react-jsx', { 'pragma': 'webjsx.createElement', 'pragmaFrag': 'webjsx.Fragment' }]
            ]
          }
        }
      }
    ],
  },
};
```

### Running the Build

```sh
npm run build
```

Ensure that your build scripts are correctly defined in `package.json`.

## Example Projects

Explore these example projects to see webjsx in action:

- **Basic Rendering:** Demonstrates simple element creation and rendering.
- **Event Handling:** Shows how to attach and manage event listeners.
- **Fragments and Keys:** Illustrates grouping elements and optimizing list rendering.
- **Custom Web Components:** Integrates custom elements with webjsx.
- **JSX Syntax with Web Components:** Focuses on rendering Web Components using JSX.

## Contributing

Contributions are welcome! Whether it's reporting bugs, suggesting features, or submitting pull requests, your help is appreciated.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

Please ensure that your contributions adhere to the project's coding standards and include appropriate tests.

## License

webjsx is open-source software [licensed as MIT](LICENSE).

## Support

If you encounter any issues or have questions, feel free to open an issue on [GitHub](https://github.com/webjsx/webjsx/issues) or reach out via Twitter [@jeswin](https://twitter.com/jeswin).
