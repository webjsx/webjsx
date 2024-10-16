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

  it("should handle default slot in custom elements defined with JSX", () => {
    class MyCustomSlotElement extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const vdom = (
          <div>
            <slot></slot>
          </div>
        );
        applyDiff(shadow, vdom);
      }
    }

    if (!customElements.get("my-custom-slot-element")) {
      customElements.define("my-custom-slot-element", MyCustomSlotElement);
    }

    const vdom = (
      <my-custom-slot-element>
        <p>Content inside default slot</p>
      </my-custom-slot-element>
    );

    applyDiff(container, vdom);

    const customElement = container.querySelector("my-custom-slot-element");
    expect(customElement).to.exist;

    const slottedContent = customElement?.shadowRoot?.querySelector("slot");
    expect(slottedContent).to.exist;

    // Verify that the slotted content is correctly rendered
    const assignedNodes = (slottedContent as HTMLSlotElement).assignedNodes();
    expect(assignedNodes).to.have.lengthOf(1);
    expect(assignedNodes[0].textContent).to.equal(
      "Content inside default slot"
    );
  });

  it("should handle named slots in custom elements defined with JSX", () => {
    class NamedSlotElement extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const vdom = (
          <>
            <header>
              <slot name="header"></slot>
            </header>
            <main>
              <slot></slot>
            </main>
            <footer>
              <slot name="footer"></slot>
            </footer>
          </>
        );
        applyDiff(shadow, vdom);
      }
    }

    if (!customElements.get("named-slot-element")) {
      customElements.define("named-slot-element", NamedSlotElement);
    }

    const vdom = (
      <named-slot-element>
        <p slot="header">Header Content</p>
        <p>Main Content</p>
        <p slot="footer">Footer Content</p>
      </named-slot-element>
    );

    applyDiff(container, vdom);

    const namedSlotElement = container.querySelector("named-slot-element");
    expect(namedSlotElement).to.exist;

    // Verify header slot content
    const headerSlot = namedSlotElement?.shadowRoot?.querySelector(
      "slot[name='header']"
    );
    expect(headerSlot).to.exist;
    const headerAssigned = (headerSlot as HTMLSlotElement).assignedNodes();
    expect(headerAssigned).to.have.lengthOf(1);
    expect(headerAssigned[0].textContent).to.equal("Header Content");

    // Verify main slot content
    const mainSlot =
      namedSlotElement?.shadowRoot?.querySelector("slot:not([name])");
    expect(mainSlot).to.exist;
    const mainAssigned = (mainSlot as HTMLSlotElement).assignedNodes();
    expect(mainAssigned).to.have.lengthOf(1);
    expect(mainAssigned[0].textContent).to.equal("Main Content");

    // Verify footer slot content
    const footerSlot = namedSlotElement?.shadowRoot?.querySelector(
      "slot[name='footer']"
    );
    expect(footerSlot).to.exist;
    const footerAssigned = (footerSlot as HTMLSlotElement).assignedNodes();
    expect(footerAssigned).to.have.lengthOf(1);
    expect(footerAssigned[0].textContent).to.equal("Footer Content");
  });

  it("should update slots correctly when JSX is updated", () => {
    class MyDynamicSlotElement extends HTMLElement {
      private shadowVdom: any;

      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        this.shadowVdom = (
          <div>
            <slot></slot>
          </div>
        );
        applyDiff(shadow, this.shadowVdom);
      }

      // Method to update the shadow DOM
      update(newVdom: any) {
        this.shadowVdom = newVdom;
        applyDiff(this.shadowRoot as ShadowRoot, this.shadowVdom);
      }
    }

    if (!customElements.get("my-dynamic-slot-element")) {
      customElements.define("my-dynamic-slot-element", MyDynamicSlotElement);
    }

    // Initial render
    const initialVdom = (
      <my-dynamic-slot-element>
        <p>Initial Slot Content</p>
      </my-dynamic-slot-element>
    );

    applyDiff(container, initialVdom);

    const dynamicElement = container.querySelector("my-dynamic-slot-element");
    expect(dynamicElement).to.exist;
    expect(dynamicElement?.innerHTML).to.contain("Initial Slot Content");

    // Update the slot content
    const updatedVdom = (
      <my-dynamic-slot-element>
        <p>Updated Slot Content</p>
      </my-dynamic-slot-element>
    );

    applyDiff(container, updatedVdom);

    expect(dynamicElement?.innerHTML).to.contain("Updated Slot Content");
    expect(dynamicElement?.innerHTML).to.not.contain("Initial Slot Content");
  });

  it("should handle multiple slots in a single custom element", () => {
    class MultiSlotElement extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const vdom = (
          <>
            <div class="sidebar">
              <slot name="sidebar"></slot>
            </div>
            <div class="content">
              <slot></slot>
            </div>
            <div class="footer">
              <slot name="footer"></slot>
            </div>
          </>
        );
        applyDiff(shadow, vdom);
      }
    }

    if (!customElements.get("multi-slot-element")) {
      customElements.define("multi-slot-element", MultiSlotElement);
    }

    const vdom = (
      <multi-slot-element>
        <div slot="sidebar">Sidebar Content</div>
        <div>Main Content</div>
        <div slot="footer">Footer Content</div>
      </multi-slot-element>
    );

    applyDiff(container, vdom);

    const multiSlotElement = container.querySelector("multi-slot-element");
    expect(multiSlotElement).to.exist;

    // Verify sidebar slot content
    const sidebarSlot = multiSlotElement?.shadowRoot?.querySelector(
      "slot[name='sidebar']"
    );
    expect(sidebarSlot).to.exist;
    const sidebarAssigned = (sidebarSlot as HTMLSlotElement).assignedNodes();
    expect(sidebarAssigned).to.have.lengthOf(1);
    expect(sidebarAssigned[0].textContent).to.equal("Sidebar Content");

    // Verify main slot content
    const mainSlot =
      multiSlotElement?.shadowRoot?.querySelector("slot:not([name])");
    expect(mainSlot).to.exist;
    const mainAssigned = (mainSlot as HTMLSlotElement).assignedNodes();
    expect(mainAssigned).to.have.lengthOf(1);
    expect(mainAssigned[0].textContent).to.equal("Main Content");

    // Verify footer slot content
    const footerSlot = multiSlotElement?.shadowRoot?.querySelector(
      "slot[name='footer']"
    );
    expect(footerSlot).to.exist;
    const footerAssigned = (footerSlot as HTMLSlotElement).assignedNodes();
    expect(footerAssigned).to.have.lengthOf(1);
    expect(footerAssigned[0].textContent).to.equal("Footer Content");
  });
});
