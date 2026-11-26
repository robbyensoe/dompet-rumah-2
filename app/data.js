// DompetRumah — the household's numbers, kept apart from the pages that show them.
// Everything on the site reads from this one module, so a figure is written once
// and reused on the dashboard, the planner, the goals page and the guide.

export const HOUSEHOLD = {
  name: 'Prameswari',
  members: '2 adults, 2 children',
  home: 'renting in East Jakarta',
  monthLabel: 'November 2026',
  daysLeft: 4,
  asOf: '26 Nov 2026',
};

export const INCOMES = [
  {
    id: 'earner-one',
    label: 'Earner 1 — full-time salary',
    note: 'Exactly the Jakarta minimum wage (UMP) for 2026',
    amount: 5729876,
  },
  {
    id: 'earner-two',
    label: 'Earner 2 — online shop & freelance',
    note: 'A typical month; it moves up and down',
    amount: 4200000,
  },
];

// group: needs / wants / future. guideLo / guideHi: healthy share of income, in percent.
export const CATEGORIES = [
  { id: 'rent', name: 'Sewa kontrakan', group: 'needs', amount: 2200000, guideLo: 18, guideHi: 28, hint: 'Kontrak tahunan, dibayar tiap tanggal 1' },
  { id: 'kitchen', name: 'Belanja dapur', group: 'needs', amount: 2400000, guideLo: 20, guideHi: 30, hint: 'Pasar + warung, seminggu sekali belanja besar' },
  { id: 'transport', name: 'Transport', group: 'needs', amount: 800000, guideLo: 6, guideHi: 12, hint: 'Bensin motor, parkir, sesekali ojek' },
  { id: 'utilities', name: 'Listrik, air, internet & pulsa', group: 'needs', amount: 750000, guideLo: 5, guideHi: 10, hint: 'Token PLN, PDAM, Wi-Fi rumah, paket HP ×2' },
  { id: 'school', name: 'Sekolah & kursus', group: 'needs', amount: 650000, guideLo: 4, guideHi: 10, hint: 'SPP dua anak + les sore' },
  { id: 'health', name: 'Kesehatan & BPJS', group: 'needs', amount: 350000, guideLo: 3, guideHi: 6, hint: 'Iuran BPJS sekeluarga + obat ringan' },
  { id: 'parents', name: 'Santunan orang tua', group: 'needs', amount: 350000, guideLo: 0, guideHi: 8, hint: 'Dikirim tiap awal bulan, tidak pernah telat' },
  { id: 'eating-out', name: 'Makan di luar & hiburan', group: 'wants', amount: 600000, guideLo: 3, guideHi: 8, hint: 'Bakso Minggu malam, sesekali nonton' },
  { id: 'extras', name: 'Belanja & ekstra', group: 'wants', amount: 330000, guideLo: 2, guideHi: 6, hint: 'Pakaian, seragam, yang tidak terduga' },
  { id: 'savings', name: 'Tabungan & dana darurat', group: 'future', amount: 1000000, guideLo: 10, guideHi: 20, hint: 'Pindah ke rekening terpisah saat gajian' },
  { id: 'bike', name: 'Cicilan motor', group: 'future', amount: 499876, guideLo: 0, guideHi: 10, hint: 'Sisa cicilan, lunas pertengahan 2027' },
];

// What the household has actually spent so far this month, per category.
export const ACTUALS = {
  rent: 2200000,
  kitchen: 2180000,
  transport: 690000,
  utilities: 720000,
  school: 650000,
  health: 350000,
  parents: 350000,
  'eating-out': 640000,
  extras: 410000,
  savings: 1000000,
  bike: 499876,
};

// The most recent spending entries, newest first.
export const LEDGER = [
  { date: '25 Nov', category: 'kitchen', note: 'Pasar: beras 5 kg, ayam, sayur seminggu', amount: 185000 },
  { date: '24 Nov', category: 'transport', note: 'Bensin motor + parkir', amount: 45000 },
  { date: '23 Nov', category: 'eating-out', note: 'Makan bakso sekeluarga, Minggu malam', amount: 120000 },
  { date: '22 Nov', category: 'extras', note: 'Seragam sekolah anak, satu stel', amount: 150000 },
  { date: '21 Nov', category: 'utilities', note: 'Token PLN 200 ribu', amount: 200000 },
];

// Monthly money in vs money out, July to December 2026.
export const CASHFLOW = [
  { month: 'Jul', income: 9929876, spend: 9610000 },
  { month: 'Agu', income: 9929876, spend: 9880000 },
  { month: 'Sep', income: 10350000, spend: 10120000 },
  { month: 'Okt', income: 9929876, spend: 9740000 },
  { month: 'Nov', income: 9929876, spend: 9930000 },
  { month: 'Des', income: 11429876, spend: 10860000 },
];

export const GOALS = [
  {
    id: 'emergency',
    name: 'Dana darurat',
    target: 29800000,
    saved: 12400000,
    monthly: 1000000,
    note: 'Three months of spending (3 × Rp9,93 jt), kept in a separate account',
  },
  {
    id: 'education',
    name: 'Dana pendidikan anak',
    target: 50000000,
    saved: 8250000,
    monthly: 500000,
    note: 'For secondary school and beyond; grows with the savings line',
  },
  {
    id: 'holiday',
    name: 'Liburan keluarga ke Yogyakarta',
    target: 6000000,
    saved: 4800000,
    monthly: 300000,
    note: 'Train fares, three nights, and oleh-oleh for the grandparents',
  },
  {
    id: 'laptop',
    name: 'Laptop untuk toko',
    target: 9000000,
    saved: 2700000,
    monthly: 200000,
    note: "Earner 2's shop runs on a borrowed laptop today",
  },
];

