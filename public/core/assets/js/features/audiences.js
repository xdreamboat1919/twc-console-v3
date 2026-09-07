/* ================= AUDIENCE BUILD ================= */
var POP = { US: 230000000, CA: 27000000 };
var SRCNAME = {
  allpur: 'All purchasers',
  highaov: 'Purchasers above $250',
  member: '1Wellness members',
  kit: 'Emergency kit buyers',
  repeat: 'Repeat purchasers',
  app: 'Activated app users',
  email: 'Email subscribers, never purchased',
  vid: 'Video viewers 50%+',
};
$('lk-src').addEventListener('change', function () {
  var parts = this.value.split('|');
  $('lk-size').value = parts[1];
  calcLal();
});
function calcLal() {
  var parts = $('lk-src').value.split('|');
  var srcKey = parts[0],
    homog = parts[2] === 'homog1';
  var size = +$('lk-size').value || 0,
    rec = +$('lk-rec').value || 180,
    val = $('lk-val').value === '1',
    geo = $('lk-geo').value,
    pct = +$('lk-pct').value || 1;
  var pop = POP[geo];
  var reach = Math.round(pop * (pct / 100));

  var sizeScore = size >= 1000 ? 1 : size >= 500 ? 0.6 : 0;
  var recScore = rec <= 90 ? 1 : rec <= 180 ? 0.85 : rec <= 365 ? 0.6 : 0.3;
  var homScore = homog ? 1 : 0.6;
  var valScore = val ? 1 : 0.75;
  var q = Math.round((sizeScore * 0.35 + recScore * 0.2 + homScore * 0.25 + valScore * 0.2) * 100);

  $('lk-seed').textContent = size < 500 ? 'below minimum' : size < 1000 ? 'marginal' : 'good';
  $('lk-sbox').className = 'stat ' + (size >= 1000 ? 'hi' : size >= 500 ? 'md' : 'lo');
  $('lk-reach').textContent =
    reach >= 1000000 ? (reach / 1000000).toFixed(1) + 'M' : Math.round(reach / 1000) + 'K';
  $('lk-sim').textContent =
    pct <= 1 ? 'highest' : pct <= 3 ? 'high' : pct <= 5 ? 'moderate' : 'low';
  $('lk-type').textContent = val ? 'value-based' : 'standard';
  $('lk-ref').textContent = srcKey === 'vid' || srcKey === 'email' ? 'monthly' : 'quarterly';

  var r = $('lk-read');
  r.className = 'readout';
  var cls, label, body;
  if (size < 500) {
    cls = 'is-fail';
    label = 'Do not build this';
    body =
      'A seed of ' +
      size +
      ' is below the 500 minimum, and a lookalike modelled on fewer than that fits noise rather than a pattern. It will underperform broad targeting for months while everyone assumes a lookalike must be better than broad. Grow the seed, or seed on a broader definition and accept a less specific model.';
  } else if (q >= 80) {
    cls = 'is-pass';
    label = 'Strong seed';
    body =
      'A homogeneous seed of ' +
      size +
      ' from the last ' +
      rec +
      ' days' +
      (val ? ', with a value column' : '') +
      '. Quality score ' +
      q +
      '. The model has a consistent pattern to learn from, which matters far more than seed size once past the minimum. Five hundred high-value customers produce a better lookalike than five thousand mixed ones.';
  } else if (q >= 60) {
    cls = 'is-warn';
    label = 'Workable';
    body =
      'Quality score ' +
      q +
      '. ' +
      (!homog
        ? 'The seed is heterogeneous, meaning it mixes customer types the model then averages into something that resembles nobody. A narrower seed usually performs better even at a smaller size. '
        : '') +
      (!val
        ? 'Without a value column Meta weights every seed member equally, so a $30 buyer and a $600 buyer pull the model in the same direction. '
        : '') +
      (rec > 365 ? 'An all-time seed models a customer base that no longer exists. ' : '') +
      'Build it, and run it alongside broad rather than instead of it.';
  } else {
    cls = 'is-warn';
    label = 'Weak seed, low expectation';
    body =
      'Quality score ' +
      q +
      '. The combination of size, recency and heterogeneity means this will likely behave close to broad targeting with less reach. Worth building only if broad is already saturating and you need somewhere else to spend.';
  }
  r.classList.add(cls);
  $('lk-label').textContent = label;
  $('lk-val2').textContent = q;
  $('lk-fill').style.width = Math.min(100, (q / 80) * 70) + '%';
  $('lk-mark').style.left = '70%';
  $('lk-body').textContent = body;

  var w = '';
  if (rec > 365)
    w +=
      '<div class="flag f-med"><b>All-time seed</b>Meta weights recent seed members more heavily, and an all-time list dilutes that with customers whose behaviour no longer represents the base. A 180-day window usually outperforms an all-time one at a fraction of the size.</div>';
  if (!val && (srcKey === 'allpur' || srcKey === 'kit'))
    w +=
      '<div class="flag f-med"><b>No value column on a purchase seed</b>Map total spent to the LOOKALIKE_VALUE field on upload. It is one extra column and it changes the model from finding people who buy to finding people who spend.</div>';
  if (!homog)
    w +=
      '<div class="flag f-med"><b>Heterogeneous seed</b>' +
      SRCNAME[srcKey] +
      ' mixes customer types with different values and behaviours. The model averages them, and the result resembles nobody in particular. A narrower seed at a smaller size usually beats it.</div>';
  if (pct >= 5)
    w +=
      '<div class="flag f-low"><b>Wide percentage</b>At ' +
      pct +
      ' percent the audience is large and only loosely similar to the seed. This is close to broad targeting with extra steps, so compare it against broad directly before committing budget to it.</div>';
  if (srcKey === 'app' && size < 500)
    w +=
      '<div class="flag f-high"><b>App seed is too small</b>Activated app users are the highest-intent seed available and there are not yet enough of them. Revisit once activation has run for a quarter.</div>';
  if (!w)
    w =
      '<div class="flag f-ok"><b>No warnings</b>Seed source, recency and configuration are all sound for this build.</div>';
  $('lk-warn').innerHTML = w;

  $('lk-out').textContent =
    'LOOKALIKE SPECIFICATION\n' +
    '='.repeat(48) +
    '\n\n' +
    'AUDIENCE NAME   PR_LAL-' +
    srcKey.toUpperCase() +
    '-' +
    (pct === 1 ? '1' : pct === 2 ? '1-2' : pct === 3 ? '1-3' : pct === 5 ? '2-5' : '5-10') +
    '_' +
    geo +
    '\n\n' +
    'SEED SOURCE     ' +
    SRCNAME[srcKey] +
    '\n' +
    'SEED SIZE       ' +
    size.toLocaleString() +
    '\n' +
    'SEED WINDOW     ' +
    (rec >= 9999 ? 'All time' : 'Last ' + rec + ' days') +
    '\n' +
    'TYPE            ' +
    (val ? 'Value-based lookalike' : 'Standard lookalike') +
    '\n' +
    'COUNTRY         ' +
    geo +
    '\n' +
    'PERCENTAGE      ' +
    (pct === 1 ? '1%' : pct === 2 ? '1-2%' : pct === 3 ? '1-3%' : pct === 5 ? '2-5%' : '5-10%') +
    '\n' +
    'EST. REACH      ' +
    reach.toLocaleString() +
    '\n' +
    'QUALITY SCORE   ' +
    q +
    ' / 100\n\n' +
    'UPLOAD SCHEMA\n' +
    '  EMAIL, PHONE, FN, LN, CT, ST, ZIP, COUNTRY' +
    (val ? ',\n  LOOKALIKE_VALUE  <-- map to total spent' : '') +
    '\n' +
    '  SHA-256, lowercased and trimmed. Do not pre-hash if the\n' +
    '  upload tool hashes, and never both.\n\n' +
    'REFRESH         ' +
    (srcKey === 'vid' || srcKey === 'email' ? 'Monthly' : 'Quarterly') +
    '\n' +
    '  A seed built today models today\u2019s customer base.\n' +
    '  Rebuild before it stops doing so.\n\n' +
    'DEPLOYMENT\n' +
    '  Run alongside broad, not instead of it.\n' +
    '  If broad consistently wins, consolidate rather than\n' +
    '  keeping the lookalike alive to preserve the structure.';
}
['lk-size', 'lk-rec', 'lk-val', 'lk-geo', 'lk-pct'].forEach((id) => {
  $(id).addEventListener('input', calcLal);
});

