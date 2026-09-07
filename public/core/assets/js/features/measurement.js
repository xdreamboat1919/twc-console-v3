/* ================= PIXEL AND CAPI ================= */
var PXA = [
  [
    'px1',
    'Pixel installed and firing on every commerce page',
    10,
    'Verify with Pixel Helper on the live storefront, not the homepage alone.',
  ],
  [
    'px2',
    'CAPI live and receiving server events',
    10,
    'Server events visible in Events Manager alongside browser events.',
  ],
  [
    'px3',
    'Deduplication working on Purchase',
    10,
    'Matched event_id, confirmed in Test Events rather than assumed.',
  ],
  [
    'px4',
    'Deduplication working on every other event',
    8,
    'AddToCart and InitiateCheckout are the ones commonly missed. Purchase looks clean while every mid-funnel rate is inflated.',
  ],
  [
    'px5',
    'event_id is the order ID, on both sides',
    8,
    'A timestamp or random ID will never match, and it also fails to catch a thank-you page reload.',
  ],
  [
    'px6',
    'Purchase value and currency accurate',
    10,
    'Compare five real orders against the back end. A currency mismatch reads as a revenue gap with matching order counts.',
  ],
  [
    'px7',
    'Subscription renewals fire a distinct event',
    8,
    'If renewals fire Purchase, Meta optimises toward a blend of new and existing customers and reported ROAS is flattered by revenue the ads did not generate.',
  ],
  [
    'px8',
    'Rx conversion fires on fulfilment, not payment',
    10,
    'Payment precedes clinical approval on this funnel. Firing at payment trains delivery toward orders that may never ship.',
  ],
  [
    'px9',
    'Domain verified in Business Manager',
    7,
    'Required for Aggregated Event Measurement and for controlling who can configure events on your domain.',
  ],
  [
    'px10',
    'Aggregated Event Measurement configured, Purchase first',
    6,
    'Eight slots, ordered by priority. Wrong order means the wrong event survives on iOS.',
  ],
  [
    'px11',
    'Advanced matching enabled on commerce surfaces',
    6,
    'Improves match rates materially and belongs only on Class A.',
  ],
  [
    'px12',
    'Clinical surfaces excluded from browser pixel entirely',
    10,
    'No pixel, no SDK on intake, questionnaire or records pages. Server-side from the CRM at a de-identified milestone instead.',
  ],
  [
    'px13',
    'Verified end to end in Test Events before launch',
    5,
    'Not after. A fault found in week three has already corrupted three weeks of decisions.',
  ],
  [
    'px14',
    'Diagnostics reviewed weekly',
    4,
    'Dedup and parameter coverage break silently on theme updates, app updates and checkout changes.',
  ],
];
var pxOn = { px1: 1, px2: 1, px3: 1, px9: 1, px11: 1 };
function renderPixel() {
  $('px-list').innerHTML = PXA.map((a) => {
    var on = pxOn[a[0]];
    return (
      '<div class="chk' +
      (on ? ' ok' : '') +
      '"><input type="checkbox" data-px="' +
      a[0] +
      '"' +
      (on ? ' checked' : '') +
      '>' +
      '<div class="t">' +
      a[1] +
      '<small>' +
      a[3] +
      '</small></div>' +
      '<span class="b" style="background:' +
      (a[2] >= 10 ? 'var(--fail-bg)' : a[2] >= 7 ? 'var(--warn-bg)' : 'var(--panel-2)') +
      ';color:' +
      (a[2] >= 10 ? 'var(--fail)' : a[2] >= 7 ? 'var(--warn)' : 'var(--ink-3)') +
      '">' +
      a[2] +
      '</span></div>'
    );
  }).join('');
  var total = PXA.reduce((x, a) => x + a[2], 0);
  var got = PXA.reduce((x, a) => x + (pxOn[a[0]] ? a[2] : 0), 0);
  var pct = Math.round((got / total) * 100);
  var r = $('px-read');
  r.className = 'readout';
  var cls, label, body;
  var criticalGaps = PXA.filter((a) => a[2] >= 10 && !pxOn[a[0]]);
  if (criticalGaps.length) {
    cls = 'is-fail';
    label = 'Not safe to optimise against';
    body =
      criticalGaps.length +
      ' critical dimension' +
      (criticalGaps.length === 1 ? ' is' : 's are') +
      ' failing. At this state the conversion data is wrong in a way that will not announce itself, and every scaling decision, creative verdict and budget conversation built on it will be confidently incorrect. Fix these before changing anything in the account, because changes made now cannot be attributed to anything afterwards.';
  } else if (pct < 85) {
    cls = 'is-warn';
    label = 'Usable, with known gaps';
    body =
      'No critical faults and ' +
      (100 - pct) +
      ' percent of the weighted checks outstanding. The numbers can be acted on, and the remaining gaps will each cost something specific rather than nothing. Work them in the order below.';
  } else {
    cls = 'is-pass';
    label = 'Trustworthy';
    body =
      'The measurement layer is sound. That means a scaling decision, a creative kill and a budget increase can all be made on the reported numbers without a reconciliation argument first, which is the entire point of the work.';
  }
  r.classList.add(cls);
  $('px-label').textContent = label;
  $('px-val').textContent = pct + '%';
  $('px-fill').style.width = Math.min(100, (pct / 85) * 72) + '%';
  $('px-mark').style.left = '72%';
  $('px-body').textContent = body;
  var gaps = PXA.filter((a) => !pxOn[a[0]]).sort((a, b) => b[2] - a[2]);
  $('px-gaps').innerHTML = gaps.length
    ? gaps
        .map((a, i) => {
          var c = a[2] >= 10 ? 'f-high' : a[2] >= 7 ? 'f-med' : 'f-low';
          return (
            '<div class="flag ' + c + '"><b>' + (i + 1) + '. ' + a[1] + '</b>' + a[3] + '</div>'
          );
        })
        .join('')
    : '<div class="flag f-ok"><b>Nothing outstanding</b>Every dimension clears. Keep the weekly Diagnostics review running, because this state does not hold on its own.</div>';
}
$('px-list').addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;
  pxOn[e.target.dataset.px] = e.target.checked ? 1 : 0;
  renderPixel();
});

var PXP = [
  ['em', 'Email, hashed', 10, 'The single strongest match signal.'],
  [
    'ph',
    'Phone, hashed',
    8,
    'Second strongest, and frequently missing because checkout does not require it.',
  ],
  ['ex', 'external_id', 7, 'Your own customer ID, hashed. Persists where cookies do not.'],
  [
    'fbc',
    'fbc, the click ID',
    9,
    'Captured from fbclid on landing. Missing this is the most common single cause of poor matching.',
  ],
  ['fbp', 'fbp, the browser ID', 7, 'Set by the pixel. Requires the pixel to have fired first.'],
  ['fn', 'First name', 4, ''],
  ['ln', 'Last name', 4, ''],
  ['ct', 'City', 3, ''],
  ['st', 'State', 3, ''],
  ['zp', 'Postcode', 5, ''],
  ['co', 'Country', 4, ''],
  ['db', 'Date of birth', 3, 'Rarely available and rarely worth collecting for this alone.'],
  ['ge', 'Gender', 2, 'Low impact. Do not add a checkout field for it.'],
];
var pqOn = { em: 1, fbp: 1, co: 1, fn: 1, ln: 1 };
function renderParams() {
  $('px-params').innerHTML =
    '<div class="tw"><table><thead><tr><th>Parameter</th><th style="text-align:right">Impact</th><th>Sending</th><th>Note</th></tr></thead><tbody>' +
    PXP.map(
      (p) =>
        '<tr><td style="font-family:var(--mono);font-size:12.5px">' +
        p[0] +
        '</td><td class="num">' +
        p[2] +
        '</td>' +
        '<td><input type="checkbox" data-pq="' +
        p[0] +
        '"' +
        (pqOn[p[0]] ? ' checked' : '') +
        ' style="width:16px;height:16px;accent-color:var(--act)"></td>' +
        '<td style="font-size:12.5px;color:var(--ink-3)">' +
        (p[3] || '') +
        '</td></tr>',
    ).join('') +
    '</tbody></table></div>';
  var total = PXP.reduce((x, p) => x + p[2], 0);
  var got = PXP.reduce((x, p) => x + (pqOn[p[0]] ? p[2] : 0), 0);
  var n = PXP.filter((p) => pqOn[p[0]]).length;
  var pct = Math.round((got / total) * 100);
  var emq = pct >= 75 ? '8 to 10' : pct >= 55 ? '6 to 8' : pct >= 35 ? '4 to 6' : 'below 4';
  var gaps = PXP.filter((p) => !pqOn[p[0]]).sort((a, b) => b[2] - a[2]);
  $('pq-n').textContent = n + ' of ' + PXP.length;
  $('pq-score').textContent = pct + '%';
  $('pq-emq').textContent = emq;
  $('pq-gap').textContent = gaps.length ? gaps[0][1].split(',')[0] : 'none';
  $('pq-box').className = 'stat ' + (pct >= 70 ? 'hi' : pct >= 45 ? 'md' : 'lo');
  var nn = $('pq-note');
  if (gaps.length && gaps[0][2] >= 8) {
    nn.className = 'note bad';
    nn.textContent =
      'The largest gap is ' +
      gaps[0][1].toLowerCase() +
      ', weighted ' +
      gaps[0][2] +
      '. ' +
      (gaps[0][3] || '') +
      ' Adding it is usually a back-end change rather than a checkout change, which makes it cheaper than it sounds. Coverage of ' +
      pct +
      ' percent puts the likely Event Match Quality band around ' +
      emq +
      '.';
  } else if (pct >= 70) {
    nn.className = 'note good';
    nn.textContent =
      'Coverage of ' +
      pct +
      ' percent across ' +
      n +
      ' parameters, which should put Event Match Quality around ' +
      emq +
      '. Further gains from here are marginal, and effort is better spent on event timing and deduplication than on chasing the last few parameters.';
  } else {
    nn.className = 'note warn';
    nn.textContent =
      'Coverage of ' +
      pct +
      ' percent, likely landing Event Match Quality around ' +
      emq +
      '. The remaining gaps are lower impact individually and add up. Prioritise anything above a weight of 7 and leave the rest.';
  }
}
$('px-params').addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;
  pqOn[e.target.dataset.pq] = e.target.checked ? 1 : 0;
  renderParams();
});

