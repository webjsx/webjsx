import { Fragment, VNode } from "./types.js";
import { setAttributes } from "./utils.js";

export function createDomNode(vnode: VNode): Node {
  if (
    typeof vnode === "string" ||
    typeof vnode === "number" ||
    typeof vnode === "boolean"
  ) {
    return document.createTextNode(String(vnode));
  } else if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    if (vnode.props.children) {
      vnode.props.children.forEach((child) => {
        fragment.appendChild(createDomNode(child));
      });
    }
    return fragment;
  } else {
    const el = document.createElement(vnode.type as string);

    // Set attributes (now includes direct property assignment for non-string props)
    if (vnode.props) {
      setAttributes(el, vnode.props);
    }

    // Assign key to DOM node (use data-key now)
    if (vnode.props.key != null) {
      (el as any).__webjsx_key = vnode.props.key;
      el.setAttribute("data-key", String(vnode.props.key));
    }

    // Handle children only if dangerouslySetInnerHTML is not present
    if (vnode.props.children && !vnode.props.dangerouslySetInnerHTML) {
      vnode.props.children.forEach((child) => {
        el.appendChild(createDomNode(child));
      });
    }

    return el;
  }
}
