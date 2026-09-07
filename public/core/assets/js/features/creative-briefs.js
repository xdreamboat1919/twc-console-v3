/* ================= BRIEFS ================= */
var BRIEFS = [
  {
    c: 'ind',
    id: 'IND-01',
    n: 'The shelf',
    h: 'There\u2019s a shelf in my house I hope I never open.',
    v: 'Dim hall closet shelf, kit among ordinary household items. Available light, not styled.',
    p: 'It sits between the spare towels and the Christmas decorations. Most months I forget it\u2019s there.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-03',
    note: 'No outcome implied. The tension is entirely in "hope I never," which is anticipation rather than a claim.',
  },
  {
    c: 'ind',
    id: 'IND-02',
    n: 'The cabinet audit',
    h: 'Most medicine cabinets hold three things.',
    sub: 'Painkillers, plasters, and something expired.',
    v: 'Split frame. Left, cluttered typical cabinet with expired boxes. Right, the kit, closed.',
    p: 'Ours did too. Then we actually looked.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-01',
    note: 'Observational about the category, never about the viewer. "Most cabinets" and not "your cabinet."',
  },
  {
    c: 'ind',
    id: 'IND-03',
    n: 'Distance',
    h: '41 minutes to the nearest 24-hour pharmacy.',
    v: 'Night map aesthetic. A pin, a route line, a time.',
    p: 'That\u2019s the actual number where I live. Worth knowing yours.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Pure logistics. The safest problem framing available for this product.',
  },
  {
    c: 'ind',
    id: 'IND-04',
    n: 'Authorship',
    h: 'Five physicians decided what goes in this box.',
    v: 'Kit contents flat-lay on a clean grid, overhead, clinical lighting. Every item visible.',
    p: 'A cardiologist, an epidemiologist, an emergency physician, an internist and a maternal medicine specialist.',
    cta: 'See the contents',
    d: 'LP-01',
    ac: 'AC-02',
    note: 'Physician claims sit in the review-required tier. Approve before production, not after.',
  },
  {
    c: 'ind',
    id: 'IND-05',
    n: 'The reframe',
    h: 'Preparedness isn\u2019t paranoia.',
    sub: 'It\u2019s just admitting logistics exist.',
    v: 'Kit on a kitchen counter beside ordinary items. Bright, domestic, unremarkable.',
    p: 'Pharmacies close. Weekends happen. That\u2019s the whole argument.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Directly disarms the main objection to this category. Test against IND-01 for the same slot.',
  },
  {
    c: 'ind',
    id: 'IND-06',
    n: 'Contents walkthrough',
    h: 'Here\u2019s exactly what\u2019s inside.',
    v: 'Overhead flat-lay, every item labelled with its name. No claims in the labels.',
    p: 'No mystery. The full list, and a guidebook that explains what each item is.',
    cta: 'See the full contents',
    d: 'LP-01',
    ac: 'AC-01, AC-04',
    note: 'Lowest-risk asset in the deck. Showing contents is factual. Keep this live as the safe default.',
  },
  {
    c: 'ind',
    id: 'IND-07',
    n: 'Scale',
    h: '1,000,000+',
    sub: 'Americans have one of these.',
    v: 'Kit, understated, large numeral treatment.',
    p: 'Turns out a lot of people had the same thought.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-07',
    note: 'Social proof by count. Verify the figure is currently substantiated before running.',
  },
  {
    c: 'ind',
    id: 'IND-08',
    n: 'Time',
    h: 'Bought it in March.',
    sub: 'Opened it in November.',
    v: 'Two dates, typographic, understated.',
    p: 'Eight months of forgetting it existed. Then one evening where it mattered that it did.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-03',
    note: 'Deliberately never says what happened in November. The restraint keeps it compliant and it is also what makes it work.',
  },
  {
    c: 'dir',
    id: 'DIR-01',
    n: 'The straight offer',
    h: 'The Medical Emergency Kit',
    sub: '$299.99 · Free US shipping',
    v: 'Product, clean white, centred. Price large.',
    p: 'Prescription medications, prescribed by a licensed provider, delivered to your door.',
    cta: 'Get the kit',
    d: 'LP-01',
    ac: 'AC-01, AC-05, AC-09',
  },
  {
    c: 'dir',
    id: 'DIR-02',
    n: 'Rating',
    h: '4.9 stars. 2,006 reviews.',
    v: 'Product with review stars and count, prominent.',
    p: 'Our most-reviewed product, by a distance.',
    cta: 'See why',
    d: 'LP-01',
    ac: 'AC-08',
    note: 'Star rating and count only. No review text on the image, because review text is where claims enter.',
  },
  {
    c: 'dir',
    id: 'DIR-03',
    n: 'Certification',
    h: 'LegitScript Certified.',
    sub: 'Prescribed by licensed providers.',
    v: 'Product with LegitScript badge treatment.',
    p: 'Every prescription goes through a licensed provider consultation before it ships.',
    cta: 'See how it works',
    d: 'LP-01',
    ac: 'AC-01, AC-06',
    note: 'Trust-led. Likely the strongest performer with cautious audiences and older demographics.',
  },
  {
    c: 'dir',
    id: 'DIR-04',
    n: 'Bundle',
    h: 'The kit, plus the two people add most.',
    sub: 'Save [$X] versus buying separately.',
    v: 'Kit plus two supplement bottles, grouped.',
    p: 'Same order, same delivery, one consultation.',
    cta: 'See the bundle',
    d: 'OP-01',
    ac: 'AC-01, AC-05',
    note: 'Value framing only. Never imply a combined effect.',
  },
  {
    c: 'dir',
    id: 'DIR-05',
    n: 'Membership',
    h: 'Members save 15%. On everything.',
    v: 'Kit with a 15% badge, membership tiers hinted.',
    p: 'If you order more than once a year, the maths works out.',
    cta: 'Compare memberships',
    d: 'OP-02',
    ac: 'Membership terms',
    note: 'Lowest claim exposure in the deck. Write it commercially rather than cautiously.',
  },
  {
    c: 'dir',
    id: 'DIR-06',
    n: 'Stock up',
    h: 'Stock up and save.',
    sub: 'Up to 50% off select products.',
    v: 'Multiple units, tiered discount graphic.',
    p: 'Add more, save more. Full tiers on the page.',
    cta: 'Shop the offer',
    d: 'OP-03',
    ac: 'Promotion terms',
    note: 'Only run while the promotion is genuinely live.',
  },
  {
    c: 'dir',
    id: 'DIR-07',
    n: 'Shipping',
    h: 'Free US shipping. No hidden fees.',
    v: 'Product with a plain shipping badge.',
    p: 'The price you see is the price you pay.',
    cta: 'Get the kit',
    d: 'LP-01',
    ac: 'AC-05',
    note: 'Simple, and it addresses the most common checkout objection on a $299 order.',
  },
  {
    c: 'dir',
    id: 'DIR-08',
    n: 'Replenishment',
    h: 'Running low?',
    sub: 'Replenish your kit.',
    v: 'Kit, partially used, with replacement items.',
    p: 'Reorder what you\u2019ve used, or set up replenishment and stop thinking about it.',
    cta: 'Replenish',
    d: 'OP-04',
    ac: 'AC-03',
    note: 'Customer audiences only. Exclude non-purchasers.',
  },
  {
    c: 'pa',
    id: 'PA-01',
    n: 'The hour',
    h: 'It\u2019s 2am.',
    sub: 'Urgent care opens at 8.',
    v: 'Phone screen, 2:14am, dark room.',
    p: 'Six hours is a long time to wait for something you could already have had at home.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Time and opening hours. No health state referenced anywhere.',
  },
  {
    c: 'pa',
    id: 'PA-02',
    n: 'The closure',
    h: 'Closed for the holiday weekend.',
    v: 'Pharmacy shutter, closed sign, daylight.',
    p: 'Four days. It\u2019s the kind of thing you only notice when it matters.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Pure logistics.',
  },
  {
    c: 'pa',
    id: 'PA-03',
    n: 'The trade',
    h: 'Three hours in a waiting room.',
    sub: 'Or a box on your shelf.',
    v: 'Split. Left, waiting room chairs. Right, kit on a shelf.',
    p: 'For situations where getting there isn\u2019t the straightforward option.',
    cta: 'See what\u2019s inside',
    d: 'LP-01',
    ac: 'AC-11',
    note: 'The primary text does the compliance work. It frames access, not substitution, matching the published disclaimer.',
  },
  {
    c: 'pa',
    id: 'PA-04',
    n: 'The distance',
    h: 'Four hours from the nearest pharmacy.',
    v: 'Rural road, long perspective, dusk.',
    p: 'Some people are. Preparation isn\u2019t optional when the logistics don\u2019t work.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Strong fit for rural and remote geographies. Worth a geo-split test.',
  },
  {
    c: 'cmp',
    id: 'CMP-01',
    n: 'Cabinet vs kit',
    h: 'What most people have. What\u2019s in the kit.',
    v: 'Two overhead flat-lays side by side, same lighting. Left, typical cabinet. Right, kit contents.',
    p: 'Same shelf. Different amount of thinking behind it.',
    cta: 'See the full contents',
    d: 'LP-01',
    ac: 'AC-01',
    note: 'Contents versus contents. Factual on both sides.',
  },
  {
    c: 'cmp',
    id: 'CMP-02',
    n: 'Which kit',
    h: 'Six kits. One of them is the right one.',
    v: 'Six kits in a row, labelled, with a simple comparison grid.',
    p: 'Household size, where it lives, and what you want covered. Three questions, one answer.',
    cta: 'Find your kit',
    d: 'LP-03',
    ac: 'AC-01',
    note: 'Drives the selector. Non-clinical inputs only.',
  },
  {
    c: 'cmp',
    id: 'CMP-03',
    n: 'Tier comparison',
    h: 'Medical. Contagion. Travel.',
    sub: 'Same idea, three different situations.',
    v: 'Three kits, escalating, with contents counts.',
    p: 'The difference is what\u2019s inside and where you\u2019re likely to need it.',
    cta: 'Compare',
    d: 'LP-03',
    ac: 'AC-01',
    note: 'Product tiers only. Never compare a kit to a medication or to a course of care.',
  },
  {
    c: 'cmp',
    id: 'CMP-04',
    n: 'Getting there',
    h: 'Getting there. Or already having it.',
    v: 'Two panels. Left, journey, waiting, time stamps. Right, shelf, kit, one step.',
    p: 'For the situations where getting there isn\u2019t practical.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'Frames access, never substitution. The primary text is load-bearing and must not be cut.',
  },
  {
    c: 'lofi',
    id: 'LOFI-01',
    n: 'Notes app',
    h: '(image carries it)',
    v: 'iOS Notes screenshot titled "hall closet". Items: spare bulbs, batteries, torch, the medical kit, dog\u2019s spare lead.',
    p: 'The list of things I keep in one place so I don\u2019t have to think about them.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-03',
    note: 'The product appears as one item among five. That is the mechanic. Do not centre it.',
  },
  {
    c: 'lofi',
    id: 'LOFI-02',
    n: 'Search screenshot',
    h: '(image carries it)',
    v: 'Phone search bar reading "urgent care near me open now". Results blurred. Time visible, late.',
    p: 'Everyone has typed this at least once.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-11',
    note: 'No health term in the search string. "Urgent care" is a place, not a condition.',
  },
  {
    c: 'lofi',
    id: 'LOFI-03',
    n: 'Shelf photo',
    h: '(no headline)',
    v: 'Genuine phone photo. Kit on a shelf, slightly off-centre, household clutter visible. No styling.',
    p: 'Been there since March. Hasn\u2019t moved.',
    cta: 'See what\u2019s inside',
    d: 'LP-01',
    ac: 'AC-03',
    note: 'Deliberately imperfect. If it looks art directed it stops working.',
  },
  {
    c: 'lofi',
    id: 'LOFI-04',
    n: 'Handwritten',
    h: '(image carries it)',
    v: 'Lined paper, biro, photographed at an angle. "things to sort before winter" with the kit written third of five, ticked.',
    p: 'Third on the list. Took ten minutes.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-03',
    note: 'Same mechanic as LOFI-01. Product as one item in a life, not the subject.',
  },
  {
    c: 'lofi',
    id: 'LOFI-05',
    n: 'Text thread',
    h: '(image carries it)',
    v: 'Message thread. "did you ever get that kit thing" / "yeah last spring" / "worth it?" / "haven\u2019t thought about it since, which I think is the point"',
    p: 'The best purchases are the ones you forget about.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-03',
    note: 'CRITICAL. The reply must never describe using it or an outcome. "Haven\u2019t thought about it since" is the entire safe payload.',
  },
  {
    c: 'lofi',
    id: 'LOFI-06',
    n: 'Sticky note',
    h: '(image carries it)',
    v: 'Yellow sticky on a fridge reading "kit arrives tues", fridge-magnet aesthetic around it.',
    p: 'Ordered on a Sunday. Arrived the following week.',
    cta: 'Learn more',
    d: 'LP-02',
    ac: 'AC-10',
    note: 'Reinforces the delivery timeline honestly, which reduces post-purchase complaints.',
  },
  {
    c: 'lofi',
    id: 'LOFI-07',
    n: 'Mid-unbox',
    h: '(no headline)',
    v: 'Box half open on a kitchen table, contents partially visible, natural light, hand in frame.',
    p: 'Opened it to check what was actually in there.',
    cta: 'See the full contents',
    d: 'LP-01',
    ac: 'AC-01, AC-04',
    note: 'Curiosity through partial reveal. Pairs directly with the contents block on LP-01.',
  },
  {
    c: 'lofi',
    id: 'LOFI-08',
    n: 'Packing',
    h: '(no headline)',
    v: 'Open suitcase, clothes, travel kit tucked at the side. Phone photo, overhead, unstyled.',
    p: 'Goes in every time now. Takes up less room than a pair of shoes.',
    cta: 'Learn more',
    d: 'LP-03',
    ac: 'AC-01',
    note: 'Routes to the selector, since this frames the Travel Kit specifically.',
  },
];
var BRDESC = {
  all: 'Thirty-two briefs across five registers. Batch one should mix registers rather than test within one, because the first question is not which indirect hook works but whether this audience responds to indirect, problem-aware or direct framing.',
  ind: 'Idea first, product second. Built for cold traffic, and the destination is usually the advertorial because these viewers need context before an offer.',
  dir: 'Product, price and CTA forward. Built for warm traffic and retargeting.',
  pa: 'The most compliance-sensitive category in the deck. The problem is always access, logistics, timing or distance. It is never a symptom, condition or health state. Nothing here references fever, infection or illness, and that omission is deliberate rather than an oversight.',
  cmp: 'Contents against contents, or product tier against product tier. The comparison deliberately not written is kit against a medication or a course of care, because comparison to medication is review-required and there is no version worth the risk.',
  lofi: 'Native and unpolished, built to read as organic content. One rule across all eight: no fabricated testimonial and no screenshot implying a product worked for someone. The low-fi aesthetic makes claims feel casual and therefore more dangerous, not less.',
};
var brKey = 'all';
function renderBriefs() {
  $('br-desc').textContent = BRDESC[brKey];
  var list = brKey === 'all' ? BRIEFS : BRIEFS.filter((b) => b.c === brKey);
  $('br-list').innerHTML = list
    .map(
      (b) =>
        '<div class="panel" style="margin-bottom:12px;padding:16px 18px">' +
        '<div class="row" style="justify-content:space-between;margin-bottom:10px">' +
        '<span style="font-family:var(--mono);font-size:13px;font-weight:650;color:var(--act)">' +
        b.id +
        '</span>' +
        '<span style="font-size:13px;color:var(--ink-3)">' +
        b.n +
        '</span></div>' +
        '<div style="font-size:17px;font-weight:640;line-height:1.35;margin-bottom:' +
        (b.sub ? '2px' : '10px') +
        '">' +
        b.h +
        '</div>' +
        (b.sub
          ? '<div style="font-size:15px;color:var(--ink-2);margin-bottom:10px">' + b.sub + '</div>'
          : '') +
        '<div class="tw"><table><tbody>' +
        '<tr><td style="width:110px;color:var(--ink-3);font-size:12.5px">Visual</td><td style="font-size:13px">' +
        b.v +
        '</td></tr>' +
        '<tr><td style="color:var(--ink-3);font-size:12.5px">Primary text</td><td style="font-size:13px">' +
        b.p +
        '</td></tr>' +
        '<tr><td style="color:var(--ink-3);font-size:12.5px">CTA</td><td style="font-size:13px">' +
        b.cta +
        '</td></tr>' +
        '<tr><td style="color:var(--ink-3);font-size:12.5px">Destination</td><td style="font-size:13px;font-family:var(--mono)">' +
        b.d +
        '</td></tr>' +
        '<tr><td style="color:var(--ink-3);font-size:12.5px">Claim ref</td><td style="font-size:13px;font-family:var(--mono)">' +
        b.ac +
        '</td></tr>' +
        '</tbody></table></div>' +
        (b.note
          ? '<div class="note' +
            (b.note.indexOf('CRITICAL') === 0 ? ' bad' : '') +
            '" style="margin-top:10px">' +
            b.note +
            '</div>'
          : '') +
        '</div>',
    )
    .join('');
}
$('br-tabs').addEventListener('click', (e) => {
  var b = e.target.closest('.tab');
  if (!b) return;
  Array.prototype.forEach.call($('br-tabs').children, (x) => {
    x.classList.remove('on');
  });
  b.classList.add('on');
  brKey = b.dataset.b;
  renderBriefs();
});
