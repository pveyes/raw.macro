import raw from "raw.macro";

test("read relative file path using swc plugin", () => {
  const text = raw("./fixtures/swc.txt");
  expect(text).toEqual("Hello, swc plugins!\n");
});

test("read node_modules path using swc plugin", () => {
  const text = raw("yaml/pair.js");
  expect(text).toEqual(
    `module.exports = require('./dist/types').Pair
require('./dist/legacy-exports').warnFileDeprecation(__filename)
`,
  );
});
