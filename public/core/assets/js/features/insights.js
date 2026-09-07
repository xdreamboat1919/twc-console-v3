/* ================= WEEKLY REPORT ================= */
function buildReport() {
  var sp = +$('rp-sp').value || 0,
    rv = +$('rp-rv').value || 0,
    pu = +$('rp-pu').value || 0,
    psp = +$('rp-psp').value || 0,
    prv = +$('rp-prv').value || 0,
    ppu = +$('rp-ppu').value || 0,
    tgt = +$('rp-tgt').value || 1,
    nw = +$('rp-new').value || 0,
    dis = +$('rp-dis').value || 0,
    gr = +$('rp-grad').value || 0,
    be = +$('rp-be').value || 0,
    atc = +$('rp-atc').value || 0,
    ic = +$('rp-ic').value || 0,
    patc = +$('rp-patc').value || 0,
    pic = +$('rp-pic').value || 0;
  var cpa = pu ? sp / pu : 0,
    roas = sp ? rv / sp : 0,
    aov = pu ? rv / pu : 0;
  var pcpa = ppu ? psp / ppu : 0,
    proas = psp ? prv / psp : 0;
  function d(a, b) {
    return b ? ((a - b) / b) * 100 : 0;
  }
  function sign(x) {
    return (x >= 0 ? '+' : '') + x.toFixed(1) + '%';
  }
  var gap = be ? ((pu - be) / be) * 100 : 0;
  var acts = [];
  if (atc && patc && ic && pic) {
    var dA = d(sp / atc, psp / patc),
      dI = d(sp / ic, psp / pic),
      dP = d(cpa, pcpa);
    if (dP > 10) {
      var step =
        dP - dI > dI - dA ? 'checkout' : dI - dA > dA ? 'the product page' : 'traffic and creative';
      acts.push(
        'DIAGNOSE  Cost per purchase up ' +
          dP.toFixed(0) +
          '%. Largest deterioration added at ' +
          step +
          '. Work that step before changing budget.',
      );
    }
  }
  if (Math.abs(gap) > 15)
    acts.push(
      'INVESTIGATE  Meta and back end differ by ' +
        gap.toFixed(0) +
        '%. Run the reconciliation list before acting on anything else this week.',
    );
  if (cpa > tgt * 1.25)
    acts.push(
      'INVESTIGATE  CPA is ' +
        ((cpa / tgt - 1) * 100).toFixed(0) +
        '% above target. Work the diagnosis tree before changing budgets.',
    );
  else if (cpa <= tgt)
    acts.push(
      'HOLD OR SCALE  CPA at or below target. Check marginal CPA before increasing budget.',
    );
  if (dis > 0)
    acts.push(
      'ACCOUNT HEALTH  ' +
        dis +
        ' disapproval' +
        (dis === 1 ? '' : 's') +
        ' this week. Log it. The pattern across disapprovals is the signal, not the instance.',
    );
  if (gr > 0)
    acts.push(
      'SCALE  ' +
        gr +
        ' creative' +
        (gr === 1 ? '' : 's') +
        ' graduated. Enter at a controlled share, not full weight, and verify the orders shipped.',
    );
  if (nw < 70)
    acts.push(
      'WATCH  New customer share at ' +
        nw +
        '%. Retargeting may be flattering the blend while acquisition stalls.',
    );
  if (!acts.length) acts.push('HOLD  Nothing requires action. Continue the testing cycle.');
  $('rp-out').textContent =
    'WEEKLY REPORT  ·  week ending ' +
    $('rp-wk').value +
    '\n' +
    '='.repeat(58) +
    '\n\n' +
    '01  EXECUTIVE SUMMARY\n' +
    '    Spend        ' +
    money(sp) +
    '\n' +
    '    Revenue      ' +
    money(rv) +
    '\n' +
    '    Purchases    ' +
    pu +
    '\n' +
    '    CPA          $' +
    cpa.toFixed(0) +
    '   (target $' +
    tgt +
    ')\n' +
    '    ROAS         ' +
    roas.toFixed(2) +
    '\n' +
    '    AOV          $' +
    aov.toFixed(0) +
    '\n\n' +
    '02  COST PER FUNNEL STEP\n' +
    '    Cost per add to cart        $' +
    (atc ? (sp / atc).toFixed(2) : '—') +
    '   (' +
    (patc && atc ? sign(d(sp / atc, psp / patc)) : 'n/a') +
    ')\n' +
    '    Cost per checkout initiated $' +
    (ic ? (sp / ic).toFixed(2) : '—') +
    '   (' +
    (pic && ic ? sign(d(sp / ic, psp / pic)) : 'n/a') +
    ')\n' +
    '    Cost per purchase           $' +
    cpa.toFixed(2) +
    '   (' +
    sign(d(cpa, pcpa)) +
    ')\n' +
    '    CPA alone says the number moved. Three costs in\n' +
    '    sequence say where the cost accumulated.\n\n' +
    '03  WEEK OVER WEEK\n' +
    '    Spend        ' +
    sign(d(sp, psp)) +
    '\n' +
    '    Revenue      ' +
    sign(d(rv, prv)) +
    '\n' +
    '    Purchases    ' +
    sign(d(pu, ppu)) +
    '\n' +
    '    CPA          ' +
    sign(d(cpa, pcpa)) +
    '\n' +
    '    ROAS         ' +
    sign(d(roas, proas)) +
    '\n\n' +
    '04  LANE PERFORMANCE\n' +
    '    [by lane, against lane-specific targets]\n\n' +
    '05  CREATIVE LEADERBOARD\n' +
    '    [creative ID · concept · angle · hook · creator ·\n' +
    '     format · spend · CTR · CPA · ROAS · status]\n\n' +
    '06  CREATIVE LEARNINGS\n' +
    '    Graduated this week   ' +
    gr +
    '\n' +
    '    [winners, losers, and the hypothesis for why]\n\n' +
    '07  MEMBERSHIP AND LTV\n' +
    '    [new members · tier mix · subscription contribution]\n\n' +
    '08  APP\n' +
    '    [installs · activation rate · onboarding drop-off]\n\n' +
    '09  ACCOUNT HEALTH\n' +
    '    Disapprovals          ' +
    dis +
    '\n' +
    '    Meta vs back end      ' +
    pu +
    ' vs ' +
    be +
    '  (' +
    sign(gap) +
    ')\n' +
    '    New customer share    ' +
    nw +
    '%\n\n' +
    '10  NEXT TESTING PLAN\n' +
    '    [concepts · hooks · formats · creators]\n\n' +
    '11  ACTIONS\n' +
    acts.map((a) => '    ' + a).join('\n') +
    '\n\n' +
    (typeof opsReportSummary === 'function' ? opsReportSummary() : '') +
    (typeof growthReportSummary === 'function' ? growthReportSummary() : '') +
    '='.repeat(58) +
    '\n' +
    'The report determines what gets made and what gets built\n' +
    'next. If it only explains what happened, it is documentation\n' +
    'rather than a management tool.';
}
[
  'rp-wk',
  'rp-sp',
  'rp-rv',
  'rp-pu',
  'rp-psp',
  'rp-prv',
  'rp-ppu',
  'rp-tgt',
  'rp-new',
  'rp-dis',
  'rp-grad',
  'rp-be',
  'rp-atc',
  'rp-ic',
  'rp-patc',
  'rp-pic',
  'rp-atc',
  'rp-ic',
  'rp-patc',
  'rp-pic',
].forEach((id) => {
  $(id).addEventListener('input', buildReport);
});

