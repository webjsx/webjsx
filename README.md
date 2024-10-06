# WebJSX

A minimal library for building web applications with JSX and Web Components. It focuses on simplicity, providing just **two core functions**:

- **`createElement`**: Creates virtual DOM elements using JSX.
- **`applyDiff`**: Efficiently applies changes to the real DOM by comparing virtual nodes.

## Examples

There are a few examples on [StackBlitz](https://stackblitz.com/@jeswin/collections/webjsx). If you're impatient (like me), that's probably the easiest way to get started.

- [Todo List](https://stackblitz.com/edit/webjsx-todos)
- [Rotten Tomatoes Mockup](https://stackblitz.com/edit/webjsx-tomatoes)
- [Boring Dashboard](https://stackblitz.com/edit/webjsx-dashboard)

## Installation

Install webjsx via npm:

```sh
npm install webjsx
```

## Getting Started

WebJSX fully supports JSX syntax, allowing you to create virtual DOM elements using `createElement` and update the real DOM with `applyDiff`.

```jsx
import * as webjsx from "webjsx";

// Define a simple virtual DOM element using JSX
const vdom = (
  <div id="main-container">
    <h1>Welcome to webjsx</h1>
    <p>This is a simple example.</p>
  </div>
);

// Select the container in the real DOM
const appContainer = document.getElementById("app");

// Apply the virtual DOM diff to update the real DOM
webjsx.applyDiff(appContainer, vdom);
```

### Defining and Using Web Components with JSX

Let's write a simple Custom Element with JSX.

```jsx
import * as webjsx from "webjsx";

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
    webjsx.applyDiff(this, vdom);
  }
}

// Register the custom element
if (!customElements.get("my-element")) {
  customElements.define("my-element", MyElement);
}

// Create a virtual DOM with the custom Web Component
const vdom = <my-element title="Initial Title" count={10}></my-element>;

// Render the custom Web Component
const appContainer = document.getElementById("app");
webjsx.applyDiff(appContainer, vdom);
```

### Handling Events in JSX

Attach event listeners directly within your JSX using standard HTML event attributes.

```jsx
import * as webjsx from "webjsx";

// Define an event handler
const handleClick = () => {
  alert("Button clicked!");
};

// Create a button with an onclick event
const vdom = <button onclick={handleClick}>Click Me</button>;

// Render the button
const appContainer = document.getElementById("app");
webjsx.applyDiff(appContainer, vdom);
```

### Using Fragments

Group multiple elements without introducing additional nodes to the DOM using `<>...</>` syntax.

```jsx
import * as webjsx from "webjsx";

// Define a custom Web Component using fragments
class MyList extends HTMLElement {
  connectedCallback() {
    const vdom = (
      <>
        <h2>My List</h2>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <footer>Total items: 3</footer>
      </>
    );
    webjsx.applyDiff(this, vdom);
  }
}

// Register the custom element
if (!customElements.get("my-list")) {
  customElements.define("my-list", MyList);
}

// Render the custom Web Component
const appContainer = document.getElementById("app");
const vdom = <my-list></my-list>;
webjsx.applyDiff(appContainer, vdom);
```

## API Reference

### `createElement(tag, props, children)`

Creates a virtual DOM element.

**JSX calls createElement implicitly:**

```jsx
const vdom = (
  <div id="main-container">
    <h1>Welcome to webjsx</h1>
  </div>
);
```

**Usage (Non-JSX):**

```js
const vdom = webjsx.createElement(
  "div",
  { id: "main-container" },
  webjsx.createElement("h1", null, "Welcome to webjsx")
);
```

### `applyDiff(parent, newVirtualNode)`

Applies the differences between the new virtual node(s) and the existing DOM.

**Usage:**

```jsx
const vdom = <p class="text">Updated Text</p>;
webjsx.applyDiff(appContainer, vdom);
```

### `Fragment`

A special type used to group multiple elements without adding extra nodes to the DOM.

**Usage:**

```jsx
<>
  <span>Item 1</span>
  <span>Item 2</span>
</>
```

### `createNode(vnode)`

You probably won't need to use this directly. But if you want to convert a virtual DOM node into a real DOM node you can use `createNode`.

**Usage:**

```js
const vnode = <div>Hello, world!</div>;
const domNode = webjsx.createNode(vnode);
document.body.appendChild(domNode);
```


## Example: Creating a Counter Web Component

```jsx
import * as webjsx from "webjsx";

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
    webjsx.applyDiff(this, vdom);
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
const vdom = <counter-element title="My Counter" count={0}></counter-element>;

const appContainer = document.getElementById("app");
webjsx.applyDiff(appContainer, vdom);
```

## Advanced: Rendering Suspension

If a class defines the `webjsx_suspendRendering` and `webjsx_resumeRendering` methods, WebJSX will call the former before setting properties and the latter after all properties are set. This allows you to suspend rendering while multiple properties are being set, which would otherwise result in multiple re-renders.

In the following example, for the JSX markup <my-element prop1={10} prop2={20} />, the render() method is called only once after both properties are set:

```ts
class MyElement extends HTMLElement {
  constructor() {
    super();
    this.renderingSuspended = false;
  }

  render() {
    if (!this.renderingSuspended) {
      this.textContent = `Prop1: ${this.getAttribute(
        "prop1"
      )}, Prop2: ${this.getAttribute("prop2")}`;
    }
  }

  __webjsx_suspendRendering() {
    this.renderingSuspended = true;
  }

  __webjsx_resumeRendering() {
    this.renderingSuspended = false;
    this.render(); // Perform the actual rendering
  }
}
```

## TypeScript

### tsconfig.json

Ensure your `tsconfig.json` is set up to handle JSX.

```json
{
  "compilerOptions": {
    //...
    "jsx": "react",
    "jsxFactory": "webjsx.createElement",
    "jsxFragmentFactory": "webjsx.Fragment"
  }
}
```

### Adding Custom Elements to IntrinsicElements (TypeScript)

TypeScript will complain that your Custom Element (such as `<counter-element>`) is not found. That's because it is only aware of standard HTML elements and doesn't know what `<counter-element>` is.

To fix this you need to declare custom elements in a declarations file, such as custom-elements.d.ts:

```ts
import "webjsx";

declare module "webjsx" {
  namespace JSX {
    interface IntrinsicElements {
      "counter-element": {
        count: number;
      };
      "sidebar-component": {
        about: string;
        email: string;
      };
    }
  }
}
```

## Bundling

You can bundle with your favorite bundler, but most apps don't need to.

You can load modules directly on the web page these days:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>WebJsx Test</title>

  <!-- node_modules or wherever you copy webjsx files -->
    <script type="importmap">
      {
        "imports": {
          "webjsx": "../node_modules/webjsx/dist/index.js"
        }
      }
    </script>
    <!-- This is your entry point -->
    <script type="module" src="../dist/index.js"></script>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
```

You can see more examples in the StackBlitz.

## Contributing

Contributions are welcome! Whether it's reporting bugs, suggesting features, or submitting pull requests, your help is appreciated.
Please ensure that your contributions adhere to the project's coding standards and include appropriate tests.

To run the tests:

```sh
npm test
```

## License

WebJSX is open-source software [licensed as MIT](https://raw.githubusercontent.com/webjsx/webjsx/refs/heads/main/LICENSE).

## Support

If you encounter any issues or have questions, feel free to open an issue on [GitHub](https://github.com/webjsx/webjsx/issues) or reach out via Twitter [@jeswin](https://twitter.com/jeswin).
