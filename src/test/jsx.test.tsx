import "./setup.js";
import * as webjsx from "../index.js";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../applyDiff.js";

declare module "../index.js" {
  namespace JSX {
    interface IntrinsicElements {
      // Declare standard HTML elements (if not already declared elsewhere)
      div: any;
      span: any;
      ul: any;
      li: any;

      // Declare custom web components used in the tests
      "my-jsx-element": {
        title?: string;
        count?: number;
      };

      "nested-element": {
        label?: string;
        value?: string;
      };

      "parent-element": {
        title?: string;
        count?: number;
        children?: any;
      };

      "clickable-element": {
        onclick?: (event: Event) => void;
      };
    }
  }
}

describe("JSX Syntax", () => {
  let dom: JSDOM;
  let document: Document;
  let container: HTMLElement;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`, {
      runScripts: "dangerously",
    });
    document = dom.window.document;
    container = document.getElementById("app") as HTMLElement;
  });

  it("should render JSX elements correctly", () => {
    const vdom = (
      <div id="container">
        <h1>Hello, JSX!</h1>
        <p>This is a paragraph.</p>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#container");
    expect(div).to.exist;

    const h1 = div?.querySelector("h1");
    const p = div?.querySelector("p");

    expect(h1).to.exist;
    expect(h1?.textContent).to.equal("Hello, JSX!");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("This is a paragraph.");
  });

  it("should handle fragments in JSX", () => {
    const vdom = (
      <>
        <h2>Title</h2>
        <p>Paragraph inside a fragment.</p>
      </>
    );

    applyDiff(container, vdom);

    const h2 = container.querySelector("h2");
    const p = container.querySelector("p");

    expect(h2).to.exist;
    expect(h2?.textContent).to.equal("Title");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Paragraph inside a fragment.");
  });

  it("should handle event handlers in JSX", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    const vdom = <button onclick={handleClick}>Click Me</button>;

    applyDiff(container, vdom);

    const button = container.querySelector("button");
    expect(button).to.exist;
    expect(button?.textContent).to.equal("Click Me");

    // Simulate click event
    button?.dispatchEvent(new dom.window.Event("click"));
    expect(clicked).to.be.true;
  });

  it("should handle nested JSX elements", () => {
    const vdom = (
      <div class="wrapper">
        <header>
          <h1>Welcome</h1>
        </header>
        <main>
          <p>Main content goes here.</p>
        </main>
        <footer>
          <small>© 2024 WebJSX</small>
        </footer>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div.wrapper");
    expect(div).to.exist;

    const header = div?.querySelector("header");
    const main = div?.querySelector("main");
    const footer = div?.querySelector("footer");

    expect(header).to.exist;
    expect(header?.querySelector("h1")?.textContent).to.equal("Welcome");

    expect(main).to.exist;
    expect(main?.querySelector("p")?.textContent).to.equal(
      "Main content goes here."
    );

    expect(footer).to.exist;
    expect(footer?.querySelector("small")?.textContent).to.equal(
      "© 2024 WebJSX"
    );
  });

  it("should handle conditional rendering in JSX", () => {
    const isLoggedIn = true;
    const vdom = (
      <div>{isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}</div>
    );

    applyDiff(container, vdom);

    const p = container.querySelector("p");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Welcome back!");
  });

  it("should handle lists in JSX with keys", () => {
    const items = ["Apple", "Banana", "Cherry"];

    const vdom = (
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const ul = container.querySelector("ul");
    expect(ul).to.exist;
    const lis = ul?.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis?.[0].getAttribute("data-key")).to.equal("0");
    expect(lis?.[1].getAttribute("data-key")).to.equal("1");
    expect(lis?.[2].getAttribute("data-key")).to.equal("2");
    expect(lis?.[0].textContent).to.equal("Apple");
    expect(lis?.[1].textContent).to.equal("Banana");
    expect(lis?.[2].textContent).to.equal("Cherry");
  });

  it("should handle fragments with multiple root elements in JSX", () => {
    const vdom = (
      <>
        <h3>Header</h3>
        <section>
          <p>Section paragraph.</p>
        </section>
      </>
    );

    applyDiff(container, vdom);

    const h3 = container.querySelector("h3");
    const section = container.querySelector("section");

    expect(h3).to.exist;
    expect(h3?.textContent).to.equal("Header");
    expect(section).to.exist;
    expect(section?.querySelector("p")?.textContent).to.equal(
      "Section paragraph."
    );
  });

  it("should handle self-closing JSX elements", () => {
    const vdom = (
      <div>
        <img src="image.png" alt="Test Image" />
        <br />
        <input type="text" value="Sample" />
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div");
    expect(div).to.exist;

    const img = div?.querySelector("img");
    const br = div?.querySelector("br");
    const input = div?.querySelector("input");

    expect(img).to.exist;
    expect(img?.getAttribute("src")).to.equal("image.png");
    expect(img?.getAttribute("alt")).to.equal("Test Image");

    expect(br).to.exist;

    expect(input).to.exist;
    expect(input?.getAttribute("type")).to.equal("text");
    expect(input?.getAttribute("value")).to.equal("Sample");
  });

  it("should handle dynamic children in JSX", () => {
    const items = ["One", "Two", "Three"];
    const vdom = (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const lis = container.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis[0].textContent).to.equal("One");
    expect(lis[1].textContent).to.equal("Two");
    expect(lis[2].textContent).to.equal("Three");
  });

  it("should handle custom web components created with JSX and update their props", () => {
    // Define a custom web component
    class MyJsxElement extends HTMLElement {
      static get observedAttributes() {
        return ["title"];
      }

      private _count: number = 0;

      constructor() {
        super();
      }

      connectedCallback() {
        this.render();
      }

      attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (name === "title") {
          this.render();
        }
      }

      set count(val: number) {
        this._count = val;
        this.render();
      }

      get count() {
        return this._count;
      }

      render() {
        this.textContent = `Title: ${this.getAttribute("title")}, Count: ${
          this.count
        }`;
      }
    }

    // Register the custom element
    if (!customElements.get("my-jsx-element")) {
      customElements.define("my-jsx-element", MyJsxElement);
    }

    // Initial JSX VDOM with string and non-string props
    const initialVdom = (
      <my-jsx-element title="Initial Title" count={10}></my-jsx-element>
    );

    // Apply the initial render
    applyDiff(container, initialVdom);

    // Select the custom element
    const myJsxElement = container.querySelector(
      "my-jsx-element"
    ) as MyJsxElement;
    expect(myJsxElement).to.exist;
    expect(myJsxElement.getAttribute("title")).to.equal("Initial Title"); // setAttribute
    expect(myJsxElement.count).to.equal(10); // property

    // Verify the rendered content
    expect(myJsxElement.textContent).to.equal(
      "Title: Initial Title, Count: 10"
    );

    // Updated JSX VDOM with new props
    const updatedVdom = (
      <my-jsx-element title="Updated Title" count={20}></my-jsx-element>
    );

    // Apply the diff to update props
    applyDiff(container, updatedVdom);

    // Verify that the attributes and properties have been updated
    expect(myJsxElement.getAttribute("title")).to.equal("Updated Title"); // setAttribute
    expect(myJsxElement.count).to.equal(20); // property

    // Verify the updated rendered content
    expect(myJsxElement.textContent).to.equal(
      "Title: Updated Title, Count: 20"
    );
  });

  it("should handle nested custom web components with JSX and update their props", () => {
    // Define a nested custom web component
    class NestedElement extends HTMLElement {
      static get observedAttributes() {
        return ["label"];
      }

      private _value: string = "";

      constructor() {
        super();
      }

      connectedCallback() {
        this.render();
      }

      attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (name === "label") {
          this.render();
        }
      }

      set value(val: string) {
        this._value = val;
        this.render();
      }

      get value() {
        return this._value;
      }

      render() {
        this.textContent = `Label: ${this.getAttribute("label")}, Value: ${
          this.value
        }`;
      }
    }

    // Register the nested custom element
    if (!customElements.get("nested-element")) {
      customElements.define("nested-element", NestedElement);
    }

    // Define a parent custom web component that nests the nested element
    class ParentElement extends HTMLElement {
      static get observedAttributes() {
        return ["title"];
      }

      private _count: number = 0;

      constructor() {
        super();
      }

      connectedCallback() {
        this.render();
      }

      attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        if (name === "title") {
          this.render();
        }
      }

      set count(val: number) {
        this._count = val;
        this.render();
      }

      get count() {
        return this._count;
      }

      render() {
        this.innerHTML = `
          <nested-element label="Nested Label" value="Nested Value"></nested-element>
          <span>Parent Count: ${this.count}</span>
        `;
      }
    }

    const vdom = (
      <parent-element title="Parent Title" count={5}>
        <nested-element
          label="Nested Label"
          value="Nested Value"
        ></nested-element>
        <span>Parent Count: 5</span>
      </parent-element>
    );

    applyDiff(container, vdom);

    const parentElement = container.querySelector(
      "parent-element"
    ) as ParentElement;
    expect(parentElement).to.exist;

    // Verify the parent element's initial props
    expect(parentElement.getAttribute("title")).to.equal("Parent Title");
    expect(parentElement.count).to.equal(5);

    const nestedElement = parentElement.querySelector(
      "nested-element"
    ) as NestedElement;
    expect(nestedElement).to.exist;

    // Verify the nested element's initial props
    expect(nestedElement.getAttribute("label")).to.equal("Nested Label");
    expect(nestedElement.value).to.equal("Nested Value");

    // Verify rendered content
    const span = parentElement.querySelector("span");
    expect(span?.textContent).to.equal("Parent Count: 5");

    // Now, let's update the props
    const updatedVdom = (
      <parent-element title="Updated Parent Title" count={10}>
        <nested-element
          label="Updated Nested Label"
          value="Updated Nested Value"
        ></nested-element>
        <span>Parent Count: 10</span>
      </parent-element>
    );

    applyDiff(container, updatedVdom);

    // Verify updated props
    expect(parentElement.getAttribute("title")).to.equal(
      "Updated Parent Title"
    );
    expect(parentElement.count).to.equal(10);

    // Verify the updated nested element's props
    expect(nestedElement.getAttribute("label")).to.equal(
      "Updated Nested Label"
    );
    expect(nestedElement.value).to.equal("Updated Nested Value");

    expect(span?.textContent).to.equal("Parent Count: 10");
  });

  it("should handle event listeners on custom web components created with JSX", () => {
    // Define a custom web component with an event
    class ClickableElement extends HTMLElement {
      constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
      }

      connectedCallback() {
        this.render();
      }

      disconnectedCallback() {
        this.removeEventListener("click", this.handleClick);
      }

      handleClick() {
        // do something...
      }

      render() {
        this.textContent = "Clickable Element";
        this.addEventListener("click", this.handleClick);
      }
    }

    // Register the clickable custom element
    if (!customElements.get("clickable-element")) {
      customElements.define("clickable-element", ClickableElement);
    }

    let customClicked = false;

    function onCustomClick() {
      customClicked = true;
    }

    // Render the custom element with JSX and attach the onclick handler
    const vdom = (
      <clickable-element onclick={onCustomClick}></clickable-element>
    );
    applyDiff(container, vdom);

    const clickableElement = container.querySelector(
      "clickable-element"
    ) as ClickableElement;
    expect(clickableElement).to.exist;

    // Simulate a click event
    clickableElement.click();

    // Expect that the click event triggered the `onCustomClick` handler
    expect(customClicked).to.be.true;
  });
});
