import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Event Listeners", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should handle event listeners", () => {
    let clicked = false;
    function onClick() {
      clicked = true;
    }

    const vdom = createElement("button", { onclick: onClick }, "Click Me");
    applyDiff(container, vdom);

    const button = container.querySelector("button");
    expect(button).to.exist;
    expect(button?.textContent).to.equal("Click Me");

    // Simulate click event
    button?.dispatchEvent(new window.Event("click"));
    expect(clicked).to.be.true;
  });
});
