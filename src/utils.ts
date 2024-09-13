import { Component, MountedElement, RenderedNode, WebJsxFragment } from "./index.js";

// Utility function to flatten child elements
export function flatten(child: RenderedNode | RenderedNode[]): RenderedNode[] {
  const recurse = (item: RenderedNode | RenderedNode[]): RenderedNode[] =>
    Array.isArray(item)
      ? item.flatMap(recurse)
      : isFragment(item)
      ? item.children
        ? recurse(item.children)
        : []
      : item !== undefined
      ? [item]
      : [];

  // Start recursion from the root child
  return recurse(child);
}

// Utility function to check if an element is a fragment
export function isFragment(element: RenderedNode): element is WebJsxFragment {
  return (
    element !== undefined &&
    (element as WebJsxFragment).type === "WEBJSX_FRAGMENT"
  );
}

export function isMountedElement(
  element: HTMLElement
): element is MountedElement {
  return (
    (element as unknown as { __webjsxComponent: Component<any> })
      .__webjsxComponent !== undefined
  );
}
