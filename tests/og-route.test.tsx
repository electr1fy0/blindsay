import { beforeEach, describe, expect, mock, test } from "bun:test";

const findUnique = mock(async (_args?: any) => null as any);
const prisma = { user: { findUnique } };
const fetchMock = mock(async (_url: string | URL | Request) => ({
  arrayBuffer: async () => new ArrayBuffer(4),
}) as any);

let lastImage: { element: any; options: any } | null = null;

class ImageResponseMock {
  element: any;
  options: any;

  constructor(element: any, options: any) {
    this.element = element;
    this.options = options;
    lastImage = { element, options };
  }
}

mock.module("@/lib/prisma", () => ({ prisma }));
mock.module("next/og", () => ({ ImageResponse: ImageResponseMock }));
globalThis.fetch = fetchMock as any;

const route = await import("../app/api/og/[username]/route");

function collectText(node: any, output: string[] = []): string[] {
  if (node == null || typeof node === "boolean") return output;
  if (typeof node === "string" || typeof node === "number") {
    output.push(String(node));
    return output;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, output);
    return output;
  }
  if (node?.props) collectText(node.props.children, output);
  return output;
}

function findElements(node: any, type: string, output: any[] = []): any[] {
  if (node == null || typeof node !== "object") return output;
  if (Array.isArray(node)) {
    for (const child of node) findElements(child, type, output);
    return output;
  }
  if (node.type === type) output.push(node);
  if (node.props) findElements(node.props.children, type, output);
  return output;
}

beforeEach(() => {
  findUnique.mockClear();
  findUnique.mockImplementation(async () => null);
  fetchMock.mockClear();
  fetchMock.mockImplementation(async () => ({
    arrayBuffer: async () => new ArrayBuffer(4),
  }) as any);
  lastImage = null;
});

describe("OG route", () => {
  test("declares the Node.js runtime", () => {
    expect(route.runtime).toBe("nodejs");
  });

  test("normalizes the username for database lookup", async () => {
    await route.GET(new Request("https://example.test/api/og/Alice"), {
      params: Promise.resolve({ username: "Alice" }),
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: { username: "alice" },
      select: { name: true, username: true, image: true },
    });
  });

  test("loads all three Geist font weights", async () => {
    await route.GET(new Request("https://example.test/api/og/alice"), {
      params: Promise.resolve({ username: "alice" }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(lastImage).not.toBeNull();
    expect(lastImage!.options.width).toBe(1200);
    expect(lastImage!.options.height).toBe(630);
    expect(lastImage!.options.fonts.map((font: any) => font.weight)).toEqual([400, 500, 600]);
    expect(lastImage!.options.fonts.every((font: any) => font.name === "Geist")).toBe(true);
  });

  test("falls back to the requested username for an unknown profile", async () => {
    await route.GET(new Request("https://example.test/api/og/MissingUser"), {
      params: Promise.resolve({ username: "MissingUser" }),
    });

    const text = collectText(lastImage!.element);
    expect(text.join(" ")).toContain("MissingUser");
    expect(text.join(" ")).toContain("Anonymous inbox");
    expect(text.join(" ")).toContain("blindsay");
  });

  test("renders the placeholder avatar when no image exists", async () => {
    findUnique.mockImplementation(async () => ({
      name: "Alice",
      username: "alice",
      image: null,
    }));

    await route.GET(new Request("https://example.test/api/og/alice"), {
      params: Promise.resolve({ username: "alice" }),
    });

    expect(findElements(lastImage!.element, "img")).toHaveLength(0);
    expect(collectText(lastImage!.element)).toContain("@");
  });

  test("renders database name, username, and avatar when available", async () => {
    findUnique.mockImplementation(async () => ({
      name: "Alice Example",
      username: "alice",
      image: "https://images.example.test/alice.png",
    }));

    await route.GET(new Request("https://example.test/api/og/ALICE"), {
      params: Promise.resolve({ username: "ALICE" }),
    });

    const text = collectText(lastImage!.element).join(" ");
    const images = findElements(lastImage!.element, "img");
    expect(text).toContain("Alice Example");
    expect(text).toContain("alice");
    expect(images).toHaveLength(1);
    expect(images[0].props.src).toBe("https://images.example.test/alice.png");
    expect(images[0].props.width).toBe(120);
    expect(images[0].props.height).toBe(120);
  });

  test("awaits async route params", async () => {
    let resolved = false;
    const params = Promise.resolve().then(() => {
      resolved = true;
      return { username: "alice" };
    });

    await route.GET(new Request("https://example.test/api/og/alice"), { params });
    expect(resolved).toBe(true);
  });
});
