import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js"; 
import "../../test/setup.js"; 

describe("JSX Syntax - Basic Rendering", () => {
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

  it("should render JSX elements correctly", () => {
    const vdom = (
      <div id="container">
        <h1>Hello, JSX!</h1>
        <p>This is a paragraph.</p>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#container");
    expect(div).to.exist;

    const h1 = div?.querySelector("h1");
    const p = div?.querySelector("p");

    expect(h1).to.exist;
    expect(h1?.textContent).to.equal("Hello, JSX!");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("This is a paragraph.");
  });
});
