import "should";
import { JSDOM } from "jsdom";
import { flatten } from "../utils.js"; // Update with the actual path to flatten function
import htmlFile from "./htmlFile.js";
import { RenderedNode, WebJsxFragment } from "../index.js";

export default function () {
  describe("flatten", () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;
    const document = window.document;

    it("should return a flat array when given a single node", () => {
      const node: RenderedNode = document.createElement("div");
      const result = flatten(node);
      result.should.eql([node]);
    });

    it("should flatten an array of nodes", () => {
      const node1: RenderedNode = document.createElement("div");
      const node2: RenderedNode = document.createElement("span");
      const result = flatten([node1, node2]);
      result.should.eql([node1, node2]);
    });

    it("should flatten a nested array of nodes", () => {
      const node1: RenderedNode = document.createElement("div");
      const node2: RenderedNode = document.createElement("span");
      const node3: RenderedNode = document.createElement("p");
      const result = flatten([node1, [node2, node3]]);
      result.should.eql([node1, node2, node3]);
    });

    it("should flatten a fragment with children", () => {
      const fragment: WebJsxFragment = {
        type: "WEBJSX_FRAGMENT",
        children: [
          document.createElement("div"),
          document.createElement("span"),
        ],
      };
      const result = flatten(fragment);
      result.should.eql(fragment.children);
    });

    it("should flatten a fragment with nested children", () => {
      const fragment: WebJsxFragment = {
        type: "WEBJSX_FRAGMENT",
        children: [
          document.createElement("div"),
          {
            type: "WEBJSX_FRAGMENT",
            children: [document.createElement("span")],
          },
        ],
      };
      const result = flatten(fragment);
      result.should.eql([
        fragment.children?.[0],
        (fragment.children?.[1] as WebJsxFragment).children[0],
      ]);
    });

    it("should handle empty fragment children", () => {
      const fragment: WebJsxFragment = {
        type: "WEBJSX_FRAGMENT",
        children: [],
      };
      const result = flatten(fragment);
      result.should.eql([]);
    });

    it("should handle mixed nodes and fragments", () => {
      const node1: RenderedNode = document.createElement("div");
      const fragment: WebJsxFragment = {
        type: "WEBJSX_FRAGMENT",
        children: [document.createElement("span"), document.createElement("p")],
      };
      const result = flatten([node1, fragment]);
      result.should.eql([node1, ...fragment.children!]);
    });
  });
}
