// DompetRumah — data. One worked example (a Jakarta family of four) plus
// the national figures it is judged against. The household's budget is
// constructed arithmetic: every line below is re-added by the planner and
// must sum to the household income exactly. Benchmarks are BPS (Statistics
// Indonesia) numbers with their year attached, so a reader can check them.

export const HOUSEHOLD = {
  name: 'The Prameswari household',
  members: '2 adults, 2 children · renting in East Jakarta',
  earners: [
    { who: 'Earner 1 — full-time salary', amount: 5729876, note: 'Exactly the Jakarta minimum wage (UMP) for 2026' },
    { who: 'Earner 2 — online shop & freelance', amount: 4200000, note: 'A typical month; it moves up and down' },
  ],
};

// The monthly plan. group is needs, wants or future; guide is the share of
// income a household like this usually lands in, as a [low, high] percent.
export const CATEGORIES = [
  { id: 'rent', name: 'Rent (kontrakan)', group: 'needs', amount: 2200000, guide: [18, 28], note: 'Three rooms, East Jakarta, paid on the 1st' },
  { id: 'groceries', name: 'Groceries & kitchen', group: 'needs', amount: 2400000, guide: [20, 30], note: 'Rice, lauk, vegetables, cooking gas, market and minimarket runs' },
  { id: 'transport', name: 'Transport', group: 'needs', amount: 800000, guide: [6, 12], note: 'KRL and busway cards, petrol for one motorbike, the odd ojek' },
  { id: 'utilities', name: 'Electricity, water, internet & pulsa', group: 'needs', amount: 750000, guide: [5, 10], note: 'PLN tokens, PDAM water, home internet, two phone packages' },
  { id: 'education', name: 'School & courses', group: 'needs', amount: 650000, guide: [4, 10], note: 'School fees, books, and an English course for the elder child' },
  { id: 'health', name: 'Health & BPJS', group: 'needs', amount: 350000, guide: [3, 6], note: 'BPJS Kesehatan premiums for four, plus a medicine cushion' },
  { id: 'parents', name: 'Support for parents', group: 'needs', amount: 350000, guide: [0, 8], note: 'A monthly transfer to grandparents in the village' },
  { id: 'eatingout', name: 'Eating out & fun', group: 'wants', amount: 600000, guide: [3, 8], note: 'Weekend bakso, one family outing, streaming subscriptions' },
  { id: 'extras', name: 'Shopping & extras', group: 'wants', amount: 330000, guide: [2, 6], note: 'Clothes, toiletries beyond the basics, small repairs' },
  { id: 'savings', name: 'Savings & emergency fund', group: 'future', amount: 1000000, guide: [10, 20], note: 'Moved out on payday, before anything else is spent' },
  { id: 'cicilan', name: 'Motorbike installment (cicilan)', group: 'future', amount: 499876, guide: [0, 10], note: '14 payments left on the family motorbike' },
];

// What the household has actually spent so far this month, per category,
// as of 26 November 2026 — four days of the month remain. Two lines are
// already over their budget; the dashboard says so plainly.
export const ACTUALS_AS_OF = '26 November 2026';
export const DAYS_LEFT = 4;
export const ACTUALS = [
  { id: 'rent', spent: 2200000 },
  { id: 'groceries', spent: 2180000 },
  { id: 'transport', spent: 690000 },
  { id: 'utilities', spent: 720000 },
  { id: 'education', spent: 650000 },
  { id: 'health', spent: 350000 },
  { id: 'parents', spent: 350000 },
  { id: 'eatingout', spent: 640000 },
  { id: 'extras', spent: 410000 },
  { id: 'savings', spent: 1000000 },
  { id: 'cicilan', spent: 499876 },
];

// The last few expenses the household wrote down, newest first. The
// "log an expense" form on the dashboard adds to this list while you use it.
export const EXPENSES = [
  { date: '25 Nov', category: 'groceries', note: 'Pasar: beras 5 kg, ayam, sayur seminggu', amount: 185000 },
  { date: '24 Nov', category: 'transport', note: 'Bensin motor + parkir', amount: 45000 },
  { date: '23 Nov', category: 'eatingout', note: 'Makan bakso sekeluarga, Minggu malam', amount: 120000 },
  { date: '22 Nov', category: 'extras', note: 'Seragam sekolah anak, satu stel', amount: 150000 },
  { date: '21 Nov', category: 'utilities', note: 'Token PLN 200 ribu', amount: 200000 },
];

// Six months of the household's actual cash flow, rupiah. December carries a
// year-end bonus in income and the holiday in spending.
export const CASHFLOW = [
  { month: 'Jul', income: 9929876, spent: 9610000 },
  { month: 'Aug', income: 9929876, spent: 9880000 },
  { month: 'Sep', income: 10350000, spent: 10120000 },
  { month: 'Oct', income: 9929876, spent: 9740000 },
  { month: 'Nov', income: 9929876, spent: 9930000 },
  { month: 'Dec', income: 11429876, spent: 10860000 },
];

