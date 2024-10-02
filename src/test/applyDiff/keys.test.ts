import "../setup.js";
import { expect } from "chai";
import { applyDiff } from "../../applyDiff.js";
import { createElement } from "../../index.js";

describe("applyDiff - Keys Handling", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.getElementById("app") as HTMLElement;
    container.innerHTML = ""; // Clear container before each test
  });

  it("should handle keys correctly during reordering", () => {
    const initialVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "1", "data-key": "1" }, "Item 1"),
      createElement("li", { key: "2", "data-key": "2" }, "Item 2"),
      createElement("li", { key: "3", "data-key": "3" }, "Item 3")
    );
    applyDiff(container, initialVdom);

    const updatedVdom = createElement(
      "ul",
      null,
      createElement("li", { key: "3", "data-key": "3" }, "Item 3"),
      createElement("li", { key: "1", "data-key": "1" }, "Item 1"),
      createElement("li", { key: "2", "data-key": "2" }, "Item 2")
    );
    applyDiff(container, updatedVdom);

    const ul = container.querySelector("ul");
    expect(ul).to.exist;
    expect(ul?.children).to.have.lengthOf(3);
    expect(ul?.children[0].getAttribute("data-key")).to.equal("3");
    expect(ul?.children[1].getAttribute("data-key")).to.equal("1");
    expect(ul?.children[2].getAttribute("data-key")).to.equal("2");
  });
});
