const sum = require("../sum");

test("add two numbers", () => {
  const result = sum(1, 2);
  expect(result).toEqual(3);
});
