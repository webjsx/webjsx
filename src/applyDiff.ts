// src/applyDiff.ts

import { VNode, VElement, Fragment } from "./types.js";
import { createDomNode, updateAttributes } from "./utils.js";

/**
 * Applies the differences between the new virtual node(s) and the existing DOM.
 * @param parent The parent DOM node where the virtual nodes will be applied.
 * @param newVirtualNode A single virtual node or an array of virtual nodes.
 */
export function applyDiff(parent: Node, newVirtualNode: VNode | VNode[]): void {
  const newVNodes = Array.isArray(newVirtualNode)
    ? newVirtualNode
    : [newVirtualNode];
  diffChildren(parent, newVNodes);
}

/**
 * Diffs and updates the children of a DOM node based on the new virtual nodes.
 * @param parent The parent DOM node whose children will be diffed.
 * @param newVNodes An array of new virtual nodes.
 */
function diffChildren(parent: Node, newVNodes: VNode[]): void {
  const existingNodes = Array.from(parent.childNodes);
  const keyedMap = new Map<string | number, Node>();

  // Populate keyedMap with existing keyed nodes
  existingNodes.forEach((node) => {
    const key = (node as any).__webjsx_key;
    if (key != null) {
      keyedMap.set(key, node);
    }
  });

  let lastIndex = 0;

  for (let i = 0; i < newVNodes.length; i++) {
    const newVNode = newVNodes[i];
    const newKey = isVElement(newVNode) ? newVNode.props.key : undefined;
    let existingNode: Node | null = null;

    if (newKey != null) {
      existingNode = keyedMap.get(newKey) || null;
    }

    if (!existingNode && newKey == null) {
      existingNode = parent.childNodes[i] || null; // **Change Here**
    }

    if (existingNode) {
      const shouldMove = existingNode !== parent.childNodes[i]; // **Change Here**
      if (shouldMove) {
        parent.insertBefore(existingNode, parent.childNodes[i] || null); // **Change Here**
      }
      updateNode(existingNode, newVNode);
      lastIndex = i;
    } else {
      // Create and insert new node
      const newDomNode = createDomNode(newVNode);

      // Assign key attributes if present
      if (isVElement(newVNode) && newVNode.props.key != null) {
        (newDomNode as any).__webjsx_key = newVNode.props.key;
        (newDomNode as HTMLElement).setAttribute(
          "key",
          String(newVNode.props.key)
        );
      }

      parent.insertBefore(newDomNode, parent.childNodes[i] || null); // **Change Here**
    }
  }

  // Remove old nodes that are not in newVNodes
  const newKeys = newVNodes
    .filter(isVElementWithKey)
    .map((vnode) => vnode.props.key);

  existingNodes.forEach((node) => {
    const key = (node as any).__webjsx_key;
    if (key != null && !newKeys.includes(key)) {
      parent.removeChild(node);
    }
  });

  // Handle unkeyed nodes removal
  if (newVNodes.length < existingNodes.length) {
    for (let i = newVNodes.length; i < existingNodes.length; i++) {
      parent.removeChild(existingNodes[i]);
    }
  }
}

/**
 * Updates a DOM node to match the new virtual node.
 * @param domNode The existing DOM node to be updated.
 * @param newVNode The new virtual node to apply.
 */
function updateNode(domNode: Node, newVNode: VNode): void {
  if (
    typeof newVNode === "string" ||
    typeof newVNode === "number" ||
    typeof newVNode === "boolean"
  ) {
    if (
      domNode.nodeType !== Node.TEXT_NODE ||
      domNode.textContent !== String(newVNode)
    ) {
      const newTextNode = document.createTextNode(String(newVNode));
      domNode.parentNode?.replaceChild(newTextNode, domNode);
    }
    return;
  }

  if (newVNode.type === Fragment) {
    // Handle Fragment
    if (domNode instanceof DocumentFragment) {
      diffChildren(domNode, newVNode.props.children || []);
    } else {
      const fragment = document.createDocumentFragment();
      if (newVNode.props.children) {
        newVNode.props.children.forEach((child) => {
          fragment.appendChild(createDomNode(child));
        });
      }
      domNode.parentNode?.replaceChild(fragment, domNode);
    }
    return;
  }

  if (
    domNode instanceof HTMLElement &&
    domNode.tagName.toLowerCase() === (newVNode.type as string).toLowerCase()
  ) {
    // Update attributes
    const oldProps = (domNode as any).__webjsx_props || {};
    const newProps = newVNode.props || {};
    updateAttributes(domNode, newProps, oldProps);
    (domNode as any).__webjsx_props = newProps;

    // Handle the key attribute (use data-key now)
    if (isVElement(newVNode) && newVNode.props.key != null) {
      (domNode as any).__webjsx_key = newVNode.props.key;
      domNode.setAttribute("data-key", String(newVNode.props.key)); // Change here
    } else {
      // Remove the key if it doesn't exist in newProps
      delete (domNode as any).__webjsx_key;
      domNode.removeAttribute("data-key"); // Change here
    }

    // Update children
    const newChildren = newProps.children || [];
    diffChildren(domNode, newChildren);
  } else {
    // Replace the node
    const newDomNode = createDomNode(newVNode);

    // Assign key attributes if present (use data-key now)
    if (isVElement(newVNode) && newVNode.props.key != null) {
      (newDomNode as any).__webjsx_key = newVNode.props.key;
      (newDomNode as HTMLElement).setAttribute(
        "data-key",
        String(newVNode.props.key)
      ); // Change here
    }

    domNode.parentNode?.replaceChild(newDomNode, domNode);
  }
}

/**
 * Type guard to check if a VNode is a VElement.
 * @param vnode The virtual node to check.
 * @returns True if vnode is a VElement, false otherwise.
 */
function isVElement(vnode: VNode): vnode is VElement {
  return typeof vnode === "object" && vnode !== null && "props" in vnode;
}

/**
 * Type guard to check if a VNode is a VElement with a key.
 * @param vnode The virtual node to check.
 * @returns True if vnode is a VElement with a key, false otherwise.
 */
function isVElementWithKey(
  vnode: VNode
): vnode is VElement & { props: { key: string | number } } {
  return isVElement(vnode) && vnode.props.key != null;
}
