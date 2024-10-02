import "../setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Rendering Suspension with Custom Element", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  // Define a custom web component that supports rendering suspension
  class SuspendedElement extends HTMLElement {
    // Counter to track render calls
    public renderCallCount: number = 0;

    // Flags to track suspension state
    public __webjsx_renderingSuspended: boolean = false;
    public __webjsx_suspendCalled: boolean = false;
    public __webjsx_resumeCalled: boolean = false;

    // Internal properties
    private _prop1: string = "default1";
    private _prop2: string = "default2";
    private _prop3: string = "default3";

    constructor() {
      super();
    }

    // Observe attributes if needed
    static get observedAttributes() {
      return ["prop1", "prop2", "prop3"];
    }

    // Attribute change callback to sync attributes to properties
    attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (oldValue === newValue) return;
      switch (name) {
        case "prop1":
          this.prop1 = newValue || "";
          break;
        case "prop2":
          this.prop2 = newValue || "";
          break;
        case "prop3":
          this.prop3 = newValue || "";
          break;
      }
    }

    // Property setters and getters
    set prop1(value: string) {
      this._prop1 = value;
      this.scheduleRender();
    }

    get prop1() {
      return this._prop1;
    }

    set prop2(value: string) {
      this._prop2 = value;
      this.scheduleRender();
    }

    get prop2() {
      return this._prop2;
    }

    set prop3(value: string) {
      this._prop3 = value;
      this.scheduleRender();
    }

    get prop3() {
      return this._prop3;
    }

    // Method to schedule rendering, respecting suspension
    private scheduleRender() {
      if (this.__webjsx_renderingSuspended) {
        // Defer rendering until resume
        return;
      }
      this.render();
    }

    // Method to suspend rendering
    __webjsx_suspendRendering() {
      this.__webjsx_suspendCalled = true;
      this.__webjsx_renderingSuspended = true;
    }

    // Method to resume rendering
    __webjsx_resumeRendering() {
      this.__webjsx_resumeCalled = true;
      this.__webjsx_renderingSuspended = false;
      this.render(); // Perform a single render after resumption
    }

    // Render method increments the renderCallCount
    render() {
      this.renderCallCount++;
      this.textContent = `Props: ${this.prop1}, ${this.prop2}, ${this.prop3}`;
    }

    // Remove render call from connectedCallback
    connectedCallback() {
      // Do not call render here to prevent multiple render calls
    }
  }

  // Register the custom element if not already defined
  if (!customElements.get("suspended-element")) {
    customElements.define("suspended-element", SuspendedElement);
  }

  class NonSuspendedElement extends HTMLElement {
    public renderCallCount: number = 0;

    private _prop1: number = 0;
    private _prop2: number = 1;

    set prop1(value: number) {
      this._prop1 = value;
      this.render();
    }

    get prop1() {
      return this._prop1;
    }

    set prop2(value: number) {
      this._prop2 = value;
      this.render();
    }

    get prop2() {
      return this._prop2;
    }

    // Render method increments the renderCallCount
    render() {
      this.renderCallCount++;
      this.textContent = `Props: ${this.prop1}, ${this.prop2}`;
    }

    connectedCallback() {
      this.render();
    }
  }

  // Register the custom element if not already defined
  if (!customElements.get("non-suspended-element")) {
    customElements.define("non-suspended-element", NonSuspendedElement);
  }

  it("should call render multiple times without suspend/resume functions", () => {
    // Define a custom element without suspend/resume functions

    // Initial VDOM with initial props
    const initialVdom = createElement("non-suspended-element", {
      prop1: "initial1",
      prop2: "initial2",
    });
    applyDiff(container, initialVdom);

    // Fetch the custom element instance from the DOM
    const nonSuspendedElement = container.querySelector(
      "non-suspended-element"
    ) as NonSuspendedElement;

    // Verify initial render
    expect(nonSuspendedElement.renderCallCount).to.equal(3);
  });

  it("should suspend and resume rendering correctly with custom element", () => {
    // Initial VDOM with initial props
    const initialVdom = createElement("suspended-element", {
      prop1: "initial1",
      prop2: "initial2",
      prop3: "initial3",
    });
    applyDiff(container, initialVdom);

    // Fetch the custom element instance from the DOM
    const suspendedElement = container.querySelector(
      "suspended-element"
    ) as SuspendedElement;

    // Verify initial render
    expect(suspendedElement.renderCallCount).to.equal(1);
    expect(suspendedElement.textContent).to.equal(
      "Props: initial1, initial2, initial3"
    );

    // Verify suspension and resumption were called
    expect(suspendedElement.__webjsx_suspendCalled).to.be.true;
    expect(suspendedElement.__webjsx_resumeCalled).to.be.true;
    expect(suspendedElement.__webjsx_renderingSuspended).to.be.false;

    // Reset the suspension flags for the next update
    suspendedElement.__webjsx_suspendCalled = false;
    suspendedElement.__webjsx_resumeCalled = false;

    // Updated VDOM with multiple prop changes
    const updatedVdom = createElement("suspended-element", {
      prop1: "updated1",
      prop2: "updated2",
      prop3: "updated3",
    });
    applyDiff(container, updatedVdom);

    // Verify that suspension and resumption were called again
    expect(suspendedElement.__webjsx_suspendCalled).to.be.true;
    expect(suspendedElement.__webjsx_resumeCalled).to.be.true;

    // Verify that render was called only once more
    expect(suspendedElement.renderCallCount).to.equal(2);
    expect(suspendedElement.textContent).to.equal(
      "Props: updated1, updated2, updated3"
    );
  });

  it("should handle content updates without rendering suspension for regular elements", () => {
    // Initial VDOM
    const initialVdom = createElement(
      "div",
      { id: "test-div" },
      "Initial content"
    );
    applyDiff(container, initialVdom);

    // Fetch the regular div
    const regularDiv = container.querySelector("div#test-div") as HTMLElement;

    // Verify initial render
    expect(regularDiv.textContent).to.equal("Initial content");
    expect(regularDiv.getAttribute("id")).to.equal("test-div");
    expect((regularDiv as any).__webjsx_suspendRendering).to.be.undefined;

    // Update VDOM with multiple prop changes
    const updatedVdom = createElement(
      "div",
      { id: "test-div", "data-test": "new" },
      "Updated content"
    );
    applyDiff(container, updatedVdom);

    // Check if content was updated without suspension
    expect(regularDiv.textContent).to.equal("Updated content");
    expect(regularDiv.getAttribute("data-test")).to.equal("new");
  });
});
