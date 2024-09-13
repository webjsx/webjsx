import {
  BasicPrimitive,
  MountedElement,
  RenderedNode,
  VirtualComponent,
  VirtualElement,
  VirtualFragment
} from "./index.js";

// Utility function to flatten child elements
export function flatten(child: RenderedNode | RenderedNode[]): RenderedNode[] {
  const recurse = (item: RenderedNode | RenderedNode[]): RenderedNode[] =>
    Array.isArray(item)
      ? item.flatMap(recurse)
      : isVirtualFragment(item)
      ? item.children.flatMap(recurse)
      : item !== undefined
      ? [item]
      : [];

  // Start recursion from the root child
  return recurse(child);
}

export function isVirtualComponent(
  node: RenderedNode
): node is VirtualComponent {
  return node !== undefined && (node as VirtualComponent).type === "COMPONENT";
}

export function isVirtualFragment(node: RenderedNode): node is VirtualFragment {
  return node !== undefined && (node as VirtualFragment).type === "FRAGMENT";
}

export function isVirtualElement(node: RenderedNode): node is VirtualElement {
  return node !== undefined && (node as VirtualElement).type === "ELEMENT";
}

export function isPrimitive(node: RenderedNode): node is BasicPrimitive {
  return (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "boolean" ||
    typeof node === "bigint"
  );
}

// Utility function to check if an element has a mounted component
export function isMountedElement(
  element: HTMLElement
): element is MountedElement {
  return (element as any).__webjsxComponent !== undefined;
}
