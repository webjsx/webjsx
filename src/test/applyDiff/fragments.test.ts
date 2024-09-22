import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement, Fragment } from "../../index.js";

describe("applyDiff - Fragments", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should handle fragments correctly", () => {
    const vdom = createElement(
      Fragment,
      null,
      createElement("h1", null, "Title"),
      createElement("p", null, "Paragraph")
    );
    applyDiff(container, vdom);

    const h1 = container.querySelector("h1");
    const p = container.querySelector("p");
    expect(h1).to.exist;
    expect(h1?.textContent).to.equal("Title");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Paragraph");
  });

  it("should replace a fragment with an element", () => {
    const initialVdom = createElement(
      Fragment,
      null,
      createElement("span", null, "Span 1"),
      createElement("span", null, "Span 2")
    );
    applyDiff(container, initialVdom);

    let spans = container.querySelectorAll("span");
    expect(spans).to.have.lengthOf(2);

    const updatedVdom = createElement("div", null, "Div Content");
    applyDiff(container, updatedVdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Div Content");
    spans = container.querySelectorAll("span");
    expect(spans).to.have.lengthOf(0);
  });
});