/* ================= OFFERS ================= */
function calcOffer() {
  var pr = +$('of-price').value || 0,
    mar = (+$('of-mar').value || 0) / 100,
    di = (+$('of-disc').value || 0) / 100,
    lf = (+$('of-lift').value || 0) / 100;
  var dp = pr * (1 - di),
    c0 = pr * mar,
    c1 = dp - (pr - c0);
  var req = c1 > 0 ? c0 / c1 - 1 : 999;
  $('of-dp').textContent = '$' + dp.toFixed(2);
  $('of-cont').textContent = '$' + c1.toFixed(2);
  $('of-req').textContent = c1 > 0 ? '+' + (req * 100).toFixed(0) + '%' : 'impossible';
  $('of-nm').textContent = dp ? ((c1 / dp) * 100).toFixed(0) + '%' : '—';
  $('of-cpa').textContent = '$' + Math.max(0, c1).toFixed(0);
  var box = $('of-reqbox'),
    n = $('of-note');
  if (c1 <= 0) {
    box.className = 'stat lo';
    n.className = 'note bad';
    n.textContent =
      'At a ' +
      (di * 100).toFixed(0) +
      ' percent discount the contribution is negative. Every order loses money before any media cost. No volume lift rescues this.';
  } else if (lf >= req) {
    box.className = 'stat hi';
    n.className = 'note good';
    n.textContent =
      'Breaking even on contribution needs a ' +
      (req * 100).toFixed(0) +
      ' percent volume lift, and you expect ' +
      (lf * 100).toFixed(0) +
      ' percent. The promotion is accretive if that lift materialises. Note the affordable CPA falls to $' +
      c1.toFixed(0) +
      ' during the promotion, so bids need reducing or the discount eats the media budget instead of the margin.';
  } else {
    box.className = 'stat lo';
    n.className = 'note bad';
    n.textContent =
      'Holding contribution flat requires a ' +
      (req * 100).toFixed(0) +
      ' percent volume lift and you expect ' +
      (lf * 100).toFixed(0) +
      ' percent. This promotion destroys contribution unless it buys something the model does not capture, such as first-order acquisition of customers who will repeat. If that is the argument, make it explicitly rather than assuming the volume covers it.';
  }
}
['of-price', 'of-mar', 'of-disc', 'of-lift'].forEach((id) => {
  $(id).addEventListener('input', calcOffer);
});

/* ================= MER ================= */
function calcMER() {
  var rev = +$('mr-rev').value || 0,
    sp = +$('mr-spend').value || 1,
    mrev = +$('mr-meta').value || 0,
    msp = +$('mr-mspend').value || 1;
  var mer = rev / sp,
    roas = mrev / msp,
    share = rev ? (mrev / rev) * 100 : 0;
  $('mr-mer').textContent = mer.toFixed(2);
  $('mr-roas').textContent = roas.toFixed(2);
  $('mr-gap').textContent = (roas - mer >= 0 ? '+' : '') + (roas - mer).toFixed(2);
  $('mr-share').textContent = share.toFixed(0) + '%';
  var gap = roas - mer;
  $('mr-gbox').className = 'stat ' + (gap < 0.4 ? 'hi' : gap < 1.0 ? 'md' : 'lo');
  var n = $('mr-note');
  if (share > 100) {
    n.className = 'note bad';
    n.textContent =
      'Meta claims more revenue than the business earned in total. That is not attribution difference, it is a counting fault. Check subscription renewals firing Purchase, thank-you page reloads, and Rx orders firing at payment rather than fulfilment.';
  } else if (gap < 0.4) {
    n.className = 'note good';
    n.textContent =
      'Platform ROAS of ' +
      roas.toFixed(2) +
      ' against MER of ' +
      mer.toFixed(2) +
      ' is a narrow gap, which means Meta is not materially over-claiming and the business-level number is close to the platform view. Scale decisions made on ROAS will roughly hold at business level.';
  } else if (gap < 1.0) {
    n.className = 'note warn';
    n.textContent =
      'A gap of ' +
      gap.toFixed(2) +
      ' between platform ROAS and MER is normal where other channels and organic contribute. Make budget decisions on MER, and use ROAS only to compare campaigns against each other.';
  } else {
    n.className = 'note bad';
    n.textContent =
      'A gap of ' +
      gap.toFixed(2) +
      ' means the platform view is substantially more optimistic than the business result. Meta is claiming ' +
      share.toFixed(0) +
      ' percent of total revenue. Either attribution is over-crediting, or other channels are being under-credited for demand Meta is harvesting. Do not scale on ROAS while this gap persists.';
  }
}
['mr-rev', 'mr-spend', 'mr-meta', 'mr-mspend'].forEach((id) => {
  $(id).addEventListener('input', calcMER);
});

/* ================= SIGNIFICANCE ================= */
function ncdf(z) {
  var t = 1 / (1 + 0.2316419 * Math.abs(z));
  var d = 0.3989423 * Math.exp((-z * z) / 2);
  var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
function calcSig() {
  var c1 = +$('st-c1').value || 0,
    n1 = +$('st-n1').value || 1,
    c2 = +$('st-c2').value || 0,
    n2 = +$('st-n2').value || 1;
  var p1 = c1 / n1,
    p2 = c2 / n2,
    pp = (c1 + c2) / (n1 + n2);
  var se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2));
  var z = se ? (p2 - p1) / se : 0;
  var conf = Math.abs(2 * ncdf(Math.abs(z)) - 1) * 100;
  var lift = p1 ? ((p2 - p1) / p1) * 100 : 0;
  $('st-r1').textContent = (p1 * 100).toFixed(2) + '%';
  $('st-r2').textContent = (p2 * 100).toFixed(2) + '%';
  $('st-lift').textContent = (lift >= 0 ? '+' : '') + lift.toFixed(1) + '%';
  $('st-conf').textContent = conf.toFixed(1) + '%';
  var target = Math.abs(lift) / 100 || 0.2;
  var need = target > 0 ? Math.ceil((16 * pp * (1 - pp)) / Math.pow(pp * target, 2)) : 0;
  $('st-need').textContent = isFinite(need) && need > 0 ? need.toLocaleString() : '—';
  var r = $('st-read');
  r.className = 'readout';
  var cls, label, body;
  if (conf >= 95) {
    cls = 'is-pass';
    label = 'Significant';
    body =
      'At ' +
      conf.toFixed(1) +
      ' percent confidence the difference is unlikely to be noise. B converts ' +
      (lift >= 0 ? 'better' : 'worse') +
      ' by ' +
      Math.abs(lift).toFixed(0) +
      ' percent. Graduate the winner, and still verify the conversions are real in the back end before promoting anything.';
  } else if (conf >= 80) {
    cls = 'is-warn';
    label = 'Leaning, not conclusive';
    body =
      'At ' +
      conf.toFixed(1) +
      ' percent confidence there is a signal but not a decision. Roughly ' +
      (isFinite(need) ? need.toLocaleString() : 'more') +
      ' clicks per side would be needed to call a lift this size at 95 percent. Keep both running, or accept that you are choosing on judgement rather than on evidence and say so.';
  } else {
    cls = 'is-fail';
    label = 'Noise';
    body =
      'At ' +
      conf.toFixed(1) +
      ' percent confidence this difference is indistinguishable from chance. Calling a winner here is how accounts scale the wrong ad. Either run longer, or accept that the two are equivalent and pick on a criterion other than conversion rate.';
  }
  r.classList.add(cls);
  $('st-label').textContent = label;
  $('st-val').textContent = conf.toFixed(0) + '%';
  $('st-fill').style.width = Math.min(100, (conf / 95) * 70) + '%';
  $('st-mark').style.left = '70%';
  $('st-body').textContent = body;
}
['st-c1', 'st-n1', 'st-c2', 'st-n2'].forEach((id) => {
  $(id).addEventListener('input', calcSig);
});

