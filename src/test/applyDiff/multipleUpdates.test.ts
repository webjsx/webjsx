import "../../test/setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Multiple Updates", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should handle multiple updates efficiently", () => {
    const vdom1 = createElement("div", { id: "first" }, "First");
    applyDiff(container, vdom1);

    const vdom2 = createElement("div", { id: "second" }, "Second");
    applyDiff(container, vdom2);

    const div = container.querySelector("div");
    expect(div).to.exist;
    expect(div?.getAttribute("id")).to.equal("second");
    expect(div?.textContent).to.equal("Second");
  });
});
