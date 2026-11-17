import test from "node:test";
import assert from "node:assert/strict";
import {
  applyDiscount,
  compareCodesDesc,
  formatCurrency,
  initials,
  nextCode,
  nextPurchaseId,
  cn,
} from "../lib/utils";

test("nextCode increments the highest numeric suffix", () => {
  assert.equal(
    nextCode("INV-", [{ id: "INV-1" }, { id: "INV-7" }, { id: "INV-3" }]),
    "INV-8",
  );
});

test("nextCode pads the numeric suffix when requested", () => {
  assert.equal(nextCode("WR-", [{ id: "WR-4" }], 3), "WR-005");
});

test("nextPurchaseId uses the current year and pads to three digits", () => {
  const year = new Date().getFullYear();
  assert.equal(
    nextPurchaseId([{ id: `PO-${year}-001` }, { id: `PO-${year}-009` }]),
    `PO-${year}-010`,
  );
});

test("compareCodesDesc sorts codes numerically in descending order", () => {
  const sorted = [{ id: "INV-2" }, { id: "INV-10" }, { id: "INV-1" }].sort(
    compareCodesDesc,
  );
  assert.deepEqual(
    sorted.map((item) => item.id),
    ["INV-10", "INV-2", "INV-1"],
  );
});

test("formatCurrency formats USD amounts", () => {
  assert.equal(formatCurrency(1234), "$1,234");
});

test("applyDiscount returns the discounted total", () => {
  assert.equal(applyDiscount(599, 10), 539.1);
  assert.equal(applyDiscount(100, 0), 100);
  assert.equal(applyDiscount(100, 100), 0);
});

test("initials derives up to two uppercase initials", () => {
  assert.equal(initials("john ronald doe"), "JR");
});

test("cn joins truthy class names", () => {
  assert.equal(cn("a", false, null, "b"), "a b");
});