/* ================= SATURATION ================= */
function calcSat() {
  var size = +$('sa-size').value || 1,
    reach = +$('sa-reach').value || 0,
    freq = +$('sa-freq').value || 0,
    days = +$('sa-days').value || 1;
  var cum = Math.min(size, reach * days * 0.55);
  var pct = size ? (cum / size) * 100 : 0;
  var f30 = freq * (30 / Math.max(7, days)) * 0.7 + freq;
  var daily = reach * 0.55;
  var toSat = daily ? Math.max(0, (size * 0.75 - cum) / daily) : 0;
  $('sa-pct').textContent = pct.toFixed(0) + '%';
  $('sa-f30').textContent = f30.toFixed(1);
  $('sa-ex').textContent = toSat > 90 ? '>90' : Math.round(toSat) + ' d';
  $('sa-left').textContent = Math.max(0, Math.round(size * 0.75 - cum)).toLocaleString();
  var box = $('sa-exbox'),
    n = $('sa-note');
  if (pct > 70 || freq > 4) {
    box.className = 'stat lo';
    n.className = 'note bad';
    n.textContent =
      'Roughly ' +
      pct.toFixed(0) +
      ' percent of the addressable audience has been reached at a frequency of ' +
      freq +
      '. This audience is saturating. Broadening will help more than new creative, because the problem is who you are reaching rather than what you are showing them.';
  } else if (pct > 45 || freq > 2.8) {
    box.className = 'stat md';
    n.className = 'note warn';
    n.textContent =
      'At ' +
      pct.toFixed(0) +
      ' percent reached and a frequency of ' +
      freq +
      ', saturation is approaching. Projected frequency at thirty days is ' +
      f30.toFixed(1) +
      '. Plan the broader audience now rather than when performance drops, because building it after the fact costs another learning cycle.';
  } else {
    box.className = 'stat hi';
    n.className = 'note good';
    n.textContent =
      'At ' +
      pct.toFixed(0) +
      ' percent reached and a frequency of ' +
      freq +
      ', there is headroom. Roughly ' +
      Math.max(0, Math.round(size * 0.75 - cum)).toLocaleString() +
      ' people remain in the effective pool. If CPA is rising here, saturation is not the cause and the diagnosis lies elsewhere.';
  }
}
['sa-size', 'sa-reach', 'sa-freq', 'sa-days'].forEach((id) => {
  $(id).addEventListener('input', calcSat);
});

/* ================= COHORTS ================= */
function calcCohort() {
  var rows = [];
  for (var i = 1; i <= 6; i++) {
    var n = +$('co-n' + i).value || 0,
      a = +$('co-a' + i).value || 0,
      b = +$('co-b' + i).value || 0;
    var rpc = n ? b / n : 0,
      mult = a ? b / a : 0;
    $('co-r' + i).textContent = rpc ? '$' + rpc.toFixed(0) : '—';
    $('co-m' + i).textContent = mult ? mult.toFixed(2) + 'x' : '—';
    rows.push({ n: n, rpc: rpc, mult: mult });
  }
  var first = rows.slice(0, 2).filter((r) => r.rpc),
    last = rows.slice(-2).filter((r) => r.rpc);
  var avg = (a, k) => (a.length ? a.reduce((x, y) => x + y[k], 0) / a.length : 0);
  var f = avg(first, 'rpc'),
    l = avg(last, 'rpc');
  var drift = f ? ((l - f) / f) * 100 : 0;
  var r = $('co-read');
  r.className = 'readout';
  var cls, label, body;
  if (drift < -12) {
    cls = 'is-fail';
    label = 'Quality degrading';
    body =
      'Revenue per customer at month three has fallen ' +
      Math.abs(drift).toFixed(0) +
      ' percent from the earliest cohorts to the most recent. You are acquiring more customers who are worth less, and blended revenue will keep rising while unit economics deteriorate underneath it. Check whether the mix has shifted toward a cheaper product, whether discounting has increased, or whether the audience has broadened past the efficient pool. This is the failure that hides for two quarters.';
  } else if (drift < -4) {
    cls = 'is-warn';
    label = 'Mild drift';
    body =
      'Revenue per customer is down ' +
      Math.abs(drift).toFixed(0) +
      ' percent across cohorts. Mild degradation is normal when scaling past the most efficient audience, and it becomes a problem when CPA is not falling to compensate. Compare this against the CPA trend before acting.';
  } else if (drift > 8) {
    cls = 'is-pass';
    label = 'Quality improving';
    body =
      'Revenue per customer is up ' +
      drift.toFixed(0) +
      ' percent across cohorts, which usually means creative or targeting is finding better customers rather than just more of them. If CPA has held or improved alongside this, there is room to scale harder than the blended numbers suggest.';
  } else {
    cls = 'is-pass';
    label = 'Stable';
    body =
      'Revenue per customer is holding within ' +
      Math.abs(drift).toFixed(0) +
      ' percent across cohorts. Scaling is adding volume without diluting quality, which is the condition that justifies increasing budget. Watch the repeat multiple as the leading indicator, since it moves before revenue per customer does.';
  }
  r.classList.add(cls);
  $('co-label').textContent = label;
  $('co-val').textContent = (drift >= 0 ? '+' : '') + drift.toFixed(0) + '%';
  $('co-body').textContent = body;
}
for (var _c = 1; _c <= 6; _c++) {
  ['n', 'a', 'b'].forEach((k) => {
    var id = 'co-' + k + _c;
    if ($(id)) $(id).addEventListener('input', calcCohort);
  });
}

/* ================= TRUE ROAS ================= */
function calcRefund() {
  var g = +$('rf-gross').value || 0,
    rf = +$('rf-ref').value || 0,
    cb = +$('rf-cb').value || 0,
    un = +$('rf-unf').value || 0,
    sp = +$('rf-spend').value || 1;
  var lost = rf + cb + un,
    net = g - lost;
  var rep = g / sp,
    tru = net / sp,
    leak = g ? (lost / g) * 100 : 0;
  $('rf-rep').textContent = rep.toFixed(2);
  $('rf-true').textContent = tru.toFixed(2);
  $('rf-leak').textContent = leak.toFixed(1) + '%';
  $('rf-lost').textContent = money(lost);
  $('rf-mult').textContent = leak < 100 ? (1 / (1 - leak / 100)).toFixed(2) + 'x' : '—';
  $('rf-tbox').className = 'stat ' + (leak < 6 ? 'hi' : leak < 12 ? 'md' : 'lo');
  var n = $('rf-note');
  if (leak < 6) {
    n.className = 'note good';
    n.textContent =
      'Leakage of ' +
      leak.toFixed(1) +
      ' percent is low. Reported and true ROAS differ by ' +
      (rep - tru).toFixed(2) +
      ', which is small enough that bidding on reported numbers will not mislead you materially.';
  } else if (leak < 12) {
    n.className = 'note warn';
    n.textContent =
      'Leakage of ' +
      leak.toFixed(1) +
      ' percent means true ROAS is ' +
      tru.toFixed(2) +
      ' against a reported ' +
      rep.toFixed(2) +
      '. Effective CPA is ' +
      (1 / (1 - leak / 100)).toFixed(2) +
      ' times what Ads Manager shows, because you paid to acquire orders that did not stick. Set the target CPA against the true figure, not the reported one.';
  } else {
    n.className = 'note bad';
    n.textContent =
      'Leakage of ' +
      leak.toFixed(1) +
      ' percent is severe. True ROAS of ' +
      tru.toFixed(2) +
      ' against a reported ' +
      rep.toFixed(2) +
      ' means roughly ' +
      money(lost) +
      ' of counted revenue never banked. The unfulfilled Rx component is the one most accounts miss entirely, because the Purchase event fires at payment and nothing ever corrects it. Fix the conversion event before adjusting bids, or you will optimise toward orders that fail.';
  }
}
['rf-gross', 'rf-ref', 'rf-cb', 'rf-unf', 'rf-spend'].forEach((id) => {
  $(id).addEventListener('input', calcRefund);
});