function calcStack() {
  var a = $('st2-a').value === '1',
    b = $('st2-b').value === '1',
    x = $('st2-x').value === '1';
  var r = $('st2-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (a && b && !x) {
    cls = 'is-fail';
    label = 'Bidding against yourself';
    val = 'OVERLAP';
    body =
      'The 1 to 3 percent lookalike contains every person in the 1 percent. Running both without excluding the narrower from the broader means two of your own ad sets enter the same auction for the same person, which inflates your CPM with your own money and splits the conversion signal across two ad sets that could have been one. Either exclude the 1 percent from the 1 to 3 percent, or run the 1 to 3 percent alone. The second option is usually better, because the 1 percent is contained within it anyway.';
  } else if (a && b && x) {
    cls = 'is-warn';
    label = 'Handled, and probably unnecessary';
    val = 'SPLIT';
    body =
      'The exclusion prevents the auction collision, so this is technically correct. It also splits the budget and the conversion signal across two ad sets where one would carry both. Unless you have a specific reason to bid differently on the tightest 1 percent, a single 1 to 3 percent ad set will usually deliver better because it has more signal to learn from.';
  } else if (a && !b) {
    cls = 'is-pass';
    label = 'Tightest similarity';
    val = '1%';
    body =
      'The narrowest and most similar audience. Smallest reach, so it saturates fastest and frequency climbs sooner than on a broader band. Watch reach against audience size rather than frequency alone, and have a broader band ready before it exhausts.';
  } else if (b && !a) {
    cls = 'is-pass';
    label = 'Clean single band';
    val = '1-3%';
    body =
      'One band containing the tightest 1 percent, with more reach and a single pool of conversion signal. This is usually the right default when a lookalike is worth running at all.';
  } else {
    cls = 'is-pass';
    label = 'No lookalike running';
    val = 'BROAD';
    body =
      'Broad only. On an account with sufficient conversion signal this frequently outperforms any lookalike, because the model already knows who converts and a lookalike constrains where it may look. This is a legitimate end state rather than a gap to fill.';
  }
  r.classList.add(cls);
  $('st2-label').textContent = label;
  $('st2-val').textContent = val;
  $('st2-body').textContent = body;
}
['st2-a', 'st2-b', 'st2-x'].forEach((id) => {
  $(id).addEventListener('change', calcStack);
});

