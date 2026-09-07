/* ---------- 02 NAMING ---------- */
function campName() {
  var p = [
    'TWC',
    $('n-geo').value,
    $('n-prod').value,
    $('n-fun').value,
    $('n-pur').value,
    $('n-bud').value,
  ];
  if ($('n-gate').value) p.push($('n-gate').value);
  return p.join('_');
}
function namePascal(value, fallback) {
  var raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^[A-Za-z0-9]+$/.test(raw)) return raw;
  return (
    raw
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') || fallback
  );
}
function nameSlug(value, fallback) {
  return (
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '') || fallback
  );
}
function assetName() {
  var date =
    String($('c-date').value || '')
      .replace(/[^0-9]/g, '')
      .slice(0, 8) || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  var rawId =
    String($('c-id').value || '')
      .replace(/^CID-/i, '')
      .replace(/[^A-Za-z0-9-]/g, '') || '0000';
  var version = Math.max(1, Number.parseInt($('c-version').value, 10) || 1);
  return [
    date,
    namePascal($('c-project').value, 'Project'),
    namePascal($('c-family').value, 'CreativeFamily'),
    'CID-' + rawId,
    's-' + nameSlug($('c-source').value, 'internal'),
    'f-' + nameSlug($('c-format').value, 'static'),
    'as-' + nameSlug($('c-style').value, 'general'),
    'm-' + nameSlug($('c-message').value, 'general'),
    'h-' + nameSlug($('c-hook').value, 'general'),
    'g-' + nameSlug($('c-group').value, 'general'),
    'gen-' + $('c-gender').value,
    'age-' + $('c-age').value,
    'len-' + $('c-length').value,
    'lp-' + nameSlug($('c-placement').value, 'paid'),
    'V' + version,
  ].join('_');
}
function cid() {
  return assetName();
}
function buildNames() {
  $('o-camp').textContent = campName();
  var d = $('n-asd').value.trim().toUpperCase().replace(/\s+/g, '-');
  var p = ['AS' + pad($('n-asn').value), $('n-aud').value];
  if (d) p.push(d);
  $('o-adset').textContent = p.join('_');
  $('o-cid').textContent = cid();
  var base = $('u-url').value.trim().split('?')[0];
  var q = [
    ['utm_source', $('u-src').value],
    ['utm_medium', $('u-med').value],
    ['utm_campaign', campName()],
    ['utm_content', cid()],
  ];
  var t = $('u-term').value.trim();
  if (t) q.push(['utm_term', t]);
  $('o-utm').textContent =
    base + '?' + q.map((k) => k[0] + '=' + encodeURIComponent(k[1])).join('&');
}
[
  'n-geo',
  'n-prod',
  'n-fun',
  'n-pur',
  'n-bud',
  'n-gate',
  'n-asn',
  'n-aud',
  'n-asd',
  'c-date',
  'c-project',
  'c-family',
  'c-id',
  'c-source',
  'c-format',
  'c-style',
  'c-message',
  'c-hook',
  'c-group',
  'c-gender',
  'c-age',
  'c-length',
  'c-placement',
  'c-version',
  'c-claim',
  'u-url',
  'u-src',
  'u-med',
  'u-term',
].forEach((id) => {
  $(id).addEventListener('input', buildNames);
});
$('name-generate').addEventListener('click', buildNames);

/* ---------- 03 STRUCTURE ---------- */
function buildStruct() {
  var lv = $('s-lane').value.split('|'),
    lane = lv[0],
    cpa = +lv[1];
  var geo = $('s-geo').value,
    day = +$('s-day').value || 0,
    ph = $('s-phase').value,
    assets = +$('s-assets').value || 6;
  var pre = 'TWC_' + geo + '_' + lane + '_';
  var need = (cpa * 50) / 7,
    out = '',
    note = '';
  var excl =
    lane === 'EMERGENCY-KITS'
      ? 'Kit purchasers 180d'
      : lane === 'SKINCARE'
        ? 'Category purchasers 60d'
        : lane === '1WELLNESS'
          ? 'Existing members, permanent'
          : 'Category purchasers 30d';
  if (ph === '1') {
    var cells = Math.max(1, Math.min(4, Math.floor(day / need) || 1));
    if (day / need < 1) cells = 1;
    var per = Math.round(day / cells);
    out =
      pre +
      'ACQ_CT-CONCEPT_ABO\n  Objective       Sales, optimise to Purchase\n  Attribution     7d click / 1d view\n  Bid             Highest volume, no cap\n  Placements      Advantage+\n  Exclusions      Under 18 · ' +
      excl +
      '\n';
    var names = ['PREPAREDNESS', 'ACCESS', 'AUTHORITY', 'UNBOXING'];
    for (var i = 0; i < cells; i++)
      out +=
        '\n  AS' +
        pad(i + 1) +
        '_BROAD_' +
        names[i] +
        '\n    Budget        ' +
        money(per) +
        '/day  ABO\n    Audience      Broad, identical across cells\n    Assets        ' +
        assets +
        '\n';
    note =
      cells === 1
        ? 'At this budget the lane supports one cell. A multi-cell concept test would produce an unreadable result at full cost. Run one ad set with creatives competing at the ad level, and read them in pairs across cycles.'
        : 'Audiences are identical across cells by design. Concept is the only variable. If audience and concept move together, a winning ad set tells you nothing you can reuse.';
  } else if (ph === '2') {
    var sc = Math.round(day * 0.7),
      rt = Math.round(day * 0.15),
      ct = day - sc - rt;
    out =
      pre +
      'ACQ_SCALE_CBO\n  Budget          ' +
      money(sc) +
      '/day  CBO\n  Exclusions      Under 18 · ' +
      excl +
      '\n\n  AS01_BROAD\n    Graduated winners only, 2 to 3 creatives\n\n' +
      pre +
      'RTG_30D_ABO\n  Budget          ' +
      money(rt) +
      '/day  ABO\n\n  AS01_RTG-CONSOLIDATED-30D\n    ATC + IC 0-14d, PV 0-30d, engagers 0-30d\n    Exclusions    Purchasers 0-180d\n    Creative      Objection-resolving, not prospecting\n\n' +
      pre +
      'ACQ_CT-ANGLE_ABO\n  Budget          ' +
      money(ct) +
      '/day  ABO\n  3 cells, angles inside the winning concept\n';
    note =
      'Retargeting stays outside the scaling CBO at this stage. Warm conversions are cheaper, so an unconstrained CBO would move budget into retargeting until prospecting starves and the pool depletes with nothing refilling it. Fold it in once total spend clears roughly $3,000 daily.';
  } else {
    var s2 = Math.round(day * 0.6),
      r2 = Math.round(day * 0.15),
      t2 = Math.round(day * 0.15),
      x2 = day - s2 - r2 - t2;
    out =
      pre +
      'ACQ_SCALE_CBO\n  Budget          ' +
      money(s2) +
      '/day  CBO\n  Bid             Cost cap, set above observed median\n\n' +
      '  AS01_BROAD                      min 55% of campaign\n  AS02_LAL-PURCHASER-1-3          min 20%\n  AS03_LAL-HIGHAOV-1-2            min 10%\n  AS04_RTG-CONSOLIDATED-30D       max 15%\n    Exclusions    Purchasers 0-180d\n\n' +
      pre +
      'ACQ_CT-CONCEPT_ABO\n  Budget          ' +
      money(t2) +
      '/day  ABO, rolling fortnightly batch\n\n' +
      pre +
      'RET_REPLENISH_ABO\n  Budget          ' +
      money(x2 + r2) +
      '/day  ABO\n  Purchasers at the lane replenishment window\n';
    note =
      'Retargeting now sits inside the scaling CBO with a spend maximum, and the prospecting ad sets carry minimums. Without those limits Meta will allocate toward the cheapest conversions available and new customer acquisition stops while blended ROAS rises.';
  }
  $('o-struct').textContent = out;
  $('s-note').textContent = note;
  renderStructDiagram();
}
['s-lane', 's-geo', 's-day', 's-phase', 's-assets'].forEach((id) => {
  $(id).addEventListener('input', buildStruct);
});

