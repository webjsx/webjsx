import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - SVG Rendering", () => {
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

  it("should render an SVG element with correct namespace", () => {
    const vdom = (
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="black"
          strokeWidth="3"
          fill="red"
        />
      </svg>
    );

    applyDiff(container, vdom);

    const svg = container.querySelector("svg");
    expect(svg).to.exist;
    expect(svg?.namespaceURI).to.equal("http://www.w3.org/2000/svg");

    const circle = svg?.querySelector("circle");
    expect(circle).to.exist;
    expect(circle?.namespaceURI).to.equal("http://www.w3.org/2000/svg");
  });

  it("should update an SVG element and maintain the correct namespace", () => {
    const initialVdom = (
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="black"
          strokeWidth="3"
          fill="red"
        />
      </svg>
    );

    const updatedVdom = (
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="blue"
          strokeWidth="5"
          fill="yellow"
        />
      </svg>
    );

    applyDiff(container, initialVdom);
    let svg = container.querySelector("svg");
    expect(svg?.namespaceURI).to.equal("http://www.w3.org/2000/svg");

    // Now apply the updated virtual DOM
    applyDiff(container, updatedVdom);
    svg = container.querySelector("svg");
    expect(svg?.namespaceURI).to.equal("http://www.w3.org/2000/svg");

    const circle = svg?.querySelector("circle");
    expect(circle).to.exist;
    expect(circle?.namespaceURI).to.equal("http://www.w3.org/2000/svg");
  });

  it("should handle SVG elements with namespaces and <use> correctly", () => {
    const vdom = (
      <svg xmlns="http://www.w3.org/2000/svg">
        <use href="#example" />
      </svg>
    );

    applyDiff(container, vdom);

    const svg = container.querySelector("svg");
    expect(svg).to.exist;
    expect(svg?.namespaceURI).to.equal("http://www.w3.org/2000/svg");

    const useElement = svg?.querySelector("use");
    expect(useElement).to.exist;
    expect(useElement?.namespaceURI).to.equal("http://www.w3.org/2000/svg");
  });
});
