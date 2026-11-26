# dompet-rumah

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/robbyensoe/dompet-rumah/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/robbyensoe/dompet-rumah/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

**DompetRumah** — a household budget planner in rupiah, built for make.fun's **best-household-budget-site-20261126-1457** bounty. It follows one worked example end to end — the Prameswari household, a family of four renting in East Jakarta on Rp9.929.876 a month — and every tool on the site actually works:

- **Dashboard** — the month at a glance: money in, planned spending, the share going to the future, a donut of all eleven budget lines, the needs/wants/future split against the 50/30/20 rule, a bills checklist you can tick off as you pay, the savings goals, and six months of real cash flow. New in this edition: **spent-so-far vs budget** — every line's actual spending against its budget as of 26 November (two lines are already over, and the panel says so), plus a **log-an-expense form** that updates the bars and the log as you type.
- **Planner** — the fully editable budget. Change either income or any of the eleven lines and the shares, healthy-range flags, and what-is-left figure recompute as you type. Three presets: a Jakarta family of four, a single earner on Jakarta's minimum wage, and a family in a smaller city. New in this edition: **input validation** (negative amounts clamp to zero, a plain-language warning when one line eats more than half the income or the plan overspends), a **copy-the-plan-as-text** button, and a one-click reset to the example household.
- **Goals** — four named savings goals with progress and time-to-go, an emergency-fund calculator (spending × months of cover ÷ what you can save), and an any-goal calculator that turns a price and a date into a monthly figure. New in this edition: each goal takes an **extra monthly amount** and its finish date moves closer at once.
- **Guide** — healthy ranges per category for Indonesian households, the 50/30/20 rule examined honestly against Jakarta costs, a five-step payday routine, and the BPS benchmarks behind it all: average spending Rp1,569,088 per person (Susenas March 2025), Jakarta's UMP of Rp5,729,876 for 2026, the average wage of Rp3.33 million, and the national poverty line. New in this edition: **five signs the budget is quietly failing**, each with what to do about it.

Static files only — no framework, no build step, no network request. Amounts use Indonesian formatting throughout (Rp9.929.876).

## Run it

```sh
node serve.ts          # serves app/ at http://127.0.0.1:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # the hand-in: copies app/ + screenshots/ to out/ and writes out/dossier.json
```

Node 22.18 or later, standard library only. `main.ts` refuses early — with the reason named — when the hand-in would fail the scorer's caps (missing `app/index.html`, the wrong number of screenshots, or a screenshot over 256 KiB).