/* ---------- 04 BUDGET ---------- */
var LANES = [
  ['Emergency kits', 0.24],
  ['Wellness Farms and skincare', 0.18],
  ['Core supplements', 0.17],
  ['Restricted category', 0.09],
  ['Membership', 0.09],
  ['Retargeting', 0.09],
  ['Retention and replenishment', 0.06],
  ['App activation', 0.03],
  ['Creative testing', 0.05],
];
function calcBudget() {
  var day = +$('b-day').value || 0,
    cpa = +$('b-cpa').value || 1,
    sets = Math.max(1, +$('b-sets').value || 1);
  var per = day / sets,
    cpd = per / cpa,
    cpw = cpd * 7,
    need = (cpa * 50) / 7,
    max = Math.floor(day / need);
  $('b-perset').textContent = money(per);
  $('b-cpd').textContent = cpd.toFixed(1);
  $('b-cpw').textContent = Math.round(cpw);
  $('b-max').textContent = max;
  $('b-mo').textContent = money(day * 30);
  var r = $('b-read');
  r.className = 'readout';
  var cls, label, body;
  if (cpw >= 50) {
    cls = 'is-pass';
    label = 'Clears the threshold';
    body =
      'Each ad set receives roughly ' +
      Math.round(cpw) +
      ' conversions a week. Delivery will stabilise. At this budget you can support up to ' +
      max +
      ' ad set' +
      (max === 1 ? '' : 's') +
      ' at this CPA.';
  } else if (cpw >= 35) {
    cls = 'is-warn';
    label = 'Marginal';
    body =
      'Roughly ' +
      Math.round(cpw) +
      ' conversions a week against a threshold of 50. Workable but volatile, and most day-to-day CPA movement will be noise. Consider consolidating to ' +
      Math.max(1, max) +
      ' ad set' +
      (max === 1 ? '' : 's') +
      '.';
  } else {
    cls = 'is-fail';
    label = 'Learning limited';
    body =
      'Roughly ' +
      Math.round(cpw) +
      ' conversions a week, well under the threshold. ' +
      (max < 1
        ? 'Even the entire budget on a single ad set falls short at this CPA. Either launch on a lower-CPA product, or accept learning-limited delivery and run one ad set with creatives competing at the ad level.'
        : 'Consolidate to ' +
          max +
          ' ad set' +
          (max === 1 ? '' : 's') +
          '. Adding ad sets below the threshold makes this worse, not better.');
  }
  r.classList.add(cls);
  $('b-label').textContent = label;
  $('b-val').textContent = Math.round(cpw) + '/wk';
  $('b-fill').style.width = Math.min(100, (cpw / 50) * 62) + '%';
  $('b-mark').style.left = '62%';
  $('b-body').textContent = body;
  var mo = day * 30;
  $('b-alloc').innerHTML = LANES.map(
    (l) =>
      '<tr><td>' +
      l[0] +
      '</td><td class="num">' +
      Math.round(l[1] * 100) +
      '%</td><td class="num">' +
      money(mo * l[1]) +
      '</td><td class="num">' +
      money(day * l[1]) +
      '</td></tr>',
  ).join('');
}
['b-day', 'b-cpa', 'b-sets'].forEach((id) => {
  $(id).addEventListener('input', calcBudget);
});

function calcPace() {
  var plan = +$('p-plan').value || 0,
    spent = +$('p-spent').value || 0,
    d = +$('p-day').value || 1,
    dim = +$('p-dim').value || 30;
  var should = (plan / dim) * d,
    va = spent - should,
    pct = should ? (va / should) * 100 : 0,
    rem = plan - spent,
    left = Math.max(0, dim - d),
    req = left ? rem / left : 0;
  $('p-should').textContent = money(should);
  $('p-rem').textContent = money(rem);
  $('p-req').textContent = money(req);
  $('p-var').textContent = (va >= 0 ? '+' : '') + money(va);
  var box = $('p-varbox');
  box.className = 'stat ' + (Math.abs(pct) <= 15 ? 'hi' : Math.abs(pct) <= 25 ? 'md' : 'lo');
  var n = $('p-note');
  if (Math.abs(pct) <= 15) {
    n.className = 'note good';
    n.textContent =
      'Within the 15 percent tolerance. This is noise. Correct on the weekly reconciliation, not today.';
  } else if (va < 0) {
    n.className = 'note warn';
    n.textContent =
      'Underspending by ' +
      Math.abs(Math.round(pct)) +
      ' percent. Required daily rises to ' +
      money(req) +
      '. Raise budgets in 20 to 25 percent steps rather than one correction, because a large jump can push ad sets back into learning and undo what you were pacing toward.';
  } else {
    n.className = 'note warn';
    n.textContent =
      'Overspending by ' +
      Math.round(pct) +
      ' percent. Reduce rather than pause, because pausing resets learning. Underspend beats inefficient spend, so do not dump the difference at month end.';
  }
}
['p-plan', 'p-spent', 'p-day', 'p-dim'].forEach((id) => {
  $(id).addEventListener('input', calcPace);
});

/* ---------- 05 ECONOMICS ---------- */
function calcEcon() {
  var price = +$('e-price').value || 0,
    cogs = +$('e-cogs').value || 0,
    ship = +$('e-ship').value || 0,
    fee = (+$('e-fee').value || 0) / 100,
    roas = +$('e-roas').value || 1;
  var contrib = price - cogs - ship - price * fee,
    be = contrib > 0 ? price / contrib : 0,
    tcpa = roas > 0 ? price / roas : 0;
  $('e-contrib').textContent = '$' + contrib.toFixed(2);
  $('e-margin').textContent = price ? Math.round((contrib / price) * 100) + '%' : 'n/a';
  $('e-be').textContent = be ? be.toFixed(2) : 'n/a';
  $('e-maxcpa').textContent = '$' + contrib.toFixed(0);
  $('e-tcpa').textContent = '$' + tcpa.toFixed(0);
  var aov = +$('e-aov').value || price,
    ltv = +$('e-ltv').value || 1,
    ratio = price ? contrib / price : 0;
  var bcpa = aov * ratio,
    mcpa = contrib * ltv;
  $('e-bcpa').textContent = '$' + bcpa.toFixed(0);
  $('e-blift').textContent =
    contrib > 0 ? '+' + Math.round((bcpa / contrib - 1) * 100) + '%' : 'n/a';
  $('e-mcpa').textContent = '$' + mcpa.toFixed(0);
  $('e-mlift').textContent = '+' + Math.round((ltv - 1) * 100) + '%';
}
['e-price', 'e-cogs', 'e-ship', 'e-fee', 'e-roas', 'e-aov', 'e-ltv'].forEach((id) => {
  $(id).addEventListener('input', calcEcon);
});

