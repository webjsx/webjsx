import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - Self-Closing Elements", () => {
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

  it("should handle self-closing JSX elements", () => {
    const vdom = (
      <div>
        <img src="image.png" alt="Test Image" />
        <br />
        <input type="text" value="Sample" />
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div");
    expect(div).to.exist;

    const img = div?.querySelector("img");
    const br = div?.querySelector("br");
    const input = div?.querySelector("input");

    expect(img).to.exist;
    expect(img?.getAttribute("src")).to.equal("image.png");
    expect(img?.getAttribute("alt")).to.equal("Test Image");

    expect(br).to.exist;

    expect(input).to.exist;
    expect(input?.getAttribute("type")).to.equal("text");
    expect(input?.value).to.equal("Sample"); // Changed from getAttribute to property
  });
});
