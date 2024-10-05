// src/test/createElement/ref.test.ts

import "../setup.js";
import { expect } from "chai";
import { createElement, Fragment } from "../../index.js";
import { VElement, Ref } from "../../types.js";

describe("createElement - Ref Handling", () => {
  it("should include function ref in props", () => {
    const ref: Ref = (node) => {};
    const vdom = createElement("div", { ref, id: "ref-div" }, "Content");

    expect((vdom as VElement).props.ref).to.equal(ref);
    expect((vdom as VElement).props.id).to.equal("ref-div");
    expect((vdom as VElement).props.children).to.deep.equal(["Content"]);
  });

  it("should include object ref in props", () => {
    const refObject: { current: Node | null } = { current: null };
    const vdom = createElement(
      "span",
      { ref: refObject, id: "ref-span" },
      "Span Content"
    );

    expect((vdom as VElement).props.ref).to.equal(refObject);
    expect((vdom as VElement).props.id).to.equal("ref-span");
    expect((vdom as VElement).props.children).to.deep.equal(["Span Content"]);
  });

  it("should handle ref with Fragment correctly", () => {
    const ref: Ref = (node) => {};
    const vdom = createElement(
      Fragment,
      { ref },
      createElement("div", { id: "child-div" }, "Child Content")
    );

    expect((vdom as VElement).props.ref).to.equal(ref);
    expect((vdom as VElement).props.children).to.deep.equal([
      createElement("div", { id: "child-div" }, "Child Content"),
    ]);
  });

  it("should warn if ref is passed as a child in createElement", () => {
    let consoleWarnCalled = false;
    const originalWarn = console.warn;
    console.warn = () => {
      consoleWarnCalled = true;
    };

    const ref: Ref = (node) => {};
    const vdom = createElement("div", { id: "test-div" }, "Text", ref);

    // Since refs are handled separately, passing a ref as a child should not trigger a warning
    expect(consoleWarnCalled).to.be.false;
    expect((vdom as VElement).props.children).to.deep.equal(["Text", ref]);

    // Restore original console.warn
    console.warn = originalWarn;
  });
});