function calcMarg() {
  var s1 = +$('m-s1').value || 0,
    c1 = +$('m-c1').value || 0,
    s2 = +$('m-s2').value || 0,
    c2 = +$('m-c2').value || 0;
  var b1 = c1 ? s1 / c1 : 0,
    b2 = c2 ? s2 / c2 : 0,
    ds = s2 - s1,
    dc = c2 - c1,
    mg = dc > 0 ? ds / dc : 0;
  $('m-b1').textContent = b1 ? '$' + b1.toFixed(0) : 'n/a';
  $('m-b2').textContent = b2 ? '$' + b2.toFixed(0) : 'n/a';
  $('m-extra').textContent = dc;
  $('m-marg').textContent = dc > 0 ? '$' + mg.toFixed(0) : 'n/a';
  var box = $('m-box'),
    n = $('m-note'),
    tgt = +$('b-cpa').value || 120;
  if (dc <= 0) {
    box.className = 'stat lo';
    n.className = 'note bad';
    n.textContent =
      'The increment bought no additional conversions. Marginal CPA is effectively infinite. Reverse the increase and add creative instead, because the audience is not responding to more money.';
  } else if (mg <= tgt) {
    box.className = 'stat hi';
    n.className = 'note good';
    n.textContent =
      'Marginal CPA of $' +
      mg.toFixed(0) +
      ' is at or below the $' +
      tgt +
      ' target, so the increment is still efficient. Wait 48 to 72 hours, then consider a further 20 to 25 percent step.';
  } else if (mg <= tgt * 1.4) {
    box.className = 'stat md';
    n.className = 'note warn';
    n.textContent =
      'Marginal CPA of $' +
      mg.toFixed(0) +
      ' is above the $' +
      tgt +
      ' target while blended still looks acceptable. This is the point at which the aggregate starts hiding the decay. Hold this budget and add validated creative rather than money.';
  } else {
    box.className = 'stat lo';
    n.className = 'note bad';
    n.textContent =
      'Marginal CPA of $' +
      mg.toFixed(0) +
      ' is well above target. Every additional dollar is materially less efficient. Roll back to the previous budget and work the creative pipeline.';
  }
}
['m-s1', 'm-c1', 'm-s2', 'm-c2', 'b-cpa'].forEach((id) => {
  $(id).addEventListener('input', calcMarg);
});

/* ---------- 06 CREATIVE ---------- */
var creatives = [];
function addCreative(pre) {
  creatives.push(pre || { id: cid(), name: '', spend: 0, atc: 0, ic: 0, purch: 0, rev: 0, ctr: 0 });
  renderCreatives();
}
function verdict(c, tgt, mult) {
  var minRead = tgt * mult,
    cpa = c.purch ? c.spend / c.purch : 0;
  var bAtc = tgt * ((+$('cr-batc').value || 38) / 100),
    bIc = tgt * ((+$('cr-bic').value || 60) / 100);
  var cAtc = c.atc ? c.spend / c.atc : 0,
    cIc = c.ic ? c.spend / c.ic : 0;
  if (c.spend < minRead) return 'retest';
  if (c.purch > 0 && cpa <= tgt) return 'scale';
  if (cAtc && cIc && cAtc <= bAtc * 1.15 && cIc <= bIc * 1.15 && cpa > tgt) return 'checkout';
  if (cAtc && cAtc <= bAtc * 1.15 && (!cIc || cIc > bIc * 1.15)) return 'dest';
  if (c.purch === 0 && c.ctr >= 1.4) return 'support';
  if (c.ctr >= 1.2 && (c.purch === 0 || cpa > tgt)) return 'iterate';
  return 'kill';
}
function renderCreatives() {
  var tgt = +$('cr-cpa').value || 120,
    mult = +$('cr-mult').value || 3;
  var ts = 0,
    tp = 0,
    tr = 0,
    g = 0,
    k = 0;
  $('cr-rows').innerHTML =
    creatives
      .map((c, i) => {
        var cpa = c.purch ? c.spend / c.purch : 0,
          roas = c.spend ? c.rev / c.spend : 0,
          v = verdict(c, tgt, mult);
        var bAtc = tgt * ((+$('cr-batc').value || 38) / 100),
          bIc = tgt * ((+$('cr-bic').value || 60) / 100);
        var cAtc = c.atc ? c.spend / c.atc : 0,
          cIc = c.ic ? c.spend / c.ic : 0;
        var lbl = {
          scale: 'Scale',
          iterate: 'Iterate',
          retest: 'Retest',
          kill: 'Kill',
          support: 'Support',
          dest: 'Destination',
          checkout: 'Checkout',
        }[v];
        ts += +c.spend;
        tp += +c.purch;
        tr += +c.rev;
        if (v === 'scale') g++;
        if (v === 'kill') k++;
        return (
          '<tr><td style="font-family:var(--mono);font-size:12px">' +
          c.id +
          '</td>' +
          '<td><input type="text" data-i="' +
          i +
          '" data-k="name" value="' +
          (c.name || '') +
          '" placeholder="IND-01" style="font-family:var(--sans)"></td>' +
          '<td><input type="number" data-i="' +
          i +
          '" data-k="spend" value="' +
          c.spend +
          '" style="width:82px"></td>' +
          '<td><input type="number" data-i="' +
          i +
          '" data-k="atc" value="' +
          (c.atc || 0) +
          '" style="width:58px"></td>' +
          '<td><input type="number" data-i="' +
          i +
          '" data-k="ic" value="' +
          (c.ic || 0) +
          '" style="width:58px"></td>' +
          '<td><input type="number" data-i="' +
          i +
          '" data-k="purch" value="' +
          c.purch +
          '" style="width:58px"></td>' +
          '<td><input type="number" data-i="' +
          i +
          '" data-k="rev" value="' +
          c.rev +
          '" style="width:88px"></td>' +
          '<td><input type="number" step="0.1" data-i="' +
          i +
          '" data-k="ctr" value="' +
          c.ctr +
          '" style="width:58px"></td>' +
          '<td class="num" style="color:' +
          (cAtc && cAtc > bAtc * 1.15 ? 'var(--fail)' : 'inherit') +
          '">' +
          (cAtc ? '$' + cAtc.toFixed(0) : '—') +
          '</td>' +
          '<td class="num" style="color:' +
          (cIc && cIc > bIc * 1.15 ? 'var(--fail)' : 'inherit') +
          '">' +
          (cIc ? '$' + cIc.toFixed(0) : '—') +
          '</td>' +
          '<td class="num">' +
          (cpa ? '$' + cpa.toFixed(0) : '—') +
          '</td>' +
          '<td class="num">' +
          (roas ? roas.toFixed(2) : '—') +
          '</td>' +
          '<td><span class="pill p-' +
          v +
          '">' +
          lbl +
          '</span></td>' +
          '<td><button class="btn" data-del="' +
          i +
          '" style="padding:4px 9px">Remove</button></td></tr>'
        );
      })
      .join('') ||
    '<tr><td colspan="14" style="color:var(--ink-3);padding:18px 12px">No creatives logged. Add the batch above.</td></tr>';
  $('cr-spend').textContent = money(ts);
  $('cr-bcpa').textContent = tp ? '$' + (ts / tp).toFixed(0) : '—';
  $('cr-broas').textContent = ts ? (tr / ts).toFixed(2) : '—';
  $('cr-grad').textContent = g;
  $('cr-kill').textContent = k;
  var n = $('cr-note');
  if (!creatives.length) {
    n.className = 'note';
    n.textContent =
      'Batch size is set by confidence per creative, not production capacity. At a ' +
      money(tgt * mult) +
      ' minimum read, a fortnightly testing budget divided by that figure gives the maximum readable batch.';
  } else if (g === 0 && creatives.filter((c) => verdict(c, tgt, mult) !== 'retest').length >= 3) {
    n.className = 'note warn';
    n.textContent =
      'No graduates in a batch where most assets have reached the minimum read. Before producing another batch against the same brief, check the tracking and the landing page conversion rate. When every concept fails similarly the problem is usually upstream of creative.';
  } else if (
    creatives.filter(
      (c) => verdict(c, tgt, mult) === 'dest' || verdict(c, tgt, mult) === 'checkout',
    ).length
  ) {
    var nf = creatives.filter(
      (c) => verdict(c, tgt, mult) === 'dest' || verdict(c, tgt, mult) === 'checkout',
    ).length;
    n.className = 'note bad';
    n.textContent =
      nf +
      ' asset' +
      (nf === 1 ? ' carries a' + ' non-creative verdict' : 's carry non-creative verdicts') +
      '. Cost per add to cart sat at benchmark, meaning the creative delivered qualified traffic and something downstream lost it. Killing these would remove working creative and leave the actual problem untouched. Take the destination or checkout finding to the funnel before producing another batch.';
  } else if (g > 0) {
    n.className = 'note good';
    n.textContent =
      g +
      ' asset' +
      (g === 1 ? '' : 's') +
      ' meeting the graduation criteria. Confirm the conversions are real in the commerce back end before promoting anything, then enter them into the scaling campaign at a controlled share rather than at full weight.';
  } else {
    n.className = 'note';
    n.textContent =
      'Assets still below the minimum read. Hold the decision. A creative killed before it has spent ' +
      money(tgt * mult) +
      ' has been judged on noise.';
  }
}
$('cr-add').addEventListener('click', () => {
  addCreative();
});
$('cr-rows').addEventListener('input', (e) => {
  var t = e.target;
  if (!t.dataset.k) return;
  var c = creatives[+t.dataset.i];
  c[t.dataset.k] = t.dataset.k === 'name' ? t.value : +t.value || 0;
  renderCreatives();
});
$('cr-rows').addEventListener('click', (e) => {
  var b = e.target.closest('[data-del]');
  if (!b) return;
  creatives.splice(+b.dataset.del, 1);
  renderCreatives();
});
['cr-cpa', 'cr-mult', 'cr-batc', 'cr-bic'].forEach((id) => {
  $(id).addEventListener('input', renderCreatives);
});

