import "../setup.js";
import { expect } from "chai";
import { createElement, Fragment } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - Basic Creation", () => {
  it("should create a VElement with type and props", () => {
    const vdom = createElement("div", { id: "test" }, "Hello");
    expect(vdom).to.be.an("object");
    expect((vdom as VElement).type).to.equal("div");
    expect((vdom as VElement).props).to.deep.equal({
      id: "test",
      children: ["Hello"],
    });
  });

  it("should handle empty props", () => {
    const vdom = createElement("div", null);
    expect((vdom as VElement).props).to.deep.equal({});
  });

  it("should handle no children", () => {
    const vdom = createElement("img", { src: "image.png", alt: "An image" });
    expect((vdom as VElement).props.children).to.be.undefined;
    expect((vdom as VElement).props.src).to.equal("image.png");
    expect((vdom as VElement).props.alt).to.equal("An image");
  });
});
