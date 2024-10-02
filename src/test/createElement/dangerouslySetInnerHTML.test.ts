import "../setup.js";
import { expect } from "chai";
import { createElement } from "../../index.js";
import { VElement } from "../../types.js";

describe("createElement - dangerouslySetInnerHTML", () => {
  it("should create a VElement with dangerouslySetInnerHTML and no children", () => {
    const htmlContent = `<div><h1>Title</h1></div>`;
    const vdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "html-div",
    });

    expect(vdom).to.be.an("object");
    expect((vdom as VElement).type).to.equal("div");
    expect((vdom as VElement).props).to.deep.equal({
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "html-div",
    });
  });

  it("should ignore children when dangerouslySetInnerHTML is provided", () => {
    const htmlContent = `<p>HTML Paragraph</p>`;
    const child = createElement("span", null, "Ignored Span");
    const vdom = createElement(
      "div",
      { dangerouslySetInnerHTML: { __html: htmlContent }, id: "html-div" },
      child
    );

    expect((vdom as VElement).props).to.deep.equal({
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "html-div",
    });
  });

  it("should warn when children are provided alongside dangerouslySetInnerHTML", () => {
    // Spy on console.warn
    const originalWarn = console.warn;
    let warningMessage = "";
    console.warn = (message: string) => {
      warningMessage = message;
    };

    const htmlContent = `<span>HTML Content</span>`;
    const child = createElement("div", null, "Ignored Child");
    const vdom = createElement(
      "div",
      { dangerouslySetInnerHTML: { __html: htmlContent }, id: "html-div" },
      child
    );

    expect(warningMessage).to.equal(
      "WebJSX: Ignoring children since dangerouslySetInnerHTML is set."
    );

    // Restore console.warn
    console.warn = originalWarn;
  });
});