/* ================= SUBSCRIPTIONS ================= */
function calcSubs() {
  var act = +$('sb-act').value || 0,
    nw = +$('sb-new').value || 0,
    vol = +$('sb-vol').value || 0,
    inv = +$('sb-inv').value || 0,
    val = +$('sb-val').value || 0,
    rec = (+$('sb-rec').value || 0) / 100;
  var churn = vol + inv,
    base = act + churn;
  var cr = base ? (churn / base) * 100 : 0,
    invp = churn ? (inv / churn) * 100 : 0;
  var mrr = act * val,
    net = nw - churn;
  var recov = inv * rec * val;
  var life = cr > 0 ? 100 / cr : 0;
  $('sb-mrr').textContent = money(mrr);
  $('sb-net').textContent = (net >= 0 ? '+' : '') + net;
  $('sb-churn').textContent = cr.toFixed(1) + '%';
  $('sb-invp').textContent = invp.toFixed(0) + '%';
  $('sb-recov').textContent = money(recov);
  $('sb-life').textContent = life ? life.toFixed(1) + ' mo' : '—';
  $('sb-cbox').className = 'stat ' + (cr < 5 ? 'hi' : cr < 9 ? 'md' : 'lo');
  var n = $('sb-note');
  if (invp >= 30) {
    n.className = 'note warn';
    n.textContent =
      invp.toFixed(0) +
      ' percent of churn is involuntary, meaning a failed card rather than a customer who chose to leave. That is ' +
      inv +
      ' subscriptions worth ' +
      money(inv * val) +
      ' monthly, of which roughly ' +
      money(recov) +
      ' is recoverable with proper dunning: retry schedules, card updater, and a pre-dunning email before the charge fails. This is the cheapest revenue available anywhere in the account, and it does not require a single dollar of media.';
  } else if (cr > 9) {
    n.className = 'note bad';
    n.textContent =
      'Monthly churn of ' +
      cr.toFixed(1) +
      ' percent implies an average subscription lifespan of ' +
      life.toFixed(1) +
      ' months, which caps LTV harder than any acquisition improvement can offset. Fix retention before increasing acquisition budget, because you are filling a bucket with a hole in it.';
  } else if (net < 0) {
    n.className = 'note bad';
    n.textContent =
      'Net subscription growth is negative. Churn of ' +
      churn +
      ' exceeds ' +
      nw +
      ' new subscriptions this month, so the subscriber base is shrinking while acquisition spend continues. Either acquisition needs to rise or churn needs to fall, and churn is usually the cheaper of the two.';
  } else {
    n.className = 'note good';
    n.textContent =
      'Churn of ' +
      cr.toFixed(1) +
      ' percent with net growth of ' +
      net +
      ' subscriptions. Implied lifespan is ' +
      life.toFixed(1) +
      ' months, which is the figure to use in the LTV tool rather than an assumed retention rate.';
  }
}
['sb-act', 'sb-new', 'sb-vol', 'sb-inv', 'sb-val', 'sb-rec'].forEach((id) => {
  $(id).addEventListener('input', calcSubs);
});

/* ================= GATEWAY PRODUCT ================= */
var GPN = ['Emergency kit', 'Core supplements', 'Skincare', 'Wellness Farms', 'Membership'];
function calcGateway() {
  var best = { s: -1, i: 0 },
    rows = [];
  for (var i = 1; i <= 5; i++) {
    var a = +$('gp-a' + i).value || 0,
      m = (+$('gp-m' + i).value || 0) / 100,
      r = (+$('gp-r' + i).value || 0) / 100,
      c = +$('gp-c' + i).value || 1;
    var orders = 1 + r * 1.6;
    var v12 = a * m * orders;
    var score = v12 / c;
    $('gp-v' + i).textContent = '$' + v12.toFixed(0);
    $('gp-s' + i).textContent = score.toFixed(2);
    if (score > best.s) best = { s: score, i: i };
    rows.push({ n: GPN[i - 1], v: v12, c: c, s: score, r: r });
  }
  rows.sort((x, y) => y.s - x.s);
  var top = rows[0],
    second = rows[1];
  var n = $('gp-note');
  n.className = 'note good';
  n.textContent =
    top.n +
    ' returns ' +
    top.s.toFixed(2) +
    ' times its acquisition cost over twelve months, ahead of ' +
    second.n +
    ' at ' +
    second.s.toFixed(2) +
    '. That makes it the acquisition entry point even if another product carries a higher margin, because the repeat behaviour compounds and the margin does not. ' +
    'The check to run before committing is whether the learning threshold supports it: a high value per customer is worthless if the CPA is high enough that the budget cannot feed a single ad set. Take the ratio to the Budget tab before acting on it.';
}
for (var _g = 1; _g <= 5; _g++) {
  ['a', 'm', 'r', 'c'].forEach((k) => {
    var id = 'gp-' + k + _g;
    if ($(id)) $(id).addEventListener('input', calcGateway);
  });
}

/* ================= STORE FUNNEL ================= */
function calcStoreFunnel() {
  var v = [
    +$('cf-s').value || 0,
    +$('cf-p').value || 0,
    +$('cf-c').value || 0,
    +$('cf-k').value || 0,
    +$('cf-o').value || 0,
  ];
  var names = ['Sessions', 'Product views', 'Added to cart', 'Reached checkout', 'Purchases'];
  var bm = [null, [55, 75], [8, 14], [55, 70], [50, 65]];
  var worst = { gap: 0, i: 0 };
  var rows = '';
  for (var i = 0; i < 5; i++) {
    var rate = i ? (v[i - 1] ? (v[i] / v[i - 1]) * 100 : 0) : 100;
    var b = bm[i],
      read = '—',
      col = 'inherit';
    if (b) {
      if (rate < b[0]) {
        read = 'Below benchmark';
        col = 'var(--fail)';
        var g = (b[0] - rate) / b[0];
        if (g > worst.gap) worst = { gap: g, i: i };
      } else if (rate > b[1]) {
        read = 'Above benchmark';
        col = 'var(--pass)';
      } else {
        read = 'In range';
        col = 'inherit';
      }
    }
    rows +=
      '<tr><td>' +
      names[i] +
      '</td><td class="num">' +
      v[i].toLocaleString() +
      '</td>' +
      '<td class="num" style="color:' +
      col +
      '">' +
      (i ? rate.toFixed(1) + '%' : '—') +
      '</td>' +
      '<td class="num">' +
      (b ? b[0] + ' to ' + b[1] + '%' : '—') +
      '</td><td style="font-size:12.5px">' +
      read +
      '</td></tr>';
  }
  $('cf-rows').innerHTML = rows;
  var overall = v[0] ? (v[4] / v[0]) * 100 : 0;
  var n = $('cf-note');
  if (worst.gap > 0) {
    var fixes = [
      '',
      'Product view rate is low, which is a landing page or catalog problem rather than a media one. Paid traffic that does not reach a product page was mispriced at the click.',
      'Add to cart rate is the offer and the product page. On this catalog it is also where an undisclosed delivery timeline starts costing conversions.',
      'Checkout reach is where price and shipping become real. Confirm free shipping is visible before this step, not after it.',
      'Checkout completion is trust, payment friction and the one to two week Rx delivery expectation. This is the most expensive leak because you have already paid for everything upstream.',
    ][worst.i];
    n.className = 'note bad';
    n.textContent =
      'Overall session to purchase is ' +
      overall.toFixed(2) +
      ' percent. The largest gap against benchmark is at ' +
      names[worst.i].toLowerCase() +
      '. ' +
      fixes +
      ' Fix this before spending more on traffic, because every additional session pays the same toll.';
  } else {
    n.className = 'note good';
    n.textContent =
      'Overall session to purchase is ' +
      overall.toFixed(2) +
      ' percent, and every step sits within or above benchmark. If CPA is rising with this funnel intact, the cause is upstream in the auction or the creative rather than on the store.';
  }
}
['cf-s', 'cf-p', 'cf-c', 'cf-k', 'cf-o'].forEach((id) => {
  $(id).addEventListener('input', calcStoreFunnel);
});

/* ================= ORDER TAG SCHEMA ================= */
$('sh-tags').textContent =
  'ORDER TAG SCHEMA\n\n' +
  'WRITTEN AT ORDER CREATION\n' +
  '  src_meta                 order attributed to Meta\n' +
  '  src_email · src_sms      owned channel\n' +
  '  src_organic              no paid touch\n' +
  '  camp_[campaign_name]     full Meta campaign name\n' +
  '  creative_[creative_id]   full creative ID\n\n' +
  'WRITTEN AT FULFILMENT\n' +
  '  rx_pending               paid, awaiting clinical approval\n' +
  '  rx_approved              provider approved\n' +
  '  rx_shipped               FIRE THE CONVERSION HERE\n' +
  '  rx_declined              paid, never fulfilled, treat as refund\n\n' +
  'CUSTOMER TAGS\n' +
  '  member_select · member_premier · member_elite\n' +
  '  kit_owner                for the 120-180d replenishment window\n' +
  '  app_user                 written back from Firebase\n' +
  '  high_value               lifetime spend above threshold\n' +
  '  lapsed_365               suppression list membership\n\n' +
  'WHY THE RX SPLIT MATTERS\n' +
  '  Payment precedes clinical approval on this funnel.\n' +
  '  Firing Purchase at payment trains delivery toward orders\n' +
  '  that may never ship, and nothing downstream corrects it.\n' +
  '  rx_declined orders belong in the refund calculation, not\n' +
  '  in revenue.\n\n' +
  'RECONCILIATION QUERY\n' +
  '  Orders where tag contains src_meta, by created_at,\n' +
  '  compared against Meta purchases for the same window\n' +
  '  in the ad account timezone, not the store timezone.';

