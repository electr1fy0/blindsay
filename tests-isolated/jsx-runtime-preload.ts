import { mock } from "bun:test";

const Fragment = Symbol.for("react.fragment");

function jsx(type: any, props: any, key?: any) {
  return {
    type,
    key: key ?? null,
    props: props ?? {},
  };
}

mock.module("react/jsx-runtime", () => ({
  Fragment,
  jsx,
  jsxs: jsx,
}));

mock.module("react/jsx-dev-runtime", () => ({
  Fragment,
  jsxDEV: jsx,
}));
