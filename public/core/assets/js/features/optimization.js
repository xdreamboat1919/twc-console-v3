/* ================= ATTRIBUTION ================= */
function calcPath() {
  var n = Math.max(1, Math.min(14, +$('at-n').value || 6)),
    ck = Math.max(0, Math.min(n, +$('at-click').value || 0)),
    buy = +$('at-buy').value || n,
    win = $('at-win').value;
  var clickDay = ck ? ck : 0;
  var clickWin = win === '7c1v' || win === '7c' ? 7 : 1;
  var viewWin = win === '7c1v' || win === '1c1v' ? 1 : 0;
  var rows = '',
    credited = [];
  for (var i = 1; i <= n; i++) {
    var inter = i === ck ? 'Click' : 'View';
    var cred = false,
      why = '';
    if (i === ck && clickDay && buy - clickDay < clickWin && buy >= clickDay) {
      cred = true;
      why = 'Within the click window';
    } else if (i !== ck && viewWin && buy - i < viewWin && buy >= i) {
      cred = true;
      why = 'Within the view window';
    }
    if (cred) credited.push(i);
    var role =
      i < ck
        ? 'Built awareness. No credit.'
        : i === ck
          ? 'Generated the click.'
          : i > ck && i < buy
            ? 'Reinforced. No credit.'
            : 'Same-day exposure.';
    rows +=
      '<tr' +
      (cred ? ' style="background:#e6f3ed"' : '') +
      '><td class="num">' +
      i +
      '</td><td>Touch ' +
      i +
      '</td><td>' +
      inter +
      '</td>' +
      '<td>' +
      (cred
        ? '<span class="pill p-scale">Credited</span>' +
          (why ? ' <span style="font-size:11.5px;color:var(--ink-3)">' + why + '</span>' : '')
        : '<span class="pill p-kill">No credit</span>') +
      '</td>' +
      '<td style="font-size:12.5px;color:var(--ink-3)">' +
      role +
      '</td></tr>';
  }
  $('at-rows').innerHTML = rows;
  var n2 = $('at-note');
  var uncred = n - credited.length;
  if (!credited.length) {
    n2.className = 'note bad';
    n2.textContent =
      'Under this window nothing is credited, even though ' +
      n +
      ' touches preceded the purchase. The order will appear as organic or direct in the back end, and the campaign that produced it will look like it did nothing. This is the shape of the gap between reported and true performance on a considered purchase.';
  } else {
    n2.className = 'note warn';
    n2.textContent =
      'Touch ' +
      credited.join(' and ') +
      ' receives credit. The other ' +
      uncred +
      ' touch' +
      (uncred === 1 ? '' : 'es') +
      ' influenced the same purchase and receive nothing. That is not a measurement error, it is what a credit-assignment rule does. The mistake is treating the credited ad as the cause and the uncredited ones as waste, because a decision made on that reading removes the top of the funnel and the credited ad stops converting a month later with no obvious reason.';
  }
}
['at-n', 'at-click', 'at-buy', 'at-win'].forEach((id) => {
  $(id).addEventListener('input', calcPath);
});

function calcWindows() {
  var c1 = +$('aw-1c').value || 0,
    c7 = +$('aw-7c').value || 0,
    cv = +$('aw-7c1v').value || 0,
    be = +$('aw-be').value || 0,
    sp = +$('aw-sp').value || 1,
    aov = +$('aw-aov').value || 1;
  $('aw-c1').textContent = c1 ? '$' + (sp / c1).toFixed(0) : '—';
  $('aw-c7').textContent = c7 ? '$' + (sp / c7).toFixed(0) : '—';
  $('aw-cv').textContent = cv ? '$' + (sp / cv).toFixed(0) : '—';
  var vshare = cv ? ((cv - c7) / cv) * 100 : 0;
  var unatt = Math.max(0, be - cv);
  $('aw-vshare').textContent = vshare.toFixed(0) + '%';
  $('aw-unatt').textContent = unatt;
  $('aw-gbox').className = 'stat ' + (vshare < 12 ? 'hi' : vshare < 25 ? 'md' : 'lo');
  var spread = c1 ? ((cv - c1) / c1) * 100 : 0;
  var n = $('aw-note');
  var txt =
    'Moving from a one-day click window to seven-day click with one-day view changes reported conversions by ' +
    spread.toFixed(0) +
    ' percent, and CPA from $' +
    (c1 ? (sp / c1).toFixed(0) : 0) +
    ' to $' +
    (cv ? (sp / cv).toFixed(0) : 0) +
    '. The campaigns did not change. Only the counting rule did. ';
  if (vshare >= 25) {
    txt +=
      'View-through is carrying ' +
      vshare.toFixed(0) +
      ' percent of reported conversions, which is high. View-through credit is the weakest signal available, because it counts an impression the user may not have registered. Judge scaling decisions on the click-only figure and treat view-through as directional. ';
  } else {
    txt +=
      'View-through carries ' +
      vshare.toFixed(0) +
      ' percent, which is within a normal range for this kind of catalog. ';
  }
  if (unatt > 0) {
    txt +=
      'Separately, ' +
      unatt +
      ' back-end orders sit outside every window. Some are genuinely organic. On a $299 purchase with a one to two week fulfilment expectation, a meaningful share are paid-influenced purchases that completed after the window closed, which is exactly the gap the path tool above illustrates.';
  }
  n.className = 'note' + (vshare >= 25 ? ' bad' : ' warn');
  n.textContent = txt;
}
['aw-1c', 'aw-7c', 'aw-7c1v', 'aw-be', 'aw-sp', 'aw-aov'].forEach((id) => {
  $(id).addEventListener('input', calcWindows);
});

function calcKill() {
  var sp = +$('ak-sp').value || 0,
    cv = +$('ak-cv').value || 0,
    tgt = +$('ak-tgt').value || 1,
    ctr = +$('ak-ctr').value || 0,
    sh = +$('ak-share').value || 0,
    tr = $('ak-trend').value,
    d = +$('ak-days').value || 1,
    stage = $('ak-stage').value;
  var minRead = tgt * 3,
    cpa = cv ? sp / cv : 0;
  var ctrFloor = stage === 'acq' ? 0.9 : 1.8;
  var atcN = +$('ak-atc').value || 0,
    bAtc = tgt * ((+$('ak-batc').value || 38) / 100);
  var cAtc = atcN ? sp / atcN : 0;
  var r = $('ak-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (sp < minRead) {
    cls = 'is-warn';
    label = 'Below the minimum read';
    val = 'RETEST';
    body =
      'Spend of $' +
      sp.toFixed(0) +
      ' is under the $' +
      minRead.toFixed(0) +
      ' minimum read, which is three times target CPA. At this volume a zero-conversion ad is statistically indistinguishable from a good ad that got unlucky, so any verdict here is a coin flip presented as a decision. Let it run. This is the defensible version of the do-not-kill-early rule, and it holds without needing to assume anything about how Meta sequences ads.';
  } else if (cv > 0 && cpa <= tgt) {
    cls = 'is-pass';
    label = 'Converting at target';
    val = 'SCALE';
    body =
      'CPA of $' +
      cpa.toFixed(0) +
      ' against a $' +
      tgt +
      ' target with $' +
      sp.toFixed(0) +
      ' spent. Verify the orders are real in the back end before promoting, then graduate at a controlled share rather than full weight.';
  } else if (atcN > 0 && cAtc <= bAtc * 1.15 && cv === 0) {
    cls = 'is-warn';
    label = 'Creative worked, destination did not';
    val = 'DESTINATION';
    body =
      'Cost per add to cart of $' +
      cAtc.toFixed(0) +
      ' sits at or under the $' +
      bAtc.toFixed(0) +
      ' benchmark, so this creative delivered qualified traffic efficiently and produced no purchases. That is a destination verdict, not a creative one. Killing it removes working creative and leaves the actual problem untouched, and the next batch will fail the same way for the same reason. Take this to the product page or the checkout before producing anything new.';
  } else if (atcN > 0 && cAtc > bAtc * 1.5) {
    cls = 'is-fail';
    label = 'Creative is not working';
    val = 'KILL';
    body =
      'Cost per add to cart of $' +
      cAtc.toFixed(0) +
      ' against a $' +
      bAtc.toFixed(0) +
      ' benchmark, with no purchases past the minimum read. The creative is not producing qualified traffic, which is the one thing a creative is responsible for. This is a defensible kill because the failure is at the layer the asset controls. Archive it with a stated hypothesis.';
  } else if (cv === 0 && ctr >= ctrFloor && sh >= 12 && tr !== 'down') {
    cls = 'is-warn';
    label = 'Serving, engaging, not closing';
    val = 'SUPPORT';
    body =
      'No attributed conversions past the minimum read, and yet CTR of ' +
      ctr +
      ' percent is healthy for ' +
      (stage === 'acq' ? 'prospecting' : 'retargeting') +
      ' and the ad is still taking ' +
      sh +
      ' percent of ad set delivery on a ' +
      tr +
      ' trend. Two readings are possible and both argue against killing it today. Either the model predicts conversion value you have not seen yet, or the ad is generating clicks that convert outside the attribution window, which on a considered purchase is common. Hold it, and judge it on the account-level check rather than its own row: if total orders hold when it is paused for a week, it was not contributing. If they fall, it was.';
  } else if (cv === 0 && (ctr < ctrFloor || tr === 'down' || sh < 8)) {
    cls = 'is-fail';
    label = 'Past the read, no signal';
    val = 'KILL';
    body =
      'Spend of $' +
      sp.toFixed(0) +
      ' is past the $' +
      minRead.toFixed(0) +
      ' minimum read with no conversions, CTR of ' +
      ctr +
      ' percent ' +
      (ctr < ctrFloor
        ? 'below the ' + ctrFloor + ' percent floor for this stage'
        : 'at the floor') +
      ', and delivery ' +
      (tr === 'down' ? 'declining' : 'at ' + sh + ' percent') +
      '. The engagement signal and the delivery signal agree, which is the combination that makes a kill defensible. Archive it with a stated hypothesis for why it failed.';
  } else {
    cls = 'is-warn';
    label = 'Converting above target';
    val = 'ITERATE';
    body =
      'CPA of $' +
      cpa.toFixed(0) +
      ' against a $' +
      tgt +
      ' target. The concept is producing conversions and the execution is not efficient enough. Iterate on hook or format inside the same concept rather than abandoning the idea, because a concept that converts at all has cleared the hardest bar.';
  }
  r.classList.add(cls);
  $('ak-label').textContent = label;
  $('ak-val').textContent = val;
  $('ak-body').textContent = body;
}
[
  'ak-sp',
  'ak-cv',
  'ak-tgt',
  'ak-ctr',
  'ak-share',
  'ak-trend',
  'ak-days',
  'ak-stage',
  'ak-atc',
  'ak-batc',
  'ak-atc',
  'ak-batc',
].forEach((id) => {
  $(id).addEventListener('input', calcKill);
});

