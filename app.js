(function () {
  "use strict";

  const presets = {
    conservative: { label: "Conservative", investmentReturn: 4, incomeGrowth: 1.5, inflationRate: 3.5 },
    moderate: { label: "Moderate", investmentReturn: 6, incomeGrowth: 2.5, inflationRate: 2.5 },
    optimistic: { label: "Optimistic", investmentReturn: 8, incomeGrowth: 3.5, inflationRate: 2 }
  };
  const scenarios = JSON.parse(JSON.stringify(presets));
  const exampleValues = {
    currentAge: 29, retirementAge: 65, annualIncome: 62000, currentSavings: 18000,
    monthlyContribution: 600, annualExpenses: 39000, retirementSpending: 36000,
    majorExpense: 20000, majorExpenseAge: 33
  };
  const personalFields = Object.keys(exampleValues);
  const assumptionFields = ["investmentReturn", "incomeGrowth", "inflationRate"];
  let activeScenario = "moderate";
  let lastResults = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function formatCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    const magnitude = Math.abs(safeValue);
    const digits = magnitude < 1000 ? 0 : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: digits
    }).format(safeValue);
  }

  function formatCompact(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1
    }).format(value);
  }

  function setValue(id, value) { $("#" + id).value = value; }

  function loadAssumptions() {
    assumptionFields.forEach((key) => setValue(key, scenarios[activeScenario][key]));
    updateScenarioUI();
  }

  function updateScenarioUI() {
    $$(".scenario-card").forEach((button) => {
      const selected = button.dataset.scenario === activeScenario;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const changed = assumptionFields.some((key) => scenarios[activeScenario][key] !== presets[activeScenario][key]);
    $("#custom-badge").hidden = !changed;
  }

  function inputNumber(id) { return Number($("#" + id).value); }

  function validate() {
    const errors = {};
    const ranges = {
      currentAge: [18, 90, "Current age must be from 18 to 90."],
      retirementAge: [19, 100, "Retirement age must be from 19 to 100."],
      annualIncome: [0, 10000000, "Income must be from $0 to $10,000,000."],
      currentSavings: [0, 100000000, "Savings must be from $0 to $100,000,000."],
      monthlyContribution: [0, 1000000, "Monthly savings must be from $0 to $1,000,000."],
      annualExpenses: [0, 10000000, "Expenses must be from $0 to $10,000,000."],
      retirementSpending: [0, 10000000, "Retirement spending must be from $0 to $10,000,000."],
      majorExpense: [0, 100000000, "The expense must be from $0 to $100,000,000."],
      majorExpenseAge: [18, 100, "Expense age must be from 18 to 100."],
      investmentReturn: [-20, 20, "Return must be from -20% to 20%."],
      incomeGrowth: [-10, 15, "Income growth must be from -10% to 15%."],
      inflationRate: [-5, 15, "Inflation must be from -5% to 15%."]
    };

    Object.entries(ranges).forEach(([id, [min, max, message]]) => {
      const value = $("#" + id).value.trim();
      if (value === "" || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) errors[id] = message;
    });
    if (!errors.currentAge && !errors.retirementAge && inputNumber("retirementAge") <= inputNumber("currentAge")) {
      errors.retirementAge = "Retirement age must be later than current age.";
    }
    if (!errors.majorExpense && inputNumber("majorExpense") > 0 && !errors.majorExpenseAge && inputNumber("majorExpenseAge") < inputNumber("currentAge")) {
      errors.majorExpenseAge = "Expense age cannot be earlier than your current age.";
    }

    Object.keys(ranges).forEach((id) => {
      const input = $("#" + id);
      const error = $("#" + id + "-error");
      if (!input || !error) return;
      const message = errors[id] || "";
      error.textContent = message;
      input.setAttribute("aria-invalid", String(Boolean(message)));
    });
    const summary = $("#form-summary");
    const count = Object.keys(errors).length;
    summary.hidden = count === 0;
    summary.textContent = count ? `Please correct ${count} highlighted ${count === 1 ? "entry" : "entries"}.` : "";
    return count === 0;
  }

  function getInputs() {
    const values = {};
    personalFields.forEach((key) => { values[key] = inputNumber(key); });
    values.currentYear = new Date().getFullYear();
    return values;
  }

  function getAssumptions(scenarioName) {
    const scenario = scenarios[scenarioName];
    return {
      investmentReturn: Number(scenario.investmentReturn),
      incomeGrowth: Number(scenario.incomeGrowth),
      inflationRate: Number(scenario.inflationRate)
    };
  }

  function renderChart(projection, input) {
    const container = $("#projection-chart");
    const width = 900, height = 330;
    const padding = { top: 22, right: 20, bottom: 46, left: 74 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...projection.map((d) => d.balance), 1) * 1.1;
    const x = (index) => padding.left + (index / Math.max(1, projection.length - 1)) * plotWidth;
    const y = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;
    const line = projection.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.balance).toFixed(1)}`).join(" ");
    const area = `${line} L${x(projection.length - 1)},${padding.top + plotHeight} L${padding.left},${padding.top + plotHeight} Z`;
    const yTicks = [0, 0.25, 0.5, 0.75, 1];
    const xTickIndexes = Array.from(new Set([0, Math.round((projection.length - 1) / 4), Math.round((projection.length - 1) / 2), Math.round((projection.length - 1) * 0.75), projection.length - 1]));
    const retirementIndex = projection.findIndex((d) => d.age === input.retirementAge);
    const expenseIndex = input.majorExpense > 0 ? projection.findIndex((d) => d.age === input.majorExpenseAge) : -1;
    const grids = yTicks.map((tick) => {
      const yy = y(maxValue * tick);
      return `<line x1="${padding.left}" y1="${yy}" x2="${width - padding.right}" y2="${yy}" class="grid-line"/><text x="${padding.left - 12}" y="${yy + 4}" text-anchor="end">${formatCompact(maxValue * tick)}</text>`;
    }).join("");
    const labels = xTickIndexes.map((i) => `<text x="${x(i)}" y="${height - 14}" text-anchor="middle">Age ${projection[i].age}</text>`).join("");
    const marker = (index, label, className) => index >= 0 ? `<line x1="${x(index)}" y1="${padding.top}" x2="${x(index)}" y2="${padding.top + plotHeight}" class="${className}"/><text x="${x(index) + 6}" y="${padding.top + 14}" class="marker-label">${label}</text>` : "";
    const title = `Projected savings from ${formatCurrency(projection[0].balance)} today to ${formatCurrency(projection[projection.length - 1].balance)} at age ${projection[projection.length - 1].age}.`;

    container.setAttribute("aria-label", title);
    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      <defs><linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b7a78" stop-opacity=".3"/><stop offset="1" stop-color="#2b7a78" stop-opacity=".02"/></linearGradient></defs>
      ${grids}<path d="${area}" fill="url(#area-gradient)"/><path d="${line}" class="projection-line"/>
      ${marker(retirementIndex, "Retirement", "retirement-marker")}${marker(expenseIndex, "Major expense", "expense-marker")}${labels}
    </svg>`;

    $("#projection-table-body").innerHTML = projection.map((point) => `<tr><td>${point.year}</td><td>${point.age}</td><td>${point.phase}</td><td>${formatCurrency(point.balance)}</td></tr>`).join("");
  }

  function renderComparison(input) {
    $("#comparison-body").innerHTML = Object.keys(scenarios).map((name) => {
      const assumptions = getAssumptions(name);
      const result = FinancialPlanner.projectPlan(input, assumptions);
      const selected = name === activeScenario ? " comparison-row--selected" : "";
      return `<tr class="${selected}"><th><button type="button" class="comparison-select" data-select-scenario="${name}">${scenarios[name].label}${name === activeScenario ? " (selected)" : ""}</button></th><td>${assumptions.investmentReturn}% / ${assumptions.incomeGrowth}% / ${assumptions.inflationRate}%</td><td>${formatCurrency(result.retirementSavings)}</td><td class="${result.onTrack ? "positive" : "negative"}">${result.onTrack ? "+" : "−"}${formatCurrency(Math.abs(result.gapOrSurplus))}</td><td><span class="table-status ${result.onTrack ? "is-positive" : "is-negative"}">${result.onTrack ? "On track" : "Gap"}</span></td></tr>`;
    }).join("");
  }

  function renderResults() {
    const valid = validate();
    $("#invalid-results").hidden = valid;
    $("#results-content").hidden = !valid;
    if (!valid) return;

    const input = getInputs();
    const result = FinancialPlanner.projectPlan(input, getAssumptions(activeScenario));
    lastResults = result;
    $("#result-context").textContent = `${scenarios[activeScenario].label} scenario · age ${input.currentAge} to ${input.retirementAge}`;
    $("#retirement-savings").textContent = formatCurrency(result.retirementSavings);
    $("#retirement-savings-note").textContent = `At age ${input.retirementAge}`;
    $("#first-year-spending").textContent = formatCurrency(result.firstYearSpending);
    $("#after-expense").textContent = result.afterExpense === null ? "Not included" : formatCurrency(result.afterExpense);
    $("#after-expense-note").textContent = result.afterExpense === null ? "Enter an optional expense to estimate this" : `Immediately after the expense at age ${input.majorExpenseAge}`;
    $("#gap-label").textContent = result.onTrack ? "Estimated surplus" : "Estimated gap";
    $("#gap-surplus").textContent = `${result.onTrack ? "+" : "−"}${formatCurrency(Math.abs(result.gapOrSurplus))}`;

    const statusCard = $("#status-card");
    statusCard.classList.toggle("is-gap", !result.onTrack);
    statusCard.querySelector(".status-card__icon").textContent = result.onTrack ? "✓" : "!";
    $("#track-status").textContent = result.onTrack ? "Your plan appears on track" : "Your plan may have a funding gap";
    $("#track-explanation").textContent = `The estimate compares ${formatCurrency(result.retirementSavings)} in projected savings with a simplified target of ${formatCurrency(result.targetSavings)} (25× first-year retirement spending).`;
    renderChart(result.projection, input);
    renderComparison(input);
  }

  function selectScenario(name) {
    activeScenario = name;
    loadAssumptions();
    renderResults();
  }

  function loadExample() {
    Object.entries(exampleValues).forEach(([key, value]) => setValue(key, value));
    scenarios.conservative = { ...presets.conservative };
    scenarios.moderate = { ...presets.moderate };
    scenarios.optimistic = { ...presets.optimistic };
    selectScenario("moderate");
  }

  function resetPlanner() {
    $("#planner-form").reset();
    scenarios.conservative = { ...presets.conservative };
    scenarios.moderate = { ...presets.moderate };
    scenarios.optimistic = { ...presets.optimistic };
    selectScenario("moderate");
    $("#currentAge").focus();
  }

  function init() {
    loadAssumptions();
    $("#planner-form").addEventListener("input", renderResults);
    assumptionFields.forEach((key) => {
      $("#" + key).addEventListener("input", () => {
        scenarios[activeScenario][key] = inputNumber(key);
        updateScenarioUI();
        renderResults();
      });
    });
    $$(".scenario-card").forEach((button) => {
      button.addEventListener("click", () => selectScenario(button.dataset.scenario));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const names = Object.keys(scenarios);
        const offset = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
        const next = names[(names.indexOf(activeScenario) + offset + names.length) % names.length];
        selectScenario(next);
        $(`[data-scenario="${next}"]`).focus();
      });
    });
    $("#comparison-body").addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-scenario]");
      if (button) selectScenario(button.dataset.selectScenario);
    });
    $("#restore-preset").addEventListener("click", () => {
      scenarios[activeScenario] = { ...presets[activeScenario] };
      loadAssumptions(); renderResults();
    });
    $("#load-example").addEventListener("click", loadExample);
    $("#reset-planner").addEventListener("click", resetPlanner);
    $("#print-results").addEventListener("click", () => window.print());
    renderResults();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
