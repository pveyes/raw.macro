module.exports = {
  rootDir: __dirname,
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          experimental: {
            plugins: [
              [
                require.resolve(
                  "../target/wasm32-wasi/release/swc_plugin_raw_macro.wasm",
                ),
                {
                  rootDir: require("path").join(__dirname, "../.."),
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