function calcIncr() {
  var sp = +$('ai-sp').value || 0,
    roas = +$('ai-roas').value || 0,
    hold = (+$('ai-hold').value || 0) / 100,
    wk = +$('ai-wk').value || 4,
    inc = (+$('ai-inc').value || 0) / 100;
  var monthly = sp * roas,
    weekly = monthly / 4.33;
  var cost = weekly * wk * hold * inc;
  var iroas = roas * inc;
  var infl = inc > 0 ? (roas / iroas - 1) * 100 : 0;
  var overspend = monthly * (1 - inc);
  $('ai-cost').textContent = money(cost);
  $('ai-iroas').textContent = iroas.toFixed(2);
  $('ai-infl').textContent = '+' + infl.toFixed(0) + '%';
  $('ai-value').textContent = money(overspend * 12);
  $('ai-gbox').className = 'stat ' + (infl < 25 ? 'hi' : infl < 60 ? 'md' : 'lo');
  $('ai-out').textContent =
    'GEO HOLDOUT METHOD\n\n' +
    '1  SPLIT\n' +
    '   Select matched geographies covering ~' +
    (hold * 100).toFixed(0) +
    '% of volume.\n' +
    '   Match on historical order volume and AOV, not on population.\n' +
    '   Exclude any geo with unusual seasonality or a retail presence.\n\n' +
    '2  BASELINE\n' +
    '   Four weeks pre-period. Confirm test and control track together\n' +
    '   within 5% before starting. If they do not, the split is wrong.\n\n' +
    '3  SUPPRESS\n' +
    '   Exclude the holdout geos from every campaign in the lane.\n' +
    '   Every campaign. A single un-excluded retargeting ad set\n' +
    '   invalidates the whole test.\n\n' +
    '4  RUN  ' +
    wk +
    ' weeks\n' +
    '   Change nothing else. No budget shifts, no new creative,\n' +
    '   no structural edits in either group.\n\n' +
    '5  MEASURE\n' +
    '   Compare total back-end orders per capita, test vs control.\n' +
    '   Incremental lift = (test - control) / control\n' +
    '   Incremental ROAS = incremental revenue / spend\n\n' +
    '6  READ\n' +
    '   Incrementality below ~50% means much of the reported\n' +
    '   revenue would have arrived anyway. Above ~80% means\n' +
    '   the channel is genuinely creating demand.\n\n' +
    'COST OF THE TEST     ' +
    money(cost) +
    ' of withheld revenue\n' +
    'COST OF NOT TESTING  ' +
    money(overspend * 12) +
    ' a year at the\n' +
    '                     assumed incrementality\n\n' +
    'CHEAPER ALTERNATIVE\n' +
    '   Meta Conversion Lift is free and easier to run.\n' +
    '   It is also Meta measuring Meta, so treat it as directional\n' +
    '   and use a geo holdout when the decision is large.';
  var n = $('ai-note');
  if (infl < 25) {
    n.className = 'note good';
    n.textContent =
      'At ' +
      (inc * 100).toFixed(0) +
      ' percent incrementality, reported ROAS of ' +
      roas.toFixed(2) +
      ' overstates the incremental figure of ' +
      iroas.toFixed(2) +
      ' by ' +
      infl.toFixed(0) +
      ' percent. That is a narrow gap and scaling decisions made on reported numbers will roughly hold. The assumption still needs testing rather than believing.';
  } else {
    n.className = 'note warn';
    n.textContent =
      'At ' +
      (inc * 100).toFixed(0) +
      ' percent incrementality, roughly ' +
      money(overspend) +
      ' of monthly reported revenue would have arrived without the ads. Over a year that is ' +
      money(overspend * 12) +
      ' of spend justified by revenue the channel did not create. The holdout costs ' +
      money(cost) +
      ' in withheld revenue to find out, which is the cheapest question in the account relative to what the answer is worth.';
  }
}
['ai-sp', 'ai-roas', 'ai-hold', 'ai-wk', 'ai-inc'].forEach((id) => {
  $(id).addEventListener('input', calcIncr);
});

/* ================= OFFERS ================= */
var OFROWS = [
  ['Order bump', 1],
  ['Post-purchase upsell', 2],
  ['Subscribe and save', 3],
  ['Membership attach', 4],
];
function calcOffers() {
  var v0 = +$('of2-v0').value || 0,
    m0 = (+$('of2-m0').value || 0) / 100;
  var base = v0 * m0,
    add = 0,
    parts = [];
  $('of2-c0').textContent = '$' + base.toFixed(2);
  OFROWS.forEach((r) => {
    var i = r[1];
    var v = +$('of2-v' + i).value || 0,
      t = (+$('of2-t' + i).value || 0) / 100,
      m = (+$('of2-m' + i).value || 0) / 100;
    var c = v * t * m;
    $('of2-c' + i).textContent = '$' + c.toFixed(2);
    add += c;
    parts.push({ n: r[0], c: c, t: t, v: v });
  });
  var tot = base + add,
    lift = base ? (add / base) * 100 : 0;
  $('of2-base').textContent = '$' + base.toFixed(2);
  $('of2-tot').textContent = '$' + tot.toFixed(2);
  $('of2-lift').textContent = '+' + lift.toFixed(0) + '%';
  $('of2-cpa0').textContent = '$' + base.toFixed(0);
  $('of2-cpa1').textContent = '$' + tot.toFixed(0);
  $('of2-box').className = 'stat ' + (lift >= 25 ? 'hi' : lift >= 12 ? 'md' : 'lo');
  var n = $('of2-note');
  n.className = 'note' + (lift >= 25 ? ' good' : ' warn');
  n.textContent =
    'The stack adds $' +
    add.toFixed(2) +
    ' of contribution per order, raising the affordable CPA from $' +
    base.toFixed(0) +
    ' to $' +
    tot.toFixed(0) +
    ' at the same ROAS target. That is a ' +
    lift.toFixed(0) +
    ' percent increase in what you can pay for a customer, achieved without a single change to bidding, targeting or creative. It is also permanent, where a media efficiency gain has to be re-won every time the auction shifts.';
  parts.sort((a, b) => b.c - a.c);
  $('of2-rank').innerHTML = parts
    .map((p, i) => {
      var cls = i === 0 ? 'f-ok' : i === 1 ? 'f-low' : 'f-low';
      return (
        '<div class="flag ' +
        cls +
        '"><b>' +
        (i + 1) +
        '. ' +
        p.n +
        '</b>Adds $' +
        p.c.toFixed(2) +
        ' per order at a ' +
        (p.t * 100).toFixed(0) +
        ' percent take rate on a $' +
        p.v.toFixed(0) +
        ' offer. ' +
        (i === 0
          ? 'Build this one first. It contributes more than the rest and the effort is comparable.'
          : 'Worth building once the mechanic above is live and measured.') +
        '</div>'
      );
    })
    .join('');
}
[
  'of2-v0',
  'of2-m0',
  'of2-v1',
  'of2-t1',
  'of2-m1',
  'of2-v2',
  'of2-t2',
  'of2-m2',
  'of2-v3',
  'of2-t3',
  'of2-m3',
  'of2-v4',
  'of2-t4',
  'of2-m4',
].forEach((id) => {
  $(id).addEventListener('input', calcOffers);
});

/* ================= CHANNEL MIX ================= */
var CHN = ['Meta', 'Google branded', 'Google non-brand', 'Email and SMS', 'Affiliate and partner'];
function calcChannels() {
  var rows = [],
    ts = 0,
    tr = 0;
  for (var i = 1; i <= 5; i++) {
    var sp = +$('ch-s' + i).value || 0,
      rv = +$('ch-r' + i).value || 0,
      e = +$('ch-e' + i).value || 0.2;
    var roas = sp ? rv / sp : 0;
    var marg = roas * (1 - e);
    $('ch-o' + i).textContent = roas.toFixed(2);
    $('ch-m' + i).textContent = marg.toFixed(2);
    ts += sp;
    tr += rv;
    rows.push({ n: CHN[i - 1], i: i, sp: sp, rv: rv, roas: roas, marg: marg, e: e });
  }
  var floor = +$('ch-min').value || 2,
    add = +$('ch-add').value || 0;
  var elig = rows.filter((r) => r.marg >= floor).sort((a, b) => b.marg - a.marg);
  rows.forEach((r) => {
    var ok = r.marg >= floor;
    $('ch-v' + r.i).innerHTML = ok
      ? '<span class="pill p-scale">Fund</span>'
      : '<span class="pill p-kill">Hold</span>';
  });
  var w = elig.reduce((x, y) => x + y.marg, 0);
  var radd = 0,
    alloc = '';
  if (elig.length && add > 0) {
    alloc =
      '<div class="tw sp"><table><thead><tr><th>Channel</th><th style="text-align:right">Allocation</th><th style="text-align:right">Share</th><th style="text-align:right">Revenue added</th></tr></thead><tbody>';
    elig.forEach((r) => {
      var share = r.marg / w,
        a = add * share,
        rev = a * r.marg;
      radd += rev;
      alloc +=
        '<tr><td>' +
        r.n +
        '</td><td class="num">' +
        money(a) +
        '</td><td class="num">' +
        (share * 100).toFixed(0) +
        '%</td><td class="num">' +
        money(rev) +
        '</td></tr>';
    });
    alloc += '</tbody></table></div>';
  }
  $('ch-alloc').innerHTML = alloc;
  $('ch-now').textContent = ts ? (tr / ts).toFixed(2) : '—';
  $('ch-after').textContent = ts + add ? ((tr + radd) / (ts + add)).toFixed(2) : '—';
  $('ch-radd').textContent = money(radd);
  $('ch-elig').textContent = elig.length + ' of 5';
  var top = elig[0],
    worst = rows.slice().sort((a, b) => a.marg - b.marg)[0];
  var n = $('ch-note');
  if (!elig.length) {
    n.className = 'note bad';
    n.textContent =
      'No channel clears a ' +
      floor.toFixed(1) +
      ' marginal ROAS floor. The next dollar should not go into media at all. It goes into the levers that raise what a customer is worth: offer architecture, retention, or fixing a conversion rate problem on the store.';
  } else {
    n.className = 'note good';
    n.textContent =
      top.n +
      ' has the highest marginal ROAS at ' +
      top.marg.toFixed(2) +
      ' and takes the largest share. Note that ' +
      (rows[0].roas > rows[3].roas ? '' : '') +
      worst.n +
      ' has the lowest marginal return at ' +
      worst.marg.toFixed(2) +
      ' despite an average ROAS of ' +
      worst.roas.toFixed(2) +
      ', which is the whole point of this table. Average return tells you what a channel has produced. Marginal return tells you what the next dollar produces, and on a channel near its ceiling those two numbers diverge sharply. Elasticity is an assumption until a holdout tests it, so treat this as a hypothesis to validate rather than an allocation to execute.';
  }
}
for (var _h = 1; _h <= 5; _h++) {
  ['s', 'r', 'e'].forEach((k) => {
    var id = 'ch-' + k + _h;
    if ($(id)) $(id).addEventListener('input', calcChannels);
  });
}
['ch-add', 'ch-min'].forEach((id) => {
  $(id).addEventListener('input', calcChannels);
});

