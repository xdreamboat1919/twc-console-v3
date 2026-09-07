/* ================= ROUTINES ================= */
var checked={};
var ROUTINES={
 daily:{t:'Daily pass',n:'Nothing else. The most expensive habit in a small account is daily optimisation of a system that has not accumulated enough data to be optimised. At twelve conversions a day, most single-day movement is noise, and acting on it produces worse outcomes than acting on nothing.',
  i:[['Account health','Disapprovals, restrictions, policy notifications. First, always. A disapproval shifts delivery before any other metric looks wrong.'],
     ['Daily performance','Enter or import yesterday by campaign, including backend orders and revenue wherever available.'],
     ['Spend pacing','Yesterday against plan. Tolerance is plus or minus 15 percent. Inside that band, do nothing.'],
     ['Exception queue','Work only threshold breaches and outliers. Diagnose first, assign an action, and schedule its recheck.'],
     ['Stop','Close the tab. Resist the fifth item.']]},
 weekly:{t:'Weekly review',n:'The report determines what gets made and what gets built next. If it only explains what happened, it is documentation rather than a management tool.',
  i:[['Full funnel review','CPM, CTR, CPC, landing page views, add to cart, initiate checkout, purchase, conversion rate.'],
     ['Creative leaderboard','By creative ID, ranked on CPA, not on CTR.'],
     ['Back-end reconciliation','Meta against Shopify. Understand the delta rather than arguing about which is right.'],
     ['Prospecting against retargeting','Is the blend hiding cannibalisation? Blended CPA improving while new customer CPA worsens is the signal.'],
     ['Frequency','Prospecting above 2.5 in a seven-day window is a refresh signal.'],
     ['Audience sizes','Are retargeting pools growing from prospecting, or depleting?'],
     ['Account health patterns','Not individual disapprovals. The pattern across them.'],
     ['Decision trail','Review open actions, changes past cooldown, and experiments due for a read.'],
     ['Actions','Scale, hold, pause, iterate, investigate. Write them down with an owner and recheck date.']]},
 fortnightly:{t:'Batch cycle',n:'Production always runs one batch ahead. Without the overlap the pipeline stalls for a fortnight each cycle and the testing budget sits idle.',
  i:[['Day 14 read','Every creative classified. Scale, iterate, retest or kill.'],
     ['Back-end verification','Confirm graduating creatives produced orders that actually shipped, not just Purchase events.'],
     ['Graduate','Winners into the scaling campaign at a controlled share, not full weight.'],
     ['Ledger','Losers archived with a stated hypothesis for why they failed.'],
     ['Launch next batch','Day 15. Next batch enters production the same day.']]},
 monthly:{t:'Monthly review',n:'The ad set count audit is the one that saves the account. Accounts accrete ad sets and never remove them, and six months in the budget is spread across fifteen ad sets that have none of them exited learning.',
  i:[['Cohort review','Revenue by acquisition month, repeat purchase rate.'],
     ['Marginal CPA curve','Is each new dollar still efficient, or is the aggregate hiding decay?'],
     ['Ad set count audit','Against the learning threshold. If the count exceeds what the budget can feed, the fix is deletion, not optimisation.'],
     ['Creative ledger','What we now know. What we test next.'],
     ['Expansion gate','Against the four criteria. All four, or no expansion.'],
     ['Lookalike refresh','Quarterly, reviewed monthly. A seed built in month two is stale by month eight.'],
     ['Compliance review','Disapproval patterns and destination drift.']]}
};
var rtKey='daily'; var rtDone={};
function renderRoutine(){
  var R=ROUTINES[rtKey];
  $('rt-title').textContent=R.t;
  $('rt-list').innerHTML=R.i.map(function(it,i){
    var k=rtKey+'-'+i, on=rtDone[k];
    return '<div class="chk'+(on?' ok':'')+'"><input type="checkbox" data-k="'+k+'"'+(on?' checked':'')+'>'+
      '<div class="t">'+it[0]+'<small>'+it[1]+'</small></div></div>';
  }).join('');
  var d=R.i.filter(function(_,i){return rtDone[rtKey+'-'+i]}).length;
  $('rt-count').textContent=d+' of '+R.i.length;
  $('rt-bar').style.width=(d/R.i.length*100)+'%';
  $('rt-note').className='note'+(d===R.i.length?' good':'');
  $('rt-note').textContent=d===R.i.length?'Pass complete. '+R.n:R.n;
}
$('rt-tabs').addEventListener('click',function(e){
  var b=e.target.closest('.tab'); if(!b)return;
  Array.prototype.forEach.call($('rt-tabs').children,function(x){x.classList.remove('on')});
  b.classList.add('on'); rtKey=b.dataset.r; renderRoutine();
});
$('rt-list').addEventListener('change',function(e){
  if(e.target.type!=='checkbox')return;
  rtDone[e.target.dataset.k]=e.target.checked; renderRoutine();
});

/* ================= WORKFLOWS ================= */
var FLOWS={
 launch:{t:'Launch a lane',n:'Seven steps. Steps one to three are gates and cannot be skipped, because each one can invalidate everything downstream.',
  s:[
   ['Confirm eligibility','Is this lane gated?','track',
    'Establish whether the product needs LegitScript certification plus separate written Meta authorization. Certification alone is not sufficient. Confirm which domains the authorization covers.<br><br>If the lane is gated and authorization is not confirmed in writing, stop. Building a campaign you cannot run wastes the build and risks a restriction if it launches by mistake.',
    'Authorization confirmed in writing, or the lane is ungated.'],
   ['Verify tracking','Nine blocking items','routine',
    'Pixel firing, CAPI receiving, deduplication on <em>every</em> event, purchase value accurate, currency correct, renewals firing a distinct event, Rx conversion set to fulfilment, domain verified, aggregated event measurement configured.<br><br>Deduplication is commonly implemented on Purchase and forgotten on AddToCart and InitiateCheckout. Purchase then looks clean while every mid-funnel rate is inflated.',
    'All nine blocking items clear. Spending against broken tracking produces four weeks of decisions made on corrupted data.'],
   ['Size the budget','How many ad sets can this feed?','budget',
    'Enter daily budget and the lane target CPA. The tool returns the maximum number of ad sets that can clear the fifty-conversion weekly threshold.<br><br>If the answer is one, the concept test collapses to a single ad set with creatives competing at the ad level. That is the correct trade at that budget, not a compromise to argue about.',
    'You know how many ad sets this budget supports. Do not build more than that number.'],
   ['Generate the structure','Campaign tree with budgets','build',
    'Pick the lane, market, daily budget and phase. The generator returns the full tree with ad set budgets, audiences, exclusions and settings.<br><br>Month one is always ABO with highest-volume bidding and no cap. A cost cap set from a guess causes underdelivery, and underdelivery at cold start means the model never builds.',
    'Structure generated and the naming convention applied.'],
   ['Build audiences and exclusions','Even the empty ones','ref',
    'Create every audience on day one, including the ones that will not populate for weeks, so they fill from launch rather than from whenever you remember.<br><br>Exclusions matter more than audiences here. Prospecting must exclude the retargeting pool, or budget spent reaching a three-day-old visitor is retargeting priced as prospecting and counted as new customer acquisition.',
    'Exclusions applied at ad set level, not campaign level.'],
   ['Brief creative','Batch size, not production capacity','creative',
    'Batch size is set by confidence per creative. Testing budget divided by three times target CPA gives the maximum readable batch. Six confident decisions beat eighteen ambiguous ones.<br><br>Every brief carries the approved claim reference it is built on, so compliance is auditable at asset level rather than discoverable at review.',
    'Creative briefed with claim references, and production has confirmed it can sustain the cadence.'],
   ['Pre-flight and launch','Copy check, then go','comp',
    'Run every asset through the copy check. Second person plus a health state, and any testimonial describing use, are the two failures that account for most disapprovals in this category.<br><br>Confirm paid traffic lands on a dedicated page rather than the storefront. A compliant ad landing on a page with disease-named navigation still carries that into review.',
    'Zero blocking flags, dedicated landing page live, launch.']]},
 cycle:{t:'Fortnightly creative cycle',n:'Fourteen days, repeating. The single hardest discipline is doing nothing on day nine.',
  s:[
   ['Day 1, launch','Batch enters, next batch enters production','creative',
    'Batch N goes live in the testing campaign. Batch N+1 enters production the same day. Without that overlap the pipeline stalls for a fortnight every cycle.',
    'Batch live and approved. Next batch briefed.'],
   ['Day 3 to 4, delivery check','Nothing killed','routine',
    'Confirm ads are approved and delivering, spend is pacing, and events are arriving with correct values. Change nothing else.',
    'Delivering and tracking correctly.'],
   ['Day 7, mid-point read','Directional only','creative',
    'Rank on cost per purchase, with CTR and landing page rate as supporting signals. Do not act on the ranking.<br><br>The only intervention permitted is pausing a creative that has spent past 1.5 times target CPA with zero conversions. A concept that looks poor on day nine frequently recovers by day fourteen, and one killed on day nine cannot.',
    'Read taken. Nothing changed except confirmed non-starters.'],
   ['Day 12, next batch in review','Compliance pass on raw footage','comp',
    'Batch N+1 assets delivered and through compliance. Review raw footage before edit rather than after, because catching a claim at edit stage means the shoot is already paid for.',
    'Next batch approved and ready.'],
   ['Day 14, classify','Every asset gets a verdict','creative',
    'Scale, iterate, retest or kill. Then verify against the back end before graduating anything, because a creative can win on Purchase while producing orders that never ship.',
    'Every asset classified and the ledger updated, including the kills.'],
   ['Day 15, launch next','Cycle repeats','creative',
    'Winners into the scaling campaign at a controlled share rather than full weight. Winning a controlled ABO test does not prove a creative holds under CBO allocation against established performers.',
    'Next batch live. Return to step one.']]},
 scale:{t:'Scale a winner',n:'Four conditions, all of them. Failing any one means the answer is creative rather than budget.',
  s:[
   ['Check the fourteen-day record','CPA at or below target','budget',
    'Not the month average. Fourteen consecutive days at or below the lane target. A single strong week inside a weak month is not a scaling signal.',
    'Fourteen consecutive days at target.'],
   ['Check marginal CPA','Not blended','econ',
    'Enter spend and conversions before and after the last increment. Blended ROAS can look excellent while every new dollar is materially less efficient, and the aggregate hides it.<br><br>If marginal CPA is above target while blended still looks fine, the ceiling has been reached.',
    'Marginal CPA at or below target on the last increment.'],
   ['Check the creative pipeline','Two validated, not one','creative',
    'Single-creative dependency is fragile. If it fatigues with nothing validated behind it, volume collapses and there is no replacement ready.',
    'Two or more validated creatives live.'],
   ['Check learning state','Out, not in','diag',
    'Increasing budget mid-learning extends learning. Wait for it to stabilise first.',
    'Ad set out of the learning phase.'],
   ['Increase 20 to 25 percent','One step only','budget',
    'One increment, then a 48 to 72 hour cooldown before re-measuring marginal CPA. Larger jumps can push the ad set back into learning and undo the thing you were scaling.',
    'One step taken. Cooldown running. Do not increase again inside it.'],
   ['Re-measure','Then decide again','econ',
    'After the cooldown, recompute marginal CPA on the new increment. If it held, repeat. If it did not, roll back and work the creative pipeline instead.',
    'Marginal CPA measured on the new level.']]},
 newprod:{t:'Add a new product',n:'Given the observed NPD rate, this needs to be a repeatable operation rather than a creative emergency each time.',
  s:[
   ['Classify the product','Which tier?','ref',
    'Six tiers, from unrestricted through to prescription. The tier decides the CPA envelope, the creative constraints and whether the product can carry Meta spend at all.<br><br>Tier five has no lane. The constraint there is the claim rather than the category, and no structure resolves it.',
    'Tier assigned and CPA envelope known.'],
   ['Set economics','Per lane, never per account','econ',
    'Price, cost of goods, fulfilment, fees. The tool returns break-even ROAS and affordable CPA.<br><br>The CPA envelope varies roughly tenfold across this catalog. A single account-level target would misprice most of it.',
    'Break-even ROAS and target CPA set for this product.'],
   ['Decide the home','New lane or existing campaign?','budget',
    'A new SKU inside an existing lane inherits the audience and the learning. A new lane starts cold and needs its own threshold budget.<br><br>Split by sub-family only where volume justifies it. Three under-fed campaigns perform worse than one well-fed one.',
    'Home decided, and if it is a new lane, budget clears the threshold.'],
   ['Run the launch pack','Standing template, not bespoke','creative',
    'One product demonstration, one physician or founder explainer, two UGC first impressions, one ingredient or contents explainer, one static offer, three hook variants on the concept already proven in the lane.<br><br>Adapt the proven concept rather than starting from zero.',
    'Launch pack briefed against the proven concept.'],
   ['Compliance pre-flight','New product, new claims','comp',
    'A new SKU means new claims. Add them to the approved library before creative is written, so the team knows the boundary rather than discovering it at review.',
    'Claims approved and added to the library with references.'],
   ['Launch and watch account health','Daily, not weekly','routine',
    'New products attract review. Check disapprovals daily for the first fortnight, and treat a pattern across them as a leading indicator rather than an administrative footnote.',
    'Live, with account health on the daily pass.']]}
};
var wfKey='launch'; var wfDone={}; var wfOpen=0;
function renderFlow(){
  var F=FLOWS[wfKey];
  $('wf-title').textContent=F.t;
  $('wf-steps').innerHTML=F.s.map(function(st,i){
    var k=wfKey+'-'+i, done=wfDone[k], open=(wfOpen===i);
    return '<div class="step'+(done?' done':'')+(open?' open':'')+'" data-i="'+i+'">'+
      '<div class="shead"><div class="snum">'+(done?'&#10003;':(i+1))+'</div>'+
      '<div class="stitle">'+st[0]+'<small>'+st[1]+'</small></div>'+
      '<span class="stool">'+st[2]+'</span></div>'+
      '<div class="sbody">'+st[3]+
      '<div class="sgate"><b>Gate</b>'+st[4]+'</div>'+
      '<div class="sact"><button class="btn p sm" data-go="'+st[2]+'">Open '+st[2]+'</button>'+
      '<button class="btn sm" data-mark="'+i+'">'+(done?'Mark not done':'Mark complete')+'</button></div>'+
      '</div></div>';
  }).join('');
  var d=F.s.filter(function(_,i){return wfDone[wfKey+'-'+i]}).length;
  $('wf-count').textContent=d+' of '+F.s.length;
  $('wf-bar').style.width=(d/F.s.length*100)+'%';
  $('wf-note').className='note'+(d===F.s.length?' good':'');
  $('wf-note').textContent=d===F.s.length?'Workflow complete. '+F.n:F.n;
}
$('wf-tabs').addEventListener('click',function(e){
  var b=e.target.closest('.tab'); if(!b)return;
  Array.prototype.forEach.call($('wf-tabs').children,function(x){x.classList.remove('on')});
  b.classList.add('on'); wfKey=b.dataset.w; wfOpen=0; renderFlow();
});
$('wf-steps').addEventListener('click',function(e){
  var m=e.target.closest('[data-mark]');
  if(m){wfDone[wfKey+'-'+m.dataset.mark]=!wfDone[wfKey+'-'+m.dataset.mark];renderFlow();return}
  if(e.target.closest('[data-go]'))return;
  var h=e.target.closest('.shead'); if(!h)return;
  var i=+h.parentNode.dataset.i; wfOpen=(wfOpen===i?-1:i); renderFlow();
});