/* ================= SCENARIOS ================= */
var SCEN = [
  {
    k: 'winner',
    n: 'A creative is winning and budget is available',
    sit: 'One asset has cleared the graduation criteria and the account has room to spend more.',
    chk: [
      'Has CPA held at or below target for fourteen consecutive days, not fourteen days somewhere in the month?',
      'Is marginal CPA on the last increment still acceptable, or is the blend hiding decay?',
      'Is there a second validated creative, so a fatigue event does not collapse volume?',
      'Have the conversions been confirmed in the back end rather than trusted from Ads Manager?',
    ],
    play: [
      'Move the winner into the scaling campaign at a controlled share, not at full weight. Winning a controlled ABO test does not prove it holds under CBO allocation against established performers.',
      'Increase budget by 20 to 25 percent in one step.',
      'Wait 48 to 72 hours. Do not touch anything inside the cooldown.',
      'Re-measure marginal CPA on the new increment before deciding whether to repeat.',
      'Run the next batch in parallel so the successor is already validated when this one fatigues.',
    ],
    dont: [
      'Do not triple the budget. A large jump pushes the ad set back into learning and undoes the thing you were scaling.',
      'Do not pause the previous creative to make room. Cap live creatives at six to eight and let the weak ones starve naturally.',
      'Do not stop the testing cycle because scaling is going well. That is exactly when the pipeline empties.',
    ],
    exp: 'Marginal CPA rises modestly at each step. Expect the ceiling somewhere between two and three times current spend on a single lane before creative volume becomes the binding constraint rather than budget.',
  },
  {
    k: 'cparise',
    n: 'CPA is rising at current spend',
    sit: 'Nothing changed structurally and efficiency is deteriorating.',
    chk: [
      'Compare Meta against Shopify for the same window. If Shopify is flat and Meta looks worse, this is a tracking fault and every campaign change you make will be wrong.',
      'Check account health. A disapproval shifts delivery before any other metric moves.',
      'Then work down the funnel: CPM, CTR, landing page view rate, add to cart, checkout, purchase.',
    ],
    play: [
      'Locate the single step where the rate broke, not the metric that looks worst.',
      'If CPM rose with CTR holding, this is auction or saturation. Check frequency and reach against audience size.',
      'If CTR fell with CPM flat, this is creative. Validate by putting fresh assets into comparable delivery before retiring anything.',
      'If the funnel rates held and CPA still rose, the mix shifted. Check the prospecting and retargeting split.',
      'Change one thing, then wait a full delivery cycle before changing another.',
    ],
    dont: [
      'Do not pause campaigns as a first response. Pausing resets learning and destroys the evidence you need.',
      'Do not increase budget to "get out of learning faster". That compounds the loss.',
      'Do not change creative, audience and budget in the same session. You will never know which one worked.',
    ],
    exp: 'A correctly diagnosed cause usually resolves within one delivery cycle. If three changes have been made and nothing improved, the cause was never diagnosed and the account is now harder to read than when you started.',
  },
  {
    k: 'empty',
    n: 'The creative pipeline is empty',
    sit: 'Winners are fatiguing and there is nothing validated behind them.',
    chk: [
      'How many days of runway does the current winner have at its fatigue trajectory?',
      'What is the real production turnaround, including compliance review?',
      'Is testing budget still ring-fenced, or has it been borrowed against during a soft week?',
    ],
    play: [
      'Reduce the fatiguing winner rather than pausing it. Pausing with no replacement collapses volume immediately.',
      'Pull the next batch forward. Ship the digital mock-up assets that need no shoot, since roughly a third of the deck can be produced in days.',
      'Re-cut existing winning footage into new hooks and formats. Three hook variants from one proven shoot is faster than a new concept.',
      'If production cannot sustain the cadence, extend the cycle to three weeks rather than shrinking the batch. A smaller batch produces unreadable results; a longer cycle only slows learning.',
    ],
    dont: [
      'Do not launch untested creative straight into the scaling campaign to fill the gap.',
      'Do not raid the testing budget to prop up scaling. That is how the pipeline emptied.',
    ],
    exp: 'This situation is always a symptom of testing budget having been treated as discretionary. Fixing it once is a production sprint. Preventing it is a standing rule.',
  },
  {
    k: 'doubled',
    n: 'Budget approved at double the current level',
    sit: 'More money has arrived than the account currently absorbs.',
    chk: [
      'At the new budget, how many ad sets clear the learning threshold at the lane CPA?',
      'Is the current lane at its efficiency ceiling, or is there genuine headroom?',
      'How many validated creatives exist? Below four, budget is not the constraint.',
    ],
    play: [
      'Do not deploy it all. Increase the existing scaling campaign by 25 percent and measure marginal CPA.',
      'Put the next tranche into creative production rather than media. Creative volume is almost always the binding constraint before audience size is.',
      'Only open a second lane once all four expansion gate criteria hold, and expect the blend to dip when it does.',
      'Hold a reserve. Emergency kits are the one lane with an event-driven demand curve and budget should be able to flex toward it at short notice.',
    ],
    dont: [
      'Do not open three lanes at once. Splitting a doubled budget across three cold lanes produces three learning-limited lanes and no learning.',
      'Do not treat the new budget as permanent when planning structure. A budget that arrives and then leaves is worse than one that never arrived, because the structure built for it will be wrong.',
    ],
    exp: 'Expect the blended figure to worsen briefly while new spend is absorbed. If it does not worsen at all, the account was underspending and the ceiling is further away than assumed.',
  },
  {
    k: 'cut',
    n: 'Budget cut by forty percent',
    sit: 'Spend has to come down and the structure was built for the old level.',
    chk: [
      'At the new budget, which lanes still clear the learning threshold?',
      'Which lane has the best value-to-CPA ratio, not the highest revenue?',
      'What is the retargeting pool doing? It depletes if prospecting stops feeding it.',
    ],
    play: [
      'Cut lanes, not budgets within lanes. Two properly fed lanes beat three starved ones.',
      'Keep the lane with the best ratio, and keep the unrestricted lane if creative learning matters more than short-term revenue.',
      'Move retargeting to email and SMS if the remaining paid budget cannot support it above the delivery floor.',
      'Protect the testing allocation proportionally. Cutting it to zero saves a little now and costs the next quarter entirely.',
    ],
    dont: [
      'Do not spread the reduced budget evenly across the existing structure. That is how every ad set ends up below threshold at once.',
      'Do not pause and restart lanes repeatedly to stretch budget. Each restart costs another learning cycle.',
    ],
    exp: 'Consolidating to fewer, better-fed lanes usually holds more volume than the cut implies, because delivery stability is worth more than surface area.',
  },
  {
    k: 'cpm',
    n: 'CPMs rose thirty percent across the account',
    sit: 'Costs rose on every campaign at once, which points outward rather than inward.',
    chk: [
      'Is this account-wide or lane-specific? Account-wide points at the auction, lane-specific points at saturation.',
      'Check frequency and reach against audience size. Rising frequency with rising CPM is saturation, not competition.',
      'Check the calendar. Seasonal auction pressure is predictable and temporary.',
    ],
    play: [
      'If frequency is rising, broaden. The problem is who you are reaching, not what you are showing them.',
      'If frequency is flat and CPM rose account-wide, this is the auction. Hold structure and let CTR carry the efficiency.',
      'Recalculate the affordable CPA at the new CPM. If the maths still works, ride it out. If it does not, reduce spend rather than restructuring.',
      'Consider whether AOV work can absorb the increase. Raising AOV by a third has the same effect on spending power as cutting CPA by a quarter.',
    ],
    dont: [
      'Do not rebuild the account in response to an auction shift. The structure was not the cause and rebuilding costs a learning cycle you will need when costs normalise.',
      'Do not chase cheaper placements at the cost of intent. Cheap reach that does not convert raises CPA while lowering CPM.',
    ],
    exp: 'Auction-driven CPM shifts typically normalise within two to six weeks. Saturation-driven ones do not normalise at all and require a broader audience.',
  },
  {
    k: 'gated',
    n: 'Meta authorization comes through for the Rx lane',
    sit: 'A gated lane becomes available and there is pressure to launch it immediately.',
    chk: [
      'Which domains does the authorization actually cover? Confirm in writing rather than by assumption.',
      'Is the conversion event set to approved and shipped, or is it still firing at payment?',
      'Does the destination expose disease-named navigation?',
      'Is the claims library complete for these products?',
    ],
    play: [
      'Fund from a reallocation with a defined ceiling, not an uncapped addition. Gated categories carry disproportionate account risk and the exposure should be bounded deliberately.',
      'Fix the conversion event first. Optimising to Purchase on this funnel trains delivery toward orders that never clear clinical approval.',
      'Build a dedicated destination that carries only approved claims for the advertised product.',
      'Geo-separate at campaign level, since Canada permits far less prescription messaging than the US.',
      'Put account health on the daily pass and treat any disapproval on this lane as an immediate escalation regardless of performance.',
    ],
    dont: [
      'Do not move the whole budget into it because the AOV is attractive. The highest AOV product is also the highest risk to the account.',
      'Do not reuse existing creative. The claim boundary is different and the review scrutiny is higher.',
    ],
    exp: 'Expect higher CPA than the unrestricted lanes and slower learning, because the CPA envelope requires more spend per ad set to clear the threshold.',
  },
  {
    k: 'seasonal',
    n: 'A seasonal or event-driven demand spike',
    sit: 'Preparedness demand rises on an external trigger and the window is short.',
    chk: [
      'Is inventory able to support the volume, including the one to two week Rx consultation lead time?',
      'Is there a validated creative that fits the moment, or would anything shipped now be untested?',
      'Is the seasonal reserve intact?',
    ],
    play: [
      'Deploy the reserve rather than reallocating from working lanes.',
      'Scale the existing winner rather than launching new creative into a short window. There is no time for a learning cycle.',
      'Raise budget in larger steps than normal, accepting worse marginal CPA, because the window closes.',
      'Set the exit in advance. Decide now what spend returns to on which date.',
    ],
    dont: [
      'Do not build new campaigns for a short window. The learning phase will consume most of it.',
      'Do not use urgency language tied to a health need. Urgency attaches to the offer, never to the need, because implying delay carries a health cost is a claim.',
    ],
    exp: 'Efficiency will be worse than baseline and volume materially higher. Judge the period on absolute contribution rather than on ROAS.',
  },
  {
    k: 'flat',
    n: 'Revenue is flat while ROAS looks healthy',
    sit: 'The efficiency numbers are fine and the business is not growing.',
    chk: [
      'What is the new customer share of purchases? Below seventy percent suggests retargeting is flattering the blend.',
      'Is the retargeting pool growing week on week, or depleting because prospecting stopped feeding it?',
      'Compare MER against platform ROAS. A wide gap means the platform view is more optimistic than the business result.',
    ],
    play: [
      'This is almost always cannibalisation. Enforce the prospecting and retargeting split with spend minimums and maximums.',
      'Check that prospecting excludes the retargeting pool. Without it you are paying prospecting rates for warm traffic and counting it as acquisition.',
      'Shift budget toward prospecting even though it will worsen blended CPA, because blended CPA is the number lying to you.',
      'Track new customer CPA separately from blended CPA permanently, not just during the investigation.',
    ],
    dont: [
      'Do not scale the retargeting campaign because it looks efficient. It is efficient because the audience was already acquired.',
      'Do not treat improving blended ROAS as evidence of health when volume is flat.',
    ],
    exp: 'Blended ROAS will fall when this is corrected. Revenue and new customer count will rise. That trade is the point, and it needs explaining before it happens rather than after.',
  },
  {
    k: 'restricted',
    n: 'The ad account is restricted',
    sit: 'Delivery has stopped and the account is under review.',
    chk: [
      'What was the stated reason, and does it name a specific ad, page or policy?',
      'What ran in the seventy-two hours before the restriction?',
      'Are the affiliate and personality destinations still live and unchanged?',
    ],
    play: [
      'Stop all spend rather than letting remaining budget run.',
      'Audit every destination, including ones media does not control. The trigger is frequently the landing page rather than the ad.',
      'Work the appeal once, through the proper channel, with the specific remediation described.',
      'Pause the highest-risk lanes permanently until the account is clear, regardless of their performance.',
    ],
    dont: [
      'Do not open a second ad account. That compounds the problem and is itself a policy breach.',
      'Do not relaunch the same creative under a new campaign name. The classifier is not matching on the name.',
    ],
    exp: 'Expect two to four weeks of disruption. Plan on the assumption that paid is unavailable for that period, and move budget to email, SMS and other channels rather than waiting.',
  },
];
function renderScen() {
  var k = $('sc-sel').value,
    sc = SCEN.filter((x) => x.k === k)[0] || SCEN[0];
  $('sc-out').innerHTML =
    '<div class="panel"><h3>Situation</h3><div style="font-size:14.5px">' +
    sc.sit +
    '</div>' +
    '<h3>First check, before any action</h3><div class="tw"><table><tbody>' +
    sc.chk
      .map(
        (c, i) =>
          '<tr><td class="num" style="width:34px">' + (i + 1) + '</td><td>' + c + '</td></tr>',
      )
      .join('') +
    '</tbody></table></div>' +
    '<h3>The play</h3>' +
    sc.play
      .map((pl, i) => '<div class="flag f-ok"><b>' + (i + 1) + '</b>' + pl + '</div>')
      .join('') +
    '<h3>Do not</h3>' +
    sc.dont.map((dn) => '<div class="flag f-high">' + dn + '</div>').join('') +
    '<div class="note warn"><b style="display:block;margin-bottom:3px">Expected trajectory</b>' +
    sc.exp +
    '</div></div>';
}
$('sc-sel').innerHTML = SCEN.map((x) => '<option value="' + x.k + '">' + x.n + '</option>').join(
  '',
);
$('sc-sel').addEventListener('change', renderScen);