/* ================= PRE-FLIGHT ================= */
var PF = {
  base: [
    [
      'Campaign name follows the convention',
      1,
      'Underscore fields, hyphen inside fields. A mistake here breaks every dashboard blend silently.',
    ],
    [
      'Conversion event is Purchase, not Add to Cart',
      1,
      'Optimise for the thing you sell. A proxy event trains delivery toward the wrong person.',
    ],
    [
      'Attribution window set deliberately',
      0,
      '7-day click and 1-day view unless there is a reason. Note the reason if it differs.',
    ],
    [
      'Exclusions applied at ad set level',
      1,
      'Purchasers at the lane-appropriate window, plus the retargeting pool on prospecting.',
    ],
    [
      'Budget clears the learning threshold',
      1,
      'Check against the Budget tool. Below it, consolidate before launching.',
    ],
    [
      'Landing page loads and the URL resolves',
      1,
      'Click every destination. A broken link is the cheapest possible way to waste a launch.',
    ],
    [
      'UTM parameters present and correct',
      1,
      'Campaign matches the Meta campaign name exactly. Content carries the creative ID.',
    ],
    [
      'Pixel fires on the destination',
      1,
      'Verify with Pixel Helper on the actual landing page, not the homepage.',
    ],
    ['Creative approved and claim reference logged', 1, 'Every asset ties to an approved claim.'],
    [
      'Copy check run, zero blocking flags',
      1,
      'Second person plus a health state is the most common failure.',
    ],
    ['Age set to 18+ minimum', 1, 'Mandatory on every campaign on this account.'],
    [
      'Schedule and start date correct',
      0,
      'A campaign that starts at midnight in the wrong timezone spends a day badly.',
    ],
    [
      'Spend limit set at campaign level',
      0,
      'A safety net costs nothing and has saved more accounts than it has hindered.',
    ],
  ],
  restricted: [
    [
      'Weight loss: no before-and-after imagery',
      1,
      'Restricted category rule, and it applies to the destination too.',
    ],
    ['No negative body image framing in copy or creative', 1, ''],
    [
      'Personal attributes: no second person plus condition',
      1,
      'Struggling with, suffering from, your condition. All three are the same failure.',
    ],
    [
      'Destination excludes disease-named navigation',
      1,
      'A compliant ad on a page naming a condition carries that into review.',
    ],
  ],
  gated: [
    [
      'Meta written authorisation confirmed for this domain',
      1,
      'Certification alone is not sufficient. Confirm the authorisation covers this exact domain.',
    ],
    [
      'Conversion event is approved-and-shipped, not payment',
      1,
      'Payment precedes clinical approval. Optimising to Purchase trains delivery toward orders that never ship.',
    ],
    [
      'Geo separated at campaign level',
      1,
      'Canada permits far less prescription messaging than the US.',
    ],
    ['Dedicated destination, no disease-named navigation', 1, ''],
    [
      'Account health on the daily pass for this lane',
      1,
      'Any disapproval here is an immediate escalation regardless of performance.',
    ],
  ],
  new: [
    [
      'Product tier assigned',
      1,
      'Decides the CPA envelope, the creative constraints and whether it can run at all.',
    ],
    [
      'Claims added to the library before briefing',
      1,
      'A new SKU means new claims. Approve them before creative is written, not after.',
    ],
    [
      'Economics established: margin, breakeven, target CPA',
      1,
      'Set per lane. An account-level target misprices most of this catalog.',
    ],
    [
      'Catalog feed updated with correct product_type',
      1,
      'Set to the compliance tier so product sets can exclude gated items.',
    ],
    [
      'Launch pack briefed against a proven concept',
      0,
      'Adapt what already won in the lane rather than starting from zero.',
    ],
  ],
};
var pfDone = {};
function renderPF() {
  var k = $('pf-lane').value;
  var items = PF.base.concat(k === 'std' ? [] : PF[k] || []);
  $('pf-list').innerHTML = items
    .map((c, i) => {
      var key = k + '-' + i,
        on = pfDone[key];
      return (
        '<div class="chk' +
        (on ? ' ok' : '') +
        '"><input type="checkbox" data-pf="' +
        key +
        '"' +
        (on ? ' checked' : '') +
        '>' +
        '<div class="t">' +
        c[0] +
        (c[2] ? '<small>' + c[2] + '</small>' : '') +
        '</div>' +
        (c[1] ? '<span class="b">Blocking</span>' : '') +
        '</div>'
      );
    })
    .join('');
  var done = items.filter((_, i) => pfDone[k + '-' + i]).length;
  var blk = items.filter((c, i) => c[1] && !pfDone[k + '-' + i]).length;
  $('pf-count').textContent = done + ' of ' + items.length;
  $('pf-bar').style.width = (done / items.length) * 100 + '%';
  var v = $('pf-verdict');
  if (blk) {
    v.className = 'note bad';
    v.textContent =
      blk +
      ' blocking item' +
      (blk === 1 ? '' : 's') +
      ' outstanding. Do not launch. Every one of these takes under a minute to check and costs days to unwind after the fact.';
  } else if (done < items.length) {
    v.className = 'note warn';
    v.textContent =
      'Blocking items clear. The remaining checks are not launch blockers and each one prevents a specific avoidable annoyance.';
  } else {
    v.className = 'note good';
    v.textContent = 'Pre-flight complete. Launch.';
  }
}
$('pf-lane').addEventListener('change', renderPF);
$('pf-list').addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;
  pfDone[e.target.dataset.pf] = e.target.checked;
  renderPF();
});

/* ================= COMPETE ================= */
var COMP = [
  { n: 'Competitor A', a: 'Preparedness, family framing', d: 96 },
  { n: 'Competitor A', a: 'Physician authority', d: 71 },
  { n: 'Competitor B', a: 'Contents unboxing', d: 38 },
  { n: 'Competitor C', a: 'Symptom-led, aggressive', d: 11 },
];
function renderComp() {
  var sorted = COMP.slice().sort((a, b) => b.d - a.d);
  $('cp-rows').innerHTML = sorted.length
    ? sorted
        .map((c, i) => {
          var read, cls;
          if (c.d >= 60) {
            read = 'Confirmed winner. Nobody funds a losing ad for two months.';
            cls = 'p-scale';
          } else if (c.d >= 30) {
            read = 'Probably working. Watch for the 60-day mark.';
            cls = 'p-retest';
          } else if (c.d >= 14) {
            read = 'Still testing. Too early to read.';
            cls = 'p-iterate';
          } else {
            read = 'New or already failing.';
            cls = 'p-kill';
          }
          return (
            '<tr><td>' +
            c.n +
            '</td><td>' +
            c.a +
            '</td><td class="num">' +
            c.d +
            '</td>' +
            '<td><span class="pill ' +
            cls +
            '">' +
            read.split('.')[0] +
            '</span><div style="font-size:12px;color:var(--ink-3);margin-top:3px">' +
            read +
            '</div></td>' +
            '<td><button class="btn sm" data-cdel="' +
            COMP.indexOf(c) +
            '">Remove</button></td></tr>'
          );
        })
        .join('')
    : '<tr><td colspan="5" style="color:var(--ink-3);padding:18px 12px">Nothing logged yet.</td></tr>';
  var winners = COMP.filter((c) => c.d >= 60);
  var n = $('cp-note');
  if (winners.length) {
    var angles = {};
    winners.forEach((w) => {
      angles[w.a] = (angles[w.a] || 0) + 1;
    });
    n.className = 'note good';
    n.textContent =
      winners.length +
      ' ad' +
      (winners.length === 1 ? '' : 's') +
      ' running past 60 days. The angles are: ' +
      Object.keys(angles).join(', ') +
      '. Those are the mechanisms worth understanding, not the executions worth copying. Ask why each one works for their offer before assuming it transfers to yours.';
  } else {
    n.className = 'note';
    n.textContent =
      'Nothing tracked past 60 days yet. Log ads as you find them and revisit fortnightly. The signal is longevity rather than how good the ad looks, and it only becomes readable with time.';
  }
}
$('cp-add').addEventListener('click', () => {
  var n = $('cp-name').value.trim() || 'Unnamed',
    a = $('cp-angle').value.trim() || 'Unspecified',
    d = +$('cp-days').value || 0;
  COMP.push({ n: n, a: a, d: d });
  $('cp-name').value = '';
  $('cp-angle').value = '';
  renderComp();
  toast('Logged');
});
$('cp-rows').addEventListener('click', (e) => {
  var b = e.target.closest('[data-cdel]');
  if (!b) return;
  COMP.splice(+b.dataset.cdel, 1);
  renderComp();
});

/* ================= AUTOMATION RULES ================= */
var RULES2 = {
  safe: [
    [
      'Notify when daily spend deviates more than 20% from plan',
      'Notification only. Catches a pacing fault the same day rather than at the weekly.',
    ],
    [
      'Notify when any ad is disapproved',
      'The single most valuable rule on this account. Delivery shifts before any performance metric moves.',
    ],
    [
      'Notify when frequency exceeds 3.5 on a prospecting ad set',
      'A refresh signal, not an action. The response is a creative decision.',
    ],
    [
      'Notify when an ad set exits the learning phase',
      'Useful for knowing when a read becomes trustworthy.',
    ],
    [
      'Notify when CPA exceeds target by 25% over a 7-day window',
      'Seven days, not three. A shorter window reports noise as a trend.',
    ],
    [
      'Notify when a campaign has spent 80% of its lifetime budget',
      'Prevents the silent stop nobody notices until the weekly.',
    ],
  ],
  care: [
    [
      'Pause an ad after spending 2x target CPA with zero conversions',
      'Reasonable, and it needs a minimum lookback of 7 days and a minimum spend condition. Without both it kills ads mid-learning, repeatedly, and the account never stabilises. Exclude any ad in its first 72 hours.',
    ],
    [
      'Increase budget 15% when 7-day CPA is below target',
      'Only on a single named campaign, never account-wide, and with a hard ceiling. Never on a gated lane. Cap the number of increases per week, because compounding daily increases is how a rule quietly triples a budget.',
    ],
    [
      'Pause an ad set when frequency exceeds 6 on retargeting',
      'Retargeting tolerates high frequency, so the threshold has to be genuinely high. Below 6 this will pause working ad sets.',
    ],
    [
      'Reduce budget 20% when 7-day CPA exceeds target by 50%',
      'Reduce rather than pause, because pausing resets learning. Set a floor so the rule cannot walk a campaign down to nothing over consecutive days.',
    ],
  ],
  never: [
    [
      'Any rule that can increase spend on a gated or restricted lane',
      'An automated increase into a prescription or restricted campaign is spend nobody authorised, on the products carrying the most account risk. There is no threshold that makes this safe.',
    ],
    [
      'Any rule acting on a lookback shorter than the learning phase',
      'A three-day CPA rule optimises against noise faster than a person can correct it, and it will pause ads mid-learning on repeat until nothing in the account ever stabilises.',
    ],
    [
      'Automatic creative rotation or duplication',
      'Duplicating a disapproved ad is a policy breach whether a human or a rule does it, and a rule will do it repeatedly without anyone noticing until the account is restricted.',
    ],
    [
      'Anything that turns campaigns back on automatically',
      'A campaign was paused for a reason, and the rule does not know the reason. Restarting a lane paused for a compliance issue is the worst version of this.',
    ],
    [
      'Rules on an account with unverified tracking',
      'Automation acting on corrupted data executes the wrong decision faster and more consistently than a person would. Fix measurement before automating anything.',
    ],
  ],
};
var rlKey = 'safe';
function renderRules() {
  var set = RULES2[rlKey];
  var cls = rlKey === 'safe' ? 'f-ok' : rlKey === 'care' ? 'f-med' : 'f-high';
  $('rl-list').innerHTML = set
    .map((r) => '<div class="flag ' + cls + '"><b>' + r[0] + '</b>' + r[1] + '</div>')
    .join('');
}
$('rl-tabs').addEventListener('click', (e) => {
  var b = e.target.closest('.tab');
  if (!b) return;
  Array.prototype.forEach.call($('rl-tabs').children, (x) => {
    x.classList.remove('on');
  });
  b.classList.add('on');
  rlKey = b.dataset.r;
  renderRules();
});

/* ================= POST-PURCHASE SURVEY ================= */
function calcSurvey() {
  var ord = +$('ps-ord').value || 0,
    rr = (+$('ps-rr').value || 0) / 100,
    m = +$('ps-meta').value || 0,
    g = +$('ps-goog').value || 0,
    w = +$('ps-wom').value || 0,
    o = +$('ps-oth').value || 0,
    plat = +$('ps-plat').value || 0,
    sp = +$('ps-sp').value || 1;
  var resp = m + g + w + o;
  var share = resp ? (m / resp) * 100 : 0;
  var implied = ord * (share / 100);
  var gap = plat ? ((plat - implied) / implied) * 100 : 0;
  $('ps-n').textContent = resp;
  $('ps-share').textContent = share.toFixed(0) + '%';
  $('ps-implied').textContent = Math.round(implied);
  $('ps-gap').textContent = (gap >= 0 ? '+' : '') + gap.toFixed(0) + '%';
  $('ps-cpa').textContent = implied ? '$' + (sp / implied).toFixed(0) : '—';
  $('ps-gbox').className = 'stat ' + (Math.abs(gap) < 20 ? 'hi' : Math.abs(gap) < 45 ? 'md' : 'lo');
  var n = $('ps-note');
  if (resp < 80) {
    n.className = 'note warn';
    n.textContent =
      'Only ' +
      resp +
      ' responses. Below roughly 100 the split is unstable and a single week should not move a decision. Run it continuously and read it monthly rather than weekly.';
  } else if (gap > 20) {
    n.className = 'note bad';
    n.textContent =
      'Meta claims ' +
      plat +
      ' orders where the survey implies ' +
      Math.round(implied) +
      ', a ' +
      gap.toFixed(0) +
      ' percent overstatement. Survey-based CPA is $' +
      (sp / implied).toFixed(0) +
      ' against a platform-reported $' +
      (sp / plat).toFixed(0) +
      '. Two things are true at once: people under-report advertising, so the survey understates Meta, and view-through credit overstates it. The truth sits between them, and the gap is large enough that a holdout is now worth the withheld revenue to settle it.';
  } else if (gap < -20) {
    n.className = 'note warn';
    n.textContent =
      'The survey implies more Meta-driven orders than Meta claims, which is the expected direction on a considered purchase with a long path. Orders completing outside the attribution window, or through a brand search, arrive as organic and the survey catches them. This is evidence that reported CPA overstates the true cost rather than understates it.';
  } else {
    n.className = 'note good';
    n.textContent =
      'Platform and survey agree within ' +
      Math.abs(gap).toFixed(0) +
      ' percent, which is close for two methods measuring different things. That agreement makes both more trustworthy, and it means scaling decisions made on platform numbers are unlikely to be badly wrong.';
  }
}
['ps-ord', 'ps-rr', 'ps-meta', 'ps-goog', 'ps-wom', 'ps-oth', 'ps-plat', 'ps-sp'].forEach((id) => {
  $(id).addEventListener('input', calcSurvey);
});

