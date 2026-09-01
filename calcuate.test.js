import { test } from "node:test";
import assert from "node:assert";
import { calculate } from "./calculate.js";

test("basic arithmetic", () => {
  assert.strictEqual(calculate("2+3"), 5);
  assert.strictEqual(calculate("10-4"), 6);
  assert.strictEqual(calculate("6*7"), 42);
  assert.strictEqual(calculate("20/4"), 5);
});

test("operator precedence", () => {
  assert.strictEqual(calculate("2+3*4"), 14);
});

test("parentheses", () => {
  assert.strictEqual(calculate("(2+3)*4"), 20);
});

test("decimals", () => {
  assert.strictEqual(calculate("1.5+2.5"), 4);
});

test("negative numbers", () => {
  assert.strictEqual(calculate("-5+3"), -2);
});

test("divide by zero is rejected", () => {
  assert.throws(() => calculate("5/0"), /divide by zero/);
});

test("empty input is rejected", () => {
  assert.throws(() => calculate(""), /empty/);
});

test("code injection is rejected", () => {
  assert.throws(() => calculate("process.exit(1)"));
});

test("incomplete expression is rejected", () => {
  assert.throws(() => calculate("2+"));
  assert.throws(() => calculate("(2+3"));
});
