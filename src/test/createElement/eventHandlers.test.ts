import "../../test/setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Event Handlers", () => {
  it("should handle event handlers with HTML-style naming", () => {
    const onClick = () => {};
    const vdom = createElement("button", { onclick: onClick }, "Click Me");
    expect((vdom as VElement).props.onclick).to.equal(onClick);
    expect((vdom as VElement).props.children).to.deep.equal(["Click Me"]);
  });
});
