import * as webjsx from "../../index.js";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import "../setup.js";

describe("JSX Syntax - Ref Support", () => {
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

  it("should assign function ref to a JSX element", () => {
    let refNode: Node | null = null;
    const ref = (node: Node | null) => {
      refNode = node;
    };

    const vdom = (
      <div ref={ref} id="jsx-ref-div">
        Function Ref
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#jsx-ref-div");
    expect(div).to.exist;
    expect(refNode).to.equal(div);
    expect((refNode! as Element).textContent).to.equal("Function Ref");
  });

  it("should assign object ref to a JSX element", () => {
    const refObject: { current: Node | null } = { current: null };

    const vdom = (
      <span ref={refObject} id="jsx-ref-span">
        Object Ref
      </span>
    );

    applyDiff(container, vdom);

    const span = container.querySelector("span#jsx-ref-span");
    expect(span).to.exist;
    expect(refObject.current).to.equal(span);
    expect(refObject.current?.textContent).to.equal("Object Ref");
  });

  it("should update refs when elements are replaced in JSX", () => {
    let refNode1: Node | null = null;
    const ref1 = (node: Node | null) => {
      refNode1 = node;
    };

    let refNode2: Node | null = null;
    const ref2 = (node: Node | null) => {
      refNode2 = node;
    };

    const initialVdom = (
      <div>
        <button ref={ref1} id="jsx-ref-button1">
          Button 1
        </button>
      </div>
    );

    applyDiff(container, initialVdom);

    const button1 = container.querySelector("button#jsx-ref-button1");
    expect(button1).to.exist;
    expect(refNode1).to.equal(button1);

    // Replace Button 1 with Button 2
    const updatedVdom = (
      <div>
        <button ref={ref2} id="jsx-ref-button2">
          Button 2
        </button>
      </div>
    );

    applyDiff(container, updatedVdom);

    const button2 = container.querySelector("button#jsx-ref-button2");
    expect(button2).to.exist;
    expect(refNode2).to.equal(button2);
    expect(refNode1).to.be.null;
  });

  it("should handle multiple refs in JSX fragments", () => {
    let refNode1: Node | null = null;
    const ref1 = (node: Node | null) => {
      refNode1 = node;
    };

    let refNode2: Node | null = null;
    const ref2 = (node: Node | null) => {
      refNode2 = node;
    };

    const vdom = (
      <>
        <div ref={ref1} id="jsx-ref-div1">
          Div 1
        </div>
        <div ref={ref2} id="jsx-ref-div2">
          Div 2
        </div>
      </>
    );

    applyDiff(container, vdom);

    const div1 = container.querySelector("div#jsx-ref-div1");
    const div2 = container.querySelector("div#jsx-ref-div2");

    expect(div1).to.exist;
    expect(div2).to.exist;
    expect(refNode1).to.equal(div1);
    expect(refNode2).to.equal(div2);
  });

  it("should release refs when JSX elements are removed", () => {
    let refNode: Node | null = null;
    const ref = (node: Node | null) => {
      refNode = node;
    };

    const initialVdom = (
      <div>
        <p ref={ref} id="jsx-ref-p">
          To be removed
        </p>
      </div>
    );

    applyDiff(container, initialVdom);

    const p = container.querySelector("p#jsx-ref-p");
    expect(p).to.exist;
    expect(refNode).to.equal(p);

    // Remove the <p> element
    const updatedVdom = <div></div>;
    applyDiff(container, updatedVdom);

    expect(container.querySelector("p#jsx-ref-p")).to.not.exist;
    expect(refNode).to.be.null;
  });

  it("should handle refs within lists in JSX", () => {
    let refs: { [key: string]: Node | null } = {};

    const refCallback = (key: string) => (node: Node | null) => {
      refs[key] = node;
    };

    const vdom = (
      <ul>
        <li ref={refCallback("item1")} key="1">
          Item 1
        </li>
        <li ref={refCallback("item2")} key="2">
          Item 2
        </li>
        <li ref={refCallback("item3")} key="3">
          Item 3
        </li>
      </ul>
    );

    applyDiff(container, vdom);

    const li1 = container.querySelector("li[key='1']");
    const li2 = container.querySelector("li[key='2']");
    const li3 = container.querySelector("li[key='3']");

    expect(li1).to.exist;
    expect(li2).to.exist;
    expect(li3).to.exist;
    expect(refs["item1"]).to.equal(li1);
    expect(refs["item2"]).to.equal(li2);
    expect(refs["item3"]).to.equal(li3);

    // Reorder the list
    const updatedVdom = (
      <ul>
        <li ref={refCallback("item3")} key="3">
          Item 3
        </li>
        <li ref={refCallback("item1")} key="1">
          Item 1 Updated
        </li>
        <li ref={refCallback("item2")} key="2">
          Item 2
        </li>
      </ul>
    );

    applyDiff(container, updatedVdom);

    const updatedLi1 = container.querySelector("li[key='1']");
    const updatedLi2 = container.querySelector("li[key='2']");
    const updatedLi3 = container.querySelector("li[key='3']");

    expect(updatedLi1).to.exist;
    expect(updatedLi2).to.exist;
    expect(updatedLi3).to.exist;
    expect(refs["item1"]).to.equal(updatedLi1);
    expect(refs["item2"]).to.equal(updatedLi2);
    expect(refs["item3"]).to.equal(updatedLi3);
    expect(updatedLi1?.textContent).to.equal("Item 1 Updated");
  });
});
