export function exception(message: string): never {
  throw new Error(message);
}