/* ================= SCALE DIAGNOSTIC ================= */
function calcScaleDiag() {
  var s0 = +$('sd-s0').value || 1,
    s1 = +$('sd-s1').value || 1,
    c0 = +$('sd-c0').value || 1,
    c1 = +$('sd-c1').value || 1,
    d = +$('sd-days').value || 1,
    m0 = +$('sd-m0').value || 1,
    m1 = +$('sd-m1').value || 1,
    f1 = +$('sd-f1').value || 0,
    t0 = +$('sd-t0').value || 1,
    t1 = +$('sd-t1').value || 1,
    learn = $('sd-learn').value === '1',
    beMoved = $('sd-be').value === '1';
  var inc = ((s1 - s0) / s0) * 100;
  var conv0 = s0 / c0,
    conv1 = s1 / c1;
  var marg = conv1 - conv0 > 0 ? (s1 - s0) / (conv1 - conv0) : 0;
  var mD = ((m1 - m0) / m0) * 100,
    tD = ((t1 - t0) / t0) * 100;
  var a0 = +$('sd-a0').value || 0,
    a1 = +$('sd-a1').value || 0,
    i0v = +$('sd-i0').value || 0,
    i1v = +$('sd-i1').value || 0;
  var dA = a0 ? ((a1 - a0) / a0) * 100 : 0,
    dI = i0v ? ((i1v - i0v) / i0v) * 100 : 0,
    dP = c0 ? ((c1 - c0) / c0) * 100 : 0;
  var addI = dI - dA,
    addP = dP - dI;
  $('sd-adelta').textContent = (dA >= 0 ? '+' : '') + dA.toFixed(0) + '%';
  $('sd-idelta').textContent = (addP >= 0 ? '+' : '') + addP.toFixed(0) + 'pts';
  $('sd-abox').className = 'stat ' + (dA <= 5 ? 'hi' : dA <= 15 ? 'md' : 'lo');
  $('sd-ibox').className = 'stat ' + (addP <= 4 ? 'hi' : addP <= 12 ? 'md' : 'lo');
  $('sd-inc').textContent = '+' + inc.toFixed(0) + '%';
  $('sd-marg').textContent = marg > 0 ? '$' + marg.toFixed(0) : 'negative';
  $('sd-mdelta').textContent = (mD >= 0 ? '+' : '') + mD.toFixed(0) + '%';
  $('sd-tdelta').textContent = (tD >= 0 ? '+' : '') + tD.toFixed(0) + '%';
  $('sd-wait').textContent = learn ? Math.max(0, 7 - d) + ' more' : 'read now';
  $('sd-mbox').className =
    'stat ' + (marg > 0 && marg <= c0 * 1.25 ? 'hi' : marg > 0 && marg <= c0 * 1.8 ? 'md' : 'lo');
  var r = $('sd-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (!beMoved) {
    cls = 'is-fail';
    label = 'Not a scaling problem';
    val = 'TRACKING';
    body =
      'Meta shows CPA up and the back end held. That is a measurement fault, not a delivery one, and every change you make on this reading will be wrong. Check whether the increase coincided with anything else: a renewal event firing Purchase, a thank-you page change, or an Rx batch clearing. Reconcile before reversing the budget, because reversing it will make the fault harder to isolate.';
  } else if (learn && d < 7) {
    cls = 'is-warn';
    label = 'Learning re-entry, too early';
    val = 'WAIT';
    body =
      'The ad set re-entered learning and only ' +
      d +
      ' day' +
      (d === 1 ? ' has' : 's have') +
      ' passed. Delivery during learning is unrepresentative by design, and a CPA read at day ' +
      d +
      ' is measuring the model calibrating rather than the audience responding. Wait ' +
      Math.max(1, 7 - d) +
      ' more day' +
      (Math.max(1, 7 - d) === 1 ? '' : 's') +
      ' before judging this. Reversing now costs another learning phase on the way back down and you will have learned nothing.';
  } else if (a0 && i0v && addP > 10 && addP > addI) {
    cls = 'is-fail';
    label = 'Scaling broke checkout';
    val = 'CHECKOUT';
    body =
      'Cost per add to cart moved ' +
      dA.toFixed(0) +
      ' percent and cost per checkout ' +
      dI.toFixed(0) +
      ' percent, and cost per purchase added a further ' +
      addP.toFixed(0) +
      ' points on top of that. The creative kept delivering qualified traffic at the higher spend and the checkout stopped converting it. This is not a media problem and reversing the budget will hide it rather than fix it. Check payment failures, shipping cost visibility, and whether anything in the checkout changed when volume rose.';
  } else if (a0 && i0v && addI > 10) {
    cls = 'is-fail';
    label = 'Scaling broke the product page';
    val = 'PAGE';
    body =
      'Cost per add to cart moved only ' +
      dA.toFixed(0) +
      ' percent while cost per checkout added a further ' +
      addI.toFixed(0) +
      ' points. The broader audience is still adding to cart and the product page is converting fewer of them to checkout. Scaling frequently breaks the page before it breaks the creative, because the incremental audience arrives with less context and the page was written for the audience you had. Reversing the budget restores the number and teaches you nothing.';
  } else if (a0 && dA >= 18 && addI < 6 && addP < 6) {
    cls = 'is-warn';
    label = 'Reaching worse traffic';
    val = 'UPSTREAM';
    body =
      'Cost per add to cart rose ' +
      dA.toFixed(0) +
      ' percent and the rest of the funnel held its shape. The incremental audience is genuinely less inclined to add to cart, which is a creative supply problem rather than a budget one. Adding a proven creative reaches a different pocket of the same audience without raising marginal CPA. Adding more budget to the same assets makes it worse.';
  } else if (mD >= 18 && Math.abs(tD) < 10) {
    cls = 'is-warn';
    label = 'Auction, not creative';
    val = 'CPM';
    body =
      'CPM rose ' +
      mD.toFixed(0) +
      ' percent while CTR held within ' +
      Math.abs(tD).toFixed(0) +
      ' percent. The creative is working as well as it was and the inventory got more expensive. At a frequency of ' +
      f1 +
      ', ' +
      (f1 >= 3
        ? 'this is likely saturation from broadening rather than external competition, and the answer is a genuinely larger audience rather than more budget.'
        : 'this looks like external auction pressure rather than saturation. Recalculate the affordable CPA at the new CPM. If the maths still works, hold. If not, reduce rather than restructure.');
  } else if (tD <= -15) {
    cls = 'is-warn';
    label = 'Creative reaching a worse audience';
    val = 'CTR';
    body =
      'CTR fell ' +
      Math.abs(tD).toFixed(0) +
      ' percent with CPM up only ' +
      mD.toFixed(0) +
      ' percent. Scaling has pushed delivery into inventory or audience pockets the creative does not speak to. This is the most common real scaling failure and it is a creative supply problem rather than a budget one. Adding proven creative reaches new pockets without raising marginal CPA. Adding budget to the same assets makes it worse.';
  } else if (marg > 0 && marg <= c0 * 1.25) {
    cls = 'is-pass';
    label = 'Healthy increment';
    val = 'HOLD';
    body =
      'Marginal CPA of $' +
      marg.toFixed(0) +
      ' against a pre-increase blended CPA of $' +
      c0.toFixed(0) +
      '. The additional spend is buying customers at a reasonable premium, which is what a good increment looks like. Wait the full cooldown, re-measure, and consider the next step of 20 to 25 percent.';
  } else if (marg <= 0) {
    cls = 'is-fail';
    label = 'The increment bought nothing';
    val = 'REVERSE';
    body =
      'Conversions did not rise with spend, so marginal CPA is effectively infinite. Reverse to the previous budget and work the creative pipeline instead. More money into a structure that cannot absorb it buys impressions rather than customers.';
  } else {
    cls = 'is-fail';
    label = 'Past the ceiling';
    val = 'ROLL BACK';
    body =
      'Marginal CPA of $' +
      marg.toFixed(0) +
      ' against $' +
      c0.toFixed(0) +
      ' before. Each additional dollar is materially less efficient and the blended figure is hiding it. Roll back to the last profitable level and move the budget into creative volume, which is the only lever that raises this ceiling rather than testing it.';
  }
  r.classList.add(cls);
  $('sd-label').textContent = label;
  $('sd-val').textContent = val;
  $('sd-body').textContent = body;
}
[
  'sd-s0',
  'sd-s1',
  'sd-c0',
  'sd-c1',
  'sd-days',
  'sd-m0',
  'sd-m1',
  'sd-f1',
  'sd-t0',
  'sd-t1',
  'sd-learn',
  'sd-be',
  'sd-a0',
  'sd-a1',
  'sd-i0',
  'sd-i1',
  'sd-a0',
  'sd-a1',
  'sd-i0',
  'sd-i1',
].forEach((id) => {
  $(id).addEventListener('input', calcScaleDiag);
});

/* ================= DELIVERY DISTRIBUTION ================= */
function calcDist() {
  var v = [];
  for (var i = 1; i <= 8; i++) v.push(+$('dd-' + i).value || 0);
  var live = v.filter((x) => x > 0);
  var tot = v.reduce((a, b) => a + b, 0);
  var sorted = v.slice().sort((a, b) => b - a);
  var top = tot ? (sorted[0] / tot) * 100 : 0;
  var top3 = tot ? ((sorted[0] + sorted[1] + sorted[2]) / tot) * 100 : 0;
  var starved = live.filter((x) => tot && x / tot < 0.05).length;
  var eff = live.filter((x) => tot && x / tot >= 0.1).length;
  $('dd-top').textContent = top.toFixed(0) + '%';
  $('dd-top3').textContent = top3.toFixed(0) + '%';
  $('dd-starved').textContent = starved;
  $('dd-eff').textContent = eff + ' of ' + live.length;
  $('dd-sbox').className = 'stat ' + (starved === 0 ? 'hi' : starved <= 2 ? 'md' : 'lo');
  var n = $('dd-note');
  if (!live.length) {
    n.className = 'note';
    n.textContent = 'Enter spend by asset to read the distribution.';
    return;
  }
  if (top >= 70 && live.length > 3) {
    n.className = 'note warn';
    n.textContent =
      'One asset is taking ' +
      top.toFixed(0) +
      ' percent of delivery across ' +
      live.length +
      ' live creatives, and ' +
      starved +
      ' are effectively starved below 5 percent. In a scaling campaign that concentration is usually correct, because Meta has found the winner and is exploiting it. In a testing campaign it means the test never happened. Which one this is depends entirely on the campaign, and the fix for the second is ABO with guaranteed spend per cell rather than hoping the allocation changes.';
  } else if (starved >= 3) {
    n.className = 'note bad';
    n.textContent =
      starved +
      ' assets are receiving under 5 percent of delivery. They are technically active and are not being tested, which is the most common way an account looks like it is testing while learning nothing. Cap live creatives at six to eight, and move anything genuinely new into the testing environment where spend is guaranteed.';
  } else if (eff <= 2 && live.length >= 4) {
    n.className = 'note warn';
    n.textContent =
      'Only ' +
      eff +
      ' assets are carrying meaningful delivery out of ' +
      live.length +
      ' live. The dependency is narrower than the ad set count suggests, which means a fatigue event on the top asset will hit harder than expected. Validate a successor before that happens.';
  } else {
    n.className = 'note good';
    n.textContent =
      'Delivery is spread across ' +
      eff +
      ' effective assets with ' +
      starved +
      ' starved. That is a healthy distribution: concentrated enough that Meta is exploiting what works, broad enough that a single fatigue event does not collapse volume.';
  }
}
for (var _d = 1; _d <= 8; _d++) {
  var _id = 'dd-' + _d;
  if ($(_id)) $(_id).addEventListener('input', calcDist);
}

