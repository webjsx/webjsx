import "../setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - dangerouslySetInnerHTML", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should render HTML content using dangerouslySetInnerHTML", () => {
    const htmlContent = `<p>Hello, <strong>World!</strong></p>`;
    const vdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "test-div",
    });
    applyDiff(container, vdom);

    const div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);
  });

  it("should update HTML content when dangerouslySetInnerHTML changes", () => {
    const initialHTML = `<span>Initial <em>Content</em></span>`;
    const updatedHTML = `<span>Updated <em>Content</em></span>`;

    const initialVdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: initialHTML },
      id: "test-div",
    });
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(initialHTML);

    const updatedVdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: updatedHTML },
      id: "test-div",
    });
    applyDiff(container, updatedVdom);

    div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(updatedHTML);
  });

  it("should ignore children when dangerouslySetInnerHTML is present", () => {
    const htmlContent = `<p>Direct HTML Content</p>`;
    const vdom = createElement(
      "div",
      { dangerouslySetInnerHTML: { __html: htmlContent }, id: "test-div" },
      createElement("span", null, "Ignored Child")
    );
    applyDiff(container, vdom);

    const div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);
    const ignoredChild = div?.querySelector("span");
    expect(ignoredChild).to.not.exist;
  });

  it("should remove innerHTML when dangerouslySetInnerHTML is removed", () => {
    const htmlContent = `<p>Some HTML Content</p>`;
    const initialVdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "test-div",
    });
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);

    // Update VDOM without dangerouslySetInnerHTML
    const updatedVdom = createElement(
      "div",
      { id: "test-div" },
      "New Text Content"
    );
    applyDiff(container, updatedVdom);

    div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("New Text Content");
    expect(div?.innerHTML).to.equal("New Text Content");
  });

  it("should handle switching between dangerouslySetInnerHTML and normal children", () => {
    const htmlContent = `<p>HTML Content</p>`;
    const normalChild = createElement("span", null, "Normal Child");

    // Initial render with dangerouslySetInnerHTML
    const initialVdom = createElement("div", {
      dangerouslySetInnerHTML: { __html: htmlContent },
      id: "test-div",
    });
    applyDiff(container, initialVdom);

    let div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.innerHTML).to.equal(htmlContent);
    expect(div?.children.length).to.equal(1); // Only the <p> tag

    // Update VDOM to use normal children instead of dangerouslySetInnerHTML
    const updatedVdom = createElement("div", { id: "test-div" }, normalChild);
    applyDiff(container, updatedVdom);

    div = container.querySelector("div#test-div");
    expect(div).to.exist;
    expect(div?.textContent).to.equal("Normal Child");
    expect(div?.innerHTML).to.equal("<span>Normal Child</span>");
    expect(div?.children.length).to.equal(1); // Only the <span> tag
  });
});
