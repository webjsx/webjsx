import "./setup.js";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../applyDiff.js";
import { createElement, Fragment } from "../index.js";

describe("applyDiff", () => {
  let dom: JSDOM;
  let document: Document;
  let container: HTMLElement;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`, {
      runScripts: "dangerously",
    });
    document = dom.window.document;
    container = document.getElementById("app") as HTMLElement;
  });

  it("should render a simple element", () => {
    const vdom = createElement("p", { id: "para" }, "Hello World");
    applyDiff(container, vdom);

    const p = container.querySelector("p");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Hello World");
    expect(p?.getAttribute("id")).to.equal("para");
  });

  it("should update existing elements with new props", () => {
    const initialVdom = createElement(
      "div",
      { id: "container", class: "old-class" },
      "Initial"
    );
    applyDiff(container, initialVdom);

    let div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Initial");
    expect(div?.getAttribute("id")).to.equal("container");
    expect(div?.getAttribute("class")).to.equal("old-class");

    const updatedVdom = createElement(
      "div",
      { id: "container", class: "new-class" },
      "Updated"
    );
    applyDiff(container, updatedVdom);

    div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Updated");
    expect(div?.getAttribute("class")).to.equal("new-class");
  });

  it("should handle string props using setAttribute and non-string props as direct properties", () => {
    const vdom = createElement("div", { id: "test", customProp: 123 }, "Test");
    applyDiff(container, vdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.getAttribute("id")).to.equal("test");
    expect((div as any).customProp).to.equal(123); // Direct property assignment
  });

  it("should add and remove elements correctly", () => {
    const initialVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "2" }, "Item 2")
    );
    applyDiff(container, initialVdom);

    let ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(2);

    const updatedVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "3" }, "Item 3"),
      createElement("li", { key: "2" }, "Item 2")
    );
    applyDiff(container, updatedVdom);

    ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(3);
    expect(ul?.children[1].textContent).to.equal("Item 3");
  });

  it("should handle event listeners", () => {
    let clicked = false;
    function onClick() {
      clicked = true;
    }

    const vdom = createElement("button", { onclick: onClick }, "Click Me");
    applyDiff(container, vdom);

    const button = container.querySelector("button");
    expect(button).to.exist;
    expect(button?.textContent).to.equal("Click Me");

    // Simulate click event
    button?.dispatchEvent(new dom.window.Event("click"));
    expect(clicked).to.be.true;
  });

  it("should handle fragments correctly", () => {
    const vdom = createElement(
      Fragment,
      null,
      createElement("h1", null, "Title"),
      createElement("p", null, "Paragraph")
    );
    applyDiff(container, vdom);

    const h1 = container.querySelector("h1");
    const p = container.querySelector("p");
    expect(h1).to.exist;
    expect(h1?.textContent).to.equal("Title");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Paragraph");
  });

  it("should replace nodes when types differ", () => {
    const initialVdom = createElement("span", null, "Text");
    applyDiff(container, initialVdom);

    let span = container.querySelector("span");
    expect(span).to.exist;
    expect(span?.textContent).to.equal("Text");

    const updatedVdom = createElement("div", null, "New Text");
    applyDiff(container, updatedVdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("New Text");
    span = container.querySelector("span");
    expect(span).to.not.exist;
  });

  it("should handle multiple updates efficiently", () => {
    const vdom1 = createElement("div", { id: "first" }, "First");
    applyDiff(container, vdom1);

    const vdom2 = createElement("div", { id: "second" }, "Second");
    applyDiff(container, vdom2);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.getAttribute("id")).to.equal("second");
    expect(div?.textContent).to.equal("Second");
  });

  it("should handle keys correctly during reordering", () => {
    const initialVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "2" }, "Item 2"),
      createElement("li", { key: "3" }, "Item 3")
    );
    applyDiff(container, initialVdom);

    const updatedVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "3" }, "Item 3"),
      createElement("li", { key: "1" }, "Item 1"),
      createElement("li", { key: "2" }, "Item 2")
    );
    applyDiff(container, updatedVdom);

    const ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(3);
    expect(ul?.children[0].getAttribute("data-key")).to.equal("3");
    expect(ul?.children[1].getAttribute("data-key")).to.equal("1");
    expect(ul?.children[2].getAttribute("data-key")).to.equal("2");
  });

  it("should remove old unkeyed nodes if new VNodes have fewer nodes", () => {
    const initialVdom = createElement(
      "div",
      null,
      createElement("p", null, "Paragraph 1"),
      createElement("p", null, "Paragraph 2"),
      createElement("p", null, "Paragraph 3")
    );
    applyDiff(container, initialVdom);

    const updatedVdom = createElement(
      "div",
      null,
      createElement("p", null, "Paragraph 1"),
      createElement("p", null, "Paragraph 3")
    );
    applyDiff(container, updatedVdom);

    const ps = container.querySelectorAll("p");
    expect(ps).to.have.lengthOf(2);
    expect(ps[0].textContent).to.equal("Paragraph 1");
    expect(ps[1].textContent).to.equal("Paragraph 3");
  });

  it("should replace a fragment with an element", () => {
    const initialVdom = createElement(
      Fragment,
      null,
      createElement("span", null, "Span 1"),
      createElement("span", null, "Span 2")
    );
    applyDiff(container, initialVdom);

    let spans = container.querySelectorAll("span");
    expect(spans).to.have.lengthOf(2);

    const updatedVdom = createElement("div", null, "Div Content");
    applyDiff(container, updatedVdom);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Div Content");
    spans = container.querySelectorAll("span");
    expect(spans).to.have.lengthOf(0);
  });

  it("should handle updating text nodes", () => {
    const initialVdom = createElement("div", null, "Initial Text");
    applyDiff(container, initialVdom);

    let div = container.querySelector("div");
    expect(div?.textContent).to.equal("Initial Text");

    const updatedVdom = createElement("div", null, "Updated Text");
    applyDiff(container, updatedVdom);

    div = container.querySelector("div");
    expect(div?.textContent).to.equal("Updated Text");
  });

  it("should handle multiple root nodes", () => {
    const vdom = [
      createElement("h1", null, "Title"),
      createElement("p", null, "Paragraph"),
      createElement("button", { onclick: () => {} }, "Button"),
    ];
    applyDiff(container, vdom);

    const h1 = container.querySelector("h1");
    const p = container.querySelector("p");
    const button = container.querySelector("button");

    expect(h1).to.exist;
    expect(p).to.exist;
    expect(button).to.exist;
  });
});
