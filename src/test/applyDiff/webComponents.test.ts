import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Web Components", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should handle custom web components with string and non-string props", () => {
    // Define a custom web component
    class MyElement extends HTMLElement {
      static get observedAttributes() {
        return ["title"];
      }

      private _value: number = 0;

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

      set value(val: number) {
        this._value = val;
        this.render();
      }

      get value() {
        return this._value;
      }

      render() {
        this.textContent = `Title: ${this.getAttribute("title")}, Value: ${this.value}`;
      }
    }

    // Register the custom element
    if (!customElements.get("my-element")) {
      customElements.define("my-element", MyElement);
    }

    // Create VDOM with string and non-string props
    const vdom = createElement(
      "my-element",
      { title: "Test Title", value: 42 },
      null
    );
    applyDiff(container, vdom);

    const myElement = container.querySelector("my-element") as MyElement;
    expect(myElement).to.exist;
    expect(myElement.getAttribute("title")).to.equal("Test Title"); // setAttribute
    expect(myElement.value).to.equal(42); // property

    // Check the rendered content
    expect(myElement.textContent).to.equal("Title: Test Title, Value: 42");

    // Update VDOM with new props
    const updatedVdom = createElement(
      "my-element",
      { title: "Updated Title", value: 100 },
      null
    );
    applyDiff(container, updatedVdom);

    expect(myElement.getAttribute("title")).to.equal("Updated Title"); // setAttribute
    expect(myElement.value).to.equal(100); // property

    // Check the updated rendered content
    expect(myElement.textContent).to.equal("Title: Updated Title, Value: 100");
  });
});