// Savings goals, with what is already put by.
export const GOALS = [
  { name: 'Emergency fund', target: 29800000, saved: 12400000, monthly: 1000000, note: 'Three months of spending (3 × Rp9.93 million), kept in a separate account' },
  { name: 'Children’s education fund', target: 50000000, saved: 8250000, monthly: 500000, note: 'For secondary school and beyond; grows with the savings line' },
  { name: 'Family trip to Yogyakarta', target: 6000000, saved: 4800000, monthly: 300000, note: 'Train fares, three nights, and oleh-oleh for the grandparents' },
  { name: 'A laptop for the shop', target: 9000000, saved: 2700000, monthly: 200000, note: 'Earner 2’s shop runs on a borrowed laptop today' },
];

// The fixed bills and the day each falls due — the checklist on the dashboard.
export const BILLS = [
  { name: 'Rent (kontrakan)', due: '1st', amount: 2200000, paid: true },
  { name: 'BPJS Kesehatan premiums', due: 'by the 10th', amount: 350000, paid: true },
  { name: 'School fees', due: 'by the 10th', amount: 650000, paid: true },
  { name: 'Home internet', due: 'by the 15th', amount: 300000, paid: false },
  { name: 'PDAM water bill', due: 'by the 20th', amount: 120000, paid: false },
  { name: 'PLN electricity tokens', due: 'as needed', amount: 330000, paid: false },
  { name: 'Motorbike cicilan', due: '24th', amount: 499876, paid: false },
  { name: 'Phone packages ×2', due: '1st', amount: 100000, paid: true },
];

// National benchmarks, so the example can be judged (BPS unless noted).
export const BENCHMARKS = [
  { label: 'Average spending, per person', value: 'Rp1,569,088', note: 'a month, all Indonesia — a family of four averages about Rp6.28 million before saving anything', source: 'BPS, Susenas March 2025' },
  { label: 'Average spending in Jakarta', value: 'Rp2,962,412', note: 'per person a month; Rp1,153,404 of it (38.9%) is food', source: 'BPS, Susenas March 2025' },
  { label: 'Average employee wage', value: 'Rp3.33 million', note: 'a month, all Indonesia', source: 'BPS, Sakernas August 2025' },
  { label: 'Jakarta minimum wage (UMP)', value: 'Rp5,729,876', note: 'a month in 2026, up from Rp5,396,761 in 2025 — the highest in the country', source: 'Jakarta Governor Decree 1142/2025' },
  { label: 'National poverty line', value: 'Rp641,443', note: 'per person a month — the floor a budget must never plan below', source: 'BPS, September 2025' },
];

// A healthy share-of-income range per category, for the guide page.
export const GUIDE_RANGES = [
  { name: 'Housing (rent or mortgage)', range: '20–30%', tip: 'Above 30% of income, every other line starts to starve. In Jakarta that often means a longer commute is the real price of cheaper rent.' },
  { name: 'Food at home', range: '20–30%', tip: 'BPS counts food as 38.9% of a Jakartan’s spending. Cooking at home and a weekly market list are the two biggest levers.' },
  { name: 'Transport', range: '5–12%', tip: 'A season pass or KRL card beats daily ojek fares; count petrol, parking and servicing together, not just fares.' },
  { name: 'Utilities & phones', range: '5–10%', tip: 'Prepaid PLN tokens make electricity visible. Two streaming-and-data bundles per person is where this line quietly doubles.' },
  { name: 'Education', range: '4–10%', tip: 'Plan school costs yearly, not monthly: enrolment and books land in one month and break a budget that forgot them.' },
  { name: 'Health', range: '3–6%', tip: 'Keep BPJS premiums current — a lapsed card is the most expensive saving a household can make.' },
  { name: 'Savings & emergency fund', range: '10–20%', tip: 'Pay it on payday, into a separate account. What is left at month-end is never what gets saved.' },
  { name: 'Installments (cicilan)', range: 'under 10%', tip: 'Count every installment together — motorbike, phone, paylater. Above 30% of income in total debt payments is the danger line lenders watch.' },
  { name: 'Fun & eating out', range: '3–8%', tip: 'A small, protected fun budget is what makes the rest of the plan survivable. Cutting it to zero is how budgets die in month two.' },
];

// Warning signs that a household budget is quietly failing, for the guide.
export const WARNING_SIGNS = [
  { sign: 'The savings line is whatever is left', why: 'Saving what remains means saving nothing in a tight month. The month the emergency fund is raided is the month the plan has already failed.' },
  { sign: 'One category is always over', why: 'A line that runs over every month is not overspending — it is a wrong budget. Raise the line and cut somewhere honest instead of re-breaking the same promise.' },
  { sign: 'Payday loans or paylater cover the last week', why: 'Borrowing to reach month-end turns a Rp500.000 gap into a Rp600.000 bill next month. The gap grows every cycle until something breaks.' },
  { sign: 'Nobody knows what was spent yesterday', why: 'A budget no one writes down is a guess. Five minutes of logging a week is what turns the plan from a wish into a record.' },
  { sign: 'Every month starts with a surprise bill', why: 'School fees, vehicle tax, Eid clothes and the annual BPJS catch-up are all predictable. A month that "suddenly" costs more was planned with the calendar closed.' },
];