/* ================= SCALING SIMULATOR ================= */
function calcSim() {
  var s0 = +$('sp-s0').value || 1,
    c0 = +$('sp-c0').value || 1,
    s1 = +$('sp-s1').value || 1,
    k = +$('sp-k').value || 0.2,
    mx = +$('sp-max').value || 1,
    aov = +$('sp-aov').value || 1;
  var rows = '',
    sp = s0,
    prevSp = 0,
    prevConv = 0,
    steps = 0,
    ceiling = s0;
  var ok = true;
  while (sp <= s1 * 1.26 && steps < 14) {
    var cpa = c0 * Math.pow(sp / s0, k);
    var conv = sp / cpa;
    var marg = prevSp ? (sp - prevSp) / Math.max(0.01, conv - prevConv) : cpa;
    var roas = cpa ? aov / cpa : 0;
    var good = cpa <= mx;
    if (good) ceiling = sp;
    rows +=
      '<tr' +
      (!good ? ' style="background:#fbeaea"' : '') +
      '><td class="num">' +
      steps +
      '</td>' +
      '<td class="num">' +
      money(sp) +
      '</td><td class="num">$' +
      cpa.toFixed(0) +
      '</td>' +
      '<td class="num">' +
      (steps ? '$' + marg.toFixed(0) : '—') +
      '</td>' +
      '<td class="num">' +
      roas.toFixed(2) +
      '</td>' +
      '<td>' +
      (good
        ? '<span class="pill p-scale">Within target</span>'
        : '<span class="pill p-kill">Above ceiling</span>') +
      '</td></tr>';
    prevSp = sp;
    prevConv = conv;
    sp = sp * 1.25;
    steps++;
  }
  $('sp-rows').innerHTML = rows;
  var cpaTarget = c0 * Math.pow(s1 / s0, k);
  $('sp-ceil').textContent = money(ceiling);
  $('sp-cpat').textContent = '$' + cpaTarget.toFixed(0);
  var need = Math.ceil(Math.log(s1 / s0) / Math.log(1.25));
  $('sp-steps').textContent = need;
  $('sp-wks').textContent = Math.ceil(need * 0.5) + ' wk';
  $('sp-cbox').className = 'stat ' + (ceiling >= s1 ? 'hi' : ceiling >= s1 * 0.6 ? 'md' : 'lo');
  var n = $('sp-note');
  if (ceiling >= s1) {
    n.className = 'note good';
    n.textContent =
      'The target of ' +
      money(s1) +
      ' daily sits inside the acceptable CPA ceiling, reaching roughly $' +
      cpaTarget.toFixed(0) +
      ' against a maximum of $' +
      mx +
      '. That is ' +
      need +
      ' increments of 25 percent with a 48 to 72 hour cooldown between each, so around ' +
      Math.ceil(need * 0.5) +
      ' weeks of stepping. Re-measure marginal CPA at every step rather than trusting the model, because elasticity is not constant and this curve is an assumption.';
  } else {
    n.className = 'note bad';
    n.textContent =
      'At an elasticity of ' +
      k +
      ', CPA passes the $' +
      mx +
      ' ceiling at roughly ' +
      money(ceiling) +
      ' daily, short of the ' +
      money(s1) +
      ' target. Projected CPA at target is $' +
      cpaTarget.toFixed(0) +
      '. Budget alone will not get there. The levers that move the ceiling are creative volume first, because a new validated creative reaches a different pocket of the same audience without raising marginal CPA, then AOV, then a second lane. More money into this structure buys progressively worse customers.';
  }
}
['sp-s0', 'sp-c0', 'sp-s1', 'sp-k', 'sp-max', 'sp-aov'].forEach((id) => {
  $(id).addEventListener('input', calcSim);
});