/* ---------- 07 COPY CHECK ---------- */
var RULES = [
  {
    s: 'high',
    n: 'Named condition',
    w: [
      'fever',
      'infection',
      'infected',
      'covid',
      'flu',
      'influenza',
      'diabetes',
      'diabetic',
      'anxiety',
      'anxious',
      'depression',
      'depressed',
      'inflammation',
      'inflamed',
      'arthritis',
      'cancer',
      'tumour',
      'tumor',
      'obesity',
      'obese',
      'insomnia',
      'migraine',
      'asthma',
      'hypertension',
      'illness',
      'disease',
      'symptom',
      'syndrome',
      'disorder',
      'ailment',
      'unwell',
      'parasite',
    ],
    m: 'Naming a condition on a supplement or kit is a treatment claim by structure, regardless of wording. Remove it, or replace it with a situational framing.',
  },
  {
    s: 'high',
    n: 'Treatment or prevention verb',
    w: [
      'cure',
      'cures',
      'cured',
      'treat',
      'treats',
      'treating',
      'treatment',
      'heal',
      'heals',
      'healing',
      'prevent',
      'prevents',
      'prevention',
      'reverse',
      'reverses',
      'eliminate',
      'eliminates',
      'remedy',
      'relieve',
      'relieves',
      'combat',
      'fights',
      'flush',
      'purge',
      'detoxify',
    ],
    m: 'Positions the product as treating or preventing. Not permitted without approval, and rarely approvable on a supplement.',
  },
  {
    s: 'high',
    n: 'Second person plus health state',
    w: [
      'are you suffering',
      'suffering from',
      'struggling with',
      'do you suffer',
      'if you have',
      'your condition',
      'your symptoms',
      'feeling unwell',
      'your health problem',
    ],
    m: 'Asserts or implies knowledge of the viewer. The single most common disapproval cause in this category, and usually a grammar problem rather than a message problem.',
  },
  {
    s: 'high',
    n: 'Guarantee',
    w: ['guarantee', 'guaranteed', 'risk-free', 'risk free', 'promise', 'promised', 'always works'],
    m: 'Any promise of a result is prohibited. Guarantees about shipping or refunds are fine; guarantees about outcomes are not.',
  },
  {
    s: 'high',
    n: 'Quantified outcome',
    w: [
      'clinically proven',
      'proven to',
      'studies show',
      'research shows',
      'shown to reduce',
      'shown to improve',
      'net benefit',
      'clinical benefit',
    ],
    m: 'Quantified or study-backed outcome language sits in the review-required tier and needs sign-off with the substantiation attached.',
  },
  {
    s: 'med',
    n: 'Outcome or efficacy language',
    w: [
      'works',
      'effective',
      'effectiveness',
      'results',
      'improved',
      'improves',
      'boost',
      'boosts',
      'enhance',
      'enhances',
      'restore',
      'restores',
      'recovery',
      'recovered',
      'stronger',
      'fix',
      'fixes',
    ],
    m: 'Describes an effect. Reframe toward product function, contents or convenience.',
  },
  {
    s: 'med',
    n: 'Comparison to medication',
    w: [
      'instead of',
      'better than',
      'alternative to',
      'replace your',
      'without a prescription',
      'natural alternative',
    ],
    m: 'Comparison to medication is review-required. Comparing a product to another product in the range is fine.',
  },
  {
    s: 'med',
    n: 'Substitution for care',
    w: [
      'skip the doctor',
      'no doctor needed',
      'avoid the hospital',
      'replaces a visit',
      'no need to see',
    ],
    m: 'Implies replacing medical care. The published disclaimer frames the product for when immediate care is not accessible, and creative should match that rather than exceed it.',
  },
  {
    s: 'low',
    n: 'Superlative',
    w: [
      'best',
      'strongest',
      'most powerful',
      'ultimate',
      'miracle',
      'breakthrough',
      'revolutionary',
      'number one',
    ],
    m: 'Substantiation risk, and it attracts review. Usually removable with no loss of performance.',
  },
  {
    s: 'low',
    n: 'Manufactured urgency',
    w: [
      'act now',
      'before it is too late',
      'last chance',
      'while you still can',
      'running out of time',
    ],
    m: 'Urgency is fine attached to an offer and becomes a claim when attached to a health need, because it implies delay carries a health cost.',
  },
];
var SAFE = [
  'supports',
  'helps maintain',
  'formulated',
  'designed',
  'contains',
  'includes',
  'developed',
  'free shipping',
  'ships',
  'delivered',
  'physician',
  'licensed provider',
  'guidebook',
];
function checkCopy() {
  var raw = $('cc-in').value,
    low = raw.toLowerCase(),
    hits = [],
    counts = { high: 0, med: 0, low: 0 };
  RULES.forEach((r) => {
    var f = r.w.filter((w) => low.indexOf(w) > -1);
    if (f.length) {
      hits.push({ s: r.s, n: r.n, m: r.m, found: f });
      counts[r.s] += f.length;
    }
  });
  $('cc-h').textContent = counts.high;
  $('cc-m').textContent = counts.med;
  $('cc-l').textContent = counts.low;
  $('cc-w').textContent = raw.trim() ? raw.trim().split(/\s+/).length : 0;
  var safeFound = SAFE.filter((w) => low.indexOf(w) > -1),
    html = '';
  if (!hits.length && raw.trim()) {
    html =
      '<div class="flag f-ok"><b>No blocking patterns found</b>Nothing matched the common failure patterns. This is a first-pass scan, not approval. Copy still needs review by the medical or legal team before it runs.' +
      (safeFound.length
        ? ' Approved-register language detected: <code>' +
          safeFound.join('</code> <code>') +
          '</code>.'
        : '') +
      '</div>';
  }
  var order = { high: 0, med: 1, low: 2 };
  hits.sort((a, b) => order[a.s] - order[b.s]);
  hits.forEach((h) => {
    var cls = h.s === 'high' ? 'f-high' : h.s === 'med' ? 'f-med' : 'f-low';
    var lbl = h.s === 'high' ? 'Blocking' : h.s === 'med' ? 'Needs review' : 'Watch';
    html +=
      '<div class="flag ' +
      cls +
      '"><b>' +
      lbl +
      ', ' +
      h.n +
      '</b>Found: <code>' +
      h.found.join('</code> <code>') +
      '</code><br>' +
      h.m +
      '</div>';
  });
  $('cc-flags').innerHTML = html;
  var prev = esc(raw);
  RULES.forEach((r) => {
    r.w.forEach((w) => {
      var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      prev = prev.replace(re, r.s === 'high' ? '<mark class="h">$1</mark>' : '<mark>$1</mark>');
    });
  });
  $('cc-prev').innerHTML = prev || '<span style="color:#6b7889">Nothing to show.</span>';
}
$('cc-in').addEventListener('input', checkCopy);