/* ================= MAPS ================= */
var MAPS={
 arch:{t:'Account architecture',
  d:'Group by what can actually run, not by SKU. Inside each lane, consolidate hard, because Meta needs signal. Tier five has no lane, because the constraint there is the claim rather than the category.',
  m:'flowchart LR\n'+
    '  R(["TWC Meta"])\n'+
    '  R --> K["Emergency kits<br/>$120 CPA · hero lane"]\n'+
    '  R --> U["Wellness Farms + Skincare<br/>$25-35 CPA · unrestricted"]\n'+
    '  R --> C["Core supplements<br/>$45 CPA"]\n'+
    '  R --> RS["Restricted category<br/>$55 CPA"]\n'+
    '  R --> M["Membership<br/>optimise to Subscribe"]\n'+
    '  R --> A["App<br/>activation, not install"]\n'+
    '  R --> P["Prescription"]\n'+
    '  P --> G{"Meta authorization<br/>confirmed?"}\n'+
    '  G -->|no| STOP["Do not build"]\n'+
    '  G -->|yes| PX["Conversion event:<br/>approved and shipped"]\n'+
    '  T5["Tier 5<br/>Spike, detox, parasite"] -.->|"no lane · claim-constrained"| R\n'+
    '  classDef gate fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  class STOP,T5,G gate\n  class U,K good'},
 twocamp:{t:'Testing to scaling',
  d:'Creative flows one way on a fourteen-day cycle. ABO in testing because each concept needs guaranteed spend. CBO in scaling because the inputs are already proven and Meta can be trusted to allocate.',
  m:'flowchart LR\n'+
    '  B["New batch<br/>every 14 days"] --> T["Creative Testing<br/>ABO · broad · concept isolated"]\n'+
    '  T --> D{"Day 14<br/>classify"}\n'+
    '  D -->|"scale"| V{"Back end<br/>confirms orders<br/>shipped?"}\n'+
    '  V -->|yes| S["Scaling Campaign<br/>CBO · proven only"]\n'+
    '  V -->|no| TR["Tracking fault<br/>do not graduate"]\n'+
    '  D -->|"iterate"| B\n'+
    '  D -->|"retest"| B\n'+
    '  D -->|"kill"| L["Learning ledger<br/>with hypothesis"]\n'+
    '  L --> B\n'+
    '  S --> F{"Frequency up<br/>CTR down<br/>CPA up?"}\n'+
    '  F -->|yes| B\n'+
    '  F -->|no| S\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  class TR bad'},
 dataclass:{t:'Data class routing',
  d:'A single measurement stack cannot serve both. The domain structure makes the split clean, but the two override questions matter, because a page can sit on the commerce domain and still handle clinical data.',
  m:'flowchart TD\n'+
    '  S(["Page or event"]) --> Q1{"On care.twc.health<br/>or an app clinical screen?"}\n'+
    '  Q1 -->|yes| B["CLASS B · clinical"]\n'+
    '  Q1 -->|no| Q2{"Collects health<br/>information?"}\n'+
    '  Q2 -->|yes| B\n'+
    '  Q2 -->|no| Q3{"Names a condition,<br/>medication or service?"}\n'+
    '  Q3 -->|yes| B\n'+
    '  Q3 -->|no| A["CLASS A · commerce"]\n'+
    '  A --> A1["Browser pixel + CAPI<br/>advanced matching on<br/>value and currency<br/>dedup on every event"]\n'+
    '  B --> B1["No browser pixel, no SDK<br/>server-side from CRM<br/>de-identified milestone<br/>abstracted event names"]\n'+
    '  classDef ca fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  classDef cb fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  class A,A1 ca\n  class B,B1 cb'},
 funnels:{t:'Funnel map',
  d:'Seven live funnels across three domains and an app. F2 is the one that costs money quietly: payment is taken before clinical approval, so optimising to Purchase trains delivery toward orders that may never ship.',
  m:'flowchart TD\n'+
    '  subgraph CA["twc.health · Class A"]\n'+
    '    F1["F1 Commerce<br/>PDP → cart → checkout → Purchase"]\n'+
    '    F3["F3 Emergency kit<br/>$299.99 · hero by review volume"]\n'+
    '    F5["F5 Membership<br/>1Wellness Select/Premier/Elite"]\n'+
    '  end\n'+
    '  subgraph CB["care.twc.health · Class B"]\n'+
    '    F4["F4 Virtual care<br/>Talk to a Doc"]\n'+
    '  end\n'+
    '  F2["F2 Prescription"] --> PAY["Payment taken"]\n'+
    '  PAY --> INT["Medical history"]\n'+
    '  INT --> REV["Provider review"]\n'+
    '  REV --> SHIP["Approved and shipped"]\n'+
    '  PAY -.->|"Purchase fires here"| WRONG["Wrong conversion event"]\n'+
    '  SHIP -.->|"should fire here"| RIGHT["Correct conversion event"]\n'+
    '  F1 --> SUB["Subscribe and save"]\n'+
    '  F3 --> REP["Replenish My Kit"]\n'+
    '  F5 --> LTV["Highest LTV outcome"]\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  class WRONG bad\n  class RIGHT,LTV good'},
 cycle:{t:'Fourteen-day cycle',
  d:'Production always runs one batch ahead. The hardest discipline is day nine, where a concept that looks poor frequently recovers by day fourteen and one killed early cannot.',
  m:'flowchart LR\n'+
    '  D1["Day 1<br/>Batch N live<br/>Batch N+1 into production"] --> D3["Day 3-4<br/>Delivery check<br/>nothing killed"]\n'+
    '  D3 --> D7["Day 7<br/>Mid-point read<br/>directional only"]\n'+
    '  D7 --> D12["Day 12<br/>Batch N+1 delivered<br/>raw footage reviewed"]\n'+
    '  D12 --> D14{"Day 14<br/>Classify"}\n'+
    '  D14 -->|scale| G["Graduate at<br/>controlled share"]\n'+
    '  D14 -->|kill| LG["Ledger"]\n'+
    '  D14 -->|iterate/retest| NX\n'+
    '  G --> D15["Day 15<br/>Batch N+1 live"]\n'+
    '  LG --> D15\n'+
    '  NX["Into next batch"] --> D15\n'+
    '  D15 --> D1'},
 onboard:{t:'App onboarding',
  d:'Identity verification sits before first value, which asks for maximum trust at the point of minimum trust. Everything from id_verification_start onward is Class B, which is why activation_complete is the only event that should be exported to advertising.',
  m:'flowchart TD\n'+
    '  I["first_open"] --> R["registration_start"]\n'+
    '  R --> O["otp_verified<br/>common drop"]\n'+
    '  O --> P["pin_created"]\n'+
    '  P --> L["account_linked"]\n'+
    '  L --> AC["activation_complete<br/>PRIMARY KPI<br/>export this to ads"]\n'+
    '  AC --> V1["id_verification_start<br/>Class B"]\n'+
    '  V1 --> V2["id_verification_complete<br/>highest friction"]\n'+
    '  V2 --> BK["booking_confirmed<br/>no condition parameters"]\n'+
    '  V1 -.->|"Remote Config experiment"| EXP["Defer verification<br/>until after first value"]\n'+
    '  classDef kpi fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  classDef clin fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef exp fill:#e8eff7,stroke:#24507f,color:#24507f\n'+
    '  class AC kpi\n  class V1,V2,BK clin\n  class EXP exp'},
 cpa:{t:'CPA diagnosis',
  d:'Diagnosis first, action second. The first question is never what to change. It is whether the number is real, because optimising against a tracking fault is the most expensive mistake available.',
  m:'flowchart TD\n'+
    '  S(["CPA rising"]) --> Q1{"Meta vs Shopify<br/>moved together?"}\n'+
    '  Q1 -->|"no, Meta only"| TR["TRACKING FAULT<br/>stop optimising"]\n'+
    '  Q1 -->|yes| Q2{"CPM up?"}\n'+
    '  Q2 -->|yes| AU["Auction or saturation<br/>check frequency"]\n'+
    '  Q2 -->|no| Q3{"CTR down?"}\n'+
    '  Q3 -->|yes| CR["Creative fatigue<br/>validate with fresh assets"]\n'+
    '  Q3 -->|no| Q4{"LP view rate down?"}\n'+
    '  Q4 -->|yes| DE["Destination<br/>speed or broken link"]\n'+
    '  Q4 -->|no| Q5{"Where does<br/>the funnel break?"}\n'+
    '  Q5 -->|"add to cart"| OF["Offer or PDP"]\n'+
    '  Q5 -->|"checkout"| CH["Trust, shipping,<br/>delivery timeline"]\n'+
    '  Q5 -->|"purchase only"| FI["Final step or<br/>Purchase event"]\n'+
    '  Q5 -->|"nothing"| MX["Mix shift<br/>check prospecting split"]\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  class TR bad'},
 ninety:{t:'Ninety-day sequence',
  d:'Week zero costs nothing in media and returns more than any other week. Month one is budgeted to run below target, and the deliverable is a validated concept and a seeded pixel rather than a return.',
  m:'flowchart LR\n'+
    '  W0["Week 0<br/>Zero media spend<br/>Tracking QA · UTM fix<br/>Paid landing page<br/>Authorization confirmed"]\n'+
    '  W0 --> M1["Month 1<br/>One product<br/>Concept test<br/>Accept learning tax<br/>~1.9 ROAS expected"]\n'+
    '  M1 --> M2["Month 2<br/>Graduate winner<br/>Add retargeting<br/>Seed first lookalike<br/>~2.6 ROAS"]\n'+
    '  M2 --> GT{"Expansion gate<br/>all four criteria?"}\n'+
    '  GT -->|no| DP["Deepen lane one<br/>more creative, not more lanes"]\n'+
    '  GT -->|yes| M3["Month 3<br/>Lane two<br/>blend dips, correctly"]\n'+
    '  DP --> GT\n'+
    '  M3 --> M6["Months 4-6<br/>Cross-sell · membership<br/>AOV work · lane three"]\n'+
    '  classDef zero fill:#e8eff7,stroke:#24507f,color:#24507f\n'+
    '  class W0 zero'} ,
 lifecycle:{t:'Customer lifecycle',
  d:'Where each segment sits, what moves a customer forward, and which segments are suppression lists rather than targeting audiences. The second purchase inside ninety days is the highest-leverage moment in the whole base.',
  m:'flowchart LR\n'+
    '  P(["Prospect"]) --> N["New · 1 order<br/>within 90d"]\n'+
    '  N -->|"second purchase"| L["Loyal · 2+ orders"]\n'+
    '  N -->|"no second order"| HV{"Order value<br/>above threshold?"}\n'+
    '  HV -->|yes| HL["High value lapsing<br/>priority reactivation"]\n'+
    '  HV -->|no| AR["At risk"]\n'+
    '  L -->|"recent + high value"| CH["Champions<br/>seed lookalikes here"]\n'+
    '  L -->|"180-365d quiet"| AR\n'+
    '  AR -->|"no order 365d"| LP["Lapsed<br/>suppression list"]\n'+
    '  AR -->|"reactivated"| L\n'+
    '  HL -->|"recovered"| L\n'+
    '  CH -->|"membership"| M["Member<br/>highest LTV"]\n'+
    '  LP -.->|"exclude from all prospecting"| P\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef pri fill:#e8eff7,stroke:#24507f,color:#24507f\n'+
    '  class CH,M good\n  class LP bad\n  class HL,N pri'},
 ltvcac:{t:'LTV to CAC decision',
  d:'The ratio decides how hard you can bid. The payback period decides whether the business survives bidding that hard. A healthy ratio with a long payback can still run a company out of cash.',
  m:'flowchart TD\n'+
    '  S(["LTV / CAC"]) --> R{"Ratio"}\n'+
    '  R -->|"under 1"| L1["Losing money per customer<br/>economics problem, not bidding"]\n'+
    '  R -->|"1 to 2"| L2["Marginal<br/>nothing for overhead"]\n'+
    '  R -->|"2 to 3"| L3["Workable, tight<br/>watch marginal CPA"]\n'+
    '  R -->|"3 to 5"| L4["Healthy"]\n'+
    '  R -->|"over 5"| L5["Probably underinvesting<br/>bid higher"]\n'+
    '  L4 --> P{"Payback period"}\n'+
    '  L5 --> P\n'+
    '  P -->|"under 3 mo"| PA["Scale aggressively<br/>cohorts self-fund"]\n'+
    '  P -->|"3 to 6 mo"| PB["Scale, working capital question"]\n'+
    '  P -->|"6 to 12 mo"| PC["Confirm cash position first"]\n'+
    '  P -->|"over 12 mo"| PD["Cash flow risk<br/>pull value forward:<br/>bundles, membership, 2nd purchase"]\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  classDef warn fill:#fbf2e0,stroke:#95681a,color:#95681a\n'+
    '  class L1,L2,PD bad\n  class L4,PA,PB good\n  class L3,L5,PC warn'},
 shopmeta:{t:'Shopify to Meta',
  d:'Every arrow is a place the numbers can diverge. The commerce back end is the financial source of truth, and the platform view stays honest only if these flows are built deliberately.',
  m:'flowchart LR\n'+
    '  subgraph SH["Shopify"]\n'+
    '    O["Orders"]\n    SC["Subscription contracts"]\n    CU["Customers"]\n    PR["Products"]\n  end\n'+
    '  subgraph MT["Meta"]\n'+
    '    PU["Purchase event"]\n    SB["Subscribe event"]\n    CL["Customer list audiences"]\n    CT["Catalog · Advantage+"]\n  end\n'+
    '  O -->|"order_id as event_id<br/>value · currency · contents"| PU\n'+
    '  SC -->|"distinct event<br/>never Purchase"| SB\n'+
    '  CU -->|"hashed on upload<br/>segmented on export"| CL\n'+
    '  PR -->|"availability · price<br/>product type by tier"| CT\n'+
    '  CL --> LAL["PR03 value-based<br/>lookalike"]\n'+
    '  O --> BQ["BigQuery<br/>reconciliation layer"]\n'+
    '  PU --> BQ\n'+
    '  RX["Rx orders"] -.->|"tag on FULFILMENT<br/>not on payment"| PU\n'+
    '  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  class RX bad\n  class BQ,LAL good'},
 creative:{t:'Creative hierarchy',
  d:'Test in this order, holding prior stages fixed, so every result is attributable and the learning compounds. Changing concept, hook and format at once means a winner tells you nothing you can reuse.',
  m:'flowchart TD\n'+
    '  P["PRODUCT<br/>P01"] --> C["CONCEPT<br/>C01-C04<br/>the biggest variable"]\n'+
    '  C --> C1["Preparedness"]\n  C --> C2["Access"]\n  C --> C3["Authority"]\n  C --> C4["Contents"]\n'+
    '  C1 --> A["ANGLE<br/>A01-A04<br/>inside the winner"]\n'+
    '  A --> H["HOOK<br/>H01-H05<br/>message held constant"]\n'+
    '  H --> CR["CREATOR<br/>CR01-CR06"]\n'+
    '  CR --> F["FORMAT<br/>F01 UGC · F02 demo<br/>F03 static · F04 presenter"]\n'+
    '  F --> V["VERSION<br/>V01-V03"]\n'+
    '  V --> ID["P01_C01_A01_H03_CR07_F01_V02<br/>+ approved claim reference"]\n'+
    '  ID --> TEST{"14-day read"}\n'+
    '  classDef key fill:#e8eff7,stroke:#24507f,color:#24507f\n'+
    '  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n'+
    '  class C key\n  class ID good'} ,
 scaling:{t:'Scaling levers',
  d:'Worked in order. Reaching for budget first is the most common error in a constrained account, and it is the only lever that makes marginal CPA worse rather than better.',
  m:'flowchart TD\n  S(["Need more volume"]) --> L1{"Are there unused<br/>validated creatives?"}\n  L1 -->|yes| A1["LEVER 1<br/>Add creative to scaling<br/>no marginal CPA cost"]\n  L1 -->|no| L2{"Can AOV rise?<br/>bundle · subscribe · membership"}\n  L2 -->|yes| A2["LEVER 2<br/>Raise affordable CPA<br/>without media efficiency"]\n  L2 -->|no| L3{"Expansion gate:<br/>all four criteria?"}\n  L3 -->|yes| A3["LEVER 3<br/>Open a lane<br/>expect a blend dip"]\n  L3 -->|no| L4{"Marginal CPA<br/>still acceptable?"}\n  L4 -->|yes| A4["LEVER 4<br/>+20-25% one step<br/>48-72h cooldown"]\n  L4 -->|no| CEIL["CEILING REACHED<br/>more money buys<br/>worse customers"]\n  A4 --> RM["Re-measure marginal CPA"]\n  RM --> L4\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class A1,A2 good\n  class CEIL bad'},
 compflow:{t:'Compliance review flow',
  d:'Compliance sits upstream of production, not downstream of it. Every step that moves it later multiplies what a rejection costs.',
  m:'flowchart TD\n  P["Product tier assigned"] --> CL{"Approved claim<br/>exists in library?"}\n  CL -->|no| ESC["Escalate to medical<br/>or legal · add to library"]\n  ESC --> CL\n  CL -->|yes| BR["Brief written<br/>carries claim reference"]\n  BR --> SH["Shoot or design"]\n  SH --> RAW{"Raw footage review<br/>BEFORE edit"}\n  RAW -->|"claim drifted"| RESHOOT["Recut or reshoot<br/>cheap at this stage"]\n  RESHOOT --> RAW\n  RAW -->|clean| ED["Edit"]\n  ED --> CC["Copy check<br/>12-point scan"]\n  CC --> LP{"Destination carries<br/>only approved claims?"}\n  LP -->|no| DLP["Build dedicated paid LP"]\n  DLP --> LP\n  LP -->|yes| LAUNCH["Launch"]\n  LAUNCH --> MON["Daily account health"]\n  MON -->|disapproval| CL\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  class ESC,RESHOOT,DLP bad\n  class LAUNCH good'},
 recon:{t:'Reconciliation',
  d:'Four systems answering four different questions. They will not agree, and the task is to understand the delta rather than to force a single number.',
  m:'flowchart TD\n  Q(["Numbers disagree"]) --> D{"Delta size"}\n  D -->|"under 15%"| NORM["Normal attribution<br/>different questions,<br/>both answers correct"]\n  D -->|"over 15%"| C1{"Same window<br/>and timezone?"}\n  C1 -->|no| TZ["Meta uses ad account TZ<br/>Shopify uses store TZ"]\n  C1 -->|yes| C2{"Order and revenue<br/>delta match?"}\n  C2 -->|"diverge >10pts"| VAL["Value or currency fault"]\n  C2 -->|match| C3{"Renewals firing<br/>Purchase?"}\n  C3 -->|yes| SUB["Meta counting revenue<br/>the ads did not generate"]\n  C3 -->|no| C4{"Rx orders firing<br/>at payment?"}\n  C4 -->|yes| RX["Counting orders that<br/>never clear approval"]\n  C4 -->|no| C5{"Dedup on ALL events<br/>or only Purchase?"}\n  C5 -->|"Purchase only"| DUP["Mid-funnel inflated<br/>every rate distorted"]\n  C5 -->|all| ORG["Genuine untracked demand<br/>check order tagging first"]\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class NORM good\n  class VAL,SUB,RX,DUP bad'},
 rtg:{t:'Retargeting tiers',
  d:'Mutually exclusive by construction. Without the exclusions a user who initiated checkout yesterday sits in six audiences at once, competes against themselves in the auction and receives six different messages.',
  m:'flowchart TD\n  V(["Site visitor"]) --> T1{"Initiated<br/>checkout 0-7d?"}\n  T1 -->|yes| RT1["RT01 HOT<br/>close · static · 6-15s<br/>freq ceiling 6.0"]\n  T1 -->|no| T2{"Added to cart<br/>0-14d?"}\n  T2 -->|yes| RT2["RT02 WARM<br/>objection · 10-20s<br/>excl RT01"]\n  T2 -->|no| T3{"Viewed product<br/>0-14d?"}\n  T3 -->|yes| RT3["RT03 CONSIDERING<br/>FAQ · contents<br/>excl RT01-02"]\n  T3 -->|no| T4{"Visited 15-30d?"}\n  T4 -->|yes| RT4["RT04 AWARE<br/>differentiate<br/>excl RT01-03"]\n  T4 -->|no| T5{"Video 50% or<br/>social engager?"}\n  T5 -->|yes| RT5["RT05 ENGAGED<br/>educate · 45-90s<br/>excl RT01-04"]\n  T5 -->|no| RT6["RT06 LIST<br/>email non-purchasers"]\n  PUR["Purchasers"] -.->|"excluded from ALL<br/>180d kits · 30d supplements"| V\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class PUR bad'},
 budgetflow:{t:'Budget flow',
  d:'Where money goes as gates clear. The testing allocation is ring-fenced and never borrowed against, because it is the mechanism that produces next quarter\u2019s scaling creative.',
  m:'flowchart LR\n  B(["Monthly budget"]) --> T["Creative testing<br/>12-15% RING-FENCED"]\n  B --> RES["Seasonal reserve<br/>3-5% unallocated"]\n  B --> LANES["Operating budget"]\n  LANES --> M1{"Month 1?"}\n  M1 -->|yes| ONE["Single lane<br/>100% of operating"]\n  M1 -->|no| G{"Expansion gate<br/>all four?"}\n  G -->|no| DEEP["Deepen lane one<br/>more creative"]\n  G -->|yes| SPLIT["Split across lanes<br/>each above threshold"]\n  SPLIT --> RTG["Retargeting 8-12%<br/>separate campaign<br/>until $3k/day"]\n  SPLIT --> GATED{"Authorization<br/>confirmed?"}\n  GATED -->|no| ZERO["Rx allocation: 0"]\n  GATED -->|yes| CAP["Reallocation<br/>with a ceiling"]\n  classDef ring fill:#e8eff7,stroke:#24507f,color:#24507f\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class T,RES ring\n  class ZERO bad'},
 subs:{t:'Subscription lifecycle',
  d:'The dunning branch is the one worth building. Involuntary churn is a failed card rather than a lost customer, and it typically runs at thirty to forty percent of total churn.',
  m:'flowchart TD\n  A["Acquisition"] --> S1{"Membership<br/>attached?"}\n  S1 -->|no| OT["One-time customer<br/>LTV capped at repeat rate"]\n  S1 -->|yes| SUB["Active subscription<br/>contributes MRR"]\n  OT -.->|"post-purchase offer"| S1\n  SUB --> R{"Renewal"}\n  R -->|success| SUB\n  R -->|"card failed"| DUN["INVOLUNTARY<br/>dunning sequence"]\n  R -->|"cancelled"| VOL["VOLUNTARY<br/>capture the reason"]\n  DUN --> RET{"Retry · card updater<br/>pre-dunning email"}\n  RET -->|"~35% recovered"| SUB\n  RET -->|failed| CHURN["Churned"]\n  VOL --> WIN["Win-back via email<br/>not paid media"]\n  WIN -->|recovered| SUB\n  WIN -->|no| CHURN\n  VOL -.->|"reasons feed<br/>creative ledger"| A\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef warn fill:#fbf2e0,stroke:#95681a,color:#95681a\n  class SUB,RET good\n  class DUN warn'},
 lookermodel:{t:'Looker data model',
  d:'Campaign name is the join key across every blend. That is the entire reason for the underscore convention, and renaming a campaign after launch breaks the join silently.',
  m:'flowchart LR\n  subgraph SRC["Sources"]\n    MA["Meta Ads"]\n    G4["GA4 commerce"]\n    BQ["BigQuery export"]\n    SP["Shopify"]\n    CLG["Creative ledger"]\n    TG["Targets sheet"]\n  end\n  MA -->|campaign_name| B1["Blend 1<br/>Performance"]\n  TG -->|lane| B1\n  SP -->|date| B2["Blend 2<br/>Reconciliation"]\n  MA -->|date| B2\n  MA -->|ad_name| B3["Blend 3<br/>Creative"]\n  CLG -->|creative_id| B3\n  G4 -->|"date + campaign"| B4["Blend 4<br/>Funnel"]\n  MA --> B4\n  BQ --> B5["Cohorts"]\n  B1 --> P["Dashboard pages"]\n  B2 --> P\n  B3 --> P\n  B4 --> P\n  B5 --> P\n  CLIN["GA4 clinical"] -.->|"NEVER connected"| P\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  class CLIN bad\n  class SP good'},
 pipeline:{t:'Creative pipeline',
  d:'Production always runs one batch ahead. Without the overlap the pipeline stalls for a fortnight each cycle and the ring-fenced testing budget sits idle.',
  m:'flowchart LR\n  LED["Learning ledger<br/>what we now know"] --> BRF["Brief<br/>+ claim reference"]\n  BRF --> SPLIT{"Needs a shoot?"}\n  SPLIT -->|no| DIG["Digital mock-up<br/>ships in days<br/>~1/3 of the deck"]\n  SPLIT -->|yes| SHOOT["Shoot<br/>1 day = 5 assets"]\n  SHOOT --> RAW["Raw review<br/>before edit"]\n  RAW --> EDIT["Edit + variants"]\n  DIG --> CC["Copy check"]\n  EDIT --> CC\n  CC --> Q["Batch queued<br/>N+1 ready on day 12"]\n  Q --> LIVE["Day 15 launch"]\n  LIVE --> D14{"Day 14 verdict"}\n  D14 -->|scale| SC["Scaling campaign"]\n  D14 -->|"iterate · retest"| BRF\n  D14 -->|kill| LED\n  SC -->|fatigue| BRF\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef ring fill:#e8eff7,stroke:#24507f,color:#24507f\n  class SC good\n  class LED ring'} ,
 gaccount:{t:'Google account architecture',
  d:'Six campaign types doing genuinely different jobs across the demand curve. The mistake is treating them as six ways to buy the same traffic, when three of them capture demand that already exists and three create it.',
  m:'flowchart LR\n  R(["Google Ads"])\n  R --> CAP["CAPTURE existing demand"]\n  R --> CRE["CREATE new demand"]\n  CAP --> BR["Branded search<br/>defensive · capped budget<br/>mostly not incremental"]\n  CAP --> NB["Non-brand search<br/>the real capture lane"]\n  CAP --> SH["Shopping<br/>feed-driven capture"]\n  CRE --> PM["Performance Max<br/>both, and opaque about which"]\n  CRE --> DG["Demand Gen<br/>Meta creative transfers here"]\n  CRE --> YT["YouTube<br/>hook mechanics transfer"]\n  META["Meta creates demand"] -.->|"user searches the brand"| BR\n  BR -.->|"reports excellent ROAS<br/>on demand it did not create"| TRAP["The attribution trap"]\n  PM -.->|"brand exclusions OFF"| BR\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  class TRAP bad\n  class DG,YT good'},
 gsearch:{t:'Search campaign anatomy',
  d:'Four levels, and the leverage sits at the bottom two rather than the top. Most search accounts are restructured at campaign level when the problem was always keywords and negatives.',
  m:'flowchart TD\n  C["CAMPAIGN<br/>budget · bidding · geo · schedule"]\n  C --> AG["AD GROUP<br/>one tight theme, nothing more"]\n  AG --> KW["KEYWORDS<br/>phrase and exact<br/>broad only with mature negatives"]\n  AG --> RSA["RSAs, 2 per ad group<br/>genuinely different angles"]\n  KW --> ST["SEARCH TERMS<br/>what people actually typed"]\n  ST -->|"converted"| NEW["New exact keyword"]\n  NEW --> KW\n  ST -->|"wasted"| NEG["Negative keyword"]\n  NEG --> C\n  RSA --> AR["Asset ratings<br/>Low · Good · Best<br/>directional only"]\n  AR -.->|"no cost or conversion<br/>at asset level"| LIMIT["Cannot be A/B tested<br/>the way Meta creative can"]\n  classDef loop fill:#e8eff7,stroke:#24507f,color:#24507f\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class ST,NEW,NEG loop\n  class LIMIT bad'},
 gpmax:{t:'Performance Max, and what it hides',
  d:'The most powerful and least inspectable campaign type Google offers. Because you cannot diagnose your way out of a bad structure afterwards, the structure has to be right before launch.',
  m:'flowchart TD\n  PM["Performance Max"]\n  PM --> AG1["Asset group · THEME<br/>never per product"]\n  AG1 --> LG["Listing groups<br/>split by compliance tier"]\n  AG1 --> AS["5 headlines · 5 descriptions<br/>3 image ratios · 1 video minimum"]\n  AS -.->|"no video supplied"| GEN["Google generates one<br/>usually worse than nothing"]\n  SIG(["Audience signals<br/>a hint, not targeting"]) -.-> PM\n  BX{"Brand exclusions"}\n  PM --> BX\n  BX -->|"OFF, the default"| CANN["Absorbs branded search<br/>inflates PMax<br/>hollows out the brand campaign"]\n  BX -->|"ON"| CLEAN["Reaches genuinely new demand"]\n  PM -.-> BLIND(["Not visible:<br/>placement cost<br/>full search terms<br/>asset-level conversions"])\n  PM -.->|"outranks it"| SHOP["Standard Shopping<br/>on the same products"]\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n  class CANN,GEN,SHOP bad\n  class CLEAN good\n  class SIG,BLIND meta'},
 gscale:{t:'Google scaling levers',
  d:'The structural advantage over Meta. Impression share reports the ceiling directly, and the two reasons you lose it need opposite responses. Budget added to a rank-limited campaign buys worse positions at a worse cost.',
  m:'flowchart TD\n  S(["Need more volume"]) --> IS{"Impression share<br/>headroom?"}\n  IS -->|"under 10% left"| EXP["Near the ceiling.<br/>New keywords · new campaign type<br/>· new geography"]\n  IS -->|"headroom exists"| Q{"Lost to budget<br/>or lost to rank?"}\n  Q -->|"mostly budget"| B["RAISE BUDGET<br/>the auction is winnable<br/>you are not showing up"]\n  Q -->|"mostly rank"| R["BUDGET WILL NOT HELP<br/>you are outranked, not outspent"]\n  Q -->|"both, roughly equal"| BOTH["Fix rank first<br/>then raise into the space"]\n  R --> QS["Quality Score<br/>ad relevance · expected CTR<br/>landing page experience"]\n  QS -->|"cheaper"| WIN["Better position<br/>at the same cost per click"]\n  R --> BID["Raise bids<br/>works, and raises CPA directly"]\n  B --> STEP["Raise in steps<br/>incremental impressions are the ones<br/>you were previously outbid on"]\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef warn fill:#fbf2e0,stroke:#95681a,color:#95681a\n  class B,WIN,QS good\n  class R bad\n  class BID,BOTH warn'},
 gdemand:{t:'Where demand flows',
  d:'The whole cross-channel argument in one picture. Meta creates the demand, the brand search captures it, and the reporting credits the capture. Cutting Meta on that reading removes the thing feeding both.',
  m:'flowchart LR\n  M["Meta ad<br/>user was not looking"] --> AW["Awareness created"]\n  AW --> P1{"Clicks?"}\n  P1 -->|yes| LP["Landing page"]\n  P1 -->|"no, but remembers"| G["Searches the brand<br/>days later"]\n  G --> BR["Branded search ad"]\n  G --> ORG["Organic listing"]\n  BR --> BUY(["Purchase"])\n  ORG --> BUY\n  LP --> BUY\n  BR -.->|"claims the conversion"| CRED["Google branded<br/>reports excellent ROAS"]\n  M -.->|"outside the 7-day window<br/>no credit"| NONE["Meta reports nothing"]\n  CRED --> DEC{"Budget decision<br/>on blended reporting"}\n  NONE --> DEC\n  DEC -->|"cut Meta, fund Google"| KILL["Demand stops being created<br/>brand search volume falls<br/>3 to 6 weeks later"]\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  class KILL,CRED bad\n  class BUY good'},
 gterms:{t:'Search terms loop',
  d:'The single highest-yield routine in a search account, and the one most often skipped after the first month. Most waste sits in terms nobody chose, and most growth sits in terms nobody chose either.',
  m:'flowchart LR\n  KW["Keywords you chose"] --> AUC["Auction"]\n  AUC --> ST["Search terms<br/>what people actually typed"]\n  ST --> CAT{"Categorise"}\n  CAT -->|"brand"| BR["Review the incrementality<br/>question, not the CPA"]\n  CAT -->|"exact intent"| EX["Promote to exact keyword<br/>own bid, own ad group"]\n  CAT -->|"adjacent"| AD["Tighten match type<br/>or split into its own group"]\n  CAT -->|"informational"| IN["Negative, or route to content"]\n  CAT -->|"irrelevant"| IR["Negative immediately"]\n  EX --> KW\n  IN --> NEG["Negative list"]\n  IR --> NEG\n  NEG --> AUC\n  NEG -.->|"built BEFORE launch<br/>not after"| KW\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  class EX good\n  class IR,NEG bad'}
 ,
 attrpath:{t:'Attribution path',
  d:'Six touches, one purchase, and a credit rule that sees two of them. The gap between those two numbers is not a measurement error, it is what a credit-assignment rule does, and decisions made without accounting for it quietly remove the top of the funnel.',
  m:'flowchart LR\n  D1["Day 1<br/>impression<br/>no click"] --> D2["Day 2<br/>impression"]\n  D2 --> D3["Day 3<br/>impression"]\n  D3 --> D4["Day 4<br/>impression"]\n  D4 --> D5["Day 5<br/>CLICK<br/>no purchase"]\n  D5 --> D6["Day 6<br/>impression"]\n  D6 --> G["Searches the brand<br/>on Google"]\n  G --> P(["Purchase"])\n  D5 -.->|"7-day click<br/>CREDITED"| P\n  D6 -.->|"1-day view<br/>CREDITED"| P\n  D1 -.->|"no credit"| X["Built awareness<br/>looks like waste"]\n  D2 -.->|"no credit"| X\n  D3 -.->|"no credit"| X\n  D4 -.->|"no credit"| X\n  X --> K{"Killed for<br/>zero conversions?"}\n  K -->|yes| COLLAPSE["Top of funnel removed<br/>credited ad stops converting<br/>4-6 weeks later"]\n  K -->|"held past<br/>minimum read"| OK["Path stays intact"]\n  classDef cred fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n  classDef warn fill:#fbf2e0,stroke:#95681a,color:#95681a\n  class D5,D6,OK cred\n  class COLLAPSE bad\n  class X warn'}

};
var MMNOTES={"arch": [["Why tier five has no lane", "The Spike and detox collection is deliberately absent from this structure, and the omission is stated rather than left to inference. The constraint there is the claim, not the category, which means no campaign architecture resolves it. A disease-named collection attached to a supplement is a treatment claim by structure, regardless of how carefully the ad copy is written around it. Building a lane would imply a structural solution exists, and someone would eventually spend against it on that assumption."], ["Certification is necessary and not sufficient", "LegitScript certification appears on the TWC homepage trust bar, which clears the first and largest gate. Meta requires certified advertisers to additionally obtain written authorisation, with targeting limited to eligible countries. Current reporting indicates the requirement extends to retargeting and lookalike campaigns, not only cold prospecting. Until that authorisation is confirmed in writing and by domain, the prescription lane exists on paper only, and the correct allocation to it is zero."], ["Consolidate inside lanes, separate between them", "The structure separates where economics, customer intent and compliance genuinely differ, and merges everywhere else. Inside each lane it consolidates hard, because Meta needs conversion signal and fragmentation is the primary failure mode at constrained budgets. Three under-fed campaigns perform worse than one well-fed one, and the instinct to split by SKU produces exactly that. Structure and fragmentation are not the same thing, and an account that looks sophisticated is frequently one that has stopped learning."], ["The unrestricted lanes are the learning environment", "Wellness Farms and most of the skincare line carry no health claim, which makes them the cheapest place in the account to test concepts. A concept proven there can often be adapted to a constrained product with less risk than testing it there directly. They also build clean pixel signal and purchase history that the restricted lanes inherit without carrying their risk. Treating them as low-priority because the AOV is smaller misses what they are actually for."], ["The CPA envelope varies roughly tenfold", "Emergency kits sit near $120, core supplements near $45, skincare near $35 and Wellness Farms near $25. A single account-level CPA or ROAS target would misprice most of the catalog, making the cheap lanes look artificially strong and the kit lane look broken. Targets are set per lane, and each one is checked against the learning threshold separately before the structure is built."]], "twocamp": [["ABO in testing, CBO in scaling", "Concept testing needs guaranteed spend per cell or it produces nothing. Under CBO, Meta identifies an early leader within days and starves the remaining cells, so the budget is spent without a readable result. In scaling the inputs are already proven and Meta can be trusted to allocate, which is a different job requiring a different budget mode. Using one mode for both is the most common structural mistake in accounts that otherwise look well built."], ["The back-end verification step is not optional", "A creative can win on Purchase while producing Rx orders that never clear clinical approval, because the event fires at payment and nothing downstream corrects it. Graduation is therefore checked against Shopify rather than against Ads Manager. Skipping this step means promoting the creative that is best at generating payments rather than the one best at generating shipped orders, and the two are not the same asset."], ["Winners enter at a controlled share", "Winning a controlled ABO test proves an asset works when given guaranteed spend against a fixed audience. It does not prove it holds under CBO allocation competing against established performers with delivery history. Entering at full weight risks displacing a proven asset with one that has not been tested under those conditions. Enter at a fraction, watch a full delivery cycle, then increase."], ["Kills route to the ledger, not to deletion", "Every retired creative archives its concept, angle, hook, creator, format, spend, peak, fatigue point and a stated hypothesis for why it failed. A creative that failed for an identifiable reason has paid for itself if it removes a hypothesis from the roadmap. The output of the testing system is a running document of what this audience responds to, which is what makes round eight smarter than round one."], ["The fatigue loop closes back to the batch", "The diagram loops from scaling back to the batch because the replacement for a fatiguing winner must already be validated when fatigue arrives. If the loop is broken, the account discovers it needs new creative at exactly the moment it has none, and volume collapses while production catches up. That is why the testing allocation is ring-fenced rather than treated as discretionary spend."]], "dataclass": [["The override questions matter more than the domain", "Domain is a useful first filter and it is not sufficient. A page can sit on the commerce domain and still collect health information, or name a condition or medication in its URL. Both override questions exist because the failure mode is a page that looks like commerce, is instrumented like commerce, and is quietly transmitting clinical context. Classify on what the page does, not on where it lives."], ["Class B is server-side at a de-identified milestone", "No browser pixel, no SDK, and no advanced matching parameters carrying health context. The conversion signal is generated server-side from the CRM at a milestone that does not disclose what the user is doing. Standard advanced matching across healthcare intake is precisely the implementation pattern that has generated significant enforcement exposure and litigation across the digital health sector over the last several years."], ["Event names are abstracted, not just filtered", "intake_step_complete rather than anything naming a condition, medication or service type. Filtering in the reporting layer is a convenience and does not prevent collection, so the abstraction has to happen at the point the event is defined. If the name would tell a stranger what the user is being treated for, it is the wrong name regardless of who can currently see the report."], ["The brand promise is the strongest argument", "The parent brand leads its positioning with a pledge that patient data is never sold, shared or monetised. Aligning the measurement architecture to that pledge makes it far easier to get signed off than a purely technical or legal argument would be. It also gives the media buyer a defensible position when asked why the clinical properties are not instrumented like the store."], ["Scriptful-style B2B surfaces fall back to Class A", "Where the conversion is a business inquiry rather than a patient interaction, most of the concern disappears and normal lead generation instrumentation applies. Stating that explicitly matters, because a blanket rule applied without distinction produces over-restriction on surfaces that do not need it, and over-restriction is how a sound architecture gets abandoned."]], "funnels": [["F2 is the expensive one", "Payment is taken before clinical approval, and the site states delivery may take one to two weeks depending on when the provider consultation is scheduled. The Purchase event fires at payment, so Meta counts an order the business may never fulfil. Public complaints about Rx order delays suggest meaningful drop-off between payment and completed medical history, which means the gap is real rather than theoretical."], ["The correct conversion event is approved-and-shipped", "Until the event moves, every optimisation decision on the Rx lane trains delivery toward the audience most likely to pay rather than the audience most likely to complete intake and receive an order. Those are different people, and the difference compounds every day the campaign runs. The dotted lines in the diagram mark where the event currently fires against where it should."], ["Membership is the highest-LTV outcome and appears under-sold", "1Wellness Select, Premier and Elite are live Shopify products, so they carry a purchase event with a value and can be optimised toward directly. They appear to be sold primarily as a post-purchase or in-cart upsell rather than as a paid acquisition target. A membership acquisition looks expensive on first-order ROAS and cheap on lifetime contribution, so a target set on first purchase will systematically under-bid for the most valuable customers."], ["The subdomain split makes the architecture implementable", "Rx replenishment and virtual care route to care.twc.health while the store sits on twc.health, and Canada sits on a separate domain again. That means the Class A and Class B measurement split maps onto real properties rather than requiring page-level rules that drift over time. It is a meaningful advantage and it should be preserved rather than consolidated for convenience."], ["Affiliate destinations carry risk the media buyer does not control", "Formal affiliate and brand partnership programmes exist, which means ad destinations may sit outside media buying's control while the ad account absorbs the consequences of what appears on them. This is one of the most common causes of restriction in regulated categories. Ask early how much influence the role has over those pages, because the answer changes the risk profile of the whole account."]], "cycle": [["Day nine is the hardest discipline in the plan", "A concept that looks poor on day nine frequently recovers by day fourteen, and one killed on day nine cannot. The only intervention permitted before the read is pausing a creative that has spent past 1.5 times target CPA with zero conversions, which at a $120 target is roughly $180. Everything else waits. Most damage in a testing system comes from acting on a partial read rather than from testing the wrong thing."], ["Production runs one batch ahead, always", "Batch N+1 enters production on the same day batch N goes live. Without that overlap the pipeline stalls for a fortnight every cycle and the ring-fenced testing budget sits idle, which is the same as cutting it. The overlap is what makes the cadence sustainable rather than aspirational."], ["Fourteen days is set by spend per creative, not by the calendar", "Each creative needs three to five times target CPA in spend to produce a readable signal. At a fortnightly testing budget divided by that figure, five or six creatives is the practical batch. If the budget cannot deliver that in fourteen days, extend the cycle to three weeks rather than shrinking the batch, because a smaller batch produces unreadable results while a longer cycle only slows learning."], ["Six cycles is roughly one quarter", "A full pass through concept, angle, hook, format, creator and validation takes six cycles. The lane then enters the next quarter with a proven concept, angle, hook, format and creator, plus a documented reason each one won. That documentation is the asset, more than the winning ad is."], ["Day twelve exists so compliance is inside the cycle", "Batch N+1 must be through review by day twelve so it can launch on day fifteen. If compliance turnaround exceeds five days the cycle cannot run at this cadence and the schedule needs rebuilding around the real constraint rather than the ideal one. Agreeing that turnaround before launch is more useful than discovering it in cycle three."]], "onboard": [["Verification sits before first value", "The onboarding path requires a password, an OTP, a four-digit PIN, a PHI release authorisation with e-signature, a government photo ID upload and a selfie, all before the user has received anything. That asks for maximum trust at the point of minimum trust. Deferring verification until immediately before the appointment, rather than before the booking, is likely the single highest-leverage Remote Config experiment available anywhere in the account."], ["Everything after activation is Class B", "id_verification_start onward handles protected health information, which is why activation_complete is the only event exported to advertising. Exporting anything downstream of it would move clinical context into an ad platform. The shading in the diagram is the boundary, and it should be enforced in the Firebase configuration rather than in the reporting layer."], ["Crashlytics on the onboarding path specifically", "A crash during OTP entry or ID upload is indistinguishable from abandonment in analytics and requires an entirely different fix. Without instrumenting the path separately, a technical failure will be interpreted as a friction problem and the team will redesign a screen that was working. Stability data on this path is worth more than on any other in the app."], ["Activation over installs, and the order matters", "Adoption appears very low relative to a customer base described as over a million, which makes activation the objective rather than volume. Buying cold installs into a funnel requiring government ID before first value will produce poor economics and worse app store reviews, and reviews are hard to recover. The sequence is fix onboarding, then activate the existing base against a customer list, then consider cold acquisition only if the unit economics justify it."], ["Push is cheaper than paid retargeting", "Cloud Messaging reaches an activated user at effectively zero marginal cost, which for a subscription business with replenishment cycles is materially cheaper than buying the same reach through paid. Every activated customer permanently reduces the retargeting budget required to serve them. That is the real return on the activation campaign and it does not show up in the campaign's own ROAS."]], "cpa": [["The first question is never what to change", "It is whether the number is real. Optimising against a tracking fault is the most expensive mistake available, because the changes made will be wrong and the evidence needed to diagnose it will have been destroyed by the changes. Compare Meta against Shopify for the same window, in the same timezone, before touching anything."], ["CPM up and CTR down need opposite responses", "CPM rising with CTR holding means auction pressure or audience saturation, and the answer is broadening or accepting the cost. CTR falling with CPM flat means creative, and the answer is rotation validated against fresh assets. They look similar on a dashboard and treating one as the other makes the situation worse rather than neutral."], ["The checkout branch is catalog-specific", "On this account, checkout drop-off frequently traces to the one to two week Rx delivery expectation appearing late in the flow, or to shipping cost surfacing after the user has committed. It is the most expensive leak in the funnel because everything upstream has already been paid for. Disclosing the timeline early costs some conversion rate and buys back refunds, support load and reviews."], ["Mix shift is the answer when nothing broke", "If every funnel rate held and CPA still rose, the composition changed rather than the performance. Check the prospecting and retargeting split first, then the product mix inside the campaign. A blend drifting toward cheaper retargeting conversions will improve every visible rate while new customer acquisition quietly stalls."], ["Account health belongs at the top of this tree", "A disapproval shifts delivery before any performance metric moves, which means a CPA investigation that starts at CPM can spend a day chasing a symptom. Checking restrictions and disapprovals first takes thirty seconds and rules out the fastest-moving cause. In a catalog with gated products it is not an administrative check, it is a diagnostic one."]], "ninety": [["Week zero returns more than any other week", "It costs nothing in media and it is where the tracking QA, the UTM correction, the dedicated paid landing page and the authorisation confirmation happen. Nine of the fifteen items block launch, because spending against broken tracking does not produce a slow start. It produces four weeks of decisions made on corrupted data, and the diagnosis usually happens after the budget is gone."], ["Month one is budgeted to lose money", "Expect CPA at 1.5 to 2 times target while the model calibrates, and a blended ROAS around 1.9. The deliverables are a validated concept, a seeded pixel of roughly 290 purchases and a populated retargeting pool, not a return. Saying this in advance is what stops the plan being abandoned in week three, and a plan that promises profitability in week two will be."], ["The expansion gate has four criteria and all four must hold", "Fourteen consecutive days at or below target CPA, acceptable marginal CPA on the last increment, at least two validated creatives, and a retargeting pool that is growing rather than depleting. Failing any one means the answer is more creative rather than another lane. A second lane launched on an unstable first lane produces two unstable lanes and halves the budget available to fix either."], ["The month three dip is correct and needs pre-announcing", "A new lane enters at cold-start efficiency and pulls the blended figure down while it learns. That is a correct decision producing a temporarily worse number. A stakeholder who was not warned will read it as failure and may reverse a good decision at exactly the wrong moment, so the dip goes in the forecast before it appears in the report."], ["Customer count matters more than ROAS in the first two quarters", "By month six the base needs to be large enough that membership, replenishment, cross-sell and app activation all become viable. None of those exist without the customers acquired in months one to three, and all of them break the account out of the budget ceiling in a way that media efficiency alone cannot."]], "lifecycle": [["The second purchase inside ninety days is the leverage point", "A customer who buys twice behaves fundamentally differently from one who buys once, and the window in which that second purchase is winnable is short. This is the highest-value retention moment in the entire base and it is usually handled by a generic post-purchase email rather than by a deliberate campaign. Cross-sell into the natural complement or make the membership savings arithmetic explicit."], ["High value lapsing is priority alongside Champions", "A customer who spent at the top of the range once and did not return has already proven willingness to pay. Recovering one is worth several new low-tier acquisitions, and the audience is small enough that a materially higher CPA is justified. Most accounts treat lapsed as a single undifferentiated segment and lose this cohort inside it."], ["Lapsed is a suppression list, not a targeting audience", "Its job is to stop prospecting budget reaching people already acquired. Win-back belongs in email, where the marginal cost is near zero and the message can be longer. Paying prospecting rates to re-reach a customer from fourteen months ago is one of the quietest ways an account wastes money, because it lands in the new customer column."], ["Champions is the lookalike seed", "Seeding a lookalike on all purchasers models the median customer, which on this catalog is a low-value one. Seeding on recent, frequent, high-value customers models the cohort that carries the margin. Mapping total spent to the value column on upload turns a flat lookalike into a value-based one, which is one extra column and a materially different audience."], ["Membership is the terminal state worth engineering toward", "Every arrow in the diagram that leads to Member represents a customer whose affordable acquisition cost has just increased substantially. If a meaningful share of the base converts, the CPA target should be set against subscription contribution rather than first-order contribution, and the account can afford to bid in a way that first-order maths forbids."]], "ltvcac": [["A ratio above five usually means underinvestment", "It is read as exceptional efficiency and it more often means acquisition is too conservative. If you can afford $200 per customer and are paying $70, the gap is growth left unspent rather than margin protected. The correct response is usually to bid higher and accept a worse ratio in exchange for volume the business can clearly absorb."], ["Payback governs cash, ratio governs profit", "A three to one ratio with a fourteen-month payback can run a company out of money while every dashboard looks healthy. The two answer different questions and both need to be on the same screen. Scaling decisions made on ratio alone will be correct on paper and unaffordable in practice."], ["When payback runs long, pull value forward", "Bundles that raise first-order value, membership attach at checkout, and a deliberate second purchase inside ninety days all move contribution earlier without changing the twelve-month total. That is a different intervention from improving CPA and it is frequently faster, because it is a merchandising decision rather than a media efficiency gain."], ["Bid against the conservative LTV until cohorts exist", "Retention is the single most uncertain input in the model, and a wide spread between conservative and optimistic means the expected figure carries real risk. Until twelve months of cohort data exist, bid against the low case and treat the optimistic figure as upside rather than plan. An LTV assumption that turns out to be wrong is discovered a year after the money was spent."], ["Below one is an economics problem, not a bidding problem", "If every acquisition costs more than it returns, no amount of optimisation fixes it and scaling only scales the loss. The levers are AOV, retention and margin, in that order of speed. Reaching for creative or bidding changes here is treating a symptom on the wrong system."]], "shopmeta": [["Every arrow is a place the numbers diverge", "Each connection in the diagram has a specific failure mode worth checking before the reconciliation conversation begins. Orders can fire without an order_id as event_id. Renewals can fire Purchase. Customer lists can upload without the value column. Catalog feeds can carry stale availability. Naming the arrow makes the audit finite rather than open-ended."], ["Rx orders tag on fulfilment, never on payment", "This is the single most important line in the diagram for this catalog. Payment precedes clinical approval, so tagging on payment counts orders that may never ship and nothing downstream corrects it. The tag schema separates rx_pending, rx_approved, rx_shipped and rx_declined precisely so the conversion can fire at the right point and declined orders can be routed into the refund calculation."], ["Subscription contracts fire a distinct event", "If renewals fire Purchase, Meta optimises toward a blend of new and existing customers, and reported ROAS is flattered by revenue the ads did not generate that month. The distortion compounds as the subscriber base grows, which means the account looks like it is improving at exactly the point the acquisition engine is stalling."], ["Map total spent to the value column on upload", "It is one extra column on a customer list export and it converts a flat lookalike into a value-based one. Meta then weights the model toward customers who carry margin rather than treating a $30 jerky buyer and a $600 kit buyer as equivalent. This is the difference between PR02 and PR03 and it costs nothing to implement."], ["BigQuery is the reconciliation layer, not a report", "Meta, GA4 and Shopify will never agree, and BigQuery is where you determine why rather than argue about which is right. It is also where cohort analysis becomes possible, since the UI cannot answer questions about revenue by acquisition month. Enabling the export is cheap and the value arrives months later, which is why it gets skipped."]], "creative": [["Concept is tested first and alone", "It is the largest strategic variable and the one whose answer shapes every subsequent test. Holding audience, offer, objective, landing page and budget constant means the result is attributable. If concept, hook and format move together, a winner tells you which ad won and nothing about why, so the next round is no smarter than this one."], ["Every creative carries an approved claim reference", "This is one field beyond the standard taxonomy and it does more work than the rest combined. It makes compliance auditable at asset level rather than discoverable at review, and it gives the creative team the boundary before they write rather than a rejection afterwards. A team told the limit in advance produces better work than one told no later."], ["The ID parses into reporting dimensions", "Underscore delimiters mean concept, angle, hook, creator, format and version each become a column in Looker with a single REGEXP extract and no lookup table. That turns a creative leaderboard from a list of opaque ad names into an analysis of what this audience actually responds to. It also means a naming mistake surfaces as a null dimension rather than as a wrong number."], ["Creator sits between hook and format deliberately", "The same message delivered by a different person can perform completely differently, which means creator is a variable in its own right rather than a production detail. It also means a failing concept should not be abandoned after one creator, because the concept may be sound and the delivery wrong. Testing creator before format prevents that misattribution."], ["Iteration is where the compounding happens", "A validated concept, angle and hook should generate many executions rather than being replaced. Three hook variants and a static from one proven shoot is five assets from one production day, which is what makes a fortnightly cadence affordable. Accounts that start from zero each cycle spend the same money and learn far less."]], "scaling": [["Creative volume is first because it is free capacity", "A new validated creative reaches a different pocket of the same audience, which adds spend capacity without raising marginal CPA. No other lever does that. At a constrained budget against a product with two thousand reviews, the binding constraint is almost never audience size and almost always the number of proven assets available to spend against."], ["AOV is second because it is usually faster than CPA", "Raising AOV by a third has the same effect on spending power as cutting CPA by a quarter, and it is a merchandising decision rather than a media efficiency gain. Bundles, subscribe-and-save and membership attach all move it. A team can ship a three-tier bundle page in a week; improving CPA by twenty-five percent may take a quarter."], ["Lane expansion is third and carries hidden cost", "It adds demand pool and it also adds management overhead, dilutes learning across more surfaces, and pulls the blended figure down while the new lane learns. The four gate criteria exist to stop expansion being used as a substitute for fixing the current lane. A second lane launched on an unstable first one produces two unstable lanes."], ["Budget is last because it is the only lever that worsens efficiency", "Every other lever improves or holds marginal CPA. More money into the same structure buys progressively worse customers by definition, because the efficient audience is reached first. Increments of twenty to twenty-five percent with a forty-eight to seventy-two hour cooldown exist so the degradation is measured rather than discovered."], ["The ceiling is a real place and it should be named", "When marginal CPA exceeds target while blended still looks acceptable, the ceiling has been passed and the aggregate is hiding it. Continuing to add budget past that point is not aggressive scaling, it is buying unprofitable customers with the profitable ones subsidising them. Recognising the ceiling and reporting it is more valuable than hitting a spend number."]], "compflow": [["The claim is chosen before the concept is written", "Selecting an approved claim first means the creative team works inside a known boundary rather than discovering it at review. This produces better work, not more constrained work, because ambiguity is what makes writers hedge. It also makes every subsequent step faster, since compliance is reviewing execution rather than adjudicating whether the claim is permitted at all."], ["Raw footage is reviewed before edit", "Creator content is where claims drift, and the drift is almost never deliberate. A creator receives a brief, improvises something warmer on camera, and this fixed my problem appears where this supports the function was scripted. Catching that at the edit stage means the shoot is already paid for and the recut is a compromise rather than a fix."], ["The destination is part of the same message", "Meta reviews the ad and the landing page together, so a conservative ad landing on a page with disease-named navigation, treatment testimonials or quantified outcome statistics carries all of it into review. Building a dedicated paid landing page is the highest-leverage compliance action available, requires no change to the business, and ships in days rather than quarters."], ["A rejection routes back to the library, not to a rewrite", "If the underlying claim was never approved, rewording it only changes which review it fails. The loop in the diagram returns to the claim library because that is where the decision actually sits. Rewriting in place is how accounts accumulate disapprovals against the same underlying idea, and the pattern across disapprovals is what triggers restriction."], ["Never duplicate a rejected ad hoping one passes", "It works occasionally and it is the fastest route to account-level restriction, which on a single-account cold start is terminal. Submit one review request through the proper channel, or fix the specific violating element and relaunch as a new ad. The classifier is not matching on the campaign name."]], "recon": [["Four systems, four questions, no single answer", "Shopify answers how many transactions occurred. Meta answers how many purchases were influenced within its attribution window. GA4 answers how users behaved across channels. BigQuery is where the differences get resolved. Forcing them into one number destroys information; understanding the delta preserves it."], ["Under fifteen percent is normal and should be said out loud", "A persistent delta inside that band is attribution methodology rather than a fault, and treating it as a problem wastes weeks. Establishing the normal range early, and stating it to stakeholders before anyone asks, prevents the recurring conversation where every reporting discussion restarts from suspicion."], ["Order and revenue deltas diverging points at value", "If order counts are close but revenue is not, the fault is in the value or currency parameter rather than in counting. That distinction narrows an eight-item list to one item immediately, which is why it has its own branch in the diagram and its own calculated field in the dashboard."], ["The Rx branch is unique to this catalog", "Payment precedes clinical approval, so Meta counts an order the back end may never fulfil, and there is no correcting event. This will present as a permanent Meta over-report that no amount of deduplication work resolves, because the problem is event timing rather than event duplication. Anyone diagnosing it as a dedup fault will not find it."], ["Timezone misalignment produces a phantom delta forever", "Meta reports in the ad account timezone and Shopify in the store timezone. If those differ, every daily comparison carries a fixed error that looks like an attribution problem and never resolves. Aligning them is a five-minute check that prevents a recurring investigation."]], "rtg": [["Mutual exclusivity stops you bidding against yourself", "Without the exclusions, a user who initiated checkout yesterday sits in all six audiences simultaneously. Six of your own ad sets then compete for the same impression, inflating CPM with your own money, and the user receives six different messages with no coherent sequence. Each tier excluding every tier above it is not tidiness, it is auction hygiene."], ["Six tiers is the full expression, not the requirement", "If a lane cannot populate six ad sets above roughly a thousand people, collapse to three: hot, warm and engaged. Three tiers that exit learning outperform six that never do. Building the full structure on a pool that cannot support it is a common way accounts look sophisticated and deliver badly."], ["Creative changes by tier or the tiers are pointless", "Prospecting introduces, warm resolves objections, hot closes. Running the same asset across every tier means paying a retargeting premium for reach you already bought at prospecting rates. Length inverts with intent: a cold viewer needs a reason to keep watching, a hot viewer needs a reason to click now."], ["The purchaser exclusion window differs by product", "A $299 emergency kit is a durable purchase with a long replenishment cycle, so 180 days. A supplement is consumable, so 30. Applying one window across the catalog either burns budget re-reaching kit buyers or suppresses supplement buyers who are ready to reorder. The window is a product decision, not a platform setting."], ["Frequency ceilings rise as intent rises", "Hot retargeting tolerates a frequency of six because the window is short and the intent is high. Prospecting does not tolerate anything above roughly 2.5, because rising frequency on cold traffic means the audience is exhausting rather than converting. A single account-wide frequency cap gets both wrong."]], "budgetflow": [["Month one is a single lane, deliberately", "Splitting a cold budget across lanes produces multiple learning-limited lanes and no learning anywhere. The instinct to diversify is precisely wrong at the start, because diversification assumes you know what works and the entire point of month one is that you do not. Concentration first, expansion only into the gap a working lane leaves."], ["The testing allocation is ring-fenced and never borrowed", "In a category where the claim space is fixed and cannot be expanded, testing is not discretionary spend to be raided during a soft week. It is the mechanism that produces next quarter's scaling creative. Every account that ends up with an empty creative pipeline arrived there by treating this line as flexible."], ["Gated allocation is zero until authorisation is written down", "Not until it is likely, not until someone says it is in progress. When it opens, it is funded from a reallocation with a defined ceiling rather than an uncapped addition, because gated categories carry disproportionate account risk and the exposure should be bounded by choice rather than by accident."], ["Retargeting sits outside the scaling CBO below $3,000 daily", "Warm conversions are cheaper, so an unconstrained CBO moves budget into retargeting until prospecting starves. The pool then depletes because nothing refills it, and performance collapses six to eight weeks later with no obvious cause. Ad set spend minimums and maximums solve this at scale; below that threshold, separation is the only reliable control."], ["The seasonal reserve exists for one specific lane", "Emergency kits are the only part of the catalog with a plausible event-driven demand curve. Holding three to five percent unallocated means budget can flex toward that lane at short notice rather than being pulled out of working campaigns mid-cycle, which costs a learning phase every time."]], "subs": [["A failed card is not a lost customer", "Involuntary churn typically runs at thirty to forty percent of total churn and is recoverable at almost no cost. Treating it as churn writes off revenue that a retry schedule, a card updater and a pre-dunning email would recover. It is the cheapest revenue available anywhere in the account and it requires no media spend at all."], ["Pre-dunning beats post-dunning", "Reaching the customer before the charge fails outperforms recovery afterwards, because the message is administrative rather than remedial and the customer is not yet in a failure state. Card expiry dates are known in advance, which makes this a scheduling problem rather than a persuasion one."], ["Implied lifespan is the number to feed the LTV model", "Monthly churn converts directly into an average subscription lifespan, and that figure is observed rather than assumed. Using it in the LTV tool instead of a retention guess removes the single most uncertain input in the whole model, which is what makes the LTV to CAC ratio trustworthy enough to bid against."], ["Cancellation reasons belong in the creative ledger", "They are the cheapest source of objection insight available and almost nobody reads them. A customer explaining why they left is describing the objection that retargeting creative should be answering. Routing that back into the brief closes a loop most accounts leave open."], ["Membership attach changes what acquisition can pay", "Every arrow into the active subscription state represents a customer whose affordable CPA just rose substantially. If attach rate is meaningful, the acquisition target should be set against subscription contribution rather than first-order contribution, and the campaign optimising toward membership is usually the most under-funded one in the account."]], "lookermodel": [["Nine dimensions from one field", "Brand, market, lane, funnel stage, purpose, budget type and gated flag all parse out of the campaign name, with audience and creative attributes coming from the ad set and ad names. No lookup table, no manual tagging, no maintenance. This is the entire payoff of the underscore convention and it is why the convention is worth enforcing."], ["A naming mistake surfaces as a null, not as a wrong number", "That is the failure mode you want, because a null is visible and a wrong number is not. Build a chart that counts null dimensions and put it on the reconciliation page. A campaign named outside the convention will appear there within a day rather than quietly polluting a lane total for a quarter."], ["Never sum Meta revenue and Shopify revenue silently", "A single Revenue metric that combines both is the fastest way to lose a stakeholder's trust in the entire dashboard, because the moment someone spots it every other number becomes suspect. Label the source on every revenue scorecard, even where it feels redundant."], ["The clinical property never enters this model", "Class B data does not belong in a shared reporting layer at all, regardless of who currently has access. Row-level access controls are a mitigation, not a solution, and the safer position is that the data never arrives. This is also the easiest part of the architecture to compromise under deadline pressure, which is why it is drawn explicitly."], ["Renaming a campaign breaks every blend silently", "The row does not error, it simply disappears from the blended table. Nobody notices until a lane total looks low weeks later. Lock campaign names at creation and treat renaming as a structural change requiring the same care as a budget change."]], "pipeline": [["A third of the deck needs no photography", "Digital mock-ups and typographic assets ship in days, which means batch one does not wait on a shoot. On a constrained budget that matters enormously, because a two-week production lead time before the first test is two weeks of budget not learning anything. Sequence the shoot-free assets first deliberately."], ["One shoot should yield five assets", "Three hook variants, a 1:1 cut and a static from the same footage. A shoot that produces one finished ad is a wasted day, and it is the reason most teams cannot sustain a fortnightly cadence. Brief for variants at the point the shoot is planned, not after the edit."], ["Compliance sits inside production, not after it", "Raw footage review before edit is the specific control, because that is the point at which a drifted claim is still cheap to fix. If review turnaround exceeds five days the cadence cannot run and the schedule needs rebuilding around the real constraint. Agree the turnaround before launch."], ["Kills go into the ledger with a hypothesis", "A creative that failed for an identifiable reason has paid for itself if it removes a hypothesis from the roadmap. Recording only winners produces a highlight reel; recording both produces a map. Over six cycles the ledger becomes more valuable than any individual winning asset."], ["The loop from scaling back to brief is the whole system", "Fatigue in the scaling campaign feeds the next brief, and the ledger feeds it too. If that loop is broken the account produces creative on a schedule rather than in response to what it learned, and the results stop compounding. An account that accumulates ads rather than learnings will plateau regardless of budget."]], "attrpath": [["Two of six touches receive credit", "Touch five takes the click credit under a seven-day click window and touch six takes view credit under the one-day view window. Touches one through four influenced the same purchase and receive nothing at all. This is not a bug and no window setting fixes it, because any credit-assignment rule has to choose someone and it will always choose whoever was nearest the conversion."], ["The Google search step is where most leakage happens", "A user who searches the brand name and buys from the result is a paid-influenced purchase arriving through an organic or direct path. On a $299 considered purchase this is common rather than exceptional, which means the back end shows orders no campaign claims. Some of those genuinely are organic. A meaningful share are the tail of exactly this path."], ["The dangerous decision is killing the uncredited touches", "An ad with impressions and no attributed conversions looks like waste on its own row. Removing it does not show up immediately, because the credited ad keeps converting users already in the path. It shows up four to six weeks later when the path stops being fed and the closing ad starts underperforming for no visible reason, at which point nobody connects it to a decision made a month earlier."], ["Continued delivery is evidence, not proof", "Meta does not run a documented ad-level model that assigns assist roles and keeps an ad alive for its position in a sequence. Ad-level delivery is driven by predicted conversion rate and estimated action rate. An ad still taking meaningful spend is therefore weak evidence the model sees something useful, and it is not confirmation of a sequence role. Useful as a signal, not as a rule."], ["The defensible reason to hold is statistical", "Below three to five times target CPA in spend, an ad with zero conversions is indistinguishable from a good ad that got unlucky. That argument survives scrutiny from a finance director in a way an assumed assist model does not, and it produces the same decision. Hold below the minimum read, then judge on an account-level pause test rather than on the row."], ["Only a holdout answers the causal question", "No window setting reveals what would have happened without the ad. A geo holdout does, by comparing matched regions with the lane suppressed against regions where it runs. Everything else is a proxy, and MER is the most useful proxy because it is attribution-free. The holdout is the right tool when the decision is large enough to justify the revenue withheld to run it."]], "gaccount": [["Three types capture, three create", "Branded search, non-brand search and Shopping all capture demand that already exists. Demand Gen and YouTube create it. Performance Max does both and will not tell you which, which is why brand exclusions matter more there than anywhere else in the account."], ["The trap sits on the branded arm", "The customer path frequently includes a brand search after a Meta impression. Branded search then converts at an excellent reported rate on demand it did not generate, and any blended comparison will name it the best channel in the account."], ["Demand Gen and YouTube are shaded green for a reason", "They are the only two Google surfaces where the Meta creative deck and the Meta testing methodology both transfer without rework. If the creative already exists, they are the cheapest expansion available."], ["PMax feeding back into branded search is a real path", "Brand exclusions default to off. Left that way, PMax absorbs branded search traffic, reports it as new performance and hollows out the brand campaign at the same time, so both numbers move and neither is telling the truth."]], "gsearch": [["The leverage is at the bottom two levels", "Campaign settings and ad groups get restructured constantly and rarely change anything. Keywords, match types and negatives are where search accounts are actually won, and the search terms report is where all three come from."], ["Two RSAs per ad group is the practical maximum", "Google will not split delivery evenly across more, and asset ratings carry no cost or conversion data. Two ads with genuinely different angles, read at ad level over a longer window than a Meta test, is the most granular honest read available."], ["The loop is the whole system", "Converting search terms become new exact keywords. Wasted terms become negatives. Run weekly for the first eight weeks, then monthly. Skipping it means paying for the same wasted terms every month while the converting ones stay unbid."], ["Broad match is a decision, not a default", "It opens volume and waste in the same move. It is workable once the negative list has been through eight weeks of weekly review, and it is expensive before that."]], "gpmax": [["Asset groups by theme, never by product", "A theme gives Google enough signal to learn a pattern. A product gives it a fragment. Splitting by product is the most common PMax structural mistake and it cannot be diagnosed afterwards, because asset-level reporting does not exist."], ["Brand exclusions default to off", "This is the single most expensive default in the platform. Left off, PMax serves against your own brand searches, takes credit for traffic branded search already owned, and inflates itself while the brand campaign appears to decline."], ["Supply a video or Google will make one", "The auto-generated video assembled from stills is usually worse than no video at all, and it will run against your brand without anyone approving it. One real video per asset group prevents it."], ["PMax outranks standard Shopping on shared inventory", "If both run on the same products, PMax takes the traffic. The Shopping campaign then looks like it stopped working, and nothing about how it was built has changed. Decide which one owns which products before launching either."], ["Structure before launch, because there is no diagnosis after", "No placement-level cost, no full search terms, no asset-level conversions. Every other campaign type can be fixed by reading the data. This one has to be right the first time."]], "gscale": [["The ceiling is reported, not inferred", "This is the structural advantage over Meta. On Meta the ceiling is discovered by watching marginal CPA deteriorate. On Google, impression share states directly how much of the available auction you are not showing up for."], ["Lost to budget and lost to rank need opposite responses", "Losing share to budget means the auction is winnable and you are absent from it, so budget works. Losing share to rank means you are being outranked rather than outspent, and budget buys worse positions at a worse cost."], ["Quality Score is the cheaper of the two rank levers", "Ad relevance, expected click-through rate and landing page experience improve position without raising cost per click. The landing page work also improves conversion rate, so it pays twice. Raising bids works and it raises CPA by definition."], ["Under ten percent headroom means the bidding conversation is over", "At that point more budget and higher bids both buy almost nothing. Scaling becomes new keyword themes, a new campaign type or a new geography, which is a different kind of work and a different timeline."], ["Raise in steps even when budget is clearly the constraint", "The incremental impressions are the ones you were previously outbid on, which means someone else valued them more. Expect them to convert slightly worse and measure rather than assume."]], "gdemand": [["This diagram is the cross-channel argument", "Everything else in the Google section supports it. Meta creates demand the user was not looking for, the user searches the brand days later, and the branded ad claims the conversion. The reporting is accurate and the conclusion drawn from it is wrong."], ["The Meta side of the path frequently receives nothing", "If the brand search happens beyond the seven-day click window, or the user never clicked the Meta ad at all, Meta reports nothing. The conversion appears as branded search or as organic, and the channel that generated it looks weak."], ["The failure arrives three to six weeks later", "Cut Meta and fund Google on this reading, and branded search volume falls, because nobody is creating the demand that produces the searches. By the time it shows up, the decision is far enough back that few people connect the two."], ["The defence is measurement, not argument", "A branded search pause test and a Meta geo holdout each cost a defined amount and settle the question. Running neither means the budget conversation is decided by whichever platform reports more confidently, which is always the one capturing rather than creating."]], "gterms": [["Most waste and most growth sit in the same report", "Terms nobody chose are where the wasted spend lives, and converting terms nobody chose are where the next keyword set comes from. One report, read weekly, answers both."], ["Categorise into five, not two", "Brand, exact intent, adjacent, informational and irrelevant. Sorting into good and bad collapses the two categories that need judgement rather than action, which is where adjacent terms get negatived when they should have been split into their own ad group with their own bid."], ["Negatives belong before launch", "A minimum list of free, cheap, DIY, how to make, side effects, recall, lawsuit and competitor names costs ten minutes and saves the first month. Building it afterwards means paying for the education."], ["Promoting a converting term is not the same as leaving it running", "A term converting inside a phrase match keyword is being bid at that keyword's price. Promoting it to exact with its own bid and its own ad copy usually improves both cost and conversion rate."]]};
var mmKey='arch', mmReady=false;
function initMermaid(){
  if(typeof mermaid==='undefined')return false;
  if(!mmReady){
    mermaid.initialize({startOnLoad:false,theme:'base',securityLevel:'loose',
      themeVariables:{
        primaryColor:'#f2f5f9',primaryTextColor:'#16202e',primaryBorderColor:'#c2cbd8',
        lineColor:'#6b7889',secondaryColor:'#e7ecf3',tertiaryColor:'#fff',
        fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
        fontSize:'13px',clusterBkg:'#fafbfd',clusterBorder:'#d5dce6'}});
    mmReady=true;
  }
  return true;
}
function drawMap(){
  var M=MAPS[mmKey];
  $('mm-desc').textContent=M.d;
  var nts=MMNOTES[mmKey]||[];
  $('mm-ncount').textContent=nts.length+' notes';
  $('mm-dsub').textContent=M.t+'. Click the header to collapse.';
  $('mm-notes').innerHTML=nts.map(function(n,i){
    var open=(i===0&&!ntCollapsed)?' open':'';
    return '<div class="nt'+open+'" data-nt="'+i+'">'+
      '<div class="nthead"><span class="ntn">'+(i+1)+'</span><span class="ntt">'+n[0]+'</span></div>'+
      '<div class="ntb">'+n[1]+'</div></div>';
  }).join('');
  $('mm-src').textContent=M.m;
  var box=$('mm-canvas'), fall=$('mm-fall');
  if(!initMermaid()){
    box.innerHTML='';fall.style.display='block';
    fall.textContent=M.m+'\n\n[Diagram library unavailable offline. Copy the source above into any Mermaid renderer.]';
    return;
  }
  fall.style.display='none';
  box.innerHTML='';
  var id='mm'+Date.now();
  try{
    mermaid.render(id,M.m).then(function(r){
      box.innerHTML=r.svg; prepSvg(); fitDiagram();
    }).catch(function(){
      fall.style.display='block';fall.textContent=M.m;
    });
  }catch(err){fall.style.display='block';fall.textContent=M.m}
  $('mm-ptitle').textContent=M.t;
  $('mm-psub').textContent=M.d;
}

