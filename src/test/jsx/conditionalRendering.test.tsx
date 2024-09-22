import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../../test/setup.js";

describe("JSX Syntax - Conditional Rendering", () => {
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

  it("should handle conditional rendering in JSX", () => {
    const isLoggedIn = true;
    const vdom = (
      <div>{isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}</div>
    );

    applyDiff(container, vdom);

    const p = container.querySelector("p");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Welcome back!");
  });
});