/* ================= CREATIVE SUPPLY ================= */
function calcSupply() {
  var sp = +$('cs-sp').value || 0,
    cpm = +$('cs-cpm').value || 1,
    aud = +$('cs-aud').value || 1,
    tol = +$('cs-tol').value || 2.5;
  var weekly = sp * 7,
    imp = (weekly / cpm) * 1000;
  var perCreative = aud * tol;
  var need = Math.max(1, Math.ceil(imp / perCreative));
  $('cs-imp').textContent = Math.round(imp).toLocaleString();
  $('cs-need').textContent = need;
  $('cs-per').textContent = Math.round(perCreative).toLocaleString();
  $('cs-prod').textContent = Math.max(2, Math.ceil(need / 3)) + ' new';
  $('cs-nbox').className = 'stat ' + (need <= 4 ? 'hi' : need <= 8 ? 'md' : 'lo');
  var n = $('cs-note');
  n.className = 'note' + (need <= 4 ? ' good' : need <= 8 ? ' warn' : ' bad');
  n.textContent =
    'At ' +
    money(sp) +
    ' daily against a ' +
    aud.toLocaleString() +
    ' audience, the account generates roughly ' +
    Math.round(imp).toLocaleString() +
    ' impressions a week. Holding each creative to a frequency of ' +
    tol +
    ' means around ' +
    need +
    ' assets in rotation at any time, and roughly ' +
    Math.max(2, Math.ceil(need / 3)) +
    ' new ones per fortnight to replace fatigue. ' +
    (need > 8
      ? 'That is a demanding production cadence. If it cannot be met, the honest options are a larger audience, a lower spend, or accepting that frequency will run above tolerance and CPA will follow it up. Adding budget without adding creative supply is what produces a ceiling that looks like an audience problem.'
      : 'That is a sustainable cadence at this budget. The number rises roughly in step with spend, so recalculate it before any material increase rather than after performance drops.');
}
['cs-sp', 'cs-cpm', 'cs-aud', 'cs-tol'].forEach((id) => {
  $(id).addEventListener('input', calcSupply);
});

/* ================= SELF-COMPETITION ================= */
function calcSelfComp() {
  var n = +$('sc2-n').value || 1,
    ov = (+$('sc2-ov').value || 0) / 100,
    sp = +$('sc2-sp').value || 0,
    same = $('sc2-same').value === '1';
  var risk = (n - 1) * ov * (same ? 1 : 0.45);
  var r = $('sc2-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (n <= 1 || risk < 0.25) {
    cls = 'is-pass';
    label = 'Not a concern';
    val = 'CLEAR';
    body =
      'With ' +
      n +
      ' campaign' +
      (n === 1 ? '' : 's') +
      ' at ' +
      (ov * 100).toFixed(0) +
      ' percent overlap, self-competition is not material. Overlap matters far less than most people assume, and inside a single CBO it is a non-issue because Meta arbitrates between ad sets before the auction rather than in it.';
  } else if (risk < 0.7) {
    cls = 'is-warn';
    label = 'Some overlap cost';
    val = 'WATCH';
    body =
      'Roughly ' +
      n +
      ' campaigns share ' +
      (ov * 100).toFixed(0) +
      ' percent of their audience' +
      (same
        ? ' and optimise to the same event, which is where the cost concentrates.'
        : ', though the different optimisation events reduce the collision.') +
      ' The symptom is CPM rising with no change in CTR or auction conditions, because you are bidding against yourself. Use the Meta audience overlap tool to confirm before restructuring, and prefer consolidating campaigns to adding exclusions, because exclusions fragment the signal further.';
  } else {
    cls = 'is-fail';
    label = 'Bidding against yourself';
    val = 'CONSOLIDATE';
    body =
      n +
      ' campaigns at ' +
      (ov * 100).toFixed(0) +
      ' percent overlap on the same optimisation event is genuine self-competition. Combined spend of ' +
      money(sp) +
      ' is inflating your own CPM, and the account will read this as auction pressure rather than as a structural fault. Consolidate into one campaign with multiple ad sets, which lets Meta arbitrate internally instead of forcing your bids into the same auction. This is a common consequence of scaling by duplication, and duplication is rarely the right way to scale.';
  }
  r.classList.add(cls);
  $('sc2-label').textContent = label;
  $('sc2-val').textContent = val;
  $('sc2-body').textContent = body;
}
['sc2-n', 'sc2-ov', 'sc2-sp', 'sc2-same'].forEach((id) => {
  $(id).addEventListener('input', calcSelfComp);
});

/* ================= ROLLOUT: DELIVERY RAMP ================= */
function calcRamp() {
  var sp = +$('rd-sp').value || 1,
    n = Math.max(1, +$('rd-n').value || 1),
    nw = +$('rd-new').value || 0,
    d = Math.max(1, +$('rd-days').value || 1),
    cpa = +$('rd-cpa').value || 1,
    inc = +$('rd-inc').value || 0;
  var totalSpent = sp * d;
  var fair = 100 / n,
    act = totalSpent ? (nw / totalSpent) * 100 : 0;
  var need = cpa * 3,
    rate = nw / d,
    eta = rate > 0 ? Math.ceil((need - nw) / rate) : 999;
  $('rd-fair').textContent = fair.toFixed(0) + '%';
  $('rd-act').textContent = act.toFixed(1) + '%';
  $('rd-need').textContent = '$' + need.toFixed(0);
  $('rd-eta').textContent = nw >= need ? 'read now' : eta > 60 ? '>60' : eta + ' d';
  $('rd-abox').className = 'stat ' + (act >= fair * 0.6 ? 'hi' : act >= fair * 0.25 ? 'md' : 'lo');
  var r = $('rd-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (nw >= need) {
    cls = 'is-pass';
    label = 'Genuinely tested';
    val = 'READ IT';
    body =
      'The asset has taken $' +
      nw.toFixed(0) +
      ' against a $' +
      need.toFixed(0) +
      ' minimum read. Whatever it did, it did with enough spend behind it to mean something. Classify it and move on.';
  } else if (act < fair * 0.25) {
    cls = 'is-fail';
    label = 'Starved, not failing';
    val = 'NOT TESTED';
    body =
      'The asset has taken ' +
      act.toFixed(1) +
      ' percent of delivery where an even split would be ' +
      fair.toFixed(0) +
      ' percent, and the incumbent is holding ' +
      inc +
      ' percent. This is not a creative verdict, it is a delivery outcome. Meta prefers what it already has history on, and a new asset in a scaling ad set frequently never gets read at all. At this rate it needs ' +
      (eta > 60 ? 'over 60' : eta) +
      ' more days to reach a minimum read, which is longer than the batch cycle. Move it to the testing campaign with its own ad set and guaranteed spend, because waiting will not change the allocation.';
  } else if (act < fair * 0.6) {
    cls = 'is-warn';
    label = 'Under-delivered';
    val = 'WATCH';
    body =
      'At ' +
      act.toFixed(1) +
      ' percent of delivery against a ' +
      fair.toFixed(0) +
      ' percent even share, the asset is getting some read but slowly. It needs roughly ' +
      eta +
      ' more days to reach the $' +
      need.toFixed(0) +
      ' minimum. If that is inside the batch cycle, let it run. If it is not, move it to the testing environment rather than extending the cycle around one asset.';
  } else {
    cls = 'is-pass';
    label = 'Delivering normally';
    val = 'ON TRACK';
    body =
      'The asset is taking ' +
      act.toFixed(1) +
      ' percent of delivery against a ' +
      fair.toFixed(0) +
      ' percent even share, which is a fair allocation for something new. It reaches a minimum read in around ' +
      eta +
      ' days. No intervention needed.';
  }
  r.classList.add(cls);
  $('rd-label').textContent = label;
  $('rd-val').textContent = val;
  $('rd-body').textContent = body;
}
['rd-sp', 'rd-n', 'rd-new', 'rd-days', 'rd-cpa', 'rd-inc'].forEach((id) => {
  $(id).addEventListener('input', calcRamp);
});

/* ================= ROLLOUT: LAYER DIAGNOSIS ================= */
function calcLayers() {
  var imp = +$('cq-imp').value || 1,
    s3 = +$('cq-3s').value || 0,
    tp = +$('cq-tp').value || 0,
    clk = +$('cq-clk').value || 0,
    lpv = +$('cq-lpv').value || 0,
    pur = +$('cq-pur').value || 0,
    fmt = $('cq-fmt').value,
    stage = $('cq-stage').value;
  var hook = imp ? (s3 / imp) * 100 : 0,
    hold = s3 ? (tp / s3) * 100 : 0,
    ctr = imp ? (clk / imp) * 100 : 0,
    lpr = clk ? (lpv / clk) * 100 : 0,
    cvr = lpv ? (pur / lpv) * 100 : 0;
  var bHook = fmt === 'reel' ? [22, 38] : [15, 28];
  var bHold = [12, 25];
  var bCtr = stage === 'acq' ? [0.9, 1.8] : [1.8, 3.5];
  var bLpr = [70, 88];
  var bCvr = stage === 'acq' ? [2.5, 4.5] : [4, 8];
  var rows = [
    [
      'Hook rate, 3s / impressions',
      hook,
      bHook,
      'The first three seconds. Opening frame, motion, on-screen hook.',
    ],
    [
      'Hold rate, ThruPlay / 3s',
      hold,
      bHold,
      'Whether the promise held. Pacing and payoff timing.',
    ],
    [
      'CTR, clicks / impressions',
      ctr,
      bCtr,
      'Whether watching converted into wanting. CTA and offer clarity.',
    ],
    [
      'LP view rate, LPV / clicks',
      lpr,
      bLpr,
      'Page speed and destination integrity. Not a creative problem.',
    ],
    [
      'Conversion, purchases / LPV',
      cvr,
      bCvr,
      'Offer, price, trust, checkout. Not a creative problem either.',
    ],
  ];
  var firstFail = -1;
  $('cq-rows').innerHTML = rows
    .map((r, i) => {
      var v = r[1],
        b = r[2],
        ok = v >= b[0],
        strong = v > b[1];
      if (!ok && firstFail < 0) firstFail = i;
      var pill = strong
        ? '<span class="pill p-scale">Strong</span>'
        : ok
          ? '<span class="pill p-retest">In range</span>'
          : '<span class="pill p-kill">Below</span>';
      return (
        '<tr><td>' +
        r[0] +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">' +
        r[3] +
        '</div></td>' +
        '<td class="num" style="color:' +
        (ok ? 'inherit' : 'var(--fail)') +
        '">' +
        v.toFixed(v < 10 ? 2 : 1) +
        '%</td>' +
        '<td class="num">' +
        b[0] +
        ' to ' +
        b[1] +
        '%</td><td>' +
        pill +
        '</td></tr>'
      );
    })
    .join('');
  var r = $('cq-read');
  r.className = 'readout';
  var cls, label, val, body;
  var fixes = [
    [
      'is-fail',
      'Failed at the thumbstop',
      'HOOK',
      'The creative is not stopping anyone. Nothing downstream matters until this is fixed, and no amount of CTA or offer work compensates. Rebuild the first three seconds: a different opening frame, motion in the first half second, or a text hook that lands before the voiceover does. Keep the concept and change the opening, because the concept has not been tested yet.',
    ],
    [
      'is-fail',
      'Stopped them, then lost them',
      'HOLD',
      'People stopped and did not stay. The opening wrote a cheque the middle did not cash, which usually means the payoff is too late or the pacing sags between second three and second eight. Cut length, move the product earlier, or make the second beat deliver something the hook promised.',
    ],
    [
      'is-warn',
      'Watched but not compelled',
      'CTR',
      'Attention held and did not convert into intent. The creative is entertaining rather than persuasive. Look at the CTA, whether the offer is legible on screen, and whether the viewer knows what to do by the end. On this catalog it is also worth checking that the value is clear, because a $299 purchase needs a reason before it needs a button.',
    ],
    [
      'is-warn',
      'Not a creative problem',
      'PAGE',
      'Clicks are not becoming landing page views. That is page speed, a broken destination or a redirect chain, and no creative change fixes it. Check the URL resolves and the page loads before spending another day on the asset.',
    ],
    [
      'is-warn',
      'Not a creative problem',
      'OFFER',
      'Traffic arrives and does not convert. The creative did its job and the page, the price, the trust signals or the checkout did not. On this catalog also check whether the one to two week delivery expectation is being disclosed early enough.',
    ],
  ];
  if (firstFail < 0) {
    cls = 'is-pass';
    label = 'Every layer clears';
    val = 'SCALE';
    body =
      'Hook, hold, click and conversion all sit within or above benchmark. If CPA is still above target with this profile, the problem is economics rather than creative: the affordable CPA may simply be lower than what this audience costs, which is a pricing or AOV question.';
  } else {
    var f = fixes[firstFail];
    cls = f[0];
    label = f[1];
    val = f[2];
    body = f[3];
    body +=
      ' Note that everything below the failing layer is unreadable until this one is fixed, because the sample reaching it has already been filtered by whatever went wrong here.';
  }
  r.classList.add(cls);
  $('cq-label').textContent = label;
  $('cq-val').textContent = val;
  $('cq-body').textContent = body;
}
['cq-imp', 'cq-3s', 'cq-tp', 'cq-clk', 'cq-lpv', 'cq-pur', 'cq-fmt', 'cq-stage'].forEach((id) => {
  $(id).addEventListener('input', calcLayers);
});

