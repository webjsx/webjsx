// src/createElement.ts

import { Fragment, VElement, VNode } from "./types.js";

/**
 * Overloads for createElement function.
 */
export function createElement(
  type: string | typeof Fragment,
  props: { [key: string]: any } | null,
  ...children: any[]
): VElement;

/**
 * Implementation of createElement function.
 */
export function createElement(
  type: string | typeof Fragment,
  props: { [key: string]: any } | null,
  ...children: any[]
): VElement {
  const normalizedProps: { [key: string]: any } = props ? { ...props } : {};

  const flatChildren: VNode[] = [];

  const flatten = (child: any) => {
    if (Array.isArray(child)) {
      child.forEach(flatten);
    } else if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "boolean"
    ) {
      flatChildren.push(child);
    } else if (child === null || child === undefined) {
      // Ignore null or undefined children
    } else {
      flatChildren.push(child);
    }
  };

  children.forEach(flatten);

  if (flatChildren.length > 0) {
    normalizedProps.children = flatChildren;
  }

  return {
    type,
    props: normalizedProps,
  };
}