/* ---- map accordions ---- */
var ntCollapsed=false;
document.addEventListener('click',function(e){
  var h=e.target.closest('.acchead[data-acc]');
  if(h){
    var a=$(h.dataset.acc); a.classList.toggle('open');
    h.querySelector('.chev').innerHTML=a.classList.contains('open')?'&#8722;':'+';
    if(h.dataset.acc==='acc-dia'){$('mm-tdia').textContent=a.classList.contains('open')?'Hide diagram':'Show diagram';
      if(a.classList.contains('open'))setTimeout(fitDiagram,60);}
    if(h.dataset.acc==='acc-stxt'){}
    if(h.dataset.acc==='acc-src')$('mm-tsrc').textContent=a.classList.contains('open')?'Hide source':'Show source';
    return;
  }
  var n=e.target.closest('.nthead');
  if(n){ n.parentNode.classList.toggle('open'); }
});
function tog(id,btn,onTxt,offTxt){
  var a=$(id), open=a.classList.toggle('open');
  a.querySelector('.chev').innerHTML=open?'&#8722;':'+';
  $(btn).textContent=open?onTxt:offTxt;
}
$('mm-tdia').addEventListener('click',function(){tog('acc-dia','mm-tdia','Hide diagram','Show diagram');setTimeout(fitDiagram,60)});
$('mm-tsrc').addEventListener('click',function(){tog('acc-src','mm-tsrc','Hide source','Show source')});
$('mm-tnot').addEventListener('click',function(){
  var nts=document.querySelectorAll('#mm-notes .nt');
  var anyOpen=false;
  Array.prototype.forEach.call(nts,function(x){if(x.classList.contains('open'))anyOpen=true});
  Array.prototype.forEach.call(nts,function(x){x.classList.toggle('open',!anyOpen)});
  ntCollapsed=anyOpen;
  $('mm-tnot').textContent=anyOpen?'Expand all notes':'Collapse all notes';
  if(!$('acc-not').classList.contains('open')){
    $('acc-not').classList.add('open');
    $('acc-not').querySelector('.chev').innerHTML='&#8722;';
  }
});