/* ================= ROLLOUT: READINESS ================= */
function calcReady() {
  var sp = +$('rr-sp').value || 0,
    imp = +$('rr-imp').value || 0,
    clk = +$('rr-clk').value || 0,
    cv = +$('rr-cv').value || 0,
    d = +$('rr-days').value || 0,
    cpa = +$('rr-cpa').value || 1;
  var need = [
    ['Spend', sp, cpa * 3, '$'],
    ['Impressions', imp, 25000, ''],
    ['Link clicks', clk, 300, ''],
    ['Days live', d, 4, ''],
    ['Conversions for a CPA read', cv, 5, ''],
  ];
  var short = [];
  $('rr-rows').innerHTML = need
    .map((r) => {
      var ok = r[1] >= r[2];
      if (!ok) short.push(r[0].toLowerCase());
      return (
        '<tr><td>' +
        r[0] +
        '</td><td class="num">' +
        r[3] +
        Math.round(r[1]).toLocaleString() +
        '</td>' +
        '<td class="num">' +
        r[3] +
        Math.round(r[2]).toLocaleString() +
        '</td>' +
        '<td>' +
        (ok ? '<span class="pill p-scale">Met</span>' : '<span class="pill p-kill">Short</span>') +
        '</td></tr>'
      );
    })
    .join('');
  var n = $('rr-note');
  if (!short.length) {
    n.className = 'note good';
    n.textContent =
      'Every dimension clears. This creative can be classified with confidence, including a kill verdict.';
  } else if (short.length <= 2) {
    n.className = 'note warn';
    n.textContent =
      'Short on ' +
      short.join(' and ') +
      '. A directional read is available and a kill decision is not, because the missing dimension is the one that would tell you whether a zero is real. Give it the remaining runway or accept that the verdict is a judgement call rather than an evidenced one.';
  } else {
    n.className = 'note bad';
    n.textContent =
      'Short on ' +
      short.length +
      ' of five dimensions: ' +
      short.join(', ') +
      '. There is nothing readable here yet. Spend alone is not sufficient, because a creative can hit the spend threshold on an expensive audience with too few impressions to say anything at all about how it performs.';
  }
}
['rr-sp', 'rr-imp', 'rr-clk', 'rr-cv', 'rr-days', 'rr-cpa'].forEach((id) => {
  $(id).addEventListener('input', calcReady);
});

/* ================= STRUCTURE DIAGRAM ================= */
var sv = { s: 1, x: 0, y: 0, drag: false, px: 0, py: 0 };
function svApply() {
  var c = $('st-canvas');
  c.style.transform = 'translate(' + sv.x + 'px,' + sv.y + 'px) scale(' + sv.s + ')';
  $('st-zoom').textContent = Math.round(sv.s * 100) + '%';
}
function svPrep() {
  var g = $('st-canvas').querySelector('svg');
  if (!g) return;
  var vb = g.getAttribute('viewBox'),
    w,
    h;
  if (vb) {
    var a = vb.split(/[\s,]+/);
    w = Number.parseFloat(a[2]);
    h = Number.parseFloat(a[3]);
  } else {
    w = g.clientWidth || 900;
    h = g.clientHeight || 600;
  }
  g.style.maxWidth = 'none';
  g.setAttribute('width', w);
  g.setAttribute('height', h);
  g.dataset.w = w;
  g.dataset.h = h;
}
function svFit() {
  var g = $('st-canvas').querySelector('svg');
  if (!g) return;
  var st = $('st-stage');
  var w = Number.parseFloat(g.dataset.w) || g.clientWidth,
    h = Number.parseFloat(g.dataset.h) || g.clientHeight;
  sv.s = Math.max(0.12, Math.min((st.clientWidth - 44) / w, (st.clientHeight - 44) / h, 1.6));
  sv.x = (st.clientWidth - w * sv.s) / 2;
  sv.y = (st.clientHeight - h * sv.s) / 2;
  svApply();
}
function svZoom(f, cx, cy) {
  var st = $('st-stage'),
    r = st.getBoundingClientRect();
  if (cx === undefined) {
    cx = st.clientWidth / 2;
    cy = st.clientHeight / 2;
  } else {
    cx = cx - r.left;
    cy = cy - r.top;
  }
  var ns = Math.max(0.12, Math.min(6, sv.s * f));
  sv.x = cx - (cx - sv.x) * (ns / sv.s);
  sv.y = cy - (cy - sv.y) * (ns / sv.s);
  sv.s = ns;
  svApply();
}
(() => {
  var st = $('st-stage');
  st.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      svZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    },
    { passive: false },
  );
  st.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mmctl')) return;
    sv.drag = true;
    sv.px = e.clientX;
    sv.py = e.clientY;
    st.classList.add('drag');
    st.setPointerCapture(e.pointerId);
  });
  st.addEventListener('pointermove', (e) => {
    if (!sv.drag) return;
    sv.x += e.clientX - sv.px;
    sv.y += e.clientY - sv.py;
    sv.px = e.clientX;
    sv.py = e.clientY;
    svApply();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => {
    st.addEventListener(ev, () => {
      sv.drag = false;
      st.classList.remove('drag');
    });
  });
  st.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.mmctl')) svZoom(1.5, e.clientX, e.clientY);
  });
})();
$('sz-in').addEventListener('click', () => {
  svZoom(1.25);
});
$('sz-out').addEventListener('click', () => {
  svZoom(1 / 1.25);
});
$('sz-fit').addEventListener('click', svFit);
$('sz-pres').addEventListener('click', () => {
  var st = $('st-stage'),
    on = st.classList.toggle('present');
  document.body.classList.toggle('presenting', on);
  $('sz-pres').textContent = on ? 'Exit' : 'Present';
  setTimeout(svFit, 60);
});
$('sz-svg').addEventListener('click', () => {
  var g = $('st-canvas').querySelector('svg');
  if (!g) return;
  var c = g.cloneNode(true);
  c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', '#ffffff');
  c.insertBefore(bg, c.firstChild);
  var str = new XMLSerializer().serializeToString(c);
  var lane = $('s-lane').value.split('|')[0].toLowerCase();
  dl(
    new Blob([str], { type: 'image/svg+xml;charset=utf-8' }),
    'twc-structure-' + lane + '-p' + $('s-phase').value + '.svg',
  );
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('st-stage').classList.contains('present')) {
    $('sz-pres').click();
  }
});

function structMermaid() {
  var lv = $('s-lane').value.split('|'),
    lane = lv[0],
    cpa = +lv[1];
  var geo = $('s-geo').value,
    day = +$('s-day').value || 0,
    ph = $('s-phase').value,
    assets = +$('s-assets').value || 6;
  var pre = 'TWC_' + geo + '_' + lane + '_';
  var need = (cpa * 50) / 7;
  var excl =
    lane === 'EMERGENCY-KITS'
      ? 'Kit purchasers 180d'
      : lane === 'SKINCARE'
        ? 'Category purchasers 60d'
        : lane === '1WELLNESS'
          ? 'Existing members'
          : 'Category purchasers 30d';
  var m = 'flowchart TD\n';
  var cap = '',
    note = '';
  if (ph === '1') {
    var cells = Math.max(1, Math.min(4, Math.floor(day / need) || 1));
    if (day / need < 1) cells = 1;
    var per = Math.round(day / cells);
    var names = ['PREPAREDNESS', 'ACCESS', 'AUTHORITY', 'UNBOXING'];
    m +=
      '  SET(["Objective: Sales · Purchase<br/>7d click / 1d view<br/>Highest volume, no cap<br/>Advantage+ placements"])\n';
    m += '  C["' + pre + 'ACQ_CT-CONCEPT_ABO<br/>' + money(day) + ' / day · ABO"]\n';
    m += '  SET -.-> C\n';
    for (var i = 0; i < cells; i++) {
      m +=
        '  C --> A' +
        i +
        '["AS' +
        String(i + 1).padStart(2, '0') +
        '_BROAD_' +
        names[i] +
        '<br/>' +
        money(per) +
        ' / day<br/>' +
        assets +
        ' assets"]\n';
    }
    m += '  EX(["Exclusions<br/>Under 18 · ' + excl + '"])\n';
    m += '  EX -.-> C\n';
    m += '  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n';
    m += '  classDef cell fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m += '  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m += '  class C camp\n';
    m += '  class ' + Array.from({ length: cells }, (_, i) => 'A' + i).join(',') + ' cell\n';
    m += '  class SET,EX meta';
    cap =
      cells +
      ' cell' +
      (cells === 1 ? '' : 's') +
      ' · ' +
      assets +
      ' assets each · ' +
      money(per) +
      ' each';
    note =
      cells === 1
        ? 'At ' +
          money(day) +
          ' daily against a $' +
          cpa +
          ' CPA, the lane supports one cell. A multi-cell concept test would produce an unreadable result at full cost, so creatives compete at the ad level inside one ad set and are read in pairs across cycles.'
        : 'Audiences are identical across all ' +
          cells +
          ' cells by design. Concept is the only variable. If audience and concept move together, a winning ad set tells you nothing you can reuse in the next round.';
  } else if (ph === '2') {
    var sc = Math.round(day * 0.7),
      rt = Math.round(day * 0.15),
      ct = day - sc - rt;
    m += '  subgraph SC[" "]\n';
    m += '    S["' + pre + 'ACQ_SCALE_CBO<br/>' + money(sc) + ' / day · CBO"]\n';
    m += '    S --> S1["AS01_BROAD<br/>Graduated winners only<br/>2 to 3 creatives"]\n';
    m += '  end\n';
    m += '  subgraph RT[" "]\n';
    m += '    R["' + pre + 'RTG_30D_ABO<br/>' + money(rt) + ' / day · ABO"]\n';
    m +=
      '    R --> R1["AS01_RTG-CONSOLIDATED-30D<br/>ATC + IC 0-14d · PV 0-30d<br/>Objection-resolving creative"]\n';
    m += '  end\n';
    m += '  subgraph CT[" "]\n';
    m += '    T["' + pre + 'ACQ_CT-ANGLE_ABO<br/>' + money(ct) + ' / day · ABO"]\n';
    m += '    T --> T1["AS01"] \n    T --> T2["AS02"]\n    T --> T3["AS03"]\n';
    m += '  end\n';
    m += '  T -.->|"graduate winners"| S\n';
    m +=
      '  EX(["Exclusions<br/>Under 18 · ' + excl + '<br/>Retargeting excl. purchasers 0-180d"])\n';
    m += '  EX -.-> S\n';
    m += '  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n';
    m += '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n';
    m += '  classDef cell fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m += '  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m += '  class S,R,T camp\n  class S1 good\n  class R1,T1,T2,T3 cell\n  class EX meta';
    cap = '3 campaigns · scale ' + money(sc) + ' · rtg ' + money(rt) + ' · test ' + money(ct);
    note =
      'Retargeting sits outside the scaling CBO at this stage. Warm conversions are cheaper, so an unconstrained CBO would move budget into retargeting until prospecting starves and the pool depletes with nothing refilling it. Fold it in once total spend clears roughly $3,000 daily.';
  } else {
    var s2 = Math.round(day * 0.6),
      t2 = Math.round(day * 0.15),
      rest = day - s2 - t2;
    m +=
      '  S["' +
      pre +
      'ACQ_SCALE_CBO<br/>' +
      money(s2) +
      ' / day · CBO<br/>Cost cap above observed median"]\n';
    m += '  S --> A1["AS01_BROAD<br/>min 55% of campaign"]\n';
    m += '  S --> A2["AS02_LAL-PURCHASER-1-3<br/>min 20%"]\n';
    m += '  S --> A3["AS03_LAL-HIGHAOV-1-2<br/>min 10%"]\n';
    m += '  S --> A4["AS04_RTG-CONSOLIDATED-30D<br/>max 15%<br/>excl. purchasers 0-180d"]\n';
    m +=
      '  T["' +
      pre +
      'ACQ_CT-CONCEPT_ABO<br/>' +
      money(t2) +
      ' / day · ABO<br/>Rolling fortnightly batch"]\n';
    m +=
      '  RE["' +
      pre +
      'RET_REPLENISH_ABO<br/>' +
      money(rest) +
      ' / day · ABO<br/>Lane replenishment window"]\n';
    m += '  T -.->|"graduate"| S\n';
    m += '  S -.->|"purchasers"| RE\n';
    m += '  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n';
    m += '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n';
    m += '  classDef warn fill:#fbf2e0,stroke:#95681a,color:#95681a\n';
    m += '  classDef cell fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m += '  class S,T,RE camp\n  class A1,A2,A3 good\n  class A4 warn\n';
    cap =
      'Mature lane · scale ' + money(s2) + ' · test ' + money(t2) + ' · retention ' + money(rest);
    note =
      'Retargeting now sits inside the scaling CBO with a spend maximum, and the prospecting ad sets carry minimums. Without those limits Meta allocates toward the cheapest conversions available, prospecting starves, and new customer acquisition stops while blended ROAS rises.';
  }
  return {
    m: m,
    cap: cap,
    note: note,
    title: pre.replace(/_$/, ''),
    sub: 'Phase ' + ph + ' · ' + money(day) + ' daily · $' + cpa + ' target CPA',
  };
}
function renderStructDiagram() {
  var o = structMermaid();
  $('st-cap').textContent = o.cap;
  $('st-note').className = 'note';
  $('st-note').textContent = o.note;
  $('st-ptitle').textContent = o.title;
  $('st-psub').textContent = o.sub;
  var box = $('st-canvas'),
    fall = $('st-fall');
  if (typeof mermaid === 'undefined' || !initMermaid()) {
    box.innerHTML = '';
    fall.style.display = 'block';
    fall.textContent = o.m;
    return;
  }
  fall.style.display = 'none';
  box.innerHTML = '';
  try {
    mermaid
      .render('stmm' + Date.now(), o.m)
      .then((r) => {
        box.innerHTML = r.svg;
        svPrep();
        svFit();
      })
      .catch(() => {
        fall.style.display = 'block';
        fall.textContent = o.m;
      });
  } catch (err) {
    fall.style.display = 'block';
    fall.textContent = o.m;
  }
}

