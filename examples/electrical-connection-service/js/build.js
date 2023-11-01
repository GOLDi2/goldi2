async function build() {
  const esbuild = require("esbuild");
  const resolve = await import("esbuild-plugin-resolve");

  esbuild.build({
    entryPoints: ["./src/gui/index.mts"],
    bundle: true,
    outfile: "./app/bundle.js",
    plugins: [
      resolve.default({
        events: require.resolve("events/"),
      }),
    ],
  });
}

build();
