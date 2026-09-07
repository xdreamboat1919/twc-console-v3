/* ================= SHOPIFY ================= */
var SHEX = {
  seed: {
    t: 'LOOKALIKE SEED, HIGH VALUE\n\nSHOPIFY ADMIN\n  Customers > Filter\n  Total spent  is greater than  200\n  Orders       is greater than  0\n  Export selected customers as CSV\n\nCOLUMNS TO KEEP\n  Email · Phone · First Name · Last Name\n  Country · Province · Total Spent · Orders Count\n\nMETA UPLOAD\n  Audiences > Create > Customer List\n  Map: email, phone, fn, ln, country, st\n  Include LTV column mapped to Total Spent\n  Do NOT pre-hash. Meta hashes on upload.\n\nTHEN\n  Create lookalike 1-2% from this list\n  Name: PR03_LAL-HIGHAOV-1-2\n\nREFRESH  Quarterly',
    n: 'Mapping Total Spent to the value column lets Meta build a value-based lookalike rather than a flat one, which weights the model toward the customers who actually carry margin. It is a single extra column and it materially changes the audience.',
  },
  excl: {
    t: 'SUPPRESSION LIST\n\nSHOPIFY ADMIN\n  Customers > Filter\n  Orders  is greater than  0\n  Export all customers as CSV\n\nMETA UPLOAD\n  Audiences > Customer List > SEG_ALL_PURCHASERS\n\nAPPLY AS EXCLUSION ON\n  Every prospecting campaign\n  Every retargeting ad set (purchasers 0-180d for kits,\n  0-30d for supplements)\n\nWHY\n  Prospecting must also exclude the retargeting pool.\n  Reaching a three-day-old visitor with prospecting budget\n  is retargeting priced as prospecting and counted as\n  new customer acquisition.\n\nREFRESH  Weekly',
    n: 'Refresh this weekly rather than monthly. A stale suppression list means you spend a month paying to reacquire customers you already have, and the cost is invisible because it lands in the new customer column.',
  },
  member: {
    t: 'MEMBERSHIP UPSELL\n\nSHOPIFY ADMIN\n  Customers > Filter\n  Orders  is greater than  0\n  Customer tag  does not contain  1wellness_member\n  Export selected customers as CSV\n\nMETA UPLOAD\n  Audiences > Customer List > SEG_NON_MEMBERS\n\nCAMPAIGN\n  TWC_US_1WELLNESS_ACQ_MEMBERSHIP_CBO\n  Optimise to the membership purchase event,\n  not to product Purchase.\n\nEXCLUDE  Existing members, permanently\n\nBID  Against subscription contribution, not first order.\n     This permits a materially higher CPA than product\n     acquisition and it is usually the underfunded campaign.',
    n: 'This is likely the highest-return export in the list. A membership acquisition looks expensive on first-order ROAS and cheap on lifetime contribution, so if the target is set on first purchase the account is under-bidding for its most valuable customers.',
  },
  lapsed: {
    t: 'REACTIVATION\n\nSHOPIFY ADMIN\n  Customers > Filter\n  Last order date  is before  [today minus 180 days]\n  Last order date  is after   [today minus 365 days]\n  Total spent  is greater than  250\n  Export selected customers as CSV\n\nMETA UPLOAD\n  Audiences > Customer List > SEG_HIGHVALUE_LAPSING\n\nSEQUENCE\n  1. Email and SMS first. Zero media cost.\n  2. Paid only against non-responders after 14 days.\n\nCREATIVE\n  Replenishment for kit owners.\n  What changed since they last bought.\n  Never a repeat of acquisition creative.',
    n: 'Running owned channels first and paid only against non-responders is the difference between reactivation being profitable and reactivation being a way to pay for customers you would have recovered for free.',
  },
  app: {
    t: 'APP ACTIVATION\n\nSHOPIFY ADMIN\n  Customers > Filter\n  Orders  is greater than  0\n  Customer tag  does not contain  app_user\n  Export selected customers as CSV\n\nMETA UPLOAD\n  Audiences > Customer List > SEG_CUSTOMERS_NO_APP\n\nCAMPAIGN\n  TWC_US_APP_ACT_ACTIVATION_ABO\n  Optimise to activation_complete, not to install.\n\nEXCLUDE  Existing app users, permanently\n\nWHY THIS AND NOT COLD INSTALLS\n  The onboarding path requires government ID and a selfie\n  before first value. Cold installs into that funnel produce\n  poor economics and worse reviews. These customers already\n  trust the brand, which is the whole barrier.',
    n: 'This requires the app to write back an app_user tag to the Shopify customer record. If that integration does not exist, building it is a prerequisite and it is a small job relative to what the activation campaign is worth.',
  },
};
function renderShopify() {
  var k = $('sh-sel').value;
  $('sh-out').textContent = SHEX[k].t;
  $('sh-note').textContent = SHEX[k].n;
}
$('sh-sel').addEventListener('change', renderShopify);
function calcShopRec() {
  var so = +$('sh-so').value || 0,
    sr = +$('sh-sr').value || 0,
    tg = +$('sh-tag').value || 0,
    mt = +$('sh-meta').value || 0;
  var aov = so ? sr / so : 0,
    over = so ? ((mt - so) / so) * 100 : 0,
    untag = so - tg,
    orgp = so ? ((so - tg) / so) * 100 : 0;
  $('sh-aov').textContent = aov ? '$' + aov.toFixed(0) : '—';
  $('sh-over').textContent = (over >= 0 ? '+' : '') + over.toFixed(1) + '%';
  $('sh-untag').textContent = untag.toLocaleString();
  $('sh-orgpct').textContent = orgp.toFixed(0) + '%';
  var a = Math.abs(over);
  $('sh-mbox').className = 'stat ' + (a <= 15 ? 'hi' : a <= 30 ? 'md' : 'lo');
  var n = $('sh-rnote');
  if (a <= 15) {
    n.className = 'note good';
    n.textContent =
      'Meta over-reports by ' +
      over.toFixed(0) +
      ' percent, which is inside normal attribution difference. Meta answers how many purchases were influenced within its window. Shopify answers how many transactions happened. Both are correct and they will not agree.';
  } else if (over > 0) {
    n.className = 'note bad';
    n.textContent =
      'Meta reports ' +
      over.toFixed(0) +
      ' percent more purchases than Shopify recorded orders. Beyond attribution difference, the usual causes in this account are subscription renewals firing the Purchase event, a thank-you page reload double counting, or Rx orders firing at payment rather than at fulfilment. Work those three before adjusting any campaign.';
  } else {
    n.className = 'note warn';
    n.textContent =
      'Shopify shows more orders than Meta reports, which usually means genuine organic or unattributed demand rather than a fault. ' +
      untag.toLocaleString() +
      ' orders carry no paid media tag, or ' +
      orgp.toFixed(0) +
      ' percent of the total. Confirm the tagging is complete before treating that as organic, because untagged paid orders look identical to organic ones.';
  }
}
['sh-so', 'sh-sr', 'sh-tag', 'sh-meta'].forEach((id) => {
  $(id).addEventListener('input', calcShopRec);
});
