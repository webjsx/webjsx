// src/test/applyDiff/ref.test.ts

import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement, Fragment } from "../../index.js";
import "../setup.js";

describe("applyDiff - Ref Support", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should assign function ref to a DOM node", () => {
    let refNode: Node | null = null;
    const ref = (node: Node | null) => {
      refNode = node;
    };

    const vdom = createElement("div", { ref, id: "ref-div" }, "Ref Test");
    applyDiff(container, vdom);

    const div = container.querySelector("div#ref-div");
    expect(div).to.exist;
    expect(refNode).to.equal(div);
    expect((refNode! as Element).textContent).to.equal("Ref Test");
  });

  it("should assign object ref to a DOM node", () => {
    const refObject: { current: Node | null } = { current: null };

    const vdom = createElement(
      "span",
      { ref: refObject, id: "ref-span" },
      "Object Ref"
    );
    applyDiff(container, vdom);

    const span = container.querySelector("span#ref-span");
    expect(span).to.exist;
    expect(refObject.current).to.equal(span);
    expect(refObject.current?.textContent).to.equal("Object Ref");
  });

  it("should update function ref when the node changes", () => {
    let refNode: Node | null = null;
    const ref = (node: Node | null) => {
      refNode = node;
    };

    const initialVdom = createElement(
      "button",
      { ref, id: "ref-button" },
      "Click Me"
    );
    applyDiff(container, initialVdom);

    const button = container.querySelector("button#ref-button");
    expect(button).to.exist;
    expect(refNode).to.equal(button);
    expect((refNode! as Element).textContent).to.equal("Click Me");

    // Update VDOM with a different element and the same ref
    const updatedVdom = createElement(
      "button",
      { ref, id: "ref-button" },
      "Updated Click"
    );
    applyDiff(container, updatedVdom);

    const updatedButton = container.querySelector("button#ref-button");
    expect(updatedButton).to.exist;
    expect(refNode).to.equal(updatedButton);
    expect((refNode! as Element).textContent).to.equal("Updated Click");
  });

  it("should update object ref when the node changes", () => {
    const refObject: { current: Node | null } = { current: null };

    const initialVdom = createElement("input", {
      ref: refObject,
      id: "ref-input",
      type: "text",
    });
    applyDiff(container, initialVdom);

    const input = container.querySelector("input#ref-input");
    expect(input).to.exist;
    expect(refObject.current).to.equal(input);

    // Update VDOM with a different element and the same ref
    const updatedVdom = createElement("input", {
      ref: refObject,
      id: "ref-input",
      type: "password",
    });
    applyDiff(container, updatedVdom);

    const updatedInput = container.querySelector("input#ref-input");
    expect(updatedInput).to.exist;
    expect(refObject.current).to.equal(updatedInput);
    expect(updatedInput?.getAttribute("type")).to.equal("password");
  });

  it("should release function ref when the node is removed", () => {
    let refNode: Node | null = null;
    const ref = (node: Node | null) => {
      refNode = node;
    };

    const vdom = createElement("div", { ref, id: "ref-div" }, "To be removed");
    applyDiff(container, vdom);

    const div = container.querySelector("div#ref-div");
    expect(div).to.exist;
    expect(refNode).to.equal(div);

    // Remove the node by applying an empty VDOM
    applyDiff(container, []);

    expect(container.querySelector("div#ref-div")).to.not.exist;
    expect(refNode).to.be.null;
  });

  it("should release object ref when the node is removed", () => {
    const refObject: { current: Node | null } = { current: null };

    const vdom = createElement(
      "span",
      { ref: refObject, id: "ref-span" },
      "To be removed"
    );
    applyDiff(container, vdom);

    const span = container.querySelector("span#ref-span");
    expect(span).to.exist;
    expect(refObject.current).to.equal(span);

    // Remove the node by applying an empty VDOM
    applyDiff(container, []);

    expect(container.querySelector("span#ref-span")).to.not.exist;
    expect(refObject.current).to.be.null;
  });

  it("should handle multiple refs correctly", () => {
    let refNode1: Node | null = null;
    const ref1 = (node: Node | null) => {
      refNode1 = node;
    };

    const refObject2: { current: Node | null } = { current: null };

    const vdom = createElement(
      Fragment,
      null,
      createElement("div", { ref: ref1, id: "ref-div" }, "First Ref"),
      createElement("p", { ref: refObject2, id: "ref-p" }, "Second Ref")
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#ref-div");
    const p = container.querySelector("p#ref-p");

    expect(div).to.exist;
    expect(p).to.exist;
    expect(refNode1).to.equal(div);
    expect(refObject2.current).to.equal(p);
  });

  it("should update ref when elements are reordered", () => {
    let refNode1: Node | null = null;
    const ref1 = (node: Node | null) => {
      refNode1 = node;
    };

    let refNode2: Node | null = null;
    const ref2 = (node: Node | null) => {
      refNode2 = node;
    };

    const initialVdom = createElement(
      Fragment,
      null,
      createElement("div", { ref: ref1, id: "ref-div1" }, "First"),
      createElement("div", { ref: ref2, id: "ref-div2" }, "Second")
    );

    applyDiff(container, initialVdom);

    const div1 = container.querySelector("div#ref-div1");
    const div2 = container.querySelector("div#ref-div2");

    expect(div1).to.exist;
    expect(div2).to.exist;
    expect(refNode1).to.equal(div1);
    expect(refNode2).to.equal(div2);

    // Reorder the elements
    const updatedVdom = createElement(
      Fragment,
      null,
      createElement("div", { ref: ref2, id: "ref-div2" }, "Second"),
      createElement("div", { ref: ref1, id: "ref-div1" }, "First")
    );

    applyDiff(container, updatedVdom);

    const updatedDiv1 = container.querySelector("div#ref-div1");
    const updatedDiv2 = container.querySelector("div#ref-div2");

    expect(updatedDiv1).to.exist;
    expect(updatedDiv2).to.exist;
    expect(refNode1).to.equal(updatedDiv1);
    expect(refNode2).to.equal(updatedDiv2);
  });

  it("should not call ref functions unnecessarily", () => {
    let callCount = 0;
    const ref = (node: Node | null) => {
      callCount += 1;
    };

    const vdom = createElement("div", { ref, id: "ref-div" }, "Ref Test");
    applyDiff(container, vdom);

    expect(callCount).to.equal(1);

    // Apply the same VDOM again
    applyDiff(container, vdom);

    // Ref should not be called again since the node hasn't changed
    expect(callCount).to.equal(1);
  });

  it("should handle replacing an element with a different ref", () => {
    let refNode1: Node | null = null;
    const ref1 = (node: Node | null) => {
      refNode1 = node;
    };

    let refNode2: Node | null = null;
    const ref2 = (node: Node | null) => {
      refNode2 = node;
    };

    const initialVdom = createElement(
      "div",
      { ref: ref1, id: "ref-div1" },
      "Div 1"
    );
    applyDiff(container, initialVdom);

    const div1 = container.querySelector("div#ref-div1");
    expect(div1).to.exist;
    expect(refNode1).to.equal(div1);

    // Replace the div with a new div with a different ref
    const updatedVdom = createElement(
      "div",
      { ref: ref2, id: "ref-div2" },
      "Div 2"
    );
    applyDiff(container, updatedVdom);

    const div2 = container.querySelector("div#ref-div2");
    expect(div2).to.exist;
    expect(refNode2).to.equal(div2);
    expect(refNode1).to.be.null; // ref1 should have been released
  });

  it("should handle refs on elements within lists", () => {
    let refs: { [key: string]: Node | null } = {};

    const refCallback = (key: string) => (node: Node | null) => {
      refs[key] = node;
    };

    const initialVdom = [
      createElement("li", { ref: refCallback("item1"), key: "1" }, "Item 1"),
      createElement("li", { ref: refCallback("item2"), key: "2" }, "Item 2"),
      createElement("li", { ref: refCallback("item3"), key: "3" }, "Item 3"),
    ];

    applyDiff(container, initialVdom);

    expect(refs["item1"]).to.exist;
    expect(refs["item1"]?.textContent).to.equal("Item 1");
    expect(refs["item2"]).to.exist;
    expect(refs["item2"]?.textContent).to.equal("Item 2");
    expect(refs["item3"]).to.exist;
    expect(refs["item3"]?.textContent).to.equal("Item 3");

    // Reorder the list
    const updatedVdom = [
      createElement("li", { ref: refCallback("item3"), key: "3" }, "Item 3"),
      createElement(
        "li",
        { ref: refCallback("item1"), key: "1" },
        "Item 1 Updated"
      ),
      createElement("li", { ref: refCallback("item2"), key: "2" }, "Item 2"),
    ];

    applyDiff(container, updatedVdom);

    expect(refs["item3"]).to.exist;
    expect(refs["item3"]?.textContent).to.equal("Item 3");
    expect(refs["item1"]).to.exist;
    expect(refs["item1"]?.textContent).to.equal("Item 1 Updated");
    expect(refs["item2"]).to.exist;
    expect(refs["item2"]?.textContent).to.equal("Item 2");
  });
});