var LANEWIN = {
  kit: ['Kit purchasers', '180d'],
  supp: ['Category purchasers', '30d'],
  skin: ['Category purchasers', '60d'],
  farms: ['Category purchasers', '30d'],
  rest: ['Category purchasers', '45d'],
  rx: ['Active Rx customers', 'prescription duration'],
};
function calcExcl() {
  var t = $('ex-type').value,
    lane = $('ex-lane').value,
    tier = $('ex-tier').value,
    geo = $('ex-geo').value;
  var lw = LANEWIN[lane];
  var rows = [
    [
      'Under 18',
      'Always',
      'Mandatory on every campaign on this account, and legally required on any restricted or prescription lane.',
    ],
  ];
  rows.push([
    'Internal staff and agency',
    'Always',
    'A customer list of the people who work on the account. Small, and it removes a persistent source of skewed engagement.',
  ]);
  rows.push([
    'Wholesale and B2B enquirers',
    'Always',
    'Different buyer, different intent. Their engagement teaches the model the wrong pattern.',
  ]);
  if (t === 'acq' || t === 'test') {
    rows.push([
      lw[0],
      lw[1],
      'Prospecting must not pay to reach people who already bought. The window differs by product because a kit is durable and a supplement is consumable.',
    ]);
    rows.push([
      'The retargeting pool',
      'Rolling 30d',
      'The exclusion most accounts miss. Reaching a three-day-old visitor with prospecting budget is retargeting priced as prospecting and counted as new customer acquisition.',
    ]);
  }
  if (t === 'test') {
    rows.push([
      'Scaling campaign converters',
      'Rolling',
      'Testing must run on genuinely cold traffic, or a winning creative may simply be harvesting demand the scaling campaign already generated.',
    ]);
  }
  if (t === 'rtg') {
    rows.push([
      lw[0],
      lw[1],
      'A retargeting ad shown to someone who already bought is spend against a conversion that already happened.',
    ]);
    if (tier === 'rt02')
      rows.push([
        'RT01 Hot',
        'Rolling',
        'Each tier excludes every tier above it, or one person sits in several audiences and your own ad sets compete for the same impression.',
      ]);
    if (tier === 'rt03')
      rows.push([
        'RT01 and RT02',
        'Rolling',
        'Mutual exclusivity is what stops CPM inflating against your own bids.',
      ]);
    if (tier === 'rt05')
      rows.push([
        'RT01 through RT03',
        'Rolling',
        'Highest intent tiers take precedence. Engaged is the residual, not an overlay.',
      ]);
    if (tier === 'cons')
      rows.push([
        'Nothing above it',
        'n/a',
        'A consolidated tier is the whole pool, so there is nothing above it to exclude. Consolidate when the pool cannot support separate tiers above the delivery floor.',
      ]);
  }
  if (t === 'ret') {
    rows.push([
      'Anyone in an active retargeting tier',
      'Rolling 30d',
      'So a recent visitor is not receiving a replenishment message and a consideration message in the same week.',
    ]);
    rows.push([
      'Purchasers inside the replenishment window',
      'Product-specific',
      'Replenishment fires at the window, not before. On kits that is 120 to 180 days, not 30.',
    ]);
  }
  if (t === 'mem') {
    rows.push([
      'Existing members, all tiers',
      'Permanent',
      'Nothing to sell them. Upgrade is a separate campaign with its own audience.',
    ]);
    rows.push([
      'Non-purchasers',
      'Permanent',
      'Membership acquisition targets people who have already bought once. Selling a subscription to a stranger is a different and much harder campaign.',
    ]);
  }
  if (t === 'app') {
    rows.push([
      'Existing app users',
      'Permanent',
      'Requires the app_user tag written back from Firebase to Shopify. Without that writeback this exclusion cannot exist and the campaign wastes spend on activated users.',
    ]);
    rows.push([
      'Non-customers',
      'Permanent',
      'Activation targets the existing base. Cold installs into a funnel requiring government ID before first value produce poor economics.',
    ]);
  }
  if (lane === 'rx') {
    rows.push([
      'Anyone outside authorised geographies',
      'Always',
      'Targeting is limited to countries covered by the Meta authorisation. Confirm which domains it covers in writing.',
    ]);
  }
  if (geo === 'CA' && lane === 'rx') {
    rows.push([
      'All US audiences',
      'Always',
      'Canada permits far less direct-to-consumer prescription messaging, so the two markets separate at campaign level rather than by targeting.',
    ]);
  }
  $('ex-rows').innerHTML = rows
    .map(
      (r) =>
        '<tr><td><b>' +
        r[0] +
        '</b></td><td class="num">' +
        r[1] +
        '</td><td style="font-size:12.5px;color:var(--ink-3)">' +
        r[2] +
        '</td></tr>',
    )
    .join('');
  var tn = {
    acq: 'Prospecting',
    rtg: 'Retargeting',
    ret: 'Retention',
    mem: 'Membership',
    app: 'App activation',
    test: 'Creative testing',
  }[t];
  $('ex-out').textContent =
    'EXCLUSION STACK · ' +
    tn.toUpperCase() +
    ' · ' +
    lane.toUpperCase() +
    ' · ' +
    geo +
    '\n' +
    '='.repeat(52) +
    '\n\nAPPLIED AT AD SET LEVEL, NOT CAMPAIGN LEVEL\n\n' +
    rows
      .map(
        (r, i) =>
          String(i + 1).padStart(2, ' ') +
          '  ' +
          r[0] +
          (r[1] !== 'Always' && r[1] !== 'n/a' ? '  [' + r[1] + ']' : ''),
      )
      .join('\n') +
    '\n\nNOTE\n  Different ad sets inside one campaign frequently need\n  different exclusions, which is why these are never set\n  at campaign level even when they happen to be identical.';
  $('ex-note').className = 'note';
  $('ex-note').textContent =
    rows.length +
    ' exclusions for this configuration. The one worth checking is whether prospecting genuinely excludes the retargeting pool, because it is the most commonly missed and the cost is invisible: budget spent reaching a recent visitor lands in the new customer column and looks like acquisition.';
}
['ex-type', 'ex-lane', 'ex-tier', 'ex-geo'].forEach((id) => {
  $(id).addEventListener('change', calcExcl);
});

