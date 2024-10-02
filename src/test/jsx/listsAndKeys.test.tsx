import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - Lists and Keys", () => {
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

  it("should handle lists in JSX with keys", () => {
    const items = ["Apple", "Banana", "Cherry"];

    const vdom = (
      <ul>
        {items.map((item, index) => (
          <li key={index} data-key={index}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const ul = container.querySelector("ul");
    expect(ul).to.exist;
    const lis = ul?.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis?.[0].getAttribute("data-key")).to.equal("0");
    expect(lis?.[1].getAttribute("data-key")).to.equal("1");
    expect(lis?.[2].getAttribute("data-key")).to.equal("2");
    expect(lis?.[0].textContent).to.equal("Apple");
    expect(lis?.[1].textContent).to.equal("Banana");
    expect(lis?.[2].textContent).to.equal("Cherry");
  });
});
