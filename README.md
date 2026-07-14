# Personal Financial Planning Scenario Planner

A beginner-friendly, single-page educational website for exploring how savings, contributions, inflation, investment returns, retirement spending, and a major future expense can affect a simplified financial plan.

The planner is designed for workshops and demonstrations. It uses only HTML, CSS, and JavaScript. There is no account, server, database, tracking, or API key. Entries are calculated in the open browser tab and are not stored or transmitted.

> **Important:** This is an educational demonstration, not financial, tax, investment, accounting, or legal advice.

## What the app includes

- Conservative, Moderate, and Optimistic presets
- Editable return, income-growth, and inflation assumptions for every scenario
- Example values that make the planner useful immediately
- Instant calculations and helpful validation messages
- Estimated savings at retirement and after an optional major expense
- Inflation-adjusted first-year retirement spending
- A simplified 4% retirement target, with estimated gap or surplus
- An accessible year-by-year chart and equivalent data table
- A side-by-side comparison of all three scenarios
- Print styling for printing or saving the results as a PDF
- Responsive layouts for phones, tablets, and desktop screens
- Keyboard-friendly controls, visible focus styles, semantic labels, and reduced-motion support

## Project files

```text
.
├── index.html                    Page content and accessible structure
├── styles.css                    Design, responsive layout, and print styles
├── calculations.js              Reusable financial calculation functions
├── app.js                       Form behavior, validation, chart, and results
├── tests/
│   └── calculations.test.js     Calculation checks runnable with Node.js
├── README.md                    This beginner-friendly guide
├── LICENSE                      MIT open-source license
└── .gitignore                   Files Git should ignore
```

## Preview it on your computer

The easiest method is to double-click `index.html`. It should open in your default browser and work without internet access.

For a local web address closer to GitHub Pages, open a terminal in this folder and run one of these commands:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000> in a browser. Stop the server by returning to the terminal and pressing `Ctrl+C`.

## Run the calculation checks

If Node.js is installed, open a terminal in this folder and run:

```bash
node tests/calculations.test.js
```

You should see `All calculation tests passed.` You do not need Node.js to use or publish the website.

## Publish free with GitHub Pages

### Option A: upload the files in a web browser (least technical)

1. Create a free account at [github.com](https://github.com) or sign in.
2. Select the **+** menu near the top-right corner, then select **New repository**.
3. Enter a repository name such as `financial-scenario-planner`.
4. Choose **Public**. GitHub Pages works well for this public workshop project.
5. Do **not** add another README, `.gitignore`, or license because this folder already contains them.
6. Select **Create repository**.
7. On the new repository page, select **uploading an existing file**.
8. Drag all project files and the `tests` folder into the upload area. Keep `index.html` at the top level, not inside another folder.
9. Enter a short message such as `Add financial scenario planner`, then select **Commit changes**.
10. Select the repository’s **Settings** tab.
11. In the left menu, select **Pages**.
12. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
13. Set **Branch** to `main`, keep the folder as `/(root)`, and select **Save**.
14. Wait a few minutes, refresh the Pages settings screen, and look for the message showing the published website address.
15. The address will usually be `https://YOUR-USERNAME.github.io/financial-scenario-planner/`.

### Option B: use Git in a terminal

Create an empty public repository on GitHub first, then run the following commands from this project folder. Replace both placeholders with your details:

```bash
git init
git add .
git commit -m "Build financial scenario planner"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Then complete steps 10–15 from Option A to enable GitHub Pages.

## Make future changes with Codex

1. Open this project folder in Codex.
2. Describe the change in plain language. For example: “Add a field for pension income and include it in the retirement calculation.”
3. Ask Codex to update the files and rerun the calculation checks.
4. Open `index.html` and test the change yourself.
5. If using Git, publish the update with:

```bash
git add .
git commit -m "Describe the change"
git push
```

GitHub Pages will normally update automatically in a few minutes.

## Simplified calculation assumptions

The planner intentionally favors clarity over financial-model complexity:

1. The current balance receives the selected annual return once per year.
2. Twelve monthly contributions are then added as one annual amount. This is slightly different from true monthly compounding.
3. Contributions increase once per year using the income-growth assumption. Annual income itself is shown for planning context but does not otherwise change the projection.
4. The optional major expense is entered in today’s dollars, increased by inflation until its chosen age, and deducted once. A balance cannot fall below zero.
5. Retirement spending is entered in today’s dollars. It is increased by inflation to retirement and every retirement year after that.
6. The plan target is first-year retirement spending divided by 4%, equivalent to 25 times that spending. “On track” only means the projected balance meets this simplified target.
7. The chart continues for at least 30 retirement years (and farther if needed to show the optional expense), up to age 100. It applies investment returns and subtracts inflation-adjusted retirement spending annually.
8. Taxes, fees, investment volatility, pensions, Social Security, debt, health costs, required distributions, contribution limits, life expectancy, and sequence-of-returns risk are not modeled.
9. All output is hypothetical and shown in future nominal dollars unless the page says otherwise.

## Accessibility and privacy

The app uses labeled fields, keyboard-operable scenario controls, an error summary, high-contrast colors, visible focus indicators, semantic tables, reduced-motion support, and an accessible text alternative for the visual chart. No cookies, local storage, analytics, or network requests are used.

## License

This project is available under the [MIT License](LICENSE).
