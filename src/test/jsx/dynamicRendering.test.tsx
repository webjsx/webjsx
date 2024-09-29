import "../../test/setup.js";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";

describe("JSX Syntax - Dynamic Rendering", () => {
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

  it("should handle dynamic children in JSX", () => {
    const items = ["One", "Two", "Three"];
    const vdom = (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const lis = container.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis[0].textContent).to.equal("One");
    expect(lis[1].textContent).to.equal("Two");
    expect(lis[2].textContent).to.equal("Three");
  });
});
