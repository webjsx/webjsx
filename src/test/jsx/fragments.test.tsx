import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../../test/setup.js";

describe("JSX Syntax - Fragments", () => {
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

  it("should handle fragments in JSX", () => {
    const vdom = (
      <>
        <h2>Title</h2>
        <p>Paragraph inside a fragment.</p>
      </>
    );

    applyDiff(container, vdom);

    const h2 = container.querySelector("h2");
    const p = container.querySelector("p");

    expect(h2).to.exist;
    expect(h2?.textContent).to.equal("Title");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Paragraph inside a fragment.");
  });

  it("should handle fragments with multiple root elements in JSX", () => {
    const vdom = (
      <>
        <h3>Header</h3>
        <section>
          <p>Section paragraph.</p>
        </section>
      </>
    );

    applyDiff(container, vdom);

    const h3 = container.querySelector("h3");
    const section = container.querySelector("section");

    expect(h3).to.exist;
    expect(h3?.textContent).to.equal("Header");
    expect(section).to.exist;
    expect(section?.querySelector("p")?.textContent).to.equal(
      "Section paragraph."
    );
  });
});
