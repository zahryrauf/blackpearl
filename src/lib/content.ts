export const DESTINATIONS = [
  { n: 'Maldives', s: 'December to April', t: 'Twenty-six atolls of reef, sandbank and empty lagoon.', k: 'lagoon', seed: 4 },
  { n: 'Sri Lanka', s: 'January to March', t: 'Galle, Mirissa for whales, and the deep harbour at Trincomalee.', k: 'ceylon', seed: 9 },
  { n: 'Greek Isles', s: 'May to September', t: 'The Cyclades under the meltemi, the Ionian when it calms.', k: 'isles', seed: 15 },
  { n: "Côte d'Azur", s: 'June to September', t: 'Antibes, Corsica and Sardinia, with berths at Porto Cervo.', k: 'riviera', seed: 21 },
];
export const SERVICES = [
  ['Acquisition', 'Search, inspection and negotiation on your behalf, with every offer kept private.'],
  ['Sales', 'Valuation, presentation and a considered list of qualified buyers.'],
  ['Management', 'Crew, maintenance, compliance and accounts, reported monthly.'],
  ['Refit', 'Yard selection, specification and supervision from first drawing to sea trial.'],
];
export const lengthBand = (l: number) => (l < 40 ? 's' : l < 60 ? 'm' : 'l');