export const BILLS = [
  { id: 'bill-rent', name: 'Sewa kontrakan', due: 'due 1st', amount: 2200000, paid: true },
  { id: 'bill-bpjs', name: 'BPJS Kesehatan', due: 'due by the 10th', amount: 350000, paid: true },
  { id: 'bill-school', name: 'SPP sekolah', due: 'due by the 10th', amount: 650000, paid: true },
  { id: 'bill-internet', name: 'Internet rumah', due: 'due by the 15th', amount: 300000, paid: false },
  { id: 'bill-water', name: 'PDAM', due: 'due by the 20th', amount: 120000, paid: false },
  { id: 'bill-power', name: 'Token PLN', due: 'due as needed', amount: 330000, paid: false },
  { id: 'bill-bike', name: 'Cicilan motor', due: 'due 24th', amount: 499876, paid: false },
  { id: 'bill-phone', name: 'Paket HP ×2', due: 'due 1st', amount: 100000, paid: true },
];

// National figures from BPS, for the guide page.
export const BENCHMARKS = {
  perCapita: 1569088,
  perCapitaNote: 'Average spending per person per month (Susenas, Mar 2025)',
  jakartaPerCapita: 2962412,
  jakartaFood: 1153404,
  jakartaFoodShare: 38.9,
  averageWage: 3330000,
  averageWageNote: 'Average monthly wage (Sakernas, Aug 2025)',
  ump2026: 5729876,
  ump2025: 5396761,
  povertyLine: 641443,
  povertyNote: 'Poverty line per person per month (Sep 2025)',
};

// Five signs a budget is in trouble — each with why it matters and what to do.
export const WARNING_SIGNS = [
  {
    title: 'Tabungan = sisa belaka',
    why: 'Saving whatever is left means saving nothing in a tight month — and tight months are most months.',
    fix: 'Move the savings line out on payday, before any spending. If it is not moved first, it does not exist.',
  },
  {
    title: 'Satu kategori selalu jebol tiap bulan',
    why: 'A line that overshoots every month is not a discipline problem; the number was wrong from the start.',
    fix: 'Raise that line to what it really costs and take the difference from a wants line, openly, instead of pretending.',
  },
  {
    title: 'Pinjaman / paylater menutup minggu terakhir',
    why: 'Borrowing to reach payday turns next month into a smaller month, and the gap grows each cycle.',
    fix: 'Freeze new borrowing for one month, list every instalment with its end date, and pay the smallest one off first.',
  },
  {
    title: 'Tidak ada yang tahu uang kemarin ke mana',
    why: 'Money with no record leaks through small, forgettable spends — the exact ones that add up to a salary.',
    fix: 'Write down every spend for seven days, however small. The pattern usually names itself by day three.',
  },
  {
    title: 'Tiap bulan dimulai dengan tagihan kejutan',
    why: 'A bill that surprises you was never in the plan; surprise bills are paid from the savings line.',
    fix: 'List every recurring bill with its date on one page, and set aside its amount the day the salary lands.',
  },
];

// Planner presets. Each preset's lines sum exactly to its income.
export const PRESETS = [
  {
    id: 'jakarta-family',
    name: 'Family of four · Jakarta',
    blurb: 'The Prameswari household, as shown on this site',
    incomes: [
      { id: 'earner-one', label: 'Earner 1 — full-time salary', amount: 5729876 },
      { id: 'earner-two', label: 'Earner 2 — online shop & freelance', amount: 4200000 },
    ],
    amounts: {
      rent: 2200000, kitchen: 2400000, transport: 800000, utilities: 750000,
      school: 650000, health: 350000, parents: 350000, 'eating-out': 600000,
      extras: 330000, savings: 1000000, bike: 499876,
    },
  },
  {
    id: 'single-ump',
    name: 'Single · Jakarta minimum wage',
    blurb: 'One salary, one room, the same eleven lines',
    incomes: [
      { id: 'earner-one', label: 'Salary — Jakarta UMP 2026', amount: 5729876 },
      { id: 'earner-two', label: 'Side income', amount: 0 },
    ],
    amounts: {
      rent: 1200000, kitchen: 1100000, transport: 500000, utilities: 450000,
      school: 200000, health: 200000, parents: 300000, 'eating-out': 350000,
      extras: 200000, savings: 729876, bike: 500000,
    },
  },
  {
    id: 'small-city-family',
    name: 'Family of four · smaller city',
    blurb: 'Lower rent, lower prices, same discipline',
    incomes: [
      { id: 'earner-one', label: 'Earner 1 — full-time salary', amount: 4000000 },
      { id: 'earner-two', label: 'Earner 2 — shop & freelance', amount: 2500000 },
    ],
    amounts: {
      rent: 900000, kitchen: 1800000, transport: 500000, utilities: 500000,
      school: 500000, health: 250000, parents: 250000, 'eating-out': 300000,
      extras: 200000, savings: 800000, bike: 500000,
    },
  },
];

export const GROUP_LABELS = {
  needs: 'Needs',
  wants: 'Wants',
  future: 'Future',
};

export const GROUP_ORDER = ['needs', 'wants', 'future'];

// A small palette for the donut chart, one colour per category in order.
export const DONUT_COLORS = [
  '#1f6b4a', '#c47f17', '#2f6fb2', '#a34d6e', '#6b7c2e',
  '#4a7a6f', '#8a5a2b', '#b3543f', '#5b6abf', '#3d8f7a', '#7a6a9e',
];
