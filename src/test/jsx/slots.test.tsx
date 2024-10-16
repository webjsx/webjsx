import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - Web Components with Slots", () => {
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

  // String-based slot content (shadow DOM usage)
  it("should render content inside a default slot defined in shadow DOM", () => {
    class MySlotElement extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = `
          <div>
            <slot></slot> <!-- Default slot for slotted content -->
          </div>
        `;
      }
    }

    // Register the custom element if not already defined
    if (!customElements.get("my-slot-element")) {
      customElements.define("my-slot-element", MySlotElement);
    }

    // JSX virtual DOM that will pass children into the slot
    const vdom = (
      <my-slot-element>
        <p>Slotted Content</p>
      </my-slot-element>
    );

    // Apply the virtual DOM
    applyDiff(container, vdom);

    const mySlotElement = container.querySelector("my-slot-element");
    const slottedContent = mySlotElement?.shadowRoot?.querySelector("slot");

    // Check that the slotted content is rendered correctly
    expect(slottedContent).to.exist;
    expect(mySlotElement?.innerHTML).to.contain("Slotted Content");
  });

  // String-based slot content update (shadow DOM usage)
  it("should update slot content in shadow DOM when JSX changes", () => {
    class MySlotElement extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = `
          <div>
            <slot></slot> <!-- Default slot for slotted content -->
          </div>
        `;
      }
    }

    // Register the custom element if not already defined
    if (!customElements.get("my-slot-element")) {
      customElements.define("my-slot-element", MySlotElement);
    }

    // Initial render with one slotted content
    const initialVdom = (
      <my-slot-element>
        <p>Initial Slotted Content</p>
      </my-slot-element>
    );

    applyDiff(container, initialVdom);

    // Verify initial slot content
    const mySlotElement = container.querySelector("my-slot-element");
    expect(mySlotElement?.innerHTML).to.contain("Initial Slotted Content");

    // Updated render with new slotted content
    const updatedVdom = (
      <my-slot-element>
        <p>Updated Slotted Content</p>
      </my-slot-element>
    );

    applyDiff(container, updatedVdom);

    // Verify updated slot content
    expect(mySlotElement?.innerHTML).to.contain("Updated Slotted Content");
  });

  // String-based named slots (shadow DOM usage)
  it("should handle named slots and distribute content in shadow DOM", () => {
    class NamedSlotElement extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = `
          <div>
            <header><slot name="header"></slot></header>
            <main><slot></slot></main>
            <footer><slot name="footer"></slot></footer>
          </div>
        `;
      }
    }

    // Register the custom element with named slots
    if (!customElements.get("named-slot-element")) {
      customElements.define("named-slot-element", NamedSlotElement);
    }

    // JSX virtual DOM that assigns content to named and default slots
    const vdom = (
      <named-slot-element>
        <p slot="header">Header Content</p>
        <p>Main Content</p>
        <p slot="footer">Footer Content</p>
      </named-slot-element>
    );

    applyDiff(container, vdom);

    const namedSlotElement = container.querySelector("named-slot-element");

    // Check that the header content is assigned to the header slot
    const headerSlot =
      namedSlotElement?.shadowRoot?.querySelector("header slot");
    expect(
      (headerSlot as HTMLSlotElement)?.assignedNodes()?.[0].textContent
    ).to.equal("Header Content");

    // Check that the main content is assigned to the default slot
    const mainSlot = namedSlotElement?.shadowRoot?.querySelector("main slot");
    expect(
      (mainSlot as HTMLSlotElement)?.assignedNodes()?.[0].textContent
    ).to.equal("Main Content");

    // Check that the footer content is assigned to the footer slot
    const footerSlot =
      namedSlotElement?.shadowRoot?.querySelector("footer slot");
    expect(
      (footerSlot as HTMLSlotElement)?.assignedNodes()?.[0].textContent
    ).to.equal("Footer Content");
  });

  // JSX-based default slot usage
  it("should handle default slot in custom elements using JSX-defined slots", () => {
    const vdom = (
      <my-slot-element>
        <slot>
          <p>Content inside slot</p>
        </slot>
      </my-slot-element>
    );

    applyDiff(container, vdom);

    const slotElement = container.querySelector("my-slot-element slot");
    expect(slotElement).to.exist;
    expect(slotElement?.parentElement?.innerHTML).to.contain(
      "Content inside slot"
    );
  });

  // JSX-based named slots usage
  it("should handle named slots in custom elements using JSX-defined slots", () => {
    const vdom = (
      <named-slot-element>
        <slot name="header">
          <p>Header Content</p>
        </slot>
        <slot>
          <p>Main Content</p>
        </slot>
        <slot name="footer">
          <p>Footer Content</p>
        </slot>
      </named-slot-element>
    );

    applyDiff(container, vdom);

    const headerSlot = container.querySelector(
      "named-slot-element slot[name='header']"
    );
    const mainSlot = container.querySelector(
      "named-slot-element slot:not([name])"
    );
    const footerSlot = container.querySelector(
      "named-slot-element slot[name='footer']"
    );

    expect(headerSlot).to.exist;
    expect(headerSlot?.innerHTML).to.contain("Header Content");

    expect(mainSlot).to.exist;
    expect(mainSlot?.innerHTML).to.contain("Main Content");

    expect(footerSlot).to.exist;
    expect(footerSlot?.innerHTML).to.contain("Footer Content");
  });

  // JSX-based slots update
  it("should update slots correctly when JSX-defined slots are updated", () => {
    const initialVdom = (
      <my-slot-element>
        <slot>
          <p>Initial Slot Content</p>
        </slot>
      </my-slot-element>
    );

    applyDiff(container, initialVdom);
    const slotElement = container.querySelector("my-slot-element slot");
    expect(slotElement?.innerHTML).to.contain("Initial Slot Content");

    // Updated render
    const updatedVdom = (
      <my-slot-element>
        <slot>
          <p>Updated Slot Content</p>
        </slot>
      </my-slot-element>
    );

    applyDiff(container, updatedVdom);
    expect(slotElement?.innerHTML).to.contain("Updated Slot Content");
  });
});