/* ================= CREATIVE TEST STRUCTURE ================= */
var cv = { s: 1, x: 0, y: 0, drag: false, px: 0, py: 0 };
function cvApply() {
  $('ct-canvas').style.transform = 'translate(' + cv.x + 'px,' + cv.y + 'px) scale(' + cv.s + ')';
  $('ct-zoom').textContent = Math.round(cv.s * 100) + '%';
}
function cvPrep() {
  var g = $('ct-canvas').querySelector('svg');
  if (!g) return;
  var vb = g.getAttribute('viewBox'),
    w,
    h;
  if (vb) {
    var a = vb.split(/[\s,]+/);
    w = Number.parseFloat(a[2]);
    h = Number.parseFloat(a[3]);
  } else {
    w = g.clientWidth || 900;
    h = g.clientHeight || 600;
  }
  g.style.maxWidth = 'none';
  g.setAttribute('width', w);
  g.setAttribute('height', h);
  g.dataset.w = w;
  g.dataset.h = h;
}
function cvFit() {
  var g = $('ct-canvas').querySelector('svg');
  if (!g) return;
  var st = $('ct-stage');
  var w = Number.parseFloat(g.dataset.w) || g.clientWidth,
    h = Number.parseFloat(g.dataset.h) || g.clientHeight;
  cv.s = Math.max(0.12, Math.min((st.clientWidth - 44) / w, (st.clientHeight - 44) / h, 1.6));
  cv.x = (st.clientWidth - w * cv.s) / 2;
  cv.y = (st.clientHeight - h * cv.s) / 2;
  cvApply();
}
function cvZoom(f, cx, cy) {
  var st = $('ct-stage'),
    r = st.getBoundingClientRect();
  if (cx === undefined) {
    cx = st.clientWidth / 2;
    cy = st.clientHeight / 2;
  } else {
    cx = cx - r.left;
    cy = cy - r.top;
  }
  var ns = Math.max(0.12, Math.min(6, cv.s * f));
  cv.x = cx - (cx - cv.x) * (ns / cv.s);
  cv.y = cy - (cy - cv.y) * (ns / cv.s);
  cv.s = ns;
  cvApply();
}
(() => {
  var st = $('ct-stage');
  st.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      cvZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    },
    { passive: false },
  );
  st.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mmctl')) return;
    cv.drag = true;
    cv.px = e.clientX;
    cv.py = e.clientY;
    st.classList.add('drag');
    st.setPointerCapture(e.pointerId);
  });
  st.addEventListener('pointermove', (e) => {
    if (!cv.drag) return;
    cv.x += e.clientX - cv.px;
    cv.y += e.clientY - cv.py;
    cv.px = e.clientX;
    cv.py = e.clientY;
    cvApply();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => {
    st.addEventListener(ev, () => {
      cv.drag = false;
      st.classList.remove('drag');
    });
  });
  st.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.mmctl')) cvZoom(1.5, e.clientX, e.clientY);
  });
})();
$('cz-in').addEventListener('click', () => {
  cvZoom(1.25);
});
$('cz-out').addEventListener('click', () => {
  cvZoom(1 / 1.25);
});
$('cz-fit').addEventListener('click', cvFit);
$('cz-pres').addEventListener('click', () => {
  var st = $('ct-stage'),
    on = st.classList.toggle('present');
  document.body.classList.toggle('presenting', on);
  $('cz-pres').textContent = on ? 'Exit' : 'Present';
  setTimeout(cvFit, 60);
});
$('cz-svg').addEventListener('click', () => {
  var g = $('ct-canvas').querySelector('svg');
  if (!g) return;
  var c = g.cloneNode(true);
  c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', '#ffffff');
  c.insertBefore(bg, c.firstChild);
  dl(
    new Blob([new XMLSerializer().serializeToString(c)], { type: 'image/svg+xml;charset=utf-8' }),
    'twc-test-' + $('ct-stage2').value + '.svg',
  );
});

