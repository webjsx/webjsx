import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../../applyDiff.js";
import * as webjsx from "../../index.js";
import "../setup.js";

describe("JSX Syntax - dangerouslySetInnerHTML", () => {
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

  it("should render HTML content using dangerouslySetInnerHTML in JSX", () => {
    const htmlContent = `<h2>JSX Title</h2><p>Paragraph with <strong>bold</strong> text.</p>`;
    const vdom = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);
    expect(div?.children.length).to.equal(2);
    expect(div?.querySelector("h2")?.textContent).to.equal("JSX Title");
    expect(div?.querySelector("p")?.innerHTML).to.equal(
      "Paragraph with <strong>bold</strong> text."
    );
  });

  it("should update HTML content using dangerouslySetInnerHTML in JSX", () => {
    const initialHTML = `<span>Initial <em>HTML</em> Content</span>`;
    const updatedHTML = `<span>Updated <em>HTML</em> Content</span>`;

    const initialVdom = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: initialHTML }}
      ></div>
    );
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(initialHTML);

    const updatedVdom = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: updatedHTML }}
      ></div>
    );
    applyDiff(container, updatedVdom);

    div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(updatedHTML);
  });

  it("should ignore children in JSX when dangerouslySetInnerHTML is present", () => {
    const htmlContent = `<p>Direct HTML Content</p>`;
    const vdom = (
      <div id="jsx-html-div" dangerouslySetInnerHTML={{ __html: htmlContent }}>
        <span>Ignored Child</span>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);
    const ignoredChild = div?.querySelector("span");
    expect(ignoredChild).to.not.exist;
  });

  it("should remove innerHTML when updating from dangerouslySetInnerHTML to normal children in JSX", () => {
    const htmlContent = `<h3>Initial HTML</h3>`;
    const normalChild = <span>New Text Content</span>;

    // Initial render with dangerouslySetInnerHTML
    const initialVdom = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></div>
    );
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);

    // Update VDOM to use normal children instead of dangerouslySetInnerHTML
    const updatedVdom = <div id="jsx-html-div">{normalChild}</div>;
    applyDiff(container, updatedVdom);

    div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("New Text Content");
    expect(div?.innerHTML).to.equal("<span>New Text Content</span>");
  });

  it("should handle switching between dangerouslySetInnerHTML and normal children in JSX", () => {
    const initialHTML = `<div><p>Initial HTML Content</p></div>`;
    const updatedHTML = `<div><p>Updated HTML Content</p></div>`;
    const normalChild = <span>Normal Child Content</span>;

    // Initial render with dangerouslySetInnerHTML
    const initialVdom = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: initialHTML }}
      ></div>
    );
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(initialHTML);

    // Update VDOM with new dangerouslySetInnerHTML
    const updatedVdomWithHTML = (
      <div
        id="jsx-html-div"
        dangerouslySetInnerHTML={{ __html: updatedHTML }}
      ></div>
    );
    applyDiff(container, updatedVdomWithHTML);

    div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(updatedHTML);

    // Update VDOM to use normal children instead of dangerouslySetInnerHTML
    const updatedVdomWithChild = <div id="jsx-html-div">{normalChild}</div>;
    applyDiff(container, updatedVdomWithChild);

    div = container.querySelector("div#jsx-html-div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Normal Child Content");
    expect(div?.innerHTML).to.equal("<span>Normal Child Content</span>");
  });
});