/* ---- diagram viewer: zoom, pan, present, export ---- */
var vz={s:1,x:0,y:0,drag:false,px:0,py:0,pinch:0};
function vApply(){
  var c=$('mm-canvas');
  c.style.transform='translate('+vz.x+'px,'+vz.y+'px) scale('+vz.s+')';
  $('mm-zoom').textContent=Math.round(vz.s*100)+'%';
}
function prepSvg(){
  var svg=$('mm-canvas').querySelector('svg'); if(!svg)return;
  var vb=svg.getAttribute('viewBox'), w, h;
  if(vb){var a=vb.split(/[\s,]+/); w=parseFloat(a[2]); h=parseFloat(a[3]);}
  else {w=svg.clientWidth||900; h=svg.clientHeight||600;}
  svg.style.maxWidth='none';
  svg.setAttribute('width',w); svg.setAttribute('height',h);
  svg.dataset.w=w; svg.dataset.h=h;
}
function fitDiagram(){
  var svg=$('mm-canvas').querySelector('svg'); if(!svg)return;
  var st=$('mm-stage');
  var w=parseFloat(svg.dataset.w)||svg.clientWidth, h=parseFloat(svg.dataset.h)||svg.clientHeight;
  var pad=44;
  var sw=st.clientWidth-pad, sh=st.clientHeight-pad;
  vz.s=Math.max(0.12,Math.min(sw/w, sh/h, 1.6));
  vz.x=(st.clientWidth-w*vz.s)/2;
  vz.y=(st.clientHeight-h*vz.s)/2;
  vApply();
}
function vZoom(f,cx,cy){
  var st=$('mm-stage'), r=st.getBoundingClientRect();
  if(cx===undefined){cx=st.clientWidth/2; cy=st.clientHeight/2}
  else {cx=cx-r.left; cy=cy-r.top}
  var ns=Math.max(0.12,Math.min(6,vz.s*f));
  vz.x=cx-(cx-vz.x)*(ns/vz.s);
  vz.y=cy-(cy-vz.y)*(ns/vz.s);
  vz.s=ns; vApply();
}
(function(){
  var st=$('mm-stage');
  st.addEventListener('wheel',function(e){
    e.preventDefault();
    vZoom(e.deltaY<0?1.12:1/1.12,e.clientX,e.clientY);
  },{passive:false});
  st.addEventListener('pointerdown',function(e){
    if(e.target.closest('.mmctl'))return;
    vz.drag=true; vz.px=e.clientX; vz.py=e.clientY;
    st.classList.add('drag'); st.setPointerCapture(e.pointerId);
  });
  st.addEventListener('pointermove',function(e){
    if(!vz.drag)return;
    vz.x+=e.clientX-vz.px; vz.y+=e.clientY-vz.py;
    vz.px=e.clientX; vz.py=e.clientY; vApply();
  });
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
    st.addEventListener(ev,function(){vz.drag=false; st.classList.remove('drag')});
  });
  st.addEventListener('dblclick',function(e){
    if(e.target.closest('.mmctl'))return;
    vZoom(1.5,e.clientX,e.clientY);
  });
})();
$('z-in').addEventListener('click',function(){vZoom(1.25)});
$('z-out').addEventListener('click',function(){vZoom(1/1.25)});
$('z-fit').addEventListener('click',fitDiagram);
function togglePresent(){
  var st=$('mm-stage'), on=st.classList.toggle('present');
  document.body.classList.toggle('presenting',on);
  $('z-pres').textContent=on?'Exit':'Present';
  $('mm-hint').textContent=on?'Drag to pan · scroll to zoom · Esc to exit':'Drag to pan · scroll to zoom';
  setTimeout(fitDiagram,60);
}
$('z-pres').addEventListener('click',togglePresent);
document.addEventListener('keydown',function(e){
  var pres=$('mm-stage').classList.contains('present');
  if(e.key==='Escape'&&pres){togglePresent();return}
  if(!pres&&!$('v-maps').classList.contains('on'))return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='+'||e.key==='='){vZoom(1.25);e.preventDefault()}
  if(e.key==='-'||e.key==='_'){vZoom(1/1.25);e.preventDefault()}
  if(e.key==='0'){fitDiagram();e.preventDefault()}
  if(e.key==='ArrowRight'){$('mm-next').click();e.preventDefault()}
  if(e.key==='ArrowLeft'){$('mm-prev').click();e.preventDefault()}
});
function svgString(){
  var svg=$('mm-canvas').querySelector('svg'); if(!svg)return null;
  var c=svg.cloneNode(true);
  c.setAttribute('xmlns','http://www.w3.org/2000/svg');
  c.insertBefore(document.createComment(' '+MAPS[mmKey].t+' '),c.firstChild);
  var bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width','100%'); bg.setAttribute('height','100%'); bg.setAttribute('fill','#ffffff');
  c.insertBefore(bg,c.firstChild);
  return new XMLSerializer().serializeToString(c);
}
function dl(blob,name){
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(a.href)},1200);
}
$('z-svg').addEventListener('click',function(){
  var str=svgString(); if(!str)return;
  dl(new Blob([str],{type:'image/svg+xml;charset=utf-8'}),'twc-'+mmKey+'.svg');
});
$('z-png').addEventListener('click',function(){
  var svg=$('mm-canvas').querySelector('svg'); if(!svg)return;
  var str=svgString(); if(!str)return;
  var w=parseFloat(svg.dataset.w)||900, h=parseFloat(svg.dataset.h)||600, k=2;
  var img=new Image();
  img.onload=function(){
    var cv=document.createElement('canvas'); cv.width=w*k; cv.height=h*k;
    var ctx=cv.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.drawImage(img,0,0,cv.width,cv.height);
    try{ cv.toBlob(function(b){ if(b)dl(b,'twc-'+mmKey+'.png') }); }
    catch(err){ alert('PNG export blocked here. Use SVG, which opens in any editor.') }
  };
  img.onerror=function(){ alert('PNG export unavailable. Use SVG instead.') };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str);
});
window.addEventListener('resize',function(){
  if($('v-maps').classList.contains('on'))setTimeout(fitDiagram,80);
});

