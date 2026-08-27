const CURRENT_MOVEMENT_PATCH = [
  { date: '2026-08-26', type: 'SIGNED', player: 'DeWanna Bonner', team: 'Atlanta Dream', detail: 'Signed by Atlanta as a free agent after reaching a contract buyout with Phoenix.', source: 'ESPN report via Bleacher Report · Aug. 26, 2026' },
  { date: '2026-08-24', type: 'BUYOUT', player: 'DeWanna Bonner', team: 'Phoenix Mercury', detail: 'Phoenix and Bonner agreed to a contract buyout, making the six-time All-Star a free agent for the stretch run.', source: 'Phoenix Mercury announcement · Bleacher Report cross-check' },
  { date: '2026-08-18', type: 'SIGNED', player: 'Maddy Westbeld', team: 'Phoenix Mercury', detail: 'Signed by Phoenix for the remainder of the 2026 season.', source: 'WNBA Transactions Report · Basketball Reference cross-check' },
  { date: '2026-08-18', type: 'SIGNED', player: 'Morgan Maly', team: 'Chicago Sky', detail: 'Signed a developmental player contract with Chicago.', source: 'WNBA Transactions Report · Chicago Sky · Basketball Reference cross-check' },
  { date: '2026-08-18', type: 'SIGNED', player: 'Elizabeth Balogun', team: 'New York Liberty', detail: 'Signed a developmental player contract with New York.', source: 'WNBA Transactions Report · Basketball Reference cross-check' },
  { date: '2026-08-15', type: 'SIGNED', player: 'Tonie Morgan', team: 'Los Angeles Sparks', detail: 'Signed by the Los Angeles Sparks.', source: 'WNBA Transactions Report · Basketball Reference cross-check' },
  { date: '2026-08-15', type: 'WAIVED', player: 'Kiana Williams', team: 'Los Angeles Sparks', detail: 'Waived by the Los Angeles Sparks.', source: 'WNBA Transactions Report · Basketball Reference cross-check' },
  { date: '2026-08-15', type: 'SIGNED', player: 'Ashlon Jackson', team: 'Connecticut Sun', detail: 'Signed by the Connecticut Sun.', source: 'WNBA Transactions Report · Basketball Reference cross-check' },
  { date: '2026-08-15', type: 'SIGNED', player: 'Rayah Marshall', team: 'Connecticut Sun', detail: 'Signed to a developmental player contract after her 7-day contract ended.', source: 'WNBA Transactions Report · Basketball Reference cross-check' }
];

const RECENT_ROSTER_PATCH = [
  { name: 'DeWanna Bonner', team: 'Atlanta Dream', status: 'active', effectiveDate: '2026-08-26', reason: 'Signed by Atlanta as a free agent after a Phoenix contract buyout.' },
  { name: 'Alicia Flórez Getino', aliases: ['Alicia Florez', 'Alicia Flórez', 'Alicia Florez Getino'], team: 'Washington Mystics', status: 'active', effectiveDate: '2026-06-04', reason: 'Full name standardized to Alicia Flórez Getino; WNBA roster surfaces often shorten it to Alicia Florez.' },
  { name: 'Maddy Westbeld', team: 'Phoenix Mercury', status: 'active', effectiveDate: '2026-08-18', reason: 'Signed by Phoenix.' },
  { name: 'Morgan Maly', team: 'Chicago Sky', status: 'development', effectiveDate: '2026-08-18', reason: 'Signed a developmental player contract with Chicago.' },
  { name: 'Elizabeth Balogun', team: 'New York Liberty', status: 'development', effectiveDate: '2026-08-18', reason: 'Signed a developmental player contract with New York.' },
  { name: 'Tonie Morgan', team: 'Los Angeles Sparks', status: 'active', effectiveDate: '2026-08-15', reason: 'Signed by Los Angeles.' },
  { name: 'Ashlon Jackson', team: 'Connecticut Sun', status: 'active', effectiveDate: '2026-08-15', reason: 'Signed by Connecticut.' },
  { name: 'Rayah Marshall', team: 'Connecticut Sun', status: 'development', effectiveDate: '2026-08-15', reason: 'Moved to a developmental player contract.' },
  { name: 'Kiana Williams', team: '', status: 'waived', effectiveDate: '2026-08-15', reason: 'Waived by Los Angeles.' }
];

module.exports = { CURRENT_MOVEMENT_PATCH, RECENT_ROSTER_PATCH };
