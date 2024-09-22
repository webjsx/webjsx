import "../../test/setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Keys Handling", () => {
  it("should assign keys correctly", () => {
    const vdom = createElement("li", { key: "item-1" }, "Item 1");
    expect((vdom as VElement).props.key).to.equal("item-1");
  });
});