/* ---------- 08 TRACKING ---------- */
function routeClass() {
  var u = $('tr-url').value.toLowerCase(),
    phi = $('tr-phi').value === '1',
    named = $('tr-name').value === '1';
  var clinicalDomain =
    /care\.twc\.health|\/appointment|\/consult|\/intake|\/replenish|\/records|\/medical-history/.test(
      u,
    );
  var isB = clinicalDomain || phi || named;
  var r = $('tr-read');
  r.className = 'readout';
  var cfg;
  if (isB) {
    r.classList.add('is-fail');
    $('tr-label').textContent = 'Class B, clinical';
    $('tr-val').textContent = 'restricted';
    var why = [];
    if (clinicalDomain) why.push('the path sits on a clinical surface');
    if (phi) why.push('the page collects health information');
    if (named) why.push('the URL or page names a condition, medication or service');
    $('tr-body').textContent =
      'Classified clinical because ' +
      why.join(', and ') +
      '. The event itself can carry protected health information, and standard advanced matching across healthcare intake is precisely the implementation pattern that has generated enforcement exposure across the sector. Instrument this server-side at a de-identified milestone, and keep the browser pixel off it entirely.';
    cfg = [
      ['Browser pixel', 'Off'],
      ['Meta CAPI', 'Server-side only, from the CRM'],
      ['Conversion event', 'De-identified milestone, abstracted name'],
      ['Advanced matching', 'Off. No health-context parameters.'],
      ['GA4 property', 'GA4_TWC_CLINICAL'],
      ['Google Signals', 'Off'],
      ['Data sharing with Google', 'Off'],
      ['Advertising audiences', 'Excluded'],
      ['User ID stitching', 'Not linked to clinical events'],
    ];
  } else {
    r.classList.add('is-pass');
    $('tr-label').textContent = 'Class A, commerce';
    $('tr-val').textContent = 'full stack';
    $('tr-body').textContent =
      'Classified commerce. This is a retail transaction surface and it behaves like any ecommerce page. Full instrumentation applies, and the thing to verify is that deduplication is implemented on every event rather than only on Purchase.';
    cfg = [
      ['Browser pixel', 'On, full funnel'],
      ['Meta CAPI', 'On, in parallel'],
      ['Deduplication', 'Matched event_id on order ID, every event'],
      ['Advanced matching', 'On'],
      ['Value and currency', 'Required on Purchase and Subscribe'],
      ['GA4 property', 'GA4_TWC_US or GA4_TWC_CA'],
      ['Consent Mode', 'v2'],
      ['BigQuery export', 'On'],
      ['Server-side GTM', 'Through GTM-WDH2F5L'],
    ];
  }
  $('tr-cfg').innerHTML = cfg
    .map((c) => '<tr><td>' + c[0] + '</td><td>' + c[1] + '</td></tr>')
    .join('');
}
['tr-url', 'tr-phi', 'tr-name'].forEach((id) => {
  $(id).addEventListener('input', routeClass);
});

