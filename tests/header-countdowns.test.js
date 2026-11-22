const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const site = fs.readFileSync('site.js', 'utf8');
const css = fs.readFileSync('site-navigation.css', 'utf8');

test('adds both 2027 countdowns to the shared site header', () => {
  assert.match(site, /data-w-header-countdowns/);
  assert.match(site, /2027 WNBA Draft/);
  assert.match(site, /2027 Season Tip-Off/);
  assert.match(site, /\['2027 Countdowns','#wHeaderCountdowns'\]/);
  assert.doesNotMatch(site, /#draftLotteryCountdown/);
  assert.match(site, /2027-04-12T00:00:00-04:00/);
  assert.match(site, /2027-05-07T00:00:00-04:00/);
});

test('labels the unconfirmed season date as projected', () => {
  assert.match(site, /PROJECTED MAY 7 · OFFICIAL DATE TBA/);
  assert.match(site, /APR 12, 2027 · TIME TBA/);
});

test('keeps the countdown strip responsive and readable', () => {
  assert.match(css, /\.w-header-countdowns\s*\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:900px\)[\s\S]*\.w-header-countdowns\{grid-template-columns:1fr/);
  assert.match(css, /font-variant-numeric:tabular-nums/);
});
