import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Props Handling", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should update existing elements with new props", () => {
    const initialVdom = createElement(
      "div",
      { id: "container", class: "old-class" },
      "Initial"
    );
    applyDiff(container, initialVdom);

    let div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Initial");
    expect(div?.getAttribute("id")).to.equal("container");
    expect(div?.getAttribute("class")).to.equal("old-class");

    const updatedVdom = createElement(
      "div",
      { id: "container", class: "new-class" },
      "Updated"
    );
    applyDiff(container, updatedVdom);

    div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Updated");
    expect(div?.getAttribute("class")).to.equal("new-class");
  });

  it("should handle string props using setAttribute and non-string props as direct properties", () => {
    const vdom = createElement("div", { id: "test", customProp: 123 }, "Test");
    applyDiff(container, vdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.getAttribute("id")).to.equal("test");
    expect((div as any).customProp).to.equal(123); // Direct property assignment
  });
});
