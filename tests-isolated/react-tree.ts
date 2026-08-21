export function walkReactTree(node: any, output: any[] = []): any[] {
  if (node === null || node === undefined || typeof node === "boolean") return output;
  if (Array.isArray(node)) {
    for (const child of node) walkReactTree(child, output);
    return output;
  }
  if (typeof node !== "object") return output;

  if ("type" in node && "props" in node) {
    output.push(node);
    walkReactTree(node.props?.children, output);
  }
  return output;
}

export function findAll(root: any, predicate: (node: any) => boolean): any[] {
  return walkReactTree(root).filter(predicate);
}

export function findOne(root: any, predicate: (node: any) => boolean): any {
  const matches = findAll(root, predicate);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one React node, found ${matches.length}`);
  }
  return matches[0];
}

export function textContent(node: any): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (typeof node === "object" && "props" in node) {
    return textContent(node.props?.children);
  }
  return "";
}