var PHI_RULES = [
  {
    s: 'high',
    n: 'Medication named',
    w: [
      'ivermectin',
      'mebendazole',
      'tirzepatide',
      'naltrexone',
      'metformin',
      'tadalafil',
      'vardenafil',
      'semaglutide',
      'hydroxychloroquine',
      'azithromycin',
      'doxycycline',
      'amoxicillin',
      'methylene',
    ],
    m: 'A medication in an event name discloses what the user is being prescribed. Abstract it. Use rx_consultation_booked rather than naming the drug.',
  },
  {
    s: 'high',
    n: 'Condition named',
    w: [
      'covid',
      'spike',
      'parasite',
      'diabetes',
      'anxiety',
      'depression',
      'pain',
      'infection',
      'fever',
      'allergy',
      'insomnia',
      'obesity',
      'cancer',
      'detox',
    ],
    m: 'A condition in an event name discloses a health status. Abstract it entirely, because the event travels to the platform whether or not it is used for targeting.',
  },
  {
    s: 'high',
    n: 'Direct identifier',
    w: [
      'email',
      'phone',
      'name',
      'dob',
      'date_of_birth',
      'ssn',
      'address',
      'gov_id',
      'id_number',
      'passport',
      'selfie',
      'photo_id',
      'insurance',
      'member_id',
      'patient_id',
    ],
    m: 'A direct identifier as an event parameter on a clinical surface is the pattern that generates enforcement exposure. Hash it, or do not send it at all from a clinical surface.',
  },
  {
    s: 'high',
    n: 'Health parameter',
    w: [
      'condition',
      'symptom',
      'diagnosis',
      'medication',
      'dosage',
      'prescription',
      'provider_name',
      'treatment',
      'severity',
      'test_result',
      'lab_result',
    ],
    m: 'Health-context parameters do not belong in an analytics or advertising payload from any surface.',
  },
  {
    s: 'med',
    n: 'Service type disclosed',
    w: [
      'telehealth',
      'consultation',
      'appointment',
      'doctor',
      'physician',
      'pharmacy',
      'medical_record',
      'clinical',
      'intake',
      'rx_',
    ],
    m: 'A service type is weaker than a condition and still narrows what the user is doing. Acceptable on a commerce surface, and on a clinical surface it should be abstracted to something like intake_step_complete.',
  },
];
var PHI_SAFE = [
  'activation_complete',
  'intake_step_complete',
  'booking_confirmed',
  'marketplace_view',
  'marketplace_purchase',
  'first_open',
  'registration_start',
  'otp_verified',
  'pin_created',
  'account_linked',
  'step_complete',
  'flow_complete',
];
function scanEvents() {
  var lines = $('ev-in')
      .value.split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean),
    html = '';
  if (!lines.length) {
    $('ev-out').innerHTML = '';
    return;
  }
  lines.forEach((l) => {
    var low = l.toLowerCase(),
      hits = [];
    PHI_RULES.forEach((r) => {
      var f = r.w.filter((w) => low.indexOf(w) > -1);
      if (f.length) hits.push({ s: r.s, n: r.n, m: r.m, found: f });
    });
    var safe = PHI_SAFE.some((w) => low.indexOf(w) > -1);
    if (!hits.length) {
      html +=
        '<div class="flag f-ok"><b><code>' +
        l +
        '</code></b>' +
        (safe
          ? 'Abstracted and safe on any surface.'
          : 'No disclosure pattern found. Safe on a commerce surface. On a clinical surface, confirm it does not narrow what the user is doing.') +
        '</div>';
    } else {
      var worst = hits.some((h) => h.s === 'high') ? 'f-high' : 'f-med';
      var lbl = worst === 'f-high' ? 'Do not send' : 'Abstract on clinical surfaces';
      html +=
        '<div class="flag ' +
        worst +
        '"><b>' +
        lbl +
        ', <code>' +
        l +
        '</code></b>' +
        hits
          .map((h) => h.n + '. Found <code>' + h.found.join('</code> <code>') + '</code>. ' + h.m)
          .join('<br>') +
        '</div>';
    }
  });
  $('ev-out').innerHTML = html;
}
$('ev-in').addEventListener('input', scanEvents);

var SPECS = {
  commerce: {
    t:
      'WEB, COMMERCE  ·  twc.health / twccanada.health  ·  CLASS A\n\nEVENT                BROWSER  SERVER  PARAMETERS\n' +
      'ViewContent            yes      yes   content_ids, content_type, value, currency\n' +
      'AddToCart              yes      yes   content_ids, value, currency\n' +
      'InitiateCheckout       yes      yes   value, currency, num_items\n' +
      'Purchase               yes      yes   order_id AS event_id, value, currency, contents\n' +
      'Subscribe              yes      yes   subscription_id, value, currency, predicted_ltv\n' +
      'MembershipUpgrade      yes      yes   tier_from, tier_to, value, currency\n\n' +
      'DEDUPLICATION   event_id = order_id, identical on browser and server\n' +
      'VERIFY IN       Test Events before launch, Diagnostics thereafter\n' +
      'ADV MATCHING    On\n' +
      'GA4             Full enhanced ecommerce, BigQuery export on\n' +
      'RENEWALS        MUST fire a distinct event, never Purchase',
    n: 'The fault most commonly present is deduplication implemented on Purchase and missing on AddToCart and InitiateCheckout. Purchase then looks clean while every mid-funnel rate is inflated, which quietly distorts every funnel diagnosis run against it.',
  },
  clinical: {
    t:
      'WEB, CLINICAL  ·  care.twc.health  ·  CLASS B\n\nBROWSER PIXEL          none\nSDK                    none\nMETA SIGNAL            server-side only, from the CRM\n\n' +
      'EVENT                     TRIGGER\n' +
      'intake_step_complete      each intake step, step index only\n' +
      'flow_complete             de-identified milestone\n' +
      'booking_confirmed         no service, condition or provider detail\n\n' +
      'PARAMETERS ALLOWED        step_index, flow_version, timestamp\n' +
      'PARAMETERS FORBIDDEN      condition, symptom, medication, dosage,\n' +
      '                          provider_name, diagnosis, any direct identifier\n\n' +
      'GA4                       GA4_TWC_CLINICAL\n' +
      'GOOGLE SIGNALS            off\n' +
      'DATA SHARING              off\n' +
      'AD AUDIENCES              excluded\n' +
      'USER ID                   not linked to clinical events',
    n: 'The parent brand leads its positioning with a pledge that patient data is never sold, shared or monetised. Aligning the measurement architecture to that pledge is both the defensible position and the stated brand promise, which makes it easier to get signed off than a purely technical argument would be.',
  },
  app: {
    t:
      'MOBILE APP  ·  com.twc.care.patient  ·  MIXED\n\n' +
      'EVENT                       CLASS  NOTES\n' +
      'first_open                    A    automatic\n' +
      'registration_start            A\n' +
      'otp_verified                  A    common drop point\n' +
      'pin_created                   A\n' +
      'account_linked                A    matched to storefront account\n' +
      'activation_complete           A    PRIMARY KPI, export this to ads\n' +
      'id_verification_start         B    highest-friction step\n' +
      'id_verification_complete      B\n' +
      'booking_confirmed             B    no condition parameters, ever\n' +
      'marketplace_view              A    safe to instrument fully\n' +
      'marketplace_purchase          A    value and currency permitted\n\n' +
      'USER PROPERTIES   membership_tier, tenure_band, app_cohort\n' +
      'FORBIDDEN         setUserId linked to any Class B event\n' +
      '                  ad personalisation on Class B events\n' +
      'AD EXPORT         activation_complete only, nothing downstream of it',
    n: 'Exporting activation_complete rather than a downstream clinical event is what keeps app advertising outside the PHI boundary. It is also the right optimisation target, because activation is the real conversion and installs are not.',
  },
};
function renderSpec() {
  var k = $('es-sel').value;
  $('es-out').textContent = SPECS[k].t;
  $('es-note').textContent = SPECS[k].n;
}
$('es-sel').addEventListener('change', renderSpec);

