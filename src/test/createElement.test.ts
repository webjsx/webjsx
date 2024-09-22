import "./setup.js";
import { expect } from "chai";
import { createElement, Fragment } from "../index.js";
import { VElement } from "../types.js";

describe("createElement", () => {
  it("should create a VElement with type and props", () => {
    const vdom = createElement("div", { id: "test" }, "Hello");
    expect(vdom).to.be.an("object");
    expect((vdom as VElement).type).to.equal("div");
    expect((vdom as VElement).props).to.deep.equal({
      id: "test",
      children: ["Hello"],
    });
  });

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

  it("should handle event handlers with HTML-style naming", () => {
    const onClick = () => {};
    const vdom = createElement("button", { onclick: onClick }, "Click Me");
    expect((vdom as VElement).props.onclick).to.equal(onClick);
    expect((vdom as VElement).props.children).to.deep.equal(["Click Me"]);
  });

  it("should assign keys correctly", () => {
    const vdom = createElement("li", { key: "item-1" }, "Item 1");
    expect((vdom as VElement).props.key).to.equal("item-1");
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

  it("should handle string props as attributes and non-string props as properties", () => {
    const vdom = createElement("div", { id: "test", customProp: 123 });
    expect((vdom as VElement).props.id).to.equal("test");
    expect((vdom as VElement).props.customProp).to.equal(123);
  });
});
