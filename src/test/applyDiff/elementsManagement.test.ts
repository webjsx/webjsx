import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Elements Management", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should add and remove elements correctly", () => {
    const initialVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "2" }, "Item 2")
    );
    applyDiff(container, initialVdom);

    let ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(2);

    const updatedVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "3" }, "Item 3"),
      createElement("li", { key: "2" }, "Item 2")
    );
    applyDiff(container, updatedVdom);

    ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(3);
    expect(ul?.children[1].textContent).to.equal("Item 3");
  });

  it("should replace nodes when types differ", () => {
    const initialVdom = createElement("span", null, "Text");
    applyDiff(container, initialVdom);

    let span = container.querySelector("span");
    expect(span).to.exist;
    expect(span?.textContent).to.equal("Text");

    const updatedVdom = createElement("div", null, "New Text");
    applyDiff(container, updatedVdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("New Text");
    span = container.querySelector("span");
    expect(span).to.not.exist;
  });

  it("should remove old unkeyed nodes if new VNodes have fewer nodes", () => {
    const initialVdom = createElement(
      "div",
      null,
      createElement("p", null, "Paragraph 1"),
      createElement("p", null, "Paragraph 2"),
      createElement("p", null, "Paragraph 3")
    );
    applyDiff(container, initialVdom);

    const updatedVdom = createElement(
      "div",
      null,
      createElement("p", null, "Paragraph 1"),
      createElement("p", null, "Paragraph 3")
    );
    applyDiff(container, updatedVdom);

    const ps = container.querySelectorAll("p");
    expect(ps).to.have.lengthOf(2);
    expect(ps[0].textContent).to.equal("Paragraph 1");
    expect(ps[1].textContent).to.equal("Paragraph 3");
  });
});
