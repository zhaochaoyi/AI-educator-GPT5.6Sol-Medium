(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FinancialPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const RETIREMENT_YEARS = 30;
  const SAFE_WITHDRAWAL_RATE = 0.04;

  function futureValue(amount, annualRatePercent, years) {
    return amount * Math.pow(1 + annualRatePercent / 100, years);
  }

  function projectPlan(input, assumptions) {
    const currentYear = input.currentYear;
    const yearsToRetirement = input.retirementAge - input.currentAge;
    const expenseEndAge = input.majorExpense > 0 ? input.majorExpenseAge : input.retirementAge;
    const endAge = Math.min(100, Math.max(input.retirementAge + RETIREMENT_YEARS, expenseEndAge));
    const returnRate = assumptions.investmentReturn / 100;
    const growthRate = assumptions.incomeGrowth / 100;
    const inflationRate = assumptions.inflationRate / 100;
    let balance = input.currentSavings;
    let annualContribution = input.monthlyContribution * 12;
    let afterExpense = null;
    let expenseFutureValue = 0;
    if (input.majorExpense > 0 && input.majorExpenseAge === input.currentAge) {
      expenseFutureValue = input.majorExpense;
      balance = Math.max(0, balance - expenseFutureValue);
      afterExpense = balance;
    }
    const projection = [{
      year: currentYear,
      age: input.currentAge,
      phase: "Today",
      balance
    }];

    for (let age = input.currentAge + 1; age <= endAge; age += 1) {
      const yearsFromNow = age - input.currentAge;
      const isRetired = age > input.retirementAge;

      balance *= 1 + returnRate;
      if (!isRetired) {
        balance += annualContribution;
        annualContribution *= 1 + growthRate;
      } else {
        const retirementYearIndex = age - input.retirementAge - 1;
        const spending = futureValue(input.retirementSpending, assumptions.inflationRate, yearsToRetirement + retirementYearIndex);
        balance -= spending;
      }

      if (input.majorExpense > 0 && age === input.majorExpenseAge) {
        expenseFutureValue = futureValue(input.majorExpense, assumptions.inflationRate, yearsFromNow);
        balance -= expenseFutureValue;
        afterExpense = Math.max(0, balance);
      }

      balance = Math.max(0, balance);
      projection.push({
        year: currentYear + yearsFromNow,
        age,
        phase: age < input.retirementAge ? "Saving" : age === input.retirementAge ? "Retirement begins" : "Retired",
        balance
      });
    }

    const retirementPoint = projection.find((point) => point.age === input.retirementAge);
    const retirementSavings = retirementPoint ? retirementPoint.balance : 0;
    const firstYearSpending = futureValue(input.retirementSpending, assumptions.inflationRate, yearsToRetirement);
    const targetSavings = firstYearSpending / SAFE_WITHDRAWAL_RATE;
    const gapOrSurplus = retirementSavings - targetSavings;

    return {
      projection,
      retirementSavings,
      firstYearSpending,
      targetSavings,
      gapOrSurplus,
      onTrack: gapOrSurplus >= 0,
      afterExpense,
      expenseFutureValue,
      yearsToRetirement
    };
  }

  return { projectPlan, futureValue, RETIREMENT_YEARS, SAFE_WITHDRAWAL_RATE };
});