var PXSPEC = {
  commerce: {
    t:
      'CLASS A · COMMERCE · twc.health and twccanada.health\n' +
      '='.repeat(58) +
      '\n\n' +
      'TRANSPORT   Browser pixel + server-side GTM to CAPI, in parallel\n' +
      'DEDUP       event_id = Shopify order_id, identical both sides\n' +
      'MATCHING    Advanced matching on. Hash client-side or let Meta hash.\n' +
      '            Never pre-hash manually and also let Meta hash.\n\n' +
      'EVENTS\n' +
      '  ViewContent        browser + server\n' +
      '    content_ids      product id, matching the catalog feed id\n' +
      '    content_type     product\n' +
      '    value, currency\n\n' +
      '  AddToCart          browser + server\n' +
      '    content_ids, value, currency\n' +
      '    event_id         cart token, stable across the session\n\n' +
      '  InitiateCheckout   browser + server\n' +
      '    value, currency, num_items\n' +
      '    event_id         checkout token\n\n' +
      '  Purchase           browser + server\n' +
      '    event_id         order_id   <-- REQUIRED, same both sides\n' +
      '    value            order total EXCLUDING tax and shipping\n' +
      '    currency         ISO code, from the order not the locale\n' +
      '    contents         array of id and quantity\n\n' +
      '  Subscribe          browser + server\n' +
      '    subscription_id, value, currency, predicted_ltv\n\n' +
      'CUSTOMER PARAMETERS, hashed\n' +
      '  em, ph, external_id, fn, ln, ct, st, zp, country\n' +
      '  fbc  captured from fbclid on first landing, stored 90 days\n' +
      '  fbp  read from the _fbp cookie\n\n' +
      'AGGREGATED EVENT MEASUREMENT, priority order\n' +
      '  1 Purchase   2 Subscribe   3 InitiateCheckout\n' +
      '  4 AddToCart  5 ViewContent\n\n' +
      'VERIFY BEFORE LAUNCH\n' +
      '  Test Events: one real purchase, both events visible,\n' +
      '  one marked deduplicated, value matching the order.',
    n: 'The two lines that cause most of the trouble here are the event_id on Purchase and the value excluding tax and shipping. Getting value wrong produces a revenue gap with matching order counts, which is the hardest reconciliation pattern to diagnose because everything looks correct except the total.',
  },
  rx: {
    t:
      'PRESCRIPTION · TIMING-CRITICAL\n' +
      '='.repeat(58) +
      '\n\n' +
      'THE PROBLEM\n' +
      '  Payment is taken before clinical approval. Delivery is stated\n' +
      '  at one to two weeks, varying by consultation date. A Purchase\n' +
      '  event at payment therefore counts an order the business may\n' +
      '  never fulfil, and nothing downstream corrects it.\n\n' +
      'THE FIX\n' +
      '  Fire the advertising conversion from the fulfilment state,\n' +
      '  not the payment state.\n\n' +
      'ORDER TAG STATES\n' +
      '  rx_pending     payment taken, awaiting clinical approval\n' +
      '  rx_approved    provider approved\n' +
      '  rx_shipped     <-- FIRE THE CONVERSION HERE\n' +
      '  rx_declined    paid, never fulfilled, treat as a refund\n\n' +
      'IMPLEMENTATION\n' +
      '  Server-side only. The browser has left long before this.\n' +
      '  Trigger    Shopify order tag changes to rx_shipped\n' +
      '  Event      Purchase\n' +
      '  event_id   order_id, same as any commerce order\n' +
      '  value      order total, tax and shipping excluded\n' +
      '  event_time the ORIGINAL order timestamp, not the ship time\n\n' +
      'WHY event_time MATTERS\n' +
      '  Meta attributes against the click, so sending the ship time\n' +
      '  pushes the conversion outside the attribution window and the\n' +
      '  campaign that generated it receives no credit at all.\n' +
      '  Meta accepts events up to 7 days after the fact.\n\n' +
      'RECONCILIATION\n' +
      '  rx_declined value belongs in the refund calculation,\n' +
      '  never in revenue.',
    n: 'The event_time detail is the one most implementations miss. Firing correctly on fulfilment but stamping it with the ship time moves the conversion outside the click window, and the lane then reports almost no attributed conversions while the back end shows healthy revenue. That pattern reads as a tracking failure and is actually a timestamp.',
  },
  clinical: {
    t:
      'CLASS B · CLINICAL · care.twc.health and app clinical screens\n' +
      '='.repeat(58) +
      '\n\n' +
      'BROWSER PIXEL      none\n' +
      'SDK                none\n' +
      'ADVANCED MATCHING  none\n' +
      'META SIGNAL        server-side only, from the CRM,\n' +
      '                   at a de-identified milestone\n\n' +
      'EVENTS PERMITTED\n' +
      '  intake_step_complete    step index only, no service detail\n' +
      '  flow_complete           the de-identified milestone\n' +
      '  booking_confirmed       no condition, provider or service\n\n' +
      'PARAMETERS PERMITTED\n' +
      '  step_index, flow_version, timestamp\n\n' +
      'PARAMETERS FORBIDDEN, without exception\n' +
      '  condition, symptom, diagnosis, medication, dosage,\n' +
      '  provider_name, service_type, treatment, severity,\n' +
      '  and every direct identifier including email and phone\n\n' +
      'NAMING RULE\n' +
      '  If the event name would tell a stranger what the user is\n' +
      '  being treated for, it is the wrong name, regardless of who\n' +
      '  can currently see the report.\n\n' +
      'GA4\n' +
      '  Separate property. Google Signals off. Data sharing off.\n' +
      '  Excluded from every advertising audience export.\n\n' +
      'WHY SERVER-SIDE GTM AND NOT THE NATIVE APP\n' +
      '  The filtering has to happen before the payload leaves your\n' +
      '  infrastructure. An integration that sends what it is given\n' +
      '  cannot do this, and filtering after the data has reached\n' +
      '  Meta has not filtered anything.',
    n: 'A high Event Match Quality score on a clinical surface is a red flag rather than an achievement. It means more personal data is reaching the platform from a place it should not be reaching it from at all.',
  },
  sub: {
    t:
      'SUBSCRIPTION EVENTS\n' +
      '='.repeat(58) +
      '\n\n' +
      'THE PROBLEM\n' +
      '  If a renewal fires Purchase, Meta optimises toward a blend of\n' +
      '  new and existing customers, and reported ROAS is flattered by\n' +
      '  revenue the ads did not generate this month. The distortion\n' +
      '  grows as the subscriber base grows, so the account looks like\n' +
      '  it is improving at exactly the point acquisition is stalling.\n\n' +
      'EVENT SEPARATION\n' +
      '  Subscribe            first subscription only\n' +
      '    subscription_id, value, currency, predicted_ltv\n' +
      '    event_id           subscription contract id\n\n' +
      '  SubscriptionRenewal  custom event, every renewal after\n' +
      '    NOT sent to ad optimisation\n' +
      '    Used for reporting and cohort analysis only\n\n' +
      '  StartTrial           if a trial exists\n' +
      '  MembershipUpgrade    custom, tier_from and tier_to\n\n' +
      'OPTIMISATION\n' +
      '  Membership campaigns optimise to Subscribe, never to Purchase.\n' +
      '  Bid against subscription contribution, not first-order value.\n\n' +
      'THE CHECK\n' +
      '  Compare Meta Purchase count against Shopify orders excluding\n' +
      '  renewal orders. If Meta is higher by roughly the renewal\n' +
      '  volume, renewals are firing Purchase.',
    n: 'This is worth testing specifically rather than assuming, because most subscription apps fire the standard Purchase event on renewal by default and nobody changes it. The check at the bottom takes ten minutes and it is one of the highest-yield tests available on this account.',
  },
};
function renderPxSpec() {
  var k = $('px-spec').value;
  $('px-out').textContent = PXSPEC[k].t;
  $('px-note').textContent = PXSPEC[k].n;
}
$('px-spec').addEventListener('change', renderPxSpec);