var CTEST = {
  concept: {
    n: 'Concept',
    mode: 'abo',
    cells: 4,
    assets: 2,
    days: 14,
    vary: 'The underlying idea. Educational, preparedness, access, physician authority.',
    hold: 'Audience, offer, objective, landing page, conversion event, budget per cell.',
    labels: ['PREPAREDNESS', 'ACCESS', 'AUTHORITY', 'UNBOXING'],
    read: 'Cost per purchase primary. CTR and landing page rate as supporting signals only.',
    why: 'The largest strategic variable in the account, and the one whose answer shapes every test after it. Variance between concepts is high, so each cell needs guaranteed spend or the answer is whichever cell Meta happened to favour.',
    err: 'Changing the audience, offer or landing page alongside the concept. Even when something wins you cannot say what won, and the next round starts from zero.',
  },
  angle: {
    n: 'Angle',
    mode: 'abo',
    cells: 4,
    assets: 2,
    days: 14,
    vary: 'The reason to care, inside the winning concept.',
    hold: 'Concept, audience, offer, landing page, conversion event.',
    labels: ['ROUTINE', 'CONVENIENCE', 'QUALITY', 'VALUE'],
    read: 'Cost per purchase primary, with CTR as the leading indicator.',
    why: 'Variance is lower than concept and still high enough that Meta will starve a cell it forms an early view on. ABO holds the read.',
    err: 'Running this before the concept is settled. Angles tested against an idea that does not work teach nothing transferable.',
  },
  hook: {
    n: 'Hook',
    mode: 'ads',
    cells: 1,
    assets: 5,
    days: 10,
    vary: 'The first three seconds. Opening frame, first line, on-screen text.',
    hold: 'Everything after the hook. Same body, same proof, same CTA, same creator.',
    labels: ['H01', 'H02', 'H03', 'H04', 'H05'],
    read: 'Hook rate first, meaning 3-second plays over impressions. That is the direct measure. CTR second, CPA third.',
    why: 'Four ABO cells isolate four hook variants. Each cell holds one hook across its selected asset executions; budget allocation does not guarantee equal delivery or a causal comparison.',
    err: 'Judging hooks on CPA alone. A hook affects the thumbstop directly and the purchase only distantly, so the metric closest to the variable is the one to read.',
  },
  creator: {
    n: 'Creator',
    mode: 'abo',
    cells: 4,
    assets: 1,
    days: 14,
    vary: 'Who delivers the message.',
    hold: 'Script, concept, angle, hook, format, CTA.',
    labels: ['CR01', 'CR02', 'CR03', 'CR04'],
    read: 'Cost per purchase, with hook rate checked separately because creators differ most at the thumbstop.',
    why: 'Creator variance is genuinely high and production is expensive, so each one needs a fair read. This is the stage most worth running as ABO even when the budget is tight.',
    err: 'Concluding a concept failed when one creator failed. The same script can succeed and fail depending entirely on who says it.',
  },
  format: {
    n: 'Format',
    mode: 'ads',
    cells: 1,
    assets: 5,
    days: 12,
    vary: 'How the winning message is delivered. UGC, demonstration, presenter, static, carousel.',
    hold: 'Concept, angle, hook, core message, CTA, landing page.',
    labels: ['F01 UGC', 'F02 DEMO', 'F03 PRESENTER', 'F04 STATIC', 'F05 CAROUSEL'],
    read: 'Cost per purchase, with hold rate as the diagnostic for why a format lost.',
    why: 'Four ABO cells isolate four format variants. Each cell uses its assigned format across the selected executions, with concept, message and offer held constant.',
    err: 'Comparing a six-second static against a sixty-second explainer on the same engagement metric. Compare them on cost per purchase and use hold rate only to explain the result.',
  },
  validate: {
    n: 'Validation',
    mode: 'abo',
    cells: 3,
    assets: 1,
    days: 14,
    vary: 'Nothing. This is a repeat read of the top performers.',
    hold: 'Everything. Fresh audience where the pool allows it.',
    labels: ['WINNER-01', 'WINNER-02', 'WINNER-03', 'CONTROL'],
    read: 'Does the result hold outside the test that produced it, at comparable cost.',
    why: 'A first-test winner carries some luck. Promoting it straight into scaling is how an account discovers a fortnight later that the result was a sample-size artefact.',
    err: 'Skipping this stage because the first read looked convincing. Convincing is exactly what a lucky read looks like.',
  },
};
function renderCTest() {
  var k = $('ct-stage2').value,
    T = Object.assign({}, CTEST[k] || CTEST.concept);
  var assets = Number($('ct-assets').value);
  T.assets =
    Number.isInteger(assets) && assets >= 4 && assets <= 12 && assets % 2 === 0 ? assets : 6;
  $('ct-assets').value = String(T.assets);
  T.mode = 'abo';
  T.cells = 4;
  T.labels = T.labels.slice(0, 4);
  while (T.labels.length < 4)
    T.labels.push('VARIANT-' + String(T.labels.length + 1).padStart(2, '0'));
  var day = +$('ct-day').value || 0,
    cpa = +$('ct-cpa').value || 1,
    prod = ($('ct-prod').value || 'PRODUCT').toUpperCase().replace(/\s+/g, '-');
  var minRead = cpa * 3,
    need = (cpa * 50) / 7;
  var cells = T.cells,
    per = Math.round(day / cells);
  var totalPer = T.mode === 'abo' ? per * T.days : Math.round((day * T.days) / T.assets);
  var weeklyPerCell = (per * 7) / cpa,
    fullTestDaily = Math.ceil(need * cells),
    perAsset = Math.round(per / T.assets);
  var purpose =
    k === 'concept'
      ? 'CT-CONCEPT'
      : k === 'angle'
        ? 'CT-ANGLE'
        : k === 'hook'
          ? 'CT-HOOK'
          : k === 'creator'
            ? 'CT-CREATOR'
            : k === 'format'
              ? 'CT-FORMAT'
              : 'CT-VALIDATE';
  var camp = 'TWC_US_' + prod + '_ACQ_' + purpose + '_' + (T.mode === 'abo' ? 'ABO' : 'CBO');

  $('ct-spec').innerHTML = [
    ['Variable', T.vary],
    ['Held constant', T.hold],
    [
      'Structure',
      T.mode === 'abo'
        ? cells +
          ' ad sets, ABO, one variant each, ' +
          T.assets +
          ' asset' +
          (T.assets === 1 ? '' : 's') +
          ' per cell'
        : 'One ad set, ' + T.assets + ' ads competing, Meta allocates',
    ],
    ['Total assets', String(cells * T.assets) + ' across ' + cells + ' cells'],
    ['Duration', T.days + ' days'],
    ['Read on', T.read],
    ['Why this structure', T.why],
  ]
    .map(
      (r) =>
        '<tr><td style="width:150px;color:var(--ink-3);font-size:12.5px;vertical-align:top">' +
        r[0] +
        '</td><td>' +
        r[1] +
        '</td></tr>',
    )
    .join('');

  var r = $('ct-read');
  r.className = 'readout';
  var cls, label, val, body;
  if (T.mode === 'abo') {
    var stableCells = Math.floor(day / need);
    if (totalPer < minRead) {
      var readableCells = Math.floor((day * T.days) / minRead);
      cls = readableCells > 1 ? 'is-warn' : 'is-fail';
      label = readableCells > 1 ? 'Reduce the cell count' : 'Budget cannot support an ABO test';
      val = readableCells > 1 ? String(Math.min(cells, readableCells)) + ' CELLS' : 'AD LEVEL';
      body =
        readableCells > 1
          ? money(day) +
            ' is the total daily test budget. Across ' +
            cells +
            ' cells, each receives ' +
            money(per) +
            ' daily and reaches only ' +
            money(totalPer) +
            ' over ' +
            T.days +
            ' days against the ' +
            money(minRead) +
            ' minimum read. Test fewer, more distinct variants per cycle.'
          : money(day) +
            ' is the total daily test budget. Over ' +
            T.days +
            ' days, no ABO cell reaches the ' +
            money(minRead) +
            ' minimum read. Run fewer variants inside one ad set, accept that Meta controls allocation, and treat the result as directional.';
    } else if (per < need) {
      stableCells = Math.max(1, stableCells);
      cls = 'is-warn';
      label = 'Below stable-delivery benchmark';
      val = String(Math.min(cells, stableCells)) + ' CELLS';
      body =
        money(day) +
        ' is the total daily test budget, not the budget for each cell. Split four ways, each cell receives ' +
        money(per) +
        ' daily and plans about ' +
        weeklyPerCell.toFixed(1) +
        ' purchases per week at the ' +
        money(cpa) +
        ' target CPA. The planning benchmark is 50 purchases per cell per week, or about ' +
        money(Math.ceil(need)) +
        ' daily per cell. Fund ' +
        Math.min(cells, stableCells) +
        ' cells per cycle at this budget, or raise the four-cell total to about ' +
        money(fullTestDaily) +
        ' daily. With ' +
        T.assets +
        ' assets per cell, the even-share estimate is only ' +
        money(perAsset) +
        ' daily per asset and Meta will not distribute evenly.';
    } else {
      cls = 'is-pass';
      label = 'Budget supports four-cell delivery';
      val = 'RUN';
      body =
        money(day) +
        ' is the total daily test budget. Each cell receives ' +
        money(per) +
        ' daily, planning about ' +
        weeklyPerCell.toFixed(1) +
        ' purchases per week at the ' +
        money(cpa) +
        ' target CPA and clearing the 50-per-week delivery benchmark. Across ' +
        T.assets +
        ' assets, the even-share estimate is ' +
        money(perAsset) +
        ' daily per asset; actual delivery will be uneven, so judge the cell first and individual assets only after sufficient spend.';
    }
  } else {
    var perAd = Math.round((day * T.days) / T.assets);
    if (perAd >= minRead * 0.7) {
      cls = 'is-pass';
      label = 'Budget supports this test';
      val = 'RUN';
      body =
        'At ' +
        money(day) +
        ' daily over ' +
        T.days +
        ' days, an even split across ' +
        T.assets +
        ' ads would give ' +
        money(perAd) +
        ' each. Meta will not split evenly, so expect two or three to carry most of the delivery. That is acceptable at this stage because the winner matters more than the full ranking.';
    } else {
      cls = 'is-warn';
      label = 'Thin, but workable';
      val = 'REDUCE';
      body =
        'An even split gives only ' +
        money(perAd) +
        ' per asset against a ' +
        money(minRead) +
        ' minimum read, and Meta will concentrate delivery further. Cut to three assets so the ones that do get delivery are readable, rather than running five and learning about one.';
    }
  }
  r.classList.add(cls);
  $('ct-label').textContent = label;
  $('ct-val').textContent = val;
  $('ct-body').textContent = body;

  var out =
    camp +
    '\n' +
    '='.repeat(Math.min(58, camp.length + 8)) +
    '\n\n' +
    'STAGE          ' +
    T.n +
    '\n' +
    'VARIABLE       ' +
    T.vary +
    '\n' +
    'HELD CONSTANT  ' +
    T.hold +
    '\n' +
    'BUDGET         ' +
    money(day) +
    ' / day · ' +
    (T.mode === 'abo' ? 'ABO' : 'CBO') +
    '\n' +
    'DURATION       ' +
    T.days +
    ' days\n' +
    'MINIMUM READ   ' +
    money(minRead) +
    ' per cell (planning threshold)\n\n' +
    'DELIVERY PLAN  ' +
    money(Math.ceil(need)) +
    ' / cell / day for 50 purchases per week\n' +
    'FULL TEST PLAN ' +
    money(fullTestDaily) +
    ' / day across ' +
    cells +
    ' cells\n\n' +
    'SETTINGS\n' +
    '  Objective          Sales, optimise to Purchase\n' +
    '  Attribution        7-day click / 1-day view\n' +
    '  Bid strategy       Highest volume, no cap\n' +
    '  Placements         Advantage+\n' +
    '  Audience           Broad, identical across every cell\n' +
    '  Exclusions         Under 18 · purchasers at lane window\n' +
    '                     · scaling campaign converters\n\n' +
    'STRUCTURE\n';
  if (T.mode === 'abo') {
    for (var i = 0; i < cells; i++) {
      out +=
        '  AS' +
        String(i + 1).padStart(2, '0') +
        '_BROAD_' +
        T.labels[i] +
        '\n' +
        '    Budget           ' +
        money(per) +
        ' / day\n' +
        '    Assets           ' +
        T.assets +
        '\n';
    }
  } else {
    out +=
      '  AS01_BROAD_' +
      T.n.toUpperCase() +
      '-TEST\n' +
      '    Budget           ' +
      money(day) +
      ' / day\n' +
      '    Ads              ' +
      T.assets +
      ', competing in one ad set\n';
    T.labels.slice(0, T.assets).forEach((l) => {
      out += '      ' + l + '\n';
    });
  }
  out += '\nREAD ON\n  ' + T.read + '\n\nCOMMON MISTAKE\n  ' + T.err;
  $('ct-out').textContent = out;

  var m = 'flowchart TD\n';
  m += '  V(["VARIABLE<br/>' + T.vary.split('.')[0] + '"])\n';
  m += '  H(["HELD CONSTANT<br/>' + T.hold.replace(/, /g, ' · ').replace(/\.$/, '') + '"])\n';
  m +=
    '  C["' +
    camp +
    '<br/>' +
    money(day) +
    ' / day · ' +
    (T.mode === 'abo' ? 'ABO' : 'CBO') +
    '<br/>' +
    T.days +
    ' days"]\n';
  m += '  V -.-> C\n  H -.-> C\n';
  if (T.mode === 'abo') {
    for (var j = 0; j < cells; j++) {
      m +=
        '  C --> A' +
        j +
        '["AS' +
        String(j + 1).padStart(2, '0') +
        '_BROAD_' +
        T.labels[j] +
        '<br/>' +
        money(per) +
        ' / day<br/>' +
        T.assets +
        ' asset' +
        (T.assets === 1 ? '' : 's') +
        '"]\n';
    }
    m += '  classDef cell fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m += '  class ' + Array.from({ length: cells }, (_, i) => 'A' + i).join(',') + ' cell\n';
  } else {
    m +=
      '  C --> S["AS01_BROAD_' +
      T.n.toUpperCase() +
      '-TEST<br/>' +
      money(day) +
      ' / day<br/>Meta allocates"]\n';
    for (var q = 0; q < T.assets; q++) {
      m += '  S --> D' + q + '["' + T.labels[q] + '"]\n';
    }
    m += '  classDef cell fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m += '  class S,' + Array.from({ length: T.assets }, (_, i) => 'D' + i).join(',') + ' cell\n';
  }
  m += '  R{"Day ' + T.days + ' read<br/>' + T.read.split('.')[0] + '"}\n';
  m += '  C --> R\n';
  m += '  R -->|scale| G["Scaling campaign"]\n';
  m += '  R -->|iterate| N["Next batch"]\n';
  m += '  R -->|kill| L["Learning ledger"]\n';
  m += '  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n';
  m += '  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
  m += '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n';
  m += '  class C camp\n  class V,H meta\n  class G good';

  $('ct-cap').textContent =
    T.mode === 'abo'
      ? cells +
        ' cells · ' +
        T.assets +
        ' assets/cell · ' +
        cells * T.assets +
        ' total · ' +
        money(per) +
        ' each · ' +
        T.days +
        ' days'
      : '1 ad set · ' + T.assets + ' ads · ' + T.days + ' days';
  $('ct-ptitle').textContent =
    'Stage ' + (Object.keys(CTEST).indexOf(k) + 1) + ' · ' + T.n + ' test';
  $('ct-psub').textContent = camp;
  var box = $('ct-canvas'),
    fall = $('ct-fall');
  if (typeof mermaid === 'undefined' || !initMermaid()) {
    box.innerHTML = '';
    fall.style.display = 'block';
    fall.textContent = m;
    return;
  }
  fall.style.display = 'none';
  box.innerHTML = '';
  try {
    mermaid
      .render('ctmm' + Date.now(), m)
      .then((res) => {
        box.innerHTML = res.svg;
        cvPrep();
        cvFit();
      })
      .catch(() => {
        fall.style.display = 'block';
        fall.textContent = m;
      });
  } catch (err) {
    fall.style.display = 'block';
    fall.textContent = m;
  }
}
['ct-stage2', 'ct-day', 'ct-cpa', 'ct-prod', 'ct-assets'].forEach((id) => {
  $(id).addEventListener('input', renderCTest);
});