var AINV = [
  ['PR01', 'Broad or Advantage+', 'Targeting', 'n/a', 'n/a', 'Primary prospecting on every lane'],
  [
    'PR02',
    'Purchaser lookalike 1-3%',
    'Lookalike',
    '500 seed',
    'Quarterly',
    'Prospecting, alongside broad',
  ],
  [
    'PR03',
    'High-AOV lookalike 1-2%',
    'Lookalike',
    '500 seed above $250',
    'Quarterly',
    'The seed most accounts never build',
  ],
  [
    'PR04',
    'Member lookalike 1-2%',
    'Lookalike',
    '300 members',
    'Quarterly',
    'Highest-LTV seed available',
  ],
  [
    'RT01',
    'InitiateCheckout 0-7d',
    'Engagement',
    '1,000',
    'Automatic',
    'Hot retargeting, closing creative',
  ],
  ['RT02', 'AddToCart 0-14d', 'Engagement', '1,000', 'Automatic', 'Warm, objection handling'],
  [
    'RT03',
    'ViewContent 0-14d',
    'Engagement',
    '1,000',
    'Automatic',
    'Considering, FAQ and contents',
  ],
  [
    'RT05',
    'Video 50% and social engagers 0-30d',
    'Engagement',
    '1,000',
    'Automatic',
    'Often the first pool to populate',
  ],
  ['CU01', 'Supplement purchasers 30-60d', 'Customer list', '1,000', 'Weekly', 'Replenishment'],
  [
    'CU02',
    'Kit purchasers 120-180d',
    'Customer list',
    '1,000',
    'Weekly',
    'Replenish My Kit window',
  ],
  ['CU04', 'Non-member purchasers', 'Customer list', '1,000', 'Weekly', 'Membership upsell'],
  [
    'CU06',
    'Customers without the app',
    'Customer list',
    '1,000',
    'Weekly',
    'App activation, needs the tag writeback',
  ],
  [
    'CU07',
    'Rx intake abandoners',
    'Customer list',
    '500',
    'Daily',
    'Completion prompt, not reacquisition',
  ],
  [
    'SUP',
    'All purchasers',
    'Suppression',
    'n/a',
    'Weekly',
    'Excluded from every prospecting campaign',
  ],
  [
    'SUP',
    'Lapsed beyond 365d',
    'Suppression',
    'n/a',
    'Monthly',
    'Win-back belongs in email, not paid',
  ],
];
$('ai2-rows').innerHTML = AINV.map((a) => {
  var pill =
    a[2] === 'Lookalike'
      ? 'p-scale'
      : a[2] === 'Suppression'
        ? 'p-kill'
        : a[2] === 'Customer list'
          ? 'p-retest'
          : 'p-iterate';
  return (
    '<tr><td class="num">' +
    a[0] +
    '</td><td><b>' +
    a[1] +
    '</b></td><td><span class="pill ' +
    pill +
    '">' +
    a[2] +
    '</span></td>' +
    '<td class="num">' +
    a[3] +
    '</td><td>' +
    a[4] +
    '</td><td style="font-size:12.5px;color:var(--ink-3)">' +
    a[5] +
    '</td></tr>'
  );
}).join('');
