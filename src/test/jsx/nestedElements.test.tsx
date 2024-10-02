import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - Nested Elements", () => {
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

  it("should handle nested JSX elements", () => {
    const vdom = (
      <div class="wrapper">
        <header>
          <h1>Welcome</h1>
        </header>
        <main>
          <p>Main content goes here.</p>
        </main>
        <footer>
          <small>© 2024 WebJSX</small>
        </footer>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div.wrapper");
    expect(div).to.exist;

    const header = div?.querySelector("header");
    const main = div?.querySelector("main");
    const footer = div?.querySelector("footer");

    expect(header).to.exist;
    expect(header?.querySelector("h1")?.textContent).to.equal("Welcome");

    expect(main).to.exist;
    expect(main?.querySelector("p")?.textContent).to.equal(
      "Main content goes here."
    );

    expect(footer).to.exist;
    expect(footer?.querySelector("small")?.textContent).to.equal(
      "© 2024 WebJSX"
    );
  });
});
