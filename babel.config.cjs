module.exports = (api) => {
  const BABEL_ENV = api.env();
  const targets =
    BABEL_ENV === "cjs"
      ? { node: 6 }
      : BABEL_ENV === "mjs" // node 10 버전에서 esm 사용하려면 확장자가 반드시 .mjs
      ? { node: 12 }
      : BABEL_ENV === "modern"
      ? ">= 2% and last 2 versions"
      : { ie: 11 };
  const plugins =
    BABEL_ENV === "mjs"
      ? ["./build_scripts/transform_import_extension.cjs"]
      : [];
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets,
          useBuiltIns: "usage",
          corejs: 3,
          modules: BABEL_ENV === "mjs" ? false : "auto",
        },
      ],
    ],
    plugins,
  };
};
