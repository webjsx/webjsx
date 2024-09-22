import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Basic Rendering", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should render a simple element", () => {
    const vdom = createElement("p", { id: "para" }, "Hello World");
    applyDiff(container, vdom);

    const p = container.querySelector("p");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Hello World");
    expect(p?.getAttribute("id")).to.equal("para");
  });

  it("should handle updating text nodes", () => {
    const initialVdom = createElement("div", null, "Initial Text");
    applyDiff(container, initialVdom);

    let div = container.querySelector("div");
    expect(div?.textContent).to.equal("Initial Text");

    const updatedVdom = createElement("div", null, "Updated Text");
    applyDiff(container, updatedVdom);

    div = container.querySelector("div");
    expect(div?.textContent).to.equal("Updated Text");
  });

  it("should handle multiple root nodes", () => {
    const vdom = [
      createElement("h1", null, "Title"),
      createElement("p", null, "Paragraph"),
      createElement("button", { onclick: () => {} }, "Button"),
    ];
    applyDiff(container, vdom);

    const h1 = container.querySelector("h1");
    const p = container.querySelector("p");
    const button = container.querySelector("button");

    expect(h1).to.exist;
    expect(p).to.exist;
    expect(button).to.exist;
  });
});
