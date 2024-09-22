import "../../test/setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Children Handling", () => {
  it("should handle primitive children", () => {
    const vdom = createElement("span", null, "Text", 123, true);
    expect((vdom as VElement).props.children).to.deep.equal([
      "Text",
      123,
      true,
    ]);
  });

  it("should handle nested elements", () => {
    const vdom = createElement(
      "ul",
      null,
      createElement("li", null, "Item 1"),
      createElement("li", null, "Item 2")
    );

    expect((vdom as VElement).type).to.equal("ul");
    expect((vdom as VElement).props.children).to.have.lengthOf(2);
    expect(((vdom as VElement).props.children![0] as VElement).type).to.equal(
      "li"
    );
    expect(
      ((vdom as VElement).props.children![0] as VElement).props.children
    ).to.deep.equal(["Item 1"]);
  });

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
