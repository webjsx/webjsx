import "../../test/setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Props Handling", () => {
  it("should handle string props as attributes and non-string props as properties", () => {
    const vdom = createElement("div", { id: "test", customProp: 123 });
    expect((vdom as VElement).props.id).to.equal("test");
    expect((vdom as VElement).props.customProp).to.equal(123);
  });
});
