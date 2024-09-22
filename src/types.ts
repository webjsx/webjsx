// src/types.ts

export const Fragment = Symbol("Fragment");

export type Primitive = string | number | boolean;

export interface ElementProps {
  [key: string]: any;
  children?: VNode[];
  key?: string | number;
}

export interface VElement {
  type: string | typeof Fragment;
  props: ElementProps;
}

export type VNode = VElement | Primitive;