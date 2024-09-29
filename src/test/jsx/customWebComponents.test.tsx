import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../../test/setup.js";

describe("JSX Syntax - Custom Web Components", () => {
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

    // Register the custom element if it hasn't been defined already
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

  it("should render JSX within a custom web component using applyDiff", () => {
    class DynamicRenderElement extends HTMLElement {
      static get observedAttributes() {
        return ["title", "count"];
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
        if (name === "title" || name === "count") {
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
        // Using applyDiff to render JSX inside the web component
        const vdom = (
          <div>
            <h2>{this.getAttribute("title")}</h2>
            <p>Count: {this.count}</p>
          </div>
        );

        // Apply the virtual DOM to the component's shadow DOM or itself
        applyDiff(this, vdom);
      }
    }

    // Register the custom element
    if (!customElements.get("dynamic-render-element")) {
      customElements.define("dynamic-render-element", DynamicRenderElement);
    }

    // Render the custom web component with initial attributes
    const vdom = (
      <dynamic-render-element
        title="Initial Title"
        count={5}
      ></dynamic-render-element>
    );

    applyDiff(container, vdom);

    const dynamicElement = container.querySelector(
      "dynamic-render-element"
    ) as DynamicRenderElement;
    expect(dynamicElement).to.exist;

    // Verify that the internal content was rendered correctly using applyDiff
    const h2 = dynamicElement.querySelector("h2");
    const p = dynamicElement.querySelector("p");

    expect(h2).to.exist;
    expect(h2?.textContent).to.equal("Initial Title");

    expect(p).to.exist;
    expect(p?.textContent).to.equal("Count: 5");

    // Now update the attributes and check if applyDiff correctly updates the content
    const updatedVdom = (
      <dynamic-render-element
        title="Updated Title"
        count={10}
      ></dynamic-render-element>
    );

    applyDiff(container, updatedVdom);

    // Verify the updated content
    expect(dynamicElement.getAttribute("title")).to.equal("Updated Title");
    expect(dynamicElement.count).to.equal(10);

    const updatedH2 = dynamicElement.querySelector("h2");
    const updatedP = dynamicElement.querySelector("p");

    expect(updatedH2?.textContent).to.equal("Updated Title");
    expect(updatedP?.textContent).to.equal("Count: 10");
  });
});
