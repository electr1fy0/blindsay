import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findOne } from "./react-tree";

const getServerSession = mock(async () => null as any);
const AppShellMock = (_props: any) => null;

mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: { marker: "auth-options" } }));
mock.module("@/components/app-shell", () => ({ AppShell: AppShellMock }));

const AppLayout = (await import("../app/(app)/layout")).default;

beforeEach(() => {
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
});

describe("AppLayout", () => {
  test("reads the server session with app auth options", async () => {
    await AppLayout({ children: "content" });
    expect(getServerSession).toHaveBeenCalledWith({ marker: "auth-options" });
  });

  test("passes undefined user to the shell for an anonymous session", async () => {
    const tree = await AppLayout({ children: "content" });
    const shell = findOne(tree, (node) => node.type === AppShellMock);
    expect(shell.props.user).toBeUndefined();
    expect(shell.props.children).toBe("content");
  });

  test("passes the exact session user through without reshaping it", async () => {
    const user = {
      id: "u1",
      email: "alice@example.test",
      username: "alice",
      image: "https://images.example/alice.png",
    };
    getServerSession.mockImplementation(async () => ({ user }));
    const tree = await AppLayout({ children: { type: "child" } as any });
    const shell = findOne(tree, (node) => node.type === AppShellMock);
    expect(shell.props.user).toBe(user);
    expect(shell.props.children).toEqual({ type: "child" });
  });

  test("handles a session object whose user field is absent", async () => {
    getServerSession.mockImplementation(async () => ({}));
    const tree = await AppLayout({ children: null });
    expect(findOne(tree, (node) => node.type === AppShellMock).props.user).toBeUndefined();
  });
});
