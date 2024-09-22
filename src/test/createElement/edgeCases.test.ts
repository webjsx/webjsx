import "../../test/setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Edge Cases", () => {
  it("should ignore null and undefined children", () => {
    const vdom = createElement(
      "div",
      null,
      "Text",
      null,
      undefined,
      createElement("span", null, "Span")
    );
    expect((vdom as VElement).props.children).to.deep.equal([
      "Text",
      createElement("span", null, "Span"),
    ]);
  });

  it("should flatten nested arrays of children", () => {
    const vdom = createElement("div", null, [
      "Child 1",
      ["Child 2", [createElement("span", null, "Nested Span")]],
    ]);
    expect((vdom as VElement).props.children).to.deep.equal([
      "Child 1",
      "Child 2",
      createElement("span", null, "Nested Span"),
    ]);
  });
});