/* ================= BLENDED METRICS ================= */
function bdSeg(pfx, per) {
  return {
    s: +$('bd-' + pfx + per + 's').value || 0,
    o: +$('bd-' + pfx + per + 'o').value || 0,
    r: +$('bd-' + pfx + per + 'r').value || 0,
  };
}
function calcBlend() {
  var P0 = bdSeg('p', '0'),
    R0 = bdSeg('r', '0'),
    E0 = bdSeg('e', '0');
  var P1 = bdSeg('p', '1'),
    R1 = bdSeg('r', '1'),
    E1 = bdSeg('e', '1');
  var paid0 = [P0, R0],
    paid1 = [P1, R1];
  var spend0 = P0.s + R0.s,
    spend1 = P1.s + R1.s;
  var ord0 = P0.o + R0.o + E0.o,
    ord1 = P1.o + R1.o + E1.o;
  var new0 = P0.o + R0.o,
    new1 = P1.o + R1.o;
  var cpa0 = ord0 ? spend0 / ord0 : 0,
    cpa1 = ord1 ? spend1 / ord1 : 0;
  var nc0 = new0 ? spend0 / new0 : 0,
    nc1 = new1 ? spend1 / new1 : 0;
  $('bd-c0').textContent = cpa0 ? '$' + cpa0.toFixed(0) : '—';
  $('bd-c1').textContent = cpa1 ? '$' + cpa1.toFixed(0) : '—';
  $('bd-n0').textContent = nc0 ? '$' + nc0.toFixed(0) : '—';
  $('bd-n1').textContent = nc1 ? '$' + nc1.toFixed(0) : '—';
  var d = cpa0 ? ((cpa1 - cpa0) / cpa0) * 100 : 0;
  var dn = nc0 ? ((nc1 - nc0) / nc0) * 100 : 0;
  $('bd-delta').textContent = (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
  $('bd-dbox').className = 'stat ' + (d <= 0 ? 'hi' : d <= 10 ? 'md' : 'lo');
  $('bd-nbox').className = 'stat ' + (dn <= 0 ? 'hi' : dn <= 10 ? 'md' : 'lo');

  /* decomposition on the paid segments only, weights = share of paid orders */
  var w0 = [new0 ? P0.o / new0 : 0, new0 ? R0.o / new0 : 0];
  var w1 = [new1 ? P1.o / new1 : 0, new1 ? R1.o / new1 : 0];
  var c0 = [P0.o ? P0.s / P0.o : 0, R0.o ? R0.s / R0.o : 0];
  var c1 = [P1.o ? P1.s / P1.o : 0, R1.o ? R1.s / R1.o : 0];
  var eff = 0,
    mix = 0;
  for (var i = 0; i < 2; i++) {
    eff += w0[i] * (c1[i] - c0[i]);
    mix += c0[i] * (w1[i] - w0[i]);
  }
  var total = nc1 - nc0;
  var inter = total - eff - mix;
  var rows = [
    [
      'Efficiency',
      eff,
      'Each segment\u2019s own cost per new customer changed. This is genuine performance movement.',
    ],
    [
      'Mix',
      mix,
      'The share of new customers coming from each segment changed. Cost per segment may not have moved at all.',
    ],
    [
      'Interaction',
      inter,
      'The residual where both moved together. Small residuals are normal; a large one means both effects are substantial.',
    ],
  ];
  $('bd-effects').innerHTML = rows
    .map((r) => {
      var sign = r[1] >= 0 ? '+' : '';
      var col = Math.abs(r[1]) < 1 ? 'inherit' : r[1] < 0 ? 'var(--pass)' : 'var(--fail)';
      return (
        '<tr><td><b>' +
        r[0] +
        '</b></td><td class="num" style="color:' +
        col +
        '">' +
        sign +
        '$' +
        r[1].toFixed(2) +
        '</td>' +
        '<td style="font-size:12.5px;color:var(--ink-3)">' +
        r[2] +
        '</td></tr>'
      );
    })
    .join('');

  var pShare0 = w0[0] * 100,
    pShare1 = w1[0] * 100;
  var rd = $('bd-read');
  rd.className = 'readout';
  var cls, label, val, body;
  var mixDominant = Math.abs(mix) > Math.abs(eff) * 1.4;
  if (d < 0 && dn > 0) {
    cls = 'is-fail';
    label = 'Blended improving, acquisition worsening';
    val = 'CANNIBALISATION';
    body =
      'Blended CPA fell ' +
      Math.abs(d).toFixed(1) +
      ' percent while cost per new customer rose ' +
      dn.toFixed(1) +
      ' percent. Retargeting share moved from ' +
      (100 - pShare0).toFixed(0) +
      ' to ' +
      (100 - pShare1).toFixed(0) +
      ' percent of new customers, and warm conversions are cheaper, so the average fell while the thing that actually grows the business got more expensive. Every report will read this as an improvement. Enforce the prospecting and retargeting split with spend minimums, confirm prospecting excludes the retargeting pool, and expect blended CPA to worsen when this is corrected. That trade is the point and it needs explaining before it happens.';
  } else if (mixDominant && d < 0) {
    cls = 'is-warn';
    label = 'The mix moved, not the performance';
    val = 'MIX';
    body =
      'Of the $' +
      Math.abs(total).toFixed(2) +
      ' change in cost per new customer, $' +
      Math.abs(mix).toFixed(2) +
      ' came from the mix shifting and only $' +
      Math.abs(eff).toFixed(2) +
      ' from efficiency actually changing. Nothing improved. The cheaper segment simply grew as a share. Run the fixed-mix comparison before reporting this as a gain, because a mix that can shift one way will shift back.';
  } else if (mixDominant && d > 0) {
    cls = 'is-warn';
    label = 'The mix moved against you';
    val = 'MIX';
    body =
      'Cost per new customer rose mainly because the mix shifted toward the more expensive segment, not because any segment got worse. Prospecting share moved from ' +
      pShare0.toFixed(0) +
      ' to ' +
      pShare1.toFixed(0) +
      ' percent. If that shift was deliberate, this is the expected cost of buying more new customers and it is not a problem to fix. If it was not deliberate, find out what changed in delivery.';
  } else if (eff < 0) {
    cls = 'is-pass';
    label = 'Genuine efficiency gain';
    val = 'REAL';
    body =
      'Cost per new customer fell and the efficiency effect of $' +
      Math.abs(eff).toFixed(2) +
      ' accounts for most of it, meaning the segments themselves got cheaper rather than the mix flattering the average. This is the version worth scaling into. Check marginal CPA before adding budget.';
  } else {
    cls = 'is-fail';
    label = 'Genuine deterioration';
    val = 'REAL';
    body =
      'Cost per new customer rose and the efficiency effect of $' +
      eff.toFixed(2) +
      ' carries most of it, so the segments themselves got more expensive rather than the mix moving. Work the diagnosis tree. Check tracking first, then CPM, then CTR, then the funnel, before changing structure.';
  }
  rd.classList.add(cls);
  $('bd-label').textContent = label;
  $('bd-val').textContent = val;
  $('bd-body').textContent = body;
}
['p', 'r', 'e'].forEach((pf) => {
  ['0', '1'].forEach((pe) => {
    ['s', 'o', 'r'].forEach((f) => {
      var id = 'bd-' + pf + pe + f;
      if ($(id)) $(id).addEventListener('input', calcBlend);
    });
  });
});

function calcAcqBlend() {
  var rev = +$('ba-rev').value || 0,
    ret = +$('ba-ret').value || 0,
    sub = +$('ba-sub').value || 0,
    sp = +$('ba-sp').value || 1,
    nw = +$('ba-new').value || 1,
    mo = +$('ba-mo').value || 1;
  var acq = Math.max(0, rev - ret - sub);
  var broas = rev / sp,
    aroas = acq / sp,
    mer = rev / sp,
    amer = acq / sp,
    ncac = sp / nw;
  $('ba-broas').textContent = broas.toFixed(2);
  $('ba-aroas').textContent = aroas.toFixed(2);
  $('ba-mer').textContent = mer.toFixed(2);
  $('ba-amer').textContent = amer.toFixed(2);
  $('ba-ncac').textContent = '$' + ncac.toFixed(0);
  var gap = aroas ? (broas / aroas - 1) * 100 : 0;
  $('ba-abox').className = 'stat ' + (gap < 20 ? 'hi' : gap < 45 ? 'md' : 'lo');
  var baseShare = rev ? ((ret + sub) / rev) * 100 : 0;
  var n = $('ba-note');
  if (gap < 15) {
    n.className = 'note good';
    n.textContent =
      'Blended and acquisition ROAS differ by ' +
      gap.toFixed(0) +
      ' percent, because returning and renewal revenue is still only ' +
      baseShare.toFixed(0) +
      ' percent of the total. At month ' +
      mo +
      ' that is expected. The gap will widen every month from here whether acquisition improves or not, so establish the acquisition figure as the reported number now rather than after the divergence becomes awkward to explain.';
  } else if (gap < 45) {
    n.className = 'note warn';
    n.textContent =
      'Returning and renewal revenue is ' +
      baseShare.toFixed(0) +
      ' percent of the total, making blended ROAS ' +
      gap.toFixed(0) +
      ' percent higher than acquisition ROAS. Budget decisions made on the blended figure are being made on revenue the ads did not generate this period. Report acquisition ROAS as the primary number and blended as context.';
  } else {
    n.className = 'note bad';
    n.textContent =
      'At ' +
      baseShare.toFixed(0) +
      ' percent of revenue from the existing base, blended ROAS of ' +
      broas.toFixed(2) +
      ' overstates acquisition ROAS of ' +
      aroas.toFixed(2) +
      ' by ' +
      gap.toFixed(0) +
      ' percent. The blended figure is now mostly a measure of how large the customer base is rather than how well acquisition works, and it will keep rising even if acquisition stops entirely. Any scaling decision made on it is being made on the wrong number.';
  }
  var rows = '';
  for (var m = mo; m <= mo + 9; m += 3) {
    var growth = Math.min(0.72, (baseShare / 100) * Math.pow(1.13, m - mo));
    var proj = aroas / (1 - growth);
    rows +=
      '<tr' +
      (m === mo ? ' style="background:#e8eff7"' : '') +
      '><td class="num">' +
      m +
      '</td><td class="num">' +
      (growth * 100).toFixed(0) +
      '%</td>' +
      '<td class="num">' +
      proj.toFixed(2) +
      '</td><td style="font-size:12.5px;color:var(--ink-3)">' +
      (m === mo
        ? 'Today'
        : 'Reads as a ' +
          ((proj / broas - 1) * 100).toFixed(0) +
          ' percent improvement, with acquisition unchanged') +
      '</td></tr>';
  }
  $('ba-proj').innerHTML = rows;
}
['ba-rev', 'ba-ret', 'ba-sub', 'ba-sp', 'ba-new', 'ba-mo'].forEach((id) => {
  $(id).addEventListener('input', calcAcqBlend);
});

/* ================= MAKE SCENARIOS ================= */
var MK = [
  {
    k: 'health',
    g: 'monitor',
    n: 'Daily account health sweep',
    rw: 'read',
    eff: 'Low',
    pri: 1,
    d: 'Pulls delivery status and review state across every campaign each morning and posts anything abnormal to Slack. On a gated catalog this is the single highest-value scenario available, because a disapproval shifts delivery before any performance metric moves.',
    bp:
      'TRIGGER   Schedule · 07:00 daily, account timezone\n\n' +
      '1  HTTP · GET graph.facebook.com/v20.0/act_{id}/ads\n' +
      '     fields  name,effective_status,ad_review_feedback,adset{name}\n' +
      '     limit   500\n\n' +
      '2  Iterator over data[]\n\n' +
      '3  Filter\n' +
      '     effective_status  IN  DISAPPROVED, WITH_ISSUES, PENDING_REVIEW\n' +
      '     OR ad_review_feedback  EXISTS\n\n' +
      '4  Router\n' +
      '     Route A  name CONTAINS "_GATED"  ->  severity P2\n' +
      '     Route B  otherwise                ->  severity P4\n\n' +
      '5  Aggregator · text, grouped by severity\n\n' +
      '6  Slack · post message\n' +
      '     P2  ->  #paid-alerts, @channel\n' +
      '     P4  ->  #paid-log, no mention\n\n' +
      '7  Google Sheets · add row to Disapproval Log\n' +
      '     date, ad name, campaign, status, reason, severity',
    note: 'Route A exists because a disapproval on a gated lane is a different severity from one on the food line. Without the split, the alert channel fills with low-priority noise and the important one gets missed inside a week.',
  },
  {
    k: 'pace',
    g: 'monitor',
    n: 'Pacing monitor',
    rw: 'read',
    eff: 'Low',
    pri: 4,
    d: 'Compares month-to-date spend against the plan held in a sheet and alerts only when variance passes the tolerance band. Silence is the normal outcome.',
    bp:
      'TRIGGER   Schedule · 08:00 daily\n\n' +
      '1  Google Sheets · get Monthly Plan row for current month\n\n' +
      '2  HTTP · GET act_{id}/insights\n' +
      '     date_preset  this_month\n' +
      '     fields       spend\n' +
      '     level        account\n\n' +
      '3  Set variables\n' +
      '     expected   plan / days_in_month * day_of_month\n' +
      '     variance   (spend - expected) / expected\n\n' +
      '4  Filter\n' +
      '     ABS(variance)  >  0.15\n\n' +
      '5  Slack · post\n' +
      '     Include: variance %, required daily for the remainder,\n' +
      '     and a reminder to correct in 20-25% steps rather than one jump',
    note: 'The filter at step 4 is the whole scenario. Inside plus or minus fifteen percent is noise, and a pacing alert that fires every day trains the team to ignore it.',
  },
  {
    k: 'learn',
    g: 'monitor',
    n: 'Learning phase watcher',
    rw: 'read',
    eff: 'Low',
    pri: 6,
    d: 'Flags ad sets still in learning past seven days, which usually means the budget is below the threshold for that CPA rather than that something is broken.',
    bp:
      'TRIGGER   Schedule · Monday 09:00\n\n' +
      '1  HTTP · GET act_{id}/adsets\n' +
      '     fields  name,learning_stage_info,daily_budget,effective_status\n\n' +
      '2  Filter\n' +
      '     learning_stage_info.status = LEARNING\n' +
      '     AND created_time  older than  7 days\n' +
      '     AND effective_status = ACTIVE\n\n' +
      '3  HTTP · GET insights for each, last_7d, fields conversions\n\n' +
      '4  Set variable\n' +
      '     shortfall  =  50 - conversions_7d\n\n' +
      '5  Slack · post with the shortfall per ad set\n' +
      '     "Needs X more conversions weekly. Consolidate rather than wait."',
    note: 'Reporting the shortfall rather than the status is what makes this actionable. Stuck in learning is a symptom; twenty-two conversions short of fifty is a budget decision.',
  },
  {
    k: 'recon',
    g: 'monitor',
    n: 'Reconciliation monitor',
    rw: 'read',
    eff: 'Medium',
    pri: 5,
    d: 'Compares Meta-reported purchases against Shopify orders daily and alerts when the delta leaves the normal attribution band. Catches a tracking fault the day it starts rather than at the monthly.',
    bp:
      'TRIGGER   Schedule · 09:00 daily, for yesterday\n\n' +
      '1  HTTP · GET act_{id}/insights\n' +
      '     time_range   yesterday, ACCOUNT TIMEZONE\n' +
      '     fields       actions, action_values\n\n' +
      '2  Shopify · Search Orders\n' +
      '     created_at  yesterday, STORE TIMEZONE, converted to match\n' +
      '     status      any\n\n' +
      '3  Aggregator · count orders, sum total\n\n' +
      '4  Set variables\n' +
      '     order_delta    (meta_purchases - shopify_orders) / shopify_orders\n' +
      '     revenue_delta  (meta_value - shopify_total) / shopify_total\n' +
      '     divergence     ABS(revenue_delta - order_delta)\n\n' +
      '5  Router\n' +
      '     ABS(order_delta) > 0.30            ->  P2 alert, counting fault\n' +
      '     divergence > 0.10                  ->  P3 alert, value or currency\n' +
      '     ABS(order_delta) > 0.15            ->  P3 alert, investigate\n' +
      '     otherwise                          ->  log only\n\n' +
      '6  Google Sheets · append to Reconciliation Log\n\n' +
      '7  Slack · post on P2 and P3 only',
    note: 'The timezone conversion at step 2 is the step most implementations skip, and skipping it produces a permanent phantom delta that looks like an attribution problem and never resolves. The divergence branch is what separates a value fault from a counting fault in one calculation.',
  },
  {
    k: 'freq',
    g: 'monitor',
    n: 'Frequency and saturation alert',
    rw: 'read',
    eff: 'Low',
    pri: 8,
    d: 'Watches seven-day frequency by funnel stage, with different ceilings for prospecting and retargeting, because a single account-wide cap gets both wrong.',
    bp:
      'TRIGGER   Schedule · daily 09:00\n\n' +
      '1  HTTP · GET act_{id}/insights\n' +
      '     level        adset\n' +
      '     date_preset  last_7d\n' +
      '     fields       frequency, reach, spend, adset_name\n\n' +
      '2  Router on adset_name\n' +
      '     CONTAINS _ACQ_  ->  ceiling 2.5\n' +
      '     CONTAINS _RTG_  ->  ceiling 4.0\n\n' +
      '3  Filter  frequency > ceiling\n\n' +
      '4  Slack · post with reach against audience size\n' +
      '     so the reader can tell saturation from ordinary repetition',
    note: 'Including reach against audience size turns this from a threshold alert into a diagnosis. Rising frequency with reach still climbing is normal; rising frequency with reach flat is saturation.',
  },

  {
    k: 'launch',
    g: 'creative',
    n: 'Batch launch pipeline',
    rw: 'write',
    eff: 'High',
    pri: 9,
    d: 'Approved creative in the ledger becomes a live ad in the testing campaign, with the naming convention and claim reference applied automatically. Removes the manual step where naming mistakes enter.',
    bp:
      'TRIGGER   Google Sheets · watch rows, Creative Ledger\n' +
      '          Condition  status = APPROVED  AND  ad_id is empty\n\n' +
      '1  Filter\n' +
      '     claim_reference  IS NOT EMPTY        <-- blocking\n' +
      '     compliance_signoff = TRUE            <-- blocking\n' +
      '     campaign_name  NOT CONTAINS "_GATED" <-- blocking\n\n' +
      '2  HTTP · POST /act_{id}/adcreatives\n' +
      '     name          {creative_id}\n' +
      '     object_story_spec  from the sheet fields\n\n' +
      '3  HTTP · POST /act_{id}/ads\n' +
      '     name        {creative_id}\n' +
      '     adset_id    from the sheet\n' +
      '     status      PAUSED        <-- never ACTIVE from a scenario\n\n' +
      '4  Google Sheets · update row with ad_id and created timestamp\n\n' +
      '5  Slack · post "N ads created, paused, awaiting review"',
    note: 'Step 3 creating everything paused is deliberate and non-negotiable. A scenario that can put live spend behind an asset nobody looked at is a scenario that will eventually do exactly that. A human turning ads on takes thirty seconds and removes the entire category of risk.',
  },
  {
    k: 'read',
    g: 'creative',
    n: 'Day 14 batch reader',
    rw: 'read',
    eff: 'Medium',
    pri: 3,
    d: 'Pulls performance for the current batch, applies the graduation criteria, writes a proposed verdict per asset into the ledger and posts the summary. The decision stays human; the arithmetic does not.',
    bp:
      'TRIGGER   Schedule · every 14 days, aligned to the batch cycle\n\n' +
      '1  Google Sheets · get active batch rows\n\n' +
      '2  HTTP · GET act_{id}/insights\n' +
      '     level        ad\n' +
      '     time_range   batch start to today\n' +
      '     fields       spend, actions, action_values, ctr,\n' +
      '                  video_3_sec_watched_actions, impressions\n\n' +
      '3  Iterator + Set variables per ad\n' +
      '     cpa       spend / purchases\n' +
      '     min_read  target_cpa * 3\n' +
      '     hook_rate video_3s / impressions\n\n' +
      '4  Router · verdict\n' +
      '     spend < min_read                         ->  RETEST\n' +
      '     purchases > 0 AND cpa <= target          ->  SCALE\n' +
      '     purchases = 0 AND ctr >= 1.4             ->  SUPPORT\n' +
      '     ctr >= 1.2                               ->  ITERATE\n' +
      '     otherwise                                ->  KILL\n\n' +
      '5  Shopify · verify orders shipped for SCALE candidates\n' +
      '     Rx lane: confirm tag = rx_shipped, not rx_pending\n\n' +
      '6  Google Sheets · write proposed verdict, not final\n\n' +
      '7  Slack · post summary, tag the creative lead for sign-off',
    note: 'Step 5 is the one that matters on this account. A creative can win on Purchase while producing Rx orders that never cleared clinical approval, so the shipped check runs before anything is proposed for scaling. And the verdict is written as proposed rather than final, because the classification is arithmetic and the decision is judgement.',
  },
  {
    k: 'starve',
    g: 'creative',
    n: 'New creative delivery watchdog',
    rw: 'read',
    eff: 'Medium',
    pri: 7,
    d: 'Catches the starved-not-failing case, where a new asset in a scaling ad set receives almost no delivery and gets killed for a result it never had the chance to produce.',
    bp:
      'TRIGGER   Schedule · daily, for ads created in the last 7 days\n\n' +
      '1  HTTP · GET act_{id}/ads  created_time within 7d\n\n' +
      '2  HTTP · GET insights, level ad, since creation\n' +
      '     fields  spend, adset_id\n\n' +
      '3  HTTP · GET insights, level adset, same window\n\n' +
      '4  Set variables\n' +
      '     fair_share    1 / ads_in_adset\n' +
      '     actual_share  ad_spend / adset_spend\n\n' +
      '5  Filter\n' +
      '     actual_share  <  fair_share * 0.25\n' +
      '     AND days_live >= 3\n\n' +
      '6  Slack · post\n' +
      '     "STARVED, not failing. Move to the testing campaign\n' +
      '      with its own ad set rather than waiting."',
    note: 'The wording of the alert matters as much as the trigger. Without it, someone reads a low-spend low-conversion row and kills a creative that was never tested, and the batch produces one fewer learning than it should have.',
  },
  {
    k: 'ledger',
    g: 'creative',
    n: 'Ledger writer on retirement',
    rw: 'read',
    eff: 'Low',
    pri: 10,
    d: 'When an ad is paused, captures its final numbers into the learning ledger so the record is written while the context is still fresh rather than reconstructed later.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  HTTP · GET act_{id}/ads  effective_status = PAUSED\n' +
      '2  Data Store · lookup ad_id, skip if already logged\n' +
      '3  HTTP · GET lifetime insights for the ad\n' +
      '4  Google Sheets · append to Learning Ledger\n' +
      '     creative_id, concept, angle, hook, creator, format,\n' +
      '     lifetime spend, CPA, ROAS, peak week, frequency at pause\n' +
      '     hypothesis  <-- left blank, filled by a human\n' +
      '5  Data Store · mark logged\n' +
      '6  Slack · weekly digest of rows awaiting a hypothesis',
    note: 'The hypothesis column stays blank deliberately. A ledger of numbers is a report; a ledger with a stated reason each asset failed is what makes round eight smarter than round one, and no scenario can write that column.',
  },

  {
    k: 'marginal',
    g: 'scaling',
    n: 'Marginal CPA tracker',
    rw: 'read',
    eff: 'Medium',
    pri: 2,
    d: 'Captures spend and conversions either side of every budget change and computes the marginal cost of the incremental customers. This is the number that decides whether to keep scaling, and almost nobody records it.',
    bp:
      'TRIGGER   Webhook from the budget change logger, or schedule\n\n' +
      '1  Google Sheets · get the last budget change row\n\n' +
      '2  HTTP · GET insights\n' +
      '     window A  7 days BEFORE the change\n' +
      '     window B  7 days AFTER the change, excluding the first 2\n' +
      '     fields    spend, conversions\n\n' +
      '3  Set variables\n' +
      '     marginal_cpa  (spend_B - spend_A) / (conv_B - conv_A)\n' +
      '     blended_cpa   spend_B / conv_B\n\n' +
      '4  Router\n' +
      '     marginal <= target        ->  "Efficient. Next step available."\n' +
      '     marginal <= target * 1.4  ->  "Ceiling approaching. Add creative."\n' +
      '     otherwise                 ->  "Past the ceiling. Roll back."\n\n' +
      '5  Google Sheets · append to Scaling Log\n' +
      '6  Slack · post the verdict with both numbers side by side',
    note: 'Excluding the first two days after a change is what makes the read fair, because delivery during learning re-entry is unrepresentative by design. Without that exclusion the scenario will report every increase as a failure.',
  },
  {
    k: 'budgetlog',
    g: 'scaling',
    n: 'Budget change logger',
    rw: 'read',
    eff: 'Low',
    pri: 11,
    d: 'Snapshots every campaign budget daily and writes any change to a log. Makes it possible to attribute a performance shift to a decision three weeks later.',
    bp:
      'TRIGGER   Schedule · daily 06:00\n\n' +
      '1  HTTP · GET act_{id}/campaigns\n' +
      '     fields  name, daily_budget, lifetime_budget\n' +
      '2  Data Store · compare against yesterday\n' +
      '3  Filter  budget changed\n' +
      '4  Google Sheets · append\n' +
      '     date, campaign, old, new, percent change\n' +
      '5  Data Store · overwrite with today\n' +
      '6  Filter  percent change > 30%\n' +
      '7  Slack · flag the large change for confirmation',
    note: 'Step 6 is a safety net rather than a rule. A thirty percent jump is either deliberate or a mistake, and both are worth a message the same day.',
  },
  {
    k: 'gate',
    g: 'scaling',
    n: 'Expansion gate checker',
    rw: 'read',
    eff: 'Medium',
    pri: 12,
    d: 'Evaluates the four expansion criteria daily and notifies only when all four hold, so the decision to open a lane is triggered by evidence rather than by someone feeling ready.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  HTTP · GET insights, level campaign, last_14d, daily breakdown\n' +
      '2  Set variables per lane\n' +
      '     days_at_target   count of days CPA <= target\n' +
      '     marginal_ok      from the Scaling Log\n' +
      '     validated_count  from the Creative Ledger, status SCALE\n' +
      '     pool_trend       retargeting audience size week over week\n' +
      '3  Filter · ALL FOUR true\n' +
      '     days_at_target >= 14\n' +
      '     AND marginal_ok = TRUE\n' +
      '     AND validated_count >= 2\n' +
      '     AND pool_trend >= 0\n' +
      '4  Slack · "Expansion gate met on {lane}. All four criteria hold."',
    note: 'A scenario that fires rarely is doing its job. The value is that it cannot fire on three of four, which is exactly how expansion decisions get made badly.',
  },

  {
    k: 'gated',
    g: 'risk',
    n: 'Gated spend guard',
    rw: 'read',
    eff: 'Low',
    pri: 1,
    d: 'Alerts immediately if any campaign carrying the gated suffix has spend while the authorisation flag is false. Should never fire, and costs nothing to run.',
    bp:
      'TRIGGER   Schedule · hourly\n\n' +
      '1  Google Sheets · read Authorisation Status by domain\n\n' +
      '2  HTTP · GET act_{id}/insights\n' +
      '     level        campaign\n' +
      '     date_preset  today\n' +
      '     fields       campaign_name, spend\n\n' +
      '3  Filter\n' +
      '     campaign_name  ENDS WITH  "_GATED"\n' +
      '     AND spend > 0\n' +
      '     AND authorisation_confirmed = FALSE\n\n' +
      '4  HTTP · POST campaign  status = PAUSED\n' +
      '     The one write action worth automating, because the\n' +
      '     failure mode it prevents is unbounded.\n\n' +
      '5  Slack · @channel P1 alert, both principals\n' +
      '6  Email · compliance owner',
    note: 'This is the single exception to the rule that scenarios should not act. Pausing spend is always reversible, always safe, and the thing it prevents is a campaign duplicated into an unauthorised category funding itself unnoticed until someone opens the account.',
  },
  {
    k: 'dest',
    g: 'risk',
    n: 'Destination monitor',
    rw: 'read',
    eff: 'Low',
    pri: 13,
    d: 'Checks every live ad destination returns 200 and that the page content has not changed since it was approved. Catches a landing page edit nobody told media about.',
    bp:
      'TRIGGER   Schedule · every 6 hours\n\n' +
      '1  HTTP · GET act_{id}/ads  fields creative{link_url}\n' +
      '2  Iterator over unique URLs\n' +
      '3  HTTP · make a request to each\n' +
      '4  Router\n' +
      '     status != 200            ->  P2 alert, pause the ad set\n' +
      '     body hash changed        ->  P3 alert, review required\n' +
      '5  Data Store · update hash\n' +
      '6  Slack · post with the URL and which ads point at it',
    note: 'The body hash check is the useful half. A destination that still returns 200 and has quietly gained a testimonial describing symptom relief is a compliance exposure nobody in media will notice until the disapproval arrives.',
  },
  {
    k: 'digest',
    g: 'risk',
    n: 'Weekly compliance digest',
    rw: 'read',
    eff: 'Low',
    pri: 14,
    d: 'Aggregates the week of disapprovals into a pattern view, because the pattern is the signal and individual instances are noise.',
    bp:
      'TRIGGER   Schedule · Monday 08:00\n\n' +
      '1  Google Sheets · read Disapproval Log, last 7 days\n' +
      '2  Aggregator · group by reason, then by lane\n' +
      '3  Filter · any reason appearing 3+ times\n' +
      '4  Slack · post the grouped view, not the list\n' +
      '5  Google Sheets · append to the monthly pattern sheet',
    note: 'Grouping before reporting is the whole point. Fifteen individual disapprovals read as bad luck; three against the same claim family read as a boundary the team keeps walking into.',
  },

  {
    k: 'rxcapi',
    g: 'data',
    n: 'Rx conversion relay',
    rw: 'write',
    eff: 'High',
    pri: 1,
    d: 'The fix for the largest measurement fault on this account. Fires the Meta conversion when the Shopify order reaches the shipped state rather than at payment, and stamps it with the original order time so it lands inside the attribution window.',
    bp:
      'TRIGGER   Shopify · Watch Order Updates\n' +
      '          Filter  tag added = "rx_shipped"\n\n' +
      '1  Data Store · check order_id not already sent\n\n' +
      '2  Set variables\n' +
      '     event_id    order.id                <-- same as any commerce order\n' +
      '     event_time  order.created_at        <-- ORIGINAL, not ship time\n' +
      '     value       order.subtotal_price    <-- excludes tax and shipping\n' +
      '     currency    order.currency\n\n' +
      '3  Hash customer fields, SHA-256, lowercased and trimmed\n' +
      '     em, ph, fn, ln, ct, st, zp, country\n\n' +
      '4  HTTP · POST graph.facebook.com/v20.0/{pixel_id}/events\n' +
      '     event_name        Purchase\n' +
      '     event_time        {original order timestamp}\n' +
      '     event_id          {order_id}\n' +
      '     action_source     website\n' +
      '     user_data         {hashed fields, plus fbc and fbp if stored}\n' +
      '     custom_data       value, currency, contents\n\n' +
      '5  Data Store · mark sent\n\n' +
      '6  Error handler\n' +
      '     On failure, retry twice, then Slack alert.\n' +
      '     Never silently drop. A missing conversion is invisible.',
    note: 'Step 2 is the line that most implementations get wrong. Firing correctly on fulfilment but stamping it with the ship time pushes the conversion outside the seven-day click window, and the lane then reports almost no attributed conversions while the back end shows healthy revenue. That reads as a tracking failure and is actually a timestamp. Meta accepts events up to seven days after the fact, which is what makes this work.',
  },
  {
    k: 'renew',
    g: 'data',
    n: 'Renewal separator',
    rw: 'write',
    eff: 'Medium',
    pri: 2,
    d: 'Sends subscription renewals as a distinct custom event rather than Purchase, so Meta stops optimising toward a blend of new and existing customers and reported ROAS stops being flattered by revenue the ads did not generate.',
    bp:
      'TRIGGER   Shopify · Watch Orders\n' +
      '          OR subscription app webhook\n\n' +
      '1  Router\n' +
      '     order has subscription_contract_id\n' +
      '     AND contract order_count > 1     ->  RENEWAL\n' +
      '     otherwise                        ->  NEW, no action here\n\n' +
      '2  RENEWAL branch\n' +
      '   HTTP · POST /{pixel_id}/events\n' +
      '     event_name  SubscriptionRenewal   <-- custom, not Purchase\n' +
      '     event_id    order_id\n' +
      '     value, currency\n\n' +
      '3  Google Sheets · log for cohort reporting\n\n' +
      '4  IMPORTANT\n' +
      '   Exclude SubscriptionRenewal from Aggregated Event\n' +
      '   Measurement priority, and never use it as an\n' +
      '   optimisation event on any campaign.',
    note: 'Worth testing before building. Most subscription apps fire the standard Purchase event on renewal by default and nobody changes it. Compare Meta Purchase count against Shopify orders excluding renewals; if Meta is higher by roughly the renewal volume, this scenario is the fix.',
  },
  {
    k: 'survey',
    g: 'data',
    n: 'Post-purchase survey collector',
    rw: 'read',
    eff: 'Low',
    pri: 6,
    d: 'Collects the how-did-you-hear-about-us response into a sheet and produces a weekly rollup, which is the cheapest attribution triangulation available.',
    bp:
      'TRIGGER   Webhook from the thank-you page survey\n\n' +
      '1  Google Sheets · append\n' +
      '     order_id, response, free_text, timestamp, order_value\n\n' +
      '2  Schedule · weekly rollup\n' +
      '3  Aggregator · group by response\n' +
      '4  Shopify · get orders for the same period\n' +
      '5  Set variables\n' +
      '     response_rate   responses / orders\n' +
      '     meta_share      meta_responses / responses\n' +
      '     implied_orders  orders * meta_share\n' +
      '6  Slack · post alongside the platform-reported figure\n\n' +
      'RULE  No health question on the survey, ever. It turns a\n' +
      '      marketing form into health data collection at checkout.',
    note: 'The free text field is where the value is. The pre-set list encodes what you already believe, and the free text is where a channel nobody knew was working surfaces.',
  },
  {
    k: 'snapshot',
    g: 'data',
    n: 'Daily metrics snapshot',
    rw: 'read',
    eff: 'Medium',
    pri: 5,
    d: 'Writes one row per day combining Meta, Shopify and GA4 into the sheet the dashboard reads from. Removes the dependency on live connectors that break silently.',
    bp:
      'TRIGGER   Schedule · 05:00 daily, for yesterday\n\n' +
      '1  HTTP · Meta insights, account level\n' +
      '2  Shopify · orders, revenue, refunds, new vs returning\n' +
      '3  Google Analytics · sessions, product views\n' +
      '4  Merge into a single record\n' +
      '5  Google Sheets · append one row\n' +
      '     date, spend, meta_purchases, meta_value,\n' +
      '     shopify_orders, shopify_revenue, refunds,\n' +
      '     new_customers, returning, sessions, delta\n' +
      '6  Filter · any field null  ->  Slack alert\n\n' +
      'The sheet becomes the dashboard source. Live connectors\n' +
      'fail quietly; a missing row is visible immediately.',
    note: 'Step 6 is what makes this trustworthy. A connector that returns nothing looks identical to a day with no spend, and a null check turns a silent failure into a message.',
  },
  {
    k: 'custlist',
    g: 'audience',
    n: 'Customer list refresh',
    rw: 'write',
    eff: 'Medium',
    pri: 3,
    d: 'Rebuilds every customer-list audience from Shopify segments on a schedule. Done manually this is an hour a week that nobody does, and a stale suppression list means paying prospecting rates to reach customers you already have.',
    bp:
      'TRIGGER   Schedule · Monday 04:00\n\n' +
      '1  Router · one branch per audience\n' +
      '     SEG_ALL_PURCHASERS      orders > 0\n' +
      '     SEG_HIGH_VALUE          total_spent >= 250\n' +
      '     SEG_NON_MEMBERS         orders > 0, tag NOT 1wellness_member\n' +
      '     SEG_KIT_OWNERS          product_type = emergency kit\n' +
      '     SEG_LAPSED_365          last_order older than 365d\n\n' +
      '2  Shopify · Search Customers per branch, paginate fully\n\n' +
      '3  Iterator + Set variables\n' +
      '     em  SHA256(lowercase(trim(email)))\n' +
      '     ph  SHA256(digits only, E.164 without the +)\n' +
      '     fn  SHA256(lowercase(trim(first_name)))\n' +
      '     ln  SHA256(lowercase(trim(last_name)))\n' +
      '     ct, st, zp, country  same normalisation\n' +
      '     lv  total_spent      <-- the value column\n\n' +
      '4  Aggregator · batches of 10,000\n\n' +
      '5  HTTP · POST /{audience_id}/users\n' +
      '     payload  {"schema":["EMAIL","PHONE","FN","LN","CT","ST","ZIP","COUNTRY","LOOKALIKE_VALUE"],\n' +
      '               "data":[[...],[...]]}\n' +
      '     session  use a session for multi-batch uploads\n\n' +
      '6  Slack · post row counts per audience\n' +
      '7  Filter · count dropped more than 20% week on week -> alert',
    note: 'The LOOKALIKE_VALUE column mapped to total spent is what turns a flat lookalike into a value-based one, and it is a single extra field. Without it, Meta models a $30 jerky buyer and a $600 kit buyer as the same person. Step 7 exists because a Shopify filter change can silently halve an audience and nothing else will tell you.',
  },
  {
    k: 'suppress',
    g: 'audience',
    n: 'Suppression sync',
    rw: 'write',
    eff: 'Low',
    pri: 4,
    d: 'Keeps the exclusion audiences current at the lane-appropriate window, since a kit is durable and a supplement is consumable and one window applied to both gets each wrong.',
    bp:
      'TRIGGER   Schedule · daily 04:30\n\n' +
      '1  Shopify · Search Orders, last 180 days\n\n' +
      '2  Router by product type\n' +
      '     emergency kit    ->  SUPPRESS_KIT_180D\n' +
      '     supplement       ->  SUPPRESS_SUPP_30D\n' +
      '     skincare         ->  SUPPRESS_SKIN_60D\n' +
      '     any Rx           ->  SUPPRESS_RX_ACTIVE\n\n' +
      '3  Filter per branch on order age against the window\n\n' +
      '4  Hash and upload as in the customer list scenario,\n' +
      '   using REPLACE rather than ADD so aged-out customers\n' +
      '   actually leave the audience\n\n' +
      '5  Slack · weekly summary only, not daily',
    note: 'REPLACE rather than ADD is the important choice. An audience built with ADD only ever grows, so a kit buyer from fourteen months ago stays suppressed forever and you lose a replenishment customer to your own exclusion list.',
  },
  {
    k: 'seed',
    g: 'audience',
    n: 'Lookalike seed refresh',
    rw: 'write',
    eff: 'Medium',
    pri: 11,
    d: 'Rebuilds the value-based lookalike seed quarterly, because a seed built in month two models a customer base that no longer exists by month eight.',
    bp:
      'TRIGGER   Schedule · quarterly, first Monday\n\n' +
      '1  Shopify · Customers, total_spent >= 250, last 180 days\n' +
      '2  Filter · count >= 500       <-- blocking, below this it fits noise\n' +
      '3  Hash and upload to SEED_HIGHAOV\n' +
      '4  HTTP · POST /act_{id}/customaudiences\n' +
      '     subtype   LOOKALIKE\n' +
      '     origin    SEED_HIGHAOV\n' +
      '     ratio     0.01 and 0.02, two audiences\n' +
      '5  Slack · post seed size and the new audience IDs\n' +
      '6  Reminder to swap the ad set targeting manually\n' +
      '   The scenario builds the audience. A human points\n' +
      '   the ad set at it, after checking the size looks sane.',
    note: 'Step 2 is a hard gate. A lookalike seeded on fewer than five hundred purchasers models noise and will quietly underperform broad for months while everyone assumes a lookalike must be better than broad.',
  },
  {
    k: 'lapse',
    g: 'audience',
    n: 'Lapsed and reactivation segments',
    rw: 'write',
    eff: 'Low',
    pri: 12,
    d: 'Builds the high-value lapsing segment specifically, which is the reactivation cohort worth more than several new low-tier acquisitions and the one most accounts lose inside an undifferentiated lapsed list.',
    bp:
      'TRIGGER   Schedule · weekly\n\n' +
      '1  Shopify · Customers\n' +
      '     last_order  between 180 and 365 days ago\n' +
      '     total_spent >= 250\n' +
      '     orders      = 1\n\n' +
      '2  Hash and upload to SEG_HIGHVALUE_LAPSING\n\n' +
      '3  Klaviyo or email platform · sync the same list\n' +
      '   Owned channels run first, paid runs against\n' +
      '   non-responders after 14 days\n\n' +
      '4  Data Store · record who entered this week\n' +
      '5  Schedule +14d · remove anyone who purchased\n' +
      '   or opened, hand the remainder to paid',
    note: 'The fourteen-day owned-first sequence is what makes reactivation profitable. Running paid against the whole list immediately means paying media rates for customers email would have recovered for nothing.',
  },
  {
    k: 'apptag',
    g: 'audience',
    n: 'App user tag writeback',
    rw: 'write',
    eff: 'Medium',
    pri: 13,
    d: 'Writes an app_user tag back onto the Shopify customer when activation completes, which is the prerequisite for the app activation campaign being able to exclude existing users.',
    bp:
      'TRIGGER   Webhook from Firebase Cloud Function\n' +
      '          on activation_complete\n\n' +
      '1  Payload  hashed email or account_linked identifier only\n' +
      '   No clinical fields. This crosses from Class B toward\n' +
      '   commerce, so only the activation fact travels.\n\n' +
      '2  Shopify · Search Customer by email\n' +
      '3  Shopify · Update Customer, add tag app_user\n' +
      '4  Data Store · record for the activation audience\n\n' +
      '5  Weekly · rebuild SEG_CUSTOMERS_NO_APP\n' +
      '   orders > 0 AND tag NOT app_user',
    note: 'Only the activation fact crosses the boundary, never anything downstream of it. An app_user tag is a commerce attribute. A booking or a verification status is not, and must stay on the clinical side.',
  },

  {
    k: 'fatigue',
    g: 'creative',
    n: 'Fatigue early warning',
    rw: 'read',
    eff: 'Medium',
    pri: 7,
    d: 'Watches the three-signal combination rather than any single metric, because frequency rising on its own is normal in a working campaign and rotating on it alone wastes proven creative.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  HTTP · GET insights, level ad, last_7d and prior_7d\n' +
      '     fields  frequency, ctr, cpc, spend, actions\n\n' +
      '2  Set variables per ad\n' +
      '     freq_now, ctr_delta, cpc_delta, cpa_delta\n\n' +
      '3  Filter · ALL THREE, not any\n' +
      '     freq_now   >  2.5\n' +
      '     ctr_delta  <  -15%\n' +
      '     cpa_delta  >  +15%\n\n' +
      '4  HTTP · check whether a fresh creative in the same\n' +
      '   ad set is outperforming under comparable delivery\n\n' +
      '5  Router\n' +
      '     fresh outperforming  ->  "Fatigue confirmed. Rotate."\n' +
      '     no fresh asset       ->  "Fatigue likely, nothing validated\n' +
      '                               behind it. Pull the next batch forward."\n\n' +
      '6  Slack · post with days of runway at the current decline rate',
    note: 'Step 4 is the difference between a fatigue alert and a fatigue diagnosis. If fresh creative is not outperforming, the auction changed rather than the creative fatiguing, and rotating will not help.',
  },
  {
    k: 'brief',
    g: 'creative',
    n: 'Brief generator on iterate',
    rw: 'read',
    eff: 'Medium',
    pri: 14,
    d: 'When a batch verdict lands on ITERATE, drafts the next brief carrying the winning concept, angle and approved claim forward, so the creative team receives a starting point rather than a blank template.',
    bp:
      'TRIGGER   Google Sheets · watch Creative Ledger\n' +
      '          Condition  verdict = ITERATE\n\n' +
      '1  Lookup the parent creative row\n' +
      '     concept, angle, hook, creator, format, claim_ref\n\n' +
      '2  Set variables · next creative ID\n' +
      '     increment the layer that failed\n' +
      '     low CTR         ->  new hook, H+1\n' +
      '     good CTR low CVR ->  new format, F+1\n' +
      '     otherwise        ->  new version, V+1\n\n' +
      '3  Google Docs · create from the brief template\n' +
      '     Pre-filled: product, concept, angle, claim reference,\n' +
      '     script skeleton, compliance restrictions, parent ID\n' +
      '     Blank: the new hook or execution, for a human\n\n' +
      '4  Slack · post the doc link to the creative channel',
    note: 'Incrementing the layer that failed rather than starting a new concept is the whole point. An iterate verdict means the idea works and the execution did not, and restarting from concept throws away the finding.',
  },
  {
    k: 'intake',
    g: 'creative',
    n: 'Asset intake validator',
    rw: 'read',
    eff: 'Low',
    pri: 15,
    d: 'Validates a new file the moment it lands in the shared folder, so a naming mistake is caught before it reaches the ad account and breaks the reporting join.',
    bp:
      'TRIGGER   Google Drive · watch folder\n\n' +
      '1  Regex on filename\n' +
      '     ^P\\d{2}_C\\d{2}_A\\d{2}_H\\d{2}_CR\\d{2}_F\\d{2}_V\\d{2}$\n\n' +
      '2  Router\n' +
      '     no match  ->  Slack, "Rename before this can be logged"\n' +
      '     match     ->  continue\n\n' +
      '3  Google Sheets · check the creative ID is not a duplicate\n' +
      '4  Check the ledger for a claim_reference on the parent\n' +
      '     missing  ->  block and notify compliance\n\n' +
      '5  Google Sheets · append to the batch, status PENDING_REVIEW\n' +
      '6  Slack · post to the creative channel with the file link',
    note: 'Catching the naming at intake rather than at launch is what keeps the reporting join intact. A file named wrongly becomes an ad named wrongly, and a campaign name that does not parse becomes a null dimension in the dashboard rather than a visible error.',
  },
  {
    k: 'review',
    g: 'creative',
    n: 'Compliance review SLA tracker',
    rw: 'read',
    eff: 'Low',
    pri: 16,
    d: 'Tracks how long each asset sits awaiting compliance review, because the fortnightly cycle depends on a five-day turnaround and the only way to know it is holding is to measure it.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  Google Sheets · rows with status PENDING_REVIEW\n' +
      '2  Set variable  days_waiting\n\n' +
      '3  Router\n' +
      '     3 days   ->  gentle reminder to the compliance owner\n' +
      '     5 days   ->  escalation, and flag the batch at risk\n' +
      '     7 days   ->  P3, the cycle will slip\n\n' +
      '4  Monthly · average turnaround written to a sheet\n' +
      '5  Slack · monthly, "Average review turnaround: X days"',
    note: 'The monthly average is the useful output rather than the daily nags. If the real turnaround is eight days, the fortnightly cadence needs rebuilding around eight rather than everyone pretending it is five and the batch quietly slipping every cycle.',
  },

  {
    k: 'concentration',
    g: 'scaling',
    n: 'Delivery concentration monitor',
    rw: 'read',
    eff: 'Low',
    pri: 8,
    d: 'Measures how much of an ad set is going to one asset, and separates healthy consolidation from a test that never happened. The same number means opposite things depending on the campaign.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  HTTP · GET insights, level ad, last_7d, by adset\n' +
      '2  Aggregator · per ad set\n' +
      '     top_share    top asset spend / adset spend\n' +
      '     starved      count of ads under 5% share\n' +
      '     effective    count of ads at or above 10%\n\n' +
      '3  Router on adset_name\n' +
      '     CONTAINS _CT-   ->  a test. top_share > 60% is a FAILED test\n' +
      '     CONTAINS _SCALE ->  scaling. top_share > 70% is normal\n\n' +
      '4  Filter · the failing condition for that campaign type\n' +
      '5  Slack · post with the framing for that campaign type,\n' +
      '   not a generic concentration warning',
    note: 'Routing on campaign type before judging the number is what makes this useful. Seventy percent on one asset in a scaling campaign is Meta exploiting a winner. The same figure in a concept test means three cells were never read and the test produced nothing.',
  },
  {
    k: 'supply',
    g: 'scaling',
    n: 'Creative supply gap alert',
    rw: 'read',
    eff: 'Medium',
    pri: 9,
    d: 'Compares spend growth against creative count and warns when the two diverge, because a ceiling caused by creative supply looks exactly like an audience problem until someone does this arithmetic.',
    bp:
      'TRIGGER   Schedule · weekly\n\n' +
      '1  HTTP · GET insights, level adset, last_7d and 4 weeks ago\n' +
      '     fields  spend, reach, frequency, adset_name\n' +
      '2  HTTP · GET ads per ad set, count ACTIVE\n\n' +
      '3  Set variables\n' +
      '     spend_growth      spend_now / spend_4w\n' +
      '     creative_growth   ads_now / ads_4w\n' +
      '     weekly_imp        spend / cpm * 1000\n' +
      '     needed_creatives  weekly_imp / (audience * 2.5)\n\n' +
      '4  Filter\n' +
      '     spend_growth > 1.3  AND  creative_growth < 1.1\n\n' +
      '5  Slack · post\n' +
      '     "Spend up X%, creative count flat. Frequency will follow.\n' +
      '      This lane needs N assets in rotation at current spend."',
    note: 'The needed_creatives figure is the part worth reporting. Telling someone frequency is rising invites a targeting conversation. Telling them the lane needs nine assets and has four points at the actual constraint.',
  },
  {
    k: 'rollback',
    g: 'scaling',
    n: 'Daily state snapshot for rollback',
    rw: 'read',
    eff: 'Low',
    pri: 17,
    d: 'Captures the full campaign, ad set and ad configuration daily, so a change that turns out badly can be reversed to a known-good state rather than reconstructed from memory.',
    bp:
      'TRIGGER   Schedule · 05:00 daily\n\n' +
      '1  HTTP · GET campaigns, adsets, ads\n' +
      '     fields  id, name, status, daily_budget, bid_strategy,\n' +
      '             targeting, optimization_goal, attribution_spec\n\n' +
      '2  JSON · aggregate into a single object\n' +
      '3  Google Drive · save as {date}-account-state.json\n' +
      '4  Data Store · keep the last 30 days, prune older\n\n' +
      '5  Weekly · diff against 7 days prior\n' +
      '6  Slack · post the changes, so the week has a record\n' +
      '   of what was altered and when',
    note: 'The weekly diff is what makes this more than a backup. Six weeks after a performance shift, the question is always what changed, and a diff answers it in seconds where memory does not.',
  },

  {
    k: 'prescan',
    g: 'risk',
    n: 'Ad copy pre-scan',
    rw: 'read',
    eff: 'Medium',
    pri: 10,
    d: 'Runs proposed copy against the failure patterns before it reaches Meta, catching the two mistakes that account for most disapprovals in this category.',
    bp:
      'TRIGGER   Webhook from the brief form, or Sheets watch\n\n' +
      '1  Set variable · lowercase the full copy block\n\n' +
      '2  Iterator over the term lists\n' +
      '     BLOCKING   conditions, treatment verbs, guarantees,\n' +
      '                quantified outcomes, second-person plus\n' +
      '                a health state\n' +
      '     REVIEW     efficacy language, medication comparison,\n' +
      '                substitution for care\n' +
      '     WATCH      superlatives, manufactured urgency\n\n' +
      '3  Router\n' +
      '     any BLOCKING hit  ->  reject, return the matched terms\n' +
      '     any REVIEW hit    ->  route to compliance\n' +
      '     clean             ->  mark PRE-SCAN PASSED\n\n' +
      '4  Google Sheets · log every scan, including passes\n' +
      '5  Slack · return the result to the submitter within seconds\n\n' +
      'This is a first-pass filter, never an approval. Compliance\n' +
      'review still runs on everything.',
    note: 'Logging the passes as well as the failures is what makes this improve over time. The pattern in what gets flagged tells you which part of the brief template is producing the problem, and fixing the template beats catching the same mistake weekly.',
  },
  {
    k: 'affiliate',
    g: 'risk',
    n: 'Affiliate destination sweep',
    rw: 'read',
    eff: 'Medium',
    pri: 18,
    d: 'Checks partner and affiliate landing pages specifically, since those sit outside media control while the ad account absorbs whatever appears on them.',
    bp:
      'TRIGGER   Schedule · daily 07:00\n\n' +
      '1  Google Sheets · read the affiliate destination inventory\n' +
      '2  HTTP · request each URL\n' +
      '3  Text parser · extract visible body copy\n\n' +
      '4  Run the same term lists as the copy pre-scan\n\n' +
      '5  Router\n' +
      '     BLOCKING term found  ->  P2, name the partner and the term\n' +
      '     page hash changed    ->  P3, re-review required\n' +
      '     status != 200        ->  P2, pause ads pointing at it\n\n' +
      '6  Slack · post with the URL, the term and the ads affected',
    note: 'This is the exposure most likely to cause a restriction and least likely to be noticed, because the page is not yours and nobody is watching it. A partner adding a testimonial describing symptom relief costs you the account, not them.',
  },
  {
    k: 'appeal',
    g: 'risk',
    n: 'Appeal tracker',
    rw: 'read',
    eff: 'Low',
    pri: 19,
    d: 'Tracks every disapproval from detection through appeal to outcome, so the pattern across appeals is visible and nobody duplicates a rejected ad because they lost track of what was already submitted.',
    bp:
      'TRIGGER   Webhook or manual entry when an appeal is filed\n\n' +
      '1  Google Sheets · append\n' +
      '     ad_id, campaign, reason, appeal_date, status = PENDING\n\n' +
      '2  Schedule · daily, check ad status via the API\n' +
      '3  Router\n' +
      '     now ACTIVE      ->  status APPROVED, log the turnaround\n' +
      '     still rejected  ->  after 5 days, escalate internally\n\n' +
      '4  Monthly · approval rate by reason category\n' +
      '5  Slack · post the monthly view\n\n' +
      'The monthly view answers whether appeals are worth filing\n' +
      'for a given reason, which is not obvious without the data.',
    note: 'Knowing that appeals on one reason category succeed and another never do saves the time spent filing the second kind, and it also tells you where the real policy boundary sits rather than where you assume it does.',
  },
  {
    k: 'p1',
    g: 'risk',
    n: 'P1 incident runbook',
    rw: 'write',
    eff: 'Medium',
    pri: 5,
    d: 'Fires on an account restriction. Stops spend, notifies everyone, and creates the incident record before anyone has had to think about the sequence.',
    bp:
      'TRIGGER   Schedule · every 15 minutes\n' +
      '          HTTP · GET act_{id}  fields account_status,\n' +
      '                 disable_reason\n\n' +
      '1  Filter · account_status != 1 (ACTIVE)\n\n' +
      '2  Data Store · check not already fired for this incident\n\n' +
      '3  HTTP · PAUSE all active campaigns\n' +
      '   Stop spend before diagnosing. Always.\n\n' +
      '4  Slack · @channel P1, both principals, with the reason code\n' +
      '5  Email · marketing owner and compliance owner\n\n' +
      '6  Google Docs · create the incident record from a template\n' +
      '     Pre-filled: timestamp, reason code, campaigns paused,\n' +
      '     spend in the 72 hours prior, recent disapprovals\n\n' +
      '7  Slack · post the runbook reminders\n' +
      '     Do not open a second ad account.\n' +
      '     Do not relaunch under a new campaign name.\n' +
      '     Assume 2-4 weeks. Move budget to owned channels.',
    note: 'The three reminders in step 7 exist because all three are what people do in the first hour of a restriction, and all three make it worse. Having them arrive automatically means nobody has to remember them while under pressure.',
  },

  {
    k: 'refund',
    g: 'data',
    n: 'Refund and chargeback tracker',
    rw: 'read',
    eff: 'Low',
    pri: 20,
    d: 'Captures refunds, chargebacks and unfulfilled Rx orders into one place, which is what makes true ROAS calculable rather than theoretical.',
    bp:
      'TRIGGER   Shopify · Watch Refunds\n' +
      '          Schedule · daily for rx_declined tags\n\n' +
      '1  Router\n' +
      '     refund              ->  type REFUND\n' +
      '     chargeback          ->  type CHARGEBACK\n' +
      '     tag rx_declined     ->  type UNFULFILLED\n\n' +
      '2  Google Sheets · append\n' +
      '     date, order_id, type, value, original order date,\n' +
      '     original attribution source\n\n' +
      '3  Weekly · aggregate by type and by source\n' +
      '4  Set variable  leakage_rate = total / gross_revenue\n' +
      '5  Slack · weekly, with reported and true ROAS side by side',
    note: 'The unfulfilled Rx line is the one nobody counts. It behaves exactly like a refund and never appears as one, because the Purchase event fired at payment and nothing downstream corrected it.',
  },
  {
    k: 'dunning',
    g: 'data',
    n: 'Dunning trigger',
    rw: 'write',
    eff: 'Medium',
    pri: 6,
    d: 'Fires the pre-dunning sequence before a card fails rather than after, which recovers materially more than post-failure retries and costs no media at all.',
    bp:
      'TRIGGER   Schedule · daily\n\n' +
      '1  Shopify or subscription app\n' +
      '     get contracts with card expiring in the next 30 days\n' +
      '     get contracts with a failed charge in the last 7 days\n\n' +
      '2  Router\n' +
      '     EXPIRING  ->  pre-dunning, administrative tone\n' +
      '                   "Your card expires before your next order"\n' +
      '     FAILED    ->  recovery, retry schedule day 1, 3, 5, 7\n\n' +
      '3  Email platform · trigger the correct flow\n' +
      '4  Data Store · record who entered which flow\n\n' +
      '5  Weekly · recovery rate by flow\n' +
      '6  Slack · post recovered MRR\n\n' +
      'Recovered revenue here is the cheapest in the account.\n' +
      'It requires no media spend and no new customer.',
    note: 'Splitting expiring from failed is what makes this work. A pre-expiry message is administrative and gets actioned. A post-failure message is remedial and a meaningful share of people read it as a reason to cancel rather than to update.',
  },

  {
    k: 'weekly',
    g: 'report',
    n: 'Weekly report assembler',
    rw: 'read',
    eff: 'High',
    pri: 15,
    d: 'Pulls every source into the ten-section template and posts it before the Monday call, so the meeting is spent on decisions rather than on reading numbers aloud.',
    bp:
      'TRIGGER   Schedule · Monday 06:00\n\n' +
      '1  HTTP · Meta insights, week and prior week\n' +
      '2  Shopify · orders, revenue, refunds, new vs returning\n' +
      '3  Google Sheets · creative ledger, disapproval log,\n' +
      '   reconciliation log, subscription metrics\n\n' +
      '4  Set variables for every section\n' +
      '     CPA, ROAS, MER, nCAC, week-over-week deltas,\n' +
      '     creative verdicts, account health count,\n' +
      '     platform against back-end delta\n\n' +
      '5  Router · generate the ACTIONS block conditionally\n' +
      '     delta > 15%          ->  "INVESTIGATE reconciliation"\n' +
      '     CPA > target * 1.25  ->  "INVESTIGATE before budget change"\n' +
      '     disapprovals > 0     ->  "ACCOUNT HEALTH, log the pattern"\n' +
      '     graduated > 0        ->  "SCALE, verify shipped first"\n' +
      '     new customer share < 70%  ->  "WATCH cannibalisation"\n\n' +
      '6  Google Docs · create from template\n' +
      '7  Slack · post the link plus the executive summary inline',
    note: 'The conditional actions block is what stops this being a data dump. A report that ends in a summary is documentation; one that ends in named actions derived from thresholds is a management tool.',
  },
  {
    k: 'anomaly',
    g: 'report',
    n: 'Statistical anomaly detector',
    rw: 'read',
    eff: 'Medium',
    pri: 9,
    d: 'Flags metrics that move beyond their own normal variation rather than beyond a fixed threshold, which is the difference between catching a real shift and being alerted every Monday.',
    bp:
      'TRIGGER   Schedule · daily 09:00\n\n' +
      '1  Google Sheets · read the last 30 daily snapshots\n\n' +
      '2  Set variables per metric\n' +
      '     mean    30-day average\n' +
      '     stdev   30-day standard deviation\n' +
      '     z       (today - mean) / stdev\n\n' +
      '   Metrics: spend, CPM, CTR, CPA, ROAS, conversion rate,\n' +
      '            new customer share, LP view rate\n\n' +
      '3  Filter · ABS(z) > 2.0\n\n' +
      '4  Aggregator · group the flagged metrics\n' +
      '5  Router\n' +
      '     3 or more metrics flagged  ->  P2, likely systemic\n' +
      '     1 or 2 flagged             ->  P3, likely local\n\n' +
      '6  Slack · post the metric, the z-score, and what\n' +
      '   normal looks like for that metric\n\n' +
      'A z-score adapts to each account and each metric.\n' +
      'A fixed threshold does not, and it either fires\n' +
      'constantly or never.',
    note: 'The count of simultaneously flagged metrics is the most useful signal in this scenario. One metric moving is usually local and worth a look. Four moving at once is nearly always a tracking fault or a delivery event, and it deserves a different first question.',
  },
  {
    k: 'cohort',
    g: 'report',
    n: 'Monthly cohort snapshot',
    rw: 'read',
    eff: 'Medium',
    pri: 16,
    d: 'Captures revenue per acquisition cohort each month, which is the only way to see quality degrading while blended revenue is still rising.',
    bp:
      'TRIGGER   Schedule · first of the month\n\n' +
      '1  Shopify · all orders, last 12 months\n' +
      '2  Aggregator · group customers by first order month\n' +
      '3  Set variables per cohort\n' +
      '     customers, revenue at month 0, 3, 6, 12\n' +
      '     revenue per customer at each checkpoint\n' +
      '     repeat multiple\n\n' +
      '4  Google Sheets · write the cohort matrix\n\n' +
      '5  Compare the two most recent cohorts against the\n' +
      '   two oldest at the month-3 checkpoint\n\n' +
      '6  Filter · drift worse than -12%\n' +
      '7  Slack · "Cohort quality declining. Later cohorts are\n' +
      '   worth X% less at month 3 at the same CPA."',
    note: 'This is the check that catches scaling degrading customer quality, and it is invisible in every platform view because platforms report periods rather than cohorts. Running it monthly rather than quarterly is what makes it early enough to act on.',
  },
  {
    k: 'oneThing',
    g: 'report',
    n: 'Daily one-thing digest',
    rw: 'read',
    eff: 'Low',
    pri: 21,
    d: 'Posts the single most important thing each morning rather than everything, because a digest containing twelve numbers gets skimmed and a digest containing one gets read.',
    bp:
      'TRIGGER   Schedule · 07:30 daily\n\n' +
      '1  Read the outputs of the other monitors\n' +
      '     health sweep, pacing, reconciliation, anomaly,\n' +
      '     fatigue, starved creative\n\n' +
      '2  Score each finding by severity\n' +
      '     P1 restriction        100\n' +
      '     P2 gated disapproval   80\n' +
      '     P2 reconciliation      70\n' +
      '     P3 anomaly, 3+ metrics 60\n' +
      '     P3 fatigue confirmed   40\n' +
      '     P4 pacing              20\n\n' +
      '3  Take the highest only\n\n' +
      '4  Router\n' +
      '     nothing above 20  ->  post "Nothing needs attention today"\n' +
      '     otherwise         ->  post the single finding with\n' +
      '                          the recommended first action\n\n' +
      'Posting nothing-to-report is deliberate. Silence is\n' +
      'ambiguous; an explicit all-clear is information.',
    note: 'The all-clear message matters more than it looks. Without it, a day with no alert is indistinguishable from a day the scenario failed, and nobody notices a broken monitor until the week they needed it.',
  },
];
var mkKey = 'monitor';
function renderMake() {
  var set = MK.filter((m) => m.g === mkKey);
  $('mk-list').innerHTML = set
    .map((m) => {
      var cls = m.rw === 'write' ? 'f-med' : 'f-ok';
      return (
        '<div class="flag ' +
        cls +
        '"><b>' +
        m.n +
        ' <span style="font-weight:400;font-size:12px;color:var(--ink-3)">· ' +
        (m.rw === 'write' ? 'writes to Meta' : 'read only') +
        ' · ' +
        m.eff +
        ' effort</span></b>' +
        m.d +
        '</div>'
      );
    })
    .join('');
}
$('mk-tabs').addEventListener('click', (e) => {
  var b = e.target.closest('.tab');
  if (!b) return;
  Array.prototype.forEach.call($('mk-tabs').children, (x) => {
    x.classList.remove('on');
  });
  b.classList.add('on');
  mkKey = b.dataset.mk;
  renderMake();
});
(() => {
  var groups = {
    monitor: 'Monitor',
    creative: 'Creative ops',
    audience: 'Audiences',
    scaling: 'Scaling',
    risk: 'Compliance',
    data: 'Data',
    report: 'Reporting',
  };
  var h = '';
  Object.keys(groups).forEach((g) => {
    h +=
      '<optgroup label="' +
      groups[g] +
      '">' +
      MK.filter((m) => m.g === g)
        .map((m) => '<option value="' + m.k + '">' + m.n + '</option>')
        .join('') +
      '</optgroup>';
  });
  $('mk-sel').innerHTML = h;
})();
function renderMakeBp() {
  var m = MK.filter((x) => x.k === $('mk-sel').value)[0] || MK[0];
  $('mk-out').textContent =
    m.n.toUpperCase() + '\n' + '='.repeat(Math.min(58, m.n.length + 8)) + '\n\n' + m.bp;
  $('mk-meta').textContent =
    (m.rw === 'write' ? 'writes to Meta' : 'read only') + ' · ' + m.eff + ' effort';
  $('mk-note').className = 'note' + (m.rw === 'write' ? ' warn' : '');
  $('mk-note').textContent = m.note;
}
$('mk-sel').addEventListener('change', renderMakeBp);
(() => {
  var ranked = MK.slice()
    .sort((a, b) => a.pri - b.pri)
    .slice(0, 12);
  $('mk-order').innerHTML = ranked
    .map(
      (m, i) =>
        '<tr><td class="num">' +
        (i + 1) +
        '</td><td><b>' +
        m.n +
        '</b></td>' +
        '<td>' +
        (m.rw === 'write'
          ? '<span class="pill p-iterate">Writes</span>'
          : '<span class="pill p-scale">Read</span>') +
        '</td>' +
        '<td>' +
        m.eff +
        '</td><td style="font-size:12.5px;color:var(--ink-3)">' +
        m.d.split('.')[0] +
        '.</td></tr>',
    )
    .join('');
})();
