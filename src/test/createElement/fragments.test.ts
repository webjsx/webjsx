import "../setup.js";
import { expect } from "chai";
import { createElement, Fragment } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Fragments", () => {
  it("should support fragments", () => {
    const vdom = createElement(
      Fragment,
      null,
      createElement("p", null, "Paragraph 1"),
      createElement("p", null, "Paragraph 2")
    );

    expect((vdom as VElement).type).to.equal(Fragment);
    expect((vdom as VElement).props.children).to.have.lengthOf(2);
    expect(((vdom as VElement).props.children![0] as VElement).type).to.equal(
      "p"
    );
    expect(((vdom as VElement).props.children![1] as VElement).type).to.equal(
      "p"
    );
  });
});
