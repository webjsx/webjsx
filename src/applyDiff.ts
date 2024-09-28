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
 * Flattens the list of virtual nodes by replacing Fragments with their children.
 * @param vnodes The array of virtual nodes to flatten.
 * @returns A new array of virtual nodes with Fragments flattened.
 */
function flattenVNodes(vnodes: VNode[]): VNode[] {
  const flat: VNode[] = [];
  vnodes.forEach((vnode) => {
    if (isFragment(vnode)) {
      flat.push(...(vnode.props.children || []));
    } else {
      flat.push(vnode);
    }
  });
  return flat;
}

/**
 * Type guard to check if a VNode is a Fragment.
 * @param vnode The virtual node to check.
 * @returns True if vnode is a Fragment, false otherwise.
 */
function isFragment(vnode: VNode): vnode is VElement {
  return typeof vnode === "object" && vnode !== null && vnode.type === Fragment;
}

/**
 * Diffs and updates the children of a DOM node based on the new virtual nodes.
 * @param parent The parent DOM node whose children will be diffed.
 * @param newVNodes An array of new virtual nodes.
 */
function diffChildren(parent: Node, newVNodes: VNode[]): void {
  // Step 1: Flatten the newVNodes by replacing Fragments with their children
  const flattenedVNodes = flattenVNodes(newVNodes);

  // Step 2: Collect existing child nodes
  const existingNodes = Array.from(parent.childNodes);
  const keyedMap = new Map<string | number, Node>();

  // Populate keyedMap with existing keyed nodes
  existingNodes.forEach((node) => {
    const key = (node as any).__webjsx_key;
    if (key != null) {
      keyedMap.set(key, node);
    }
  });

  // Step 3: Remove old keyed nodes not present in newVNodes
  const newKeys = flattenedVNodes
    .filter(isVElementWithKey)
    .map((vnode) => vnode.props.key);
  existingNodes.forEach((node) => {
    const key = (node as any).__webjsx_key;
    if (key != null && !newKeys.includes(key)) {
      parent.removeChild(node);
    }
  });

  // Step 4: Handle insertions and updates
  flattenedVNodes.forEach((newVNode, i) => {
    const newKey = isVElement(newVNode) ? newVNode.props.key : undefined;
    let existingNode: Node | null = null;

    if (newKey != null) {
      existingNode = keyedMap.get(newKey) || null;
    }

    if (!existingNode && newKey == null) {
      existingNode = parent.childNodes[i] || null;
    }

    if (existingNode) {
      // Move the node if it's not in the correct position
      if (existingNode !== parent.childNodes[i]) {
        parent.insertBefore(existingNode, parent.childNodes[i] || null);
      }
      // Update the node
      updateNode(existingNode, newVNode);
    } else {
      // Create and insert the new node
      const newDomNode = createDomNode(newVNode);

      // Assign key attributes if present
      if (isVElement(newVNode) && newVNode.props.key != null) {
        (newDomNode as any).__webjsx_key = newVNode.props.key;
        (newDomNode as HTMLElement).setAttribute(
          "data-key",
          String(newVNode.props.key)
        );
      }

      parent.insertBefore(newDomNode, parent.childNodes[i] || null);
    }
  });

  // Step 5: Remove excess unkeyed nodes
  // Re-fetch child nodes after insertions/removals
  const updatedChildNodes = Array.from(parent.childNodes);
  const newUnkeyed = flattenedVNodes.filter(
    (vnode) => !isVElementWithKey(vnode)
  );
  const existingUnkeyed = updatedChildNodes.filter(
    (node) => !(node as any).__webjsx_key
  );

  if (newUnkeyed.length < existingUnkeyed.length) {
    for (let i = newUnkeyed.length; i < existingUnkeyed.length; i++) {
      parent.removeChild(existingUnkeyed[i]);
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
    // Since we've flattened Fragments in diffChildren, this block should rarely execute.
    // However, it's kept as a safeguard.
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

    // Handle the key attribute (use data-key now)
    if (isVElement(newVNode) && newVNode.props.key != null) {
      (domNode as any).__webjsx_key = newVNode.props.key;
      domNode.setAttribute("data-key", String(newVNode.props.key)); // Change here
    } else {
      // Remove the key if it doesn't exist in newProps
      delete (domNode as any).__webjsx_key;
      domNode.removeAttribute("data-key"); // Change here
    }

    // Handle children only if dangerouslySetInnerHTML is NOT present
    if (!newProps.dangerouslySetInnerHTML && newProps.children != null) {
      diffChildren(domNode, newProps.children);
    }
  } else {
    // Replace the node
    const newDomNode = createDomNode(newVNode);

    // Assign key attributes if present (use data-key now)
    if (isVElement(newVNode) && newVNode.props.key != null) {
      (newDomNode as any).__webjsx_key = newVNode.props.key;
      (newDomNode as HTMLElement).setAttribute(
        "data-key",
        String(newVNode.props.key)
      );
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