/* ---------- 09 APP ---------- */
var FSTEPS = [
  ['first_open', 'A'],
  ['registration_start', 'A'],
  ['otp_verified', 'A'],
  ['pin_created', 'A'],
  ['account_linked', 'A'],
  ['activation_complete', 'A'],
  ['id_verification_start', 'B'],
  ['id_verification_complete', 'B'],
  ['booking_confirmed', 'B'],
];
var FIXES = {
  registration_start: [
    'Defer the account link',
    'Ask for the storefront email after first value rather than before it, so the user sees something useful before being asked to prove who they are.',
  ],
  otp_verified: [
    'Test SMS delivery and retry',
    'OTP drop is frequently a delivery problem rather than an intent problem. Instrument delivery failures separately from abandonment, and add a resend path with a visible timer.',
  ],
  pin_created: [
    'Make the PIN optional at this stage',
    'A second credential immediately after a password reads as friction with no visible benefit. Test deferring it to first sensitive action.',
  ],
  account_linked: [
    'Allow a skip',
    'Let the user proceed unlinked and prompt again at a moment when linking has an obvious payoff.',
  ],
  activation_complete: [
    'Shorten the path to first value',
    'Everything before activation is cost. Test cutting one step entirely and measure whether activation rises more than the step was worth.',
  ],
  id_verification_start: [
    'Defer identity verification until after first value',
    'This is almost certainly the highest-leverage experiment in the app. Verification is required before the user has received anything, which asks for maximum trust at the point of minimum trust. Test moving it to immediately before the appointment rather than before the booking.',
  ],
  id_verification_complete: [
    'Fix the capture experience',
    'Users who started and failed to finish are a document capture problem, not an intent problem. Instrument capture failures, add clearer guidance, and allow a retry without restarting the flow.',
  ],
  booking_confirmed: [
    'Reduce slot friction',
    'Users who verified identity and then did not book have cleared the hardest step. Check slot availability, lead time and whether the calendar shows anything bookable soon.',
  ],
};
function calcFunnel() {
  var v = [],
    i;
  for (i = 1; i <= 9; i++) v.push(+$('fn-' + i).value || 0);
  var cpi = +$('fn-cpi').value || 0;
  var worst = { drop: -1, idx: 0 };
  var rows = FSTEPS.map((st, i) => {
    var cur = v[i],
      prev = i ? v[i - 1] : v[0];
    var rate = i ? (prev ? (cur / prev) * 100 : 0) : 100,
      lost = i ? prev - cur : 0;
    if (i && lost > worst.drop) {
      worst = { drop: lost, idx: i, rate: rate };
    }
    return (
      '<tr><td style="font-family:var(--mono);font-size:12.5px">' +
      st[0] +
      '</td>' +
      '<td class="num">' +
      cur.toLocaleString() +
      '</td>' +
      '<td class="num" style="color:' +
      (i && rate < 60 ? 'var(--fail)' : i && rate < 80 ? 'var(--warn)' : 'inherit') +
      '">' +
      (i ? rate.toFixed(0) + '%' : '—') +
      '</td>' +
      '<td class="num">' +
      (i ? lost.toLocaleString() : '—') +
      '</td>' +
      '<td>' +
      (st[1] === 'B'
        ? '<span class="pill p-kill">B clinical</span>'
        : '<span class="pill p-scale">A</span>') +
      '</td></tr>'
    );
  }).join('');
  $('fn-rows').innerHTML = rows;
  var act = v[0] ? (v[5] / v[0]) * 100 : 0,
    e2e = v[0] ? (v[8] / v[0]) * 100 : 0;
  $('fn-act').textContent = act.toFixed(1) + '%';
  $('fn-cpa').textContent = act ? '$' + (cpi / (act / 100)).toFixed(2) : 'n/a';
  $('fn-e2e').textContent = e2e.toFixed(1) + '%';
  $('fn-cpb').textContent = e2e ? '$' + (cpi / (e2e / 100)).toFixed(2) : 'n/a';
  var wname = FSTEPS[worst.idx][0],
    pct = worst.rate || 0;
  $('fn-note').className = 'note ' + (pct < 50 ? 'bad' : pct < 75 ? 'warn' : 'good');
  $('fn-note').textContent =
    'Largest single drop is at ' +
    wname +
    ', where ' +
    worst.drop.toLocaleString() +
    ' users are lost at a ' +
    pct.toFixed(0) +
    ' percent step rate. Every user lost before activation_complete was paid for at ' +
    (cpi ? '$' + cpi.toFixed(2) : 'the install cost') +
    ' and returned nothing. Fixing this step is worth more than any bidding change available.';
  var ranked = [];
  for (var i = 1; i < 9; i++) {
    var lost = v[i - 1] - v[i],
      rate = v[i - 1] ? (v[i] / v[i - 1]) * 100 : 0;
    if (lost > 0) ranked.push({ name: FSTEPS[i][0], lost: lost, rate: rate });
  }
  ranked.sort((a, b) => b.lost - a.lost);
  $('fn-exp').innerHTML = ranked
    .slice(0, 4)
    .map((r, i) => {
      var f = FIXES[r.name] || ['Investigate', 'No standard fix mapped for this step.'];
      var cls = r.rate < 50 ? 'f-high' : r.rate < 75 ? 'f-med' : 'f-low';
      return (
        '<div class="flag ' +
        cls +
        '"><b>' +
        (i + 1) +
        '. ' +
        f[0] +
        '</b>' +
        'At <code>' +
        r.name +
        '</code>, ' +
        r.lost.toLocaleString() +
        ' users lost at a ' +
        r.rate.toFixed(0) +
        ' percent step rate.<br>' +
        f[1] +
        '<br><span style="color:var(--ink-3)">Run as a Remote Config variant with A/B Testing, and read activation_complete rather than the step itself.</span></div>'
      );
    })
    .join('');
}
for (var _i = 1; _i <= 9; _i++) $('fn-' + _i).addEventListener('input', calcFunnel);
$('fn-cpi').addEventListener('input', calcFunnel);