/* ================= LOOKER ================= */
$('lk-blend').textContent =
  'BLEND 1  ·  PERFORMANCE\n' +
  '  Left    Meta Ads          join key: campaign_name\n' +
  '  Right   Targets sheet     join key: lane (parsed)\n' +
  '  Type    Left outer\n' +
  '  Gives   Every campaign scored against its own lane target\n\n' +
  'BLEND 2  ·  RECONCILIATION\n' +
  '  Left    Shopify orders    join key: date\n' +
  '  Right   Meta Ads          join key: date\n' +
  '  Type    Full outer\n' +
  '  Gives   Daily delta between platform and back end\n' +
  '  WARNING Meta reports in the ad account timezone.\n' +
  '          Shopify reports in the store timezone.\n' +
  '          Align these before trusting a single row.\n\n' +
  'BLEND 3  ·  CREATIVE\n' +
  '  Left    Meta Ads          join key: ad_name\n' +
  '  Right   Creative ledger   join key: creative_id\n' +
  '  Type    Left outer\n' +
  '  Gives   Performance by concept, angle, hook and claim ref\n' +
  '          rather than by an opaque ad name\n\n' +
  'BLEND 4  ·  FUNNEL\n' +
  '  Left    GA4               join key: date + campaign\n' +
  '  Right   Meta Ads          join key: date + campaign_name\n' +
  '  Type    Left outer\n' +
  '  Gives   Platform funnel against on-site funnel side by side\n\n' +
  'JOIN INTEGRITY\n' +
  '  Campaign name is the key across every blend. Renaming a\n' +
  '  campaign after launch breaks the join silently and the row\n' +
  '  simply disappears. Lock names at creation.';

var LKC = {
  dims: {
    t:
      'DIMENSIONS PARSED FROM CAMPAIGN NAMES\n\n' +
      'Brand\n  REGEXP_EXTRACT(campaign_name, "^([A-Z]+)_")\n\n' +
      'Market\n  REGEXP_EXTRACT(campaign_name, "^[A-Z]+_([A-Z]{2})_")\n\n' +
      'Lane\n  REGEXP_EXTRACT(campaign_name, "^[A-Z]+_[A-Z]{2}_([A-Z0-9-]+)_")\n\n' +
      'Funnel stage\n  REGEXP_EXTRACT(campaign_name, "_(ACQ|RTG|RET|ACT)_")\n\n' +
      'Purpose\n  REGEXP_EXTRACT(campaign_name, "_(?:ACQ|RTG|RET|ACT)_([A-Z0-9-]+)_")\n\n' +
      'Budget type\n  REGEXP_EXTRACT(campaign_name, "_(CBO|ABO)")\n\n' +
      'Gated\n  REGEXP_CONTAINS(campaign_name, "_GATED$")\n\n' +
      'Audience, from ad set name\n  REGEXP_EXTRACT(adset_name, "^AS[0-9]{2}_([A-Z0-9-]+)")\n\n' +
      'Creative concept\n  REGEXP_EXTRACT(ad_name, "_C([0-9]{2})_")\n\n' +
      'Creative hook\n  REGEXP_EXTRACT(ad_name, "_H([0-9]{2})_")\n\n' +
      'Creative format\n  REGEXP_EXTRACT(ad_name, "_F([0-9]{2})_")',
    n: 'This is the entire payoff of the underscore convention. Nine dimensions from one field, with no lookup table and no manual tagging. It also means a naming mistake shows up as a null dimension rather than as a wrong number, which is the failure mode you want.',
  },
  eff: {
    t:
      'EFFICIENCY METRICS\n\n' +
      'CPA\n  SUM(spend) / SUM(purchases)\n\n' +
      'ROAS\n  SUM(purchase_value) / SUM(spend)\n\n' +
      'MER\n  SUM(shopify_revenue) / SUM(total_marketing_spend)\n\n' +
      'True ROAS\n  (SUM(shopify_revenue) - SUM(refunds) - SUM(rx_declined))\n  / SUM(spend)\n\n' +
      'CPA vs lane target\n  (SUM(spend)/SUM(purchases)) / MAX(target_cpa) - 1\n\n' +
      'New customer CPA\n  SUM(spend) / SUM(new_customer_orders)\n\n' +
      'Marginal CPA, week on week\n  (SUM(spend) - SUM(spend_prev))\n  / (SUM(purchases) - SUM(purchases_prev))\n\n' +
      'Contribution per order\n  AVG(order_value) * MAX(margin_pct) - (SUM(spend)/SUM(purchases))',
    n: 'New customer CPA next to blended CPA on the same scorecard is the single most useful pairing in the dashboard. When blended improves while new customer CPA worsens, retargeting is cannibalising and the blend is hiding it.',
  },
  fun: {
    t:
      'FUNNEL RATES\n\n' +
      'Landing page view rate\n  SUM(landing_page_views) / SUM(link_clicks)\n\n' +
      'LPV to add to cart\n  SUM(add_to_cart) / SUM(landing_page_views)\n\n' +
      'ATC to checkout\n  SUM(initiate_checkout) / SUM(add_to_cart)\n\n' +
      'Checkout completion\n  SUM(purchases) / SUM(initiate_checkout)\n\n' +
      'LPV to purchase\n  SUM(purchases) / SUM(landing_page_views)\n\n' +
      'Store session to purchase\n  SUM(shopify_orders) / SUM(ga4_sessions)\n\n' +
      'Funnel gap, platform vs store\n  (SUM(purchases) / SUM(landing_page_views))\n  - (SUM(shopify_orders) / SUM(ga4_sessions))',
    n: 'The last field is the one worth building. A persistent gap between the platform funnel and the store funnel is where attribution difference becomes a measurable number rather than an argument.',
  },
  rec: {
    t:
      'RECONCILIATION\n\n' +
      'Order delta\n  (SUM(meta_purchases) - SUM(shopify_orders))\n  / SUM(shopify_orders)\n\n' +
      'Revenue delta\n  (SUM(meta_revenue) - SUM(shopify_revenue))\n  / SUM(shopify_revenue)\n\n' +
      'Delta divergence, flags a value or currency fault\n  ABS(revenue_delta - order_delta)\n\n' +
      'Untagged order share\n  (SUM(shopify_orders) - SUM(orders_tagged_src_meta))\n  / SUM(shopify_orders)\n\n' +
      'Rx leakage\n  SUM(rx_declined_value) / SUM(shopify_revenue)\n\n' +
      'Reconciliation status\n  CASE\n    WHEN ABS(order_delta) <= 0.15 THEN "Normal attribution"\n    WHEN ABS(order_delta) <= 0.30 THEN "Investigate"\n    ELSE "Counting fault"\n  END',
    n: 'Order delta and revenue delta diverging by more than ten points points at a value or currency problem rather than a counting one. Building that as its own field saves the conversation every single week.',
  },
  flag: {
    t:
      'STATUS FLAGS\n\n' +
      'Learning status\n  CASE\n    WHEN SUM(purchases)/COUNT_DISTINCT(week) >= 50 THEN "Clear"\n    WHEN SUM(purchases)/COUNT_DISTINCT(week) >= 35 THEN "Marginal"\n    ELSE "Learning limited"\n  END\n\n' +
      'Frequency alert\n  CASE\n    WHEN frequency > 3.5 AND funnel_stage = "ACQ" THEN "Refresh"\n    WHEN frequency > 6.0 THEN "Saturated"\n    ELSE "OK"\n  END\n\n' +
      'Creative verdict\n  CASE\n    WHEN spend >= target_cpa*3 AND cpa <= target_cpa THEN "Scale"\n    WHEN spend >= target_cpa*3 AND ctr >= 1.2 THEN "Iterate"\n    WHEN spend < target_cpa*3 THEN "Retest"\n    ELSE "Kill"\n  END\n\n' +
      'Gated spend alert\n  CASE\n    WHEN REGEXP_CONTAINS(campaign_name,"_GATED$")\n         AND SUM(spend) > 0 AND authorization_confirmed = FALSE\n    THEN "STOP"\n    ELSE "OK"\n  END',
    n: 'The gated spend alert is worth building even though it should never fire. A campaign duplicated into a category it is not authorised for is a plausible mistake, and a dashboard that catches it costs nothing to build.',
  },
};
function renderLK() {
  var k = $('lk-sel').value;
  $('lk-calc').textContent = LKC[k].t;
  $('lk-note').textContent = LKC[k].n;
}
$('lk-sel').addEventListener('change', renderLK);

