import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - Event Handlers", () => {
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

  it("should handle event listeners on custom web components created with JSX", () => {
    // Define a custom web component
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
        // Placeholder for click handling
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
