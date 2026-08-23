const zlib = require('zlib');

const OFFICIAL_ROOT = 'https://ak-static.cms.nba.com/referee/wnba_injury';
const TEAM_ABBREVIATIONS = {
  ATL:'Atlanta Dream', CHI:'Chicago Sky', CON:'Connecticut Sun', DAL:'Dallas Wings',
  GSV:'Golden State Valkyries', IND:'Indiana Fever', LVA:'Las Vegas Aces', LAS:'Los Angeles Sparks',
  MIN:'Minnesota Lynx', NYL:'New York Liberty', PHX:'Phoenix Mercury', PDX:'Portland Fire',
  SEA:'Seattle Storm', TOR:'Toronto Tempo', WAS:'Washington Mystics'
};

const FALLBACK_REPORT = {
  reportTimestamp: '2026-08-23T04:15:00-04:00',
  reportLabel: 'Aug. 23, 2026 · 4:15 AM ET',
  reportUrl: 'https://www.wnba.com/wnba-injury-report',
  source: 'Official WNBA Injury Report PDF snapshot, 08/23/26 04:15 AM',
  injuries: [
    ['Natisha Hiedeman','Seattle Storm','OUT','Injury/Illness - Left Shoulder; Injury','08/23/2026','04:00 (ET)','SEA@DAL'],
    ['Azzi Fudd','Dallas Wings','OUT','Injury/Illness - Right Knee; right knee','08/23/2026','04:00 (ET)','SEA@DAL'],
    ['Aziaha James','Dallas Wings','OUT','Injury/Illness - Left Leg; lower left leg','08/23/2026','04:00 (ET)','SEA@DAL'],
    ['DiJonai Carrington','Chicago Sky','QUESTIONABLE','Injury/Illness - Left Foot; Left Foot','08/23/2026','07:00 (ET)','IND@CHI'],
    ['Skylar Diggins','Chicago Sky','OUT','Injury/Illness - Right Knee; Right Knee','08/23/2026','07:00 (ET)','IND@CHI'],
    ['Dana Evans','Las Vegas Aces','QUESTIONABLE','Injury/Illness - Left Leg; left leg','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Maria Conde','Toronto Tempo','OUT','Injury/Illness - Left Calf; Injury','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Marina Mabrey','Toronto Tempo','OUT','Injury/Illness - Right Adductor; Injury','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Aneesah Morrow','Toronto Tempo','OUT','Injury/Illness - Left Knee; Injury','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Nyara Sabally','Toronto Tempo','OUT','Injury/Illness - Left Calf; Not With Team','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Brittney Sykes','Toronto Tempo','OUT','Injury/Illness - Left Foot; Injury','08/23/2026','07:00 (ET)','LVA@TOR'],
    ['Sania Feagin','Portland Fire','OUT','Injury/Illness - Left Knee; Injury','08/23/2026','07:00 (ET)','WAS@PDX']
  ].map(([player,team,status,reason,gameDate,gameTime,matchup]) => ({
    player, team, status, reason, gameDate, gameTime, matchup,
    updated:'2026-08-23', source:'Official WNBA Injury Report PDF'
  })),
  teamStatuses: [
    ['Indiana Fever','NOT YET SUBMITTED','08/23/2026','07:00 (ET)','IND@CHI'],
    ['Golden State Valkyries','NOT YET SUBMITTED','08/24/2026','08:00 (ET)','GSV@MIN'],
    ['Minnesota Lynx','NOT YET SUBMITTED','08/24/2026','08:00 (ET)','GSV@MIN'],
    ['Atlanta Dream','NOT YET SUBMITTED','08/24/2026','10:00 (ET)','ATL@LAS'],
    ['Los Angeles Sparks','NOT YET SUBMITTED','08/24/2026','10:00 (ET)','ATL@LAS']
  ].map(([team,status,gameDate,gameTime,matchup]) => ({
    team, status, gameDate, gameTime, matchup, updated:'2026-08-23'
  }))
};