var LKPAGES = [
  [
    '01 Executive',
    'Scorecards for spend, revenue, purchases, CPA, ROAS, MER and new customer share, each with a week-on-week delta. One combo chart of spend against revenue over ninety days.',
    'Keep this to one screen. If a stakeholder has to scroll, they will read the first three numbers and form a view from those.',
  ],
  [
    '02 Lane performance',
    'Table by lane with spend, CPA against lane target, ROAS, purchases and share of budget. Conditional formatting on CPA against target, not against a fixed number.',
    'Lane-specific targets are the point. A single account CPA target would misprice a catalog where the envelope varies tenfold.',
  ],
  [
    '03 Creative leaderboard',
    'Blended with the creative ledger. Rows by creative ID with concept, angle, hook, format, spend, CTR, CPA, ROAS and verdict. Filter by batch.',
    'Sort on CPA by default, never on CTR. Sorting on CTR is how a leaderboard teaches a team the wrong lesson.',
  ],
  [
    '04 Funnel',
    'Platform funnel and store funnel side by side, with the gap as its own scorecard. Step rates against benchmark bands.',
    'Where the two disagree is usually where the truth is. Showing them separately is more useful than reconciling them into one number.',
  ],
  [
    '05 Cohorts',
    'From BigQuery. Revenue per acquired customer at month 0, 3, 6 and 12, by acquisition month. Retention curve overlay.',
    'This is the page that catches quality degradation while blended revenue is still rising. It is also the page nobody asks for until it is too late.',
  ],
  [
    '06 Reconciliation',
    'Daily Meta against Shopify, with the delta, the divergence flag and the untagged order share. Reconciliation status field as a scorecard.',
    'Put this in front of stakeholders deliberately. A dashboard that shows its own margin of error is trusted more than one that reports a single confident number.',
  ],
  [
    '07 Account health',
    'Disapprovals over time, restricted ads by lane, delivery status, frequency alerts and the gated spend alert.',
    'In a catalog with gated products a disapproval pattern is a leading performance indicator, not an administrative footnote.',
  ],
  [
    '08 Subscription and LTV',
    'MRR, active subscriptions, churn split into voluntary and involuntary, recoverable MRR, membership attach rate.',
    'Involuntary churn on its own scorecard is what turns a failed card from an accepted loss into a fixable one.',
  ],
];
$('lk-pages').innerHTML = LKPAGES.map(
  (p) =>
    '<div class="flag f-low"><b>' +
    p[0] +
    '</b>' +
    p[1] +
    '<div style="margin-top:7px;color:var(--ink-3)">' +
    p[2] +
    '</div></div>',
).join('');

var LKCHECK = [
  [
    'Meta Ads connector authorised at ad account level',
    1,
    'Page-level access misses campaigns and fails silently.',
  ],
  [
    'GA4 property connected, the commerce one only',
    1,
    'Never connect the clinical property to a shared dashboard.',
  ],
  [
    'BigQuery export enabled and receiving',
    1,
    'This is the reconciliation layer. Without it the delta conversation has no evidence.',
  ],
  ['Shopify export scheduled daily', 1, 'Financial source of truth. Everything else is a view.'],
  [
    'Targets sheet created, one row per lane',
    1,
    'Never hard-code a target into a calculated field. It will be wrong within a month and nobody will find it.',
  ],
  [
    'Creative ledger sheet with creative_id as key',
    0,
    'Turns an opaque ad name into concept, angle, hook and claim reference.',
  ],
  [
    'Timezone aligned between Meta and Shopify',
    1,
    'Meta reports in ad account timezone. Misalignment shows as a permanent phantom delta.',
  ],
  [
    'Campaign names locked, no renaming after launch',
    1,
    'Renaming breaks every blend silently and the row disappears rather than erroring.',
  ],
  [
    'Parsed dimensions tested against a null check',
    0,
    'A naming mistake should surface as a null dimension, so build a chart that counts them.',
  ],
  [
    'Data freshness indicator on every page',
    0,
    'A stale dashboard that looks live is worse than no dashboard.',
  ],
  [
    'Row-level access set if clinical data is anywhere near it',
    1,
    'Class B data does not belong in a shared reporting layer at all.',
  ],
];
var lkDone = {};
function renderLKCheck() {
  $('lk-list').innerHTML = LKCHECK.map((c, i) => {
    var on = lkDone[i];
    return (
      '<div class="chk' +
      (on ? ' ok' : '') +
      '"><input type="checkbox" data-lk="' +
      i +
      '"' +
      (on ? ' checked' : '') +
      '>' +
      '<div class="t">' +
      c[0] +
      '<small>' +
      c[2] +
      '</small></div>' +
      (c[1] ? '<span class="b">Required</span>' : '') +
      '</div>'
    );
  }).join('');
  var d = LKCHECK.filter((_, i) => lkDone[i]).length;
  var req = LKCHECK.filter((c, i) => c[1] && !lkDone[i]).length;
  $('lk-bar').style.width = (d / LKCHECK.length) * 100 + '%';
  var v = $('lk-verdict');
  if (req) {
    v.className = 'note bad';
    v.textContent =
      req +
      ' required item' +
      (req === 1 ? '' : 's') +
      ' outstanding. A dashboard built on an incomplete data layer will be wrong confidently, which is worse than being obviously broken, because people act on it.';
  } else if (d < LKCHECK.length) {
    v.className = 'note warn';
    v.textContent =
      'Required items clear. The remaining ones are quality of life and each one saves a recurring conversation.';
  } else {
    v.className = 'note good';
    v.textContent = 'Data layer complete. Build the pages.';
  }
}
$('lk-list').addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;
  lkDone[e.target.dataset.lk] = e.target.checked;
  renderLKCheck();
});
