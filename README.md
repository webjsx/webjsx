# webjsx

A minimal library for building web applications with JSX and Web Components. It focuses on simplicity, providing just **two core functions**:

- **`createElement`**: Creates virtual DOM elements using JSX.
- **`applyDiff`**: Efficiently applies changes to the real DOM by comparing virtual nodes.

For more examples, visit [https://github.com/webjsx/webjsx-examples](https://github.com/webjsx/webjsx-examples).

## Installation

Install webjsx via npm:

```sh
npm install webjsx
```

## Getting Started

The following is a basic example of how to use webjsx with its two main functions, `createElement` and `applyDiff`.

### Creating Elements with JSX

webjsx fully supports JSX syntax, allowing you to create virtual DOM elements using `createElement` and update the real DOM with `applyDiff`.

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
applyDiff(appContainer, vdom);
```

### Defining and Using Web Components with JSX

webjsx excels at integrating JSX with Web Components, allowing you to define custom elements and render them using JSX syntax.

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
    applyDiff(this, vdom);
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
applyDiff(appContainer, vdom);
```

### Handling Events in JSX

Attach event listeners directly within your JSX using standard HTML event attributes.

```jsx
import { createElement, applyDiff } from "webjsx";

// Define an event handler
const handleClick = () => {
  alert("Button clicked!");
};

// Create a button with an onclick event
const vdom = <button onclick={handleClick}>Click Me</button>;

// Render the button
const appContainer = document.getElementById("app");
applyDiff(appContainer, vdom);
```

### Using Fragments

Group multiple elements without introducing additional nodes to the DOM using `<>...</>` syntax.

```jsx
import * as webjsx from "webjsx";

// Define a custom Web Component using fragments
class MyList extends HTMLElement {
  connectedCallback() {
    const vdom = (
      <ul>
        <>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </>
      </ul>
    );
    applyDiff(this, vdom);
  }
}

// Register the custom element
if (!customElements.get("my-list")) {
  customElements.define("my-list", MyList);
}

// Render the custom Web Component
const appContainer = document.getElementById("app");
const vdom = <my-list></my-list>;
applyDiff(appContainer, vdom);
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
applyDiff(appContainer, vdom);
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

## Example: Creating a Counter Web Component

```jsx
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
const vdom = <counter-element title="My Counter" count={0}></counter-element>;

const appContainer = document.getElementById("app");
applyDiff(appContainer, vdom);
```

## TypeScript Configuration

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

## TypeScript: Adding Custom Elements to IntrinsicElements

TypeScript will complain that your Custom Element (such as `<counter-element>`) is not found. TypeScript is only aware of standard HTML elements and doesn't know what `<counter-element>` is.

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

## Contributing

Contributions are welcome! Whether it's reporting bugs, suggesting features, or submitting pull requests, your help is appreciated.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

Please ensure that your contributions adhere to the project's coding standards and include appropriate tests.

To run the tests:

```sh
npm test
```

## License

webjsx is open-source software [licensed as MIT](LICENSE).

## Support

If you encounter any issues or have questions, feel free to open an issue on [GitHub](https://github.com/webjsx/webjsx/issues) or reach out via Twitter [@jeswin](https://twitter.com/jeswin).

---

This version now uses only web components and avoids any React-like component examples, and the `createElement` and `applyDiff` API examples have both JSX and non-JSX versions where appropriate.
