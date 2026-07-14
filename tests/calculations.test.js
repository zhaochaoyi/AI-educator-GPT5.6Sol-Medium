"use strict";

const assert = require("node:assert/strict");
const { projectPlan, futureValue } = require("../calculations.js");

function nearlyEqual(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

const assumptions = { investmentReturn: 5, incomeGrowth: 0, inflationRate: 2 };

// Compound-growth helper.
nearlyEqual(futureValue(1000, 5, 2), 1102.5);

// One saving year: opening balance grows, then one year of contributions is added.
const oneYear = projectPlan({
  currentYear: 2026, currentAge: 64, retirementAge: 65, currentSavings: 100000,
  monthlyContribution: 1000, retirementSpending: 40000, majorExpense: 0, majorExpenseAge: 64
}, assumptions);
nearlyEqual(oneYear.retirementSavings, 117000);
nearlyEqual(oneYear.firstYearSpending, 40800);
nearlyEqual(oneYear.targetSavings, 1020000);
assert.equal(oneYear.onTrack, false);
assert.equal(oneYear.projection.length, 32);

// A future expense is inflated and deducted in its chosen year.
const withExpense = projectPlan({
  currentYear: 2026, currentAge: 40, retirementAge: 42, currentSavings: 100000,
  monthlyContribution: 0, retirementSpending: 0, majorExpense: 10000, majorExpenseAge: 41
}, assumptions);
nearlyEqual(withExpense.expenseFutureValue, 10200);
nearlyEqual(withExpense.afterExpense, 94800);
nearlyEqual(withExpense.retirementSavings, 99540);

// Zero return, growth, inflation, spending, and expense preserve a zero balance.
const zeroCase = projectPlan({
  currentYear: 2026, currentAge: 30, retirementAge: 60, currentSavings: 0,
  monthlyContribution: 0, retirementSpending: 0, majorExpense: 0, majorExpenseAge: 40
}, { investmentReturn: 0, incomeGrowth: 0, inflationRate: 0 });
assert.equal(zeroCase.retirementSavings, 0);
assert.equal(zeroCase.targetSavings, 0);
assert.equal(zeroCase.onTrack, true);
assert.equal(zeroCase.afterExpense, null);

console.log("All calculation tests passed.");
