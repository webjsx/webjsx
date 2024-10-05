import { JSDOM } from "jsdom";

import { install as sourceMapInstall } from "source-map-support";
sourceMapInstall();

// Initialize JSDOM with a basic HTML structure
const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`, {
  runScripts: "dangerously",
  resources: "usable",
});

const { window } = dom;

// Assign JSDOM globals to the Node.js global scope
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = {
  userAgent: "node.js",
};
(global as any).Element = window.Element;
(global as any).HTMLElement = window.HTMLElement;
(global as any).Node = window.Node;
(global as any).customElements = window.customElements;