var MKEYS=Object.keys(MAPS);
$('mm-tabs').innerHTML=MKEYS.map(function(k,i){
  return '<button class="tab'+(i===0?' on':'')+'" data-m="'+k+'">'+MAPS[k].t+'</button>';
}).join('');
var MGRP={gaccount:'Google',gsearch:'Google',gpmax:'Google',gscale:'Google',gdemand:'Google',gterms:'Google',arch:'Account',twocamp:'Account',budgetflow:'Account',rtg:'Account',scaling:'Account',
 dataclass:'Measurement',recon:'Measurement',shopmeta:'Measurement',lookermodel:'Measurement',attrpath:'Measurement',
 funnels:'Journey',lifecycle:'Journey',subs:'Journey',onboard:'Journey',
 cycle:'Creative',creative:'Creative',pipeline:'Creative',compflow:'Creative',
 cpa:'Decision',ltvcac:'Decision',ninety:'Decision'};
(function(){
  var groups={};
  MKEYS.forEach(function(k){var g=MGRP[k]||'Other';(groups[g]=groups[g]||[]).push(k)});
  var h='';
  Object.keys(groups).forEach(function(g){
    h+='<optgroup label="'+g+'">'+groups[g].map(function(k){
      return '<option value="'+k+'">'+MAPS[k].t+'</option>';
    }).join('')+'</optgroup>';
  });
  $('mm-sel').innerHTML=h;
})();
function selectMap(k){
  mmKey=k;
  $('mm-sel').value=k;
  Array.prototype.forEach.call($('mm-tabs').children,function(x){x.classList.toggle('on',x.dataset.m===k)});
  $('mm-idx').textContent=(MKEYS.indexOf(k)+1)+' of '+MKEYS.length;
  drawMap();
}
$('mm-sel').addEventListener('change',function(){selectMap(this.value)});
$('mm-prev').addEventListener('click',function(){
  var i=MKEYS.indexOf(mmKey); selectMap(MKEYS[(i-1+MKEYS.length)%MKEYS.length]);
});
$('mm-next').addEventListener('click',function(){
  var i=MKEYS.indexOf(mmKey); selectMap(MKEYS[(i+1)%MKEYS.length]);
});