function decodePdfString(value='') {
  return String(value)
    .replace(/\\([nrtbf()\\])/g, (_, c) => ({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','(':'(',')':')','\\':'\\'}[c] || c))
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

function extractContentStreams(buffer) {
  const source = buffer.toString('latin1');
  const streams = [];
  let cursor = 0;
  while (cursor < source.length) {
    const marker = source.indexOf('stream', cursor);
    if (marker < 0) break;
    let start = marker + 6;
    if (source[start] === '\r' && source[start + 1] === '\n') start += 2;
    else if (source[start] === '\r' || source[start] === '\n') start += 1;
    const end = source.indexOf('endstream', start);
    if (end < 0) break;
    let raw = buffer.subarray(start, end);
    while (raw.length && (raw[raw.length - 1] === 10 || raw[raw.length - 1] === 13)) raw = raw.subarray(0, raw.length - 1);
    const dictStart = Math.max(0, source.lastIndexOf('<<', marker));
    const dictionary = source.slice(dictStart, marker);
    let data = raw;
    try {
      if (/\/FlateDecode/.test(dictionary)) data = zlib.inflateSync(raw);
    } catch {}
    const text = data.toString('latin1');
    if (text.includes('BT') && text.includes('Tj')) streams.push(text);
    cursor = end + 9;
  }
  return streams;
}

function textBlocks(content='') {
  const blocks = [];
  const blockPattern = /BT([\s\S]*?)\nET/g;
  let blockMatch;
  while ((blockMatch = blockPattern.exec(content))) {
    const block = blockMatch[1];
    const firstPosition = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Td/.exec(block);
    if (!firstPosition) continue;
    const words = [];
    const textPattern = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
    let textMatch;
    while ((textMatch = textPattern.exec(block))) words.push(decodePdfString(textMatch[1]));
    if (!words.length) continue;
    blocks.push({
      x: Number(firstPosition[1]),
      y: Number(firstPosition[2]),
      text: words.join(' ').replace(/\s+/g, ' ').trim()
    });
  }
  return blocks;
}

function nearest(blocks, predicate, y, tolerance=10) {
  return blocks
    .filter(block => predicate(block) && Math.abs(block.y - y) <= tolerance)
    .sort((a,b) => Math.abs(a.y-y) - Math.abs(b.y-y))[0] || null;
}
function preceding(blocks, predicate, y) {
  return blocks.filter(block => predicate(block) && block.y <= y + 1).sort((a,b)=>b.y-a.y)[0] || null;
}
function displayName(raw='') {
  const parts = String(raw).split(',').map(value => value.trim()).filter(Boolean);
  return parts.length > 1 ? `${parts.slice(1).join(' ')} ${parts[0]}` : String(raw).trim();
}
function dateIso(raw='') {
  const match = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[1]}-${match[2]}` : '';
}
function teamsFromMatchup(matchup='') {
  return String(matchup).split('@').map(code => TEAM_ABBREVIATIONS[code.trim().toUpperCase()]).filter(Boolean);
}

function parseOfficialPdf(buffer, meta={}) {
  const streams = extractContentStreams(buffer);
  const injuries = [];
  const teamStatuses = [];
  const coveredTeams = new Set();
  let carry = {gameDate:'',gameTime:'',matchup:''};

  for (const content of streams) {
    const blocks = textBlocks(content).filter(block => block.y > 75 && block.y < 540);
    if (!blocks.length) continue;
    const contextAt = y => ({
      gameDate: preceding(blocks, block => block.x < 110 && /^\d{2}\/\d{2}\/\d{4}$/.test(block.text), y)?.text || carry.gameDate,
      gameTime: preceding(blocks, block => block.x >= 110 && block.x < 190 && /^\d{2}:\d{2}/.test(block.text), y)?.text || carry.gameTime,
      matchup: preceding(blocks, block => block.x >= 190 && block.x < 260 && /@/.test(block.text), y)?.text || carry.matchup
    });

    for (const playerBlock of blocks.filter(block => block.x >= 420 && block.x < 580 && /,/.test(block.text) && block.text !== 'Player Name')) {
      const statusBlock = nearest(blocks, block => block.x >= 580 && block.x < 662, playerBlock.y, 10);
      const reasonBlock = nearest(blocks, block => block.x >= 662, playerBlock.y, 10);
      if (!statusBlock) continue;
      const teamBlock = preceding(blocks, block => block.x >= 260 && block.x < 420 && block.text !== 'Team', playerBlock.y);
      const context = contextAt(playerBlock.y);
      const team = teamBlock?.text || '';
      teamsFromMatchup(context.matchup).forEach(value => coveredTeams.add(value));
      if (team) coveredTeams.add(team);
      injuries.push({
        player: displayName(playerBlock.text), team,
        status: String(statusBlock.text).toUpperCase(),
        reason: reasonBlock?.text || 'Availability update',
        gameDate: context.gameDate,
        gameTime: context.gameTime,
        matchup: context.matchup,
        updated: dateIso(context.gameDate) || meta.reportDate || '',
        source: 'Official WNBA Injury Report PDF'
      });
    }

    for (const teamBlock of blocks.filter(block => block.x >= 260 && block.x < 420 && block.text !== 'Team')) {
      const reportBlock = nearest(blocks, block => block.x >= 662 && /NOT YET SUBMITTED/i.test(block.text), teamBlock.y, 2);
      if (!reportBlock) continue;
      const context = contextAt(teamBlock.y);
      teamsFromMatchup(context.matchup).forEach(value => coveredTeams.add(value));
      coveredTeams.add(teamBlock.text);
      teamStatuses.push({team:teamBlock.text,status:'NOT YET SUBMITTED',...context,updated:dateIso(context.gameDate) || meta.reportDate || ''});
    }

    const lastDate = blocks.filter(block => block.x < 110 && /^\d{2}\/\d{2}\/\d{4}$/.test(block.text)).sort((a,b)=>b.y-a.y)[0];
    const lastTime = blocks.filter(block => block.x >= 110 && block.x < 190 && /^\d{2}:\d{2}/.test(block.text)).sort((a,b)=>b.y-a.y)[0];
    const lastMatch = blocks.filter(block => block.x >= 190 && block.x < 260 && /@/.test(block.text)).sort((a,b)=>b.y-a.y)[0];
    if (lastDate) carry.gameDate = lastDate.text;
    if (lastTime) carry.gameTime = lastTime.text;
    if (lastMatch) carry.matchup = lastMatch.text;
  }

  return {injuries,teamStatuses,coveredTeams:[...coveredTeams]};
}

function easternParts(date=new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US',{
    timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type,part.value]));
}
function candidateMeta(date=new Date()) {
  const parts = easternParts(date);
  const hour24 = Number(parts.hour);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const reportDate = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    filename:`Injury-Report_${reportDate}_${String(hour12).padStart(2,'0')}_${parts.minute}${ampm}.pdf`,
    reportDate,
    reportLabel:`${parts.month}/${parts.day}/${parts.year} ${String(hour12).padStart(2,'0')}:${parts.minute} ${ampm} ET`
  };
}

async function fetchLatestOfficialReport(now=new Date()) {
  const easternNow = easternParts(now);
  const minute = Number(easternNow.minute);
  const floored = new Date(now.getTime() - (minute % 15) * 60000 - now.getUTCSeconds() * 1000 - now.getUTCMilliseconds());
  const errors = [];

  for (let i=0; i<16; i++) {
    const candidate = new Date(floored.getTime() - i * 15 * 60000);
    const meta = candidateMeta(candidate);
    const url = `${OFFICIAL_ROOT}/${meta.filename}`;
    try {
      const response = await fetch(url,{
        headers:{Accept:'application/pdf','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'},
        cache:'no-store'
      });
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.subarray(0,5).toString('ascii') !== '%PDF-') continue;
      const parsed = parseOfficialPdf(buffer,meta);
      if (!parsed.injuries.length && !parsed.teamStatuses.length) continue;
      return {
        ...parsed,
        reportTimestamp:meta.reportDate,
        reportLabel:meta.reportLabel,
        reportUrl:url,
        source:'Official WNBA Injury Report PDF',
        fallback:false
      };
    } catch (error) {
      errors.push(error.message || String(error));
    }
  }

  const coveredTeams = [...new Set([
    ...FALLBACK_REPORT.injuries.flatMap(item => teamsFromMatchup(item.matchup)),
    ...FALLBACK_REPORT.teamStatuses.flatMap(item => teamsFromMatchup(item.matchup))
  ])];
  return {...FALLBACK_REPORT,coveredTeams,fallback:true,errors};
}

module.exports = {fetchLatestOfficialReport,parseOfficialPdf,FALLBACK_REPORT,teamsFromMatchup};