$('fb-out').textContent =
  'FIREBASE PROJECT: twc-patient-app\n\n' +
  'iOS            com.twc.care.patient\n' +
  'Android        com.twc.care.patient\n\n' +
  'Analytics      linked to GA4_TWC_APP, restricted configuration\n' +
  'Remote Config  onboarding variants, feature gating\n' +
  'A/B Testing    onboarding funnel experiments\n' +
  'Crashlytics    stability, onboarding path specifically\n' +
  'Cloud Msg      replenishment, appointment, re-engagement\n' +
  'Dynamic Links  web to app handoff, attribution continuity\n\n' +
  'CRASHLYTICS NOTE\n' +
  '  A crash during OTP or ID upload is indistinguishable from\n' +
  '  abandonment in analytics and needs an entirely different fix.\n' +
  '  Instrument the onboarding path separately.\n\n' +
  'CLOUD MESSAGING NOTE\n' +
  '  For a subscription business push is materially cheaper than\n' +
  '  paid retargeting and does not consume ad budget.\n\n' +
  'AD EXPORT      activation_complete only';

/* ---------- 10 SIGNALS ---------- */
function calcRec() {
  var mp = +$('rc-mp').value || 0,
    mr = +$('rc-mr').value || 0,
    sp = +$('rc-sp').value || 0,
    sr = +$('rc-sr').value || 0;
  var od = sp ? ((mp - sp) / sp) * 100 : 0,
    rd = sr ? ((mr - sr) / sr) * 100 : 0;
  $('rc-od').textContent = (od >= 0 ? '+' : '') + od.toFixed(1) + '%';
  $('rc-rd').textContent = (rd >= 0 ? '+' : '') + rd.toFixed(1) + '%';
  $('rc-maov').textContent = mp ? '$' + (mr / mp).toFixed(0) : 'n/a';
  $('rc-saov').textContent = sp ? '$' + (sr / sp).toFixed(0) : 'n/a';
  var a = Math.abs(od);
  $('rc-obox').className = 'stat ' + (a <= 15 ? 'hi' : a <= 30 ? 'md' : 'lo');
  $('rc-rbox').className = 'stat ' + (Math.abs(rd) <= 15 ? 'hi' : Math.abs(rd) <= 30 ? 'md' : 'lo');
  var h = '';
  if (a <= 15) {
    h =
      '<div class="note good">A delta under 15 percent is normal and is usually attribution methodology rather than a fault. Meta answers how many purchases were influenced within its window. The back end answers how many transactions happened. Both are correct and they will not agree.</div>';
  } else {
    h =
      '<div class="note bad">A ' +
      od.toFixed(0) +
      ' percent gap is beyond normal attribution difference. Work this list in order.</div>' +
      '<div class="tw sp"><table><thead><tr><th>#</th><th>Check</th><th>Why it produces this gap</th></tr></thead><tbody>' +
      [
        [
          '1',
          'Same date range and timezone',
          'Meta reports in the ad account timezone and the back end may not.',
        ],
        [
          '2',
          'Same attribution window',
          '7-day click with 1-day view reports more than a last-click back end.',
        ],
        ['3', 'Purchase firing more than once', 'A thank-you page reload double counts.'],
        [
          '4',
          'Deduplication across all events',
          'Commonly correct on Purchase and missing on mid-funnel events.',
        ],
        ['5', 'Event ID consistent', 'Order ID must be identical on browser and server.'],
        [
          '6',
          'Subscription renewals',
          'If renewals fire the same event as acquisition, Meta counts revenue the ads did not generate.',
        ],
        [
          '7',
          'Rx orders not fulfilling',
          'Payment precedes clinical approval. Meta counts the payment, the back end counts the shipment.',
        ],
        [
          '8',
          'Value and currency',
          'A currency mismatch shows as a revenue gap with matching order counts.',
        ],
      ]
        .map(
          (r) =>
            '<tr><td class="num">' +
            r[0] +
            '</td><td>' +
            r[1] +
            '</td><td style="color:var(--ink-3)">' +
            r[2] +
            '</td></tr>',
        )
        .join('') +
      '</tbody></table></div>';
    if (mp > sp && Math.abs(rd - od) > 10)
      h +=
        '<div class="note warn">Order and revenue deltas differ by more than 10 points, which points at a value or currency problem rather than a counting problem. Check item 8 first.</div>';
  }
  $('rc-out').innerHTML = h;
}
['rc-mp', 'rc-mr', 'rc-sp', 'rc-sr'].forEach((id) => {
  $(id).addEventListener('input', calcRec);
});

function calcFatigue() {
  var f = +$('fg-freq').value || 0,
    c1 = +$('fg-ctr1').value || 0,
    c2 = +$('fg-ctr2').value || 0,
    m1 = +$('fg-cpm1').value || 0,
    m2 = +$('fg-cpm2').value || 0,
    d = +$('fg-days').value || 0;
  var ctrD = c1 ? ((c2 - c1) / c1) * 100 : 0,
    cpmD = m1 ? ((m2 - m1) / m1) * 100 : 0;
  var r = $('fg-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (ctrD <= -20 && cpmD < 15 && f >= 3) {
    cls = 'is-fail';
    label = 'Fatigue';
    val = ctrD.toFixed(0) + '% CTR';
    body =
      'CTR has fallen ' +
      Math.abs(ctrD).toFixed(0) +
      ' percent while CPM held within ' +
      cpmD.toFixed(0) +
      ' percent, at a frequency of ' +
      f +
      ' after ' +
      d +
      ' days. That combination is fatigue rather than auction pressure. Validate it by putting fresh creative into comparable delivery conditions. If the new assets outperform, retire the old one. If they do not, the market changed and the creative is fine.';
  } else if (cpmD >= 15) {
    cls = 'is-warn';
    label = 'Auction pressure';
    val = '+' + cpmD.toFixed(0) + '% CPM';
    body =
      'CPM has risen ' +
      cpmD.toFixed(0) +
      ' percent, which points at the auction rather than the creative. Check whether frequency is also climbing. Rising frequency alongside rising CPM means the audience is saturating and needs broadening. Stable frequency with rising CPM usually means competition, seasonality or a delivery shift, and the creative does not need replacing.';
  } else if (ctrD <= -20) {
    cls = 'is-warn';
    label = 'Declining, cause unclear';
    val = ctrD.toFixed(0) + '% CTR';
    body =
      'CTR is down ' +
      Math.abs(ctrD).toFixed(0) +
      ' percent but frequency is only ' +
      f +
      ', which is low for fatigue this early. Check whether the audience or placement mix shifted, or whether a landing page change altered downstream behaviour before concluding the creative is spent.';
  } else {
    cls = 'is-pass';
    label = 'No fatigue signal';
    val = ctrD.toFixed(0) + '% CTR';
    body =
      'CTR movement of ' +
      ctrD.toFixed(0) +
      ' percent at a frequency of ' +
      f +
      ' is within normal variance. Frequency rising on its own is expected in a working campaign and is not a reason to rotate. Wait for CTR falling alongside CPC and CPA rising together.';
  }
  r.classList.add(cls);
  $('fg-label').textContent = label;
  $('fg-val').textContent = val;
  $('fg-body').textContent = body;
}
['fg-freq', 'fg-ctr1', 'fg-ctr2', 'fg-cpm1', 'fg-cpm2', 'fg-days'].forEach((id) => {
  $(id).addEventListener('input', calcFatigue);
});
