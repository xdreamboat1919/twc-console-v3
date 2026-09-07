/* ================= DIAGNOSTIC LIBRARY ================= */
function diagResult(title, body, checks, actions, avoid, go, goLabel){
  return {t:title,b:body,check:checks||[],act:actions||[],avoid:avoid||'',go:go||'',goLabel:goLabel||''};
}
function quickDiagnosis(key, category, name, description, question, choices, tags){
  var ends={},options=[];
  choices.forEach(function(choice,index){
    var resultId='r'+(index+1);
    options.push([choice[0],resultId]);
    ends[resultId]=choice[1];
  });
  return {k:key,cat:category,n:name,d:description,tags:tags||'',start:'q1',nodes:{q1:{q:question,why:description,o:options}},ends:ends};
}

var DIAG_CATEGORIES=[
  'Performance','Delivery and learning','Budget and scaling','Creative','Funnel and store',
  'Measurement','Audiences','Policy and account','Google Ads','Operations'
];

var DIAGNOSES=[
  {
    k:'cpa',cat:'Performance',n:'CPA is rising',
    d:'Separate a real acquisition problem from reporting noise, then locate the first layer that changed.',
    tags:'cost per acquisition purchase cost efficiency meta shopify backend',start:'q1',
    nodes:{
      q1:{q:'Do Meta and the back end show the same direction?',why:'Compare the same dates, timezone, attribution scope and order definition before touching delivery.',o:[['No, only Meta looks worse','r_track'],['Yes, both show CPA rising','q2']]},
      q2:{q:'Did CPM rise by roughly 15 percent or more?',o:[['Yes','r_cpm'],['No, CPM is stable','q3']]},
      q3:{q:'Did link CTR fall by roughly 20 percent or more?',o:[['Yes','r_creative'],['No','q4']]},
      q4:{q:'Did landing-page views per link click fall?',o:[['Yes','r_dest'],['No','q5']]},
      q5:{q:'Where is the first downstream deterioration?',o:[['Landing view to add to cart','r_offer'],['Add to cart to checkout','r_checkout'],['Checkout to purchase','r_final'],['No funnel rate changed','r_mix']]}
    },
    ends:{
      r_track:diagResult('Reporting or tracking fault','The business result did not move with the platform result, so campaign optimisation would react to the wrong signal.',['Reconcile order count, timezone, attribution window and new-customer definition.','Check deduplication and Purchase timing.'],['Hold campaign changes until the same order cohort reconciles.'],'Do not cut working spend from a platform-only movement.','track','Open Tracking'),
      r_cpm:diagResult('Auction pressure or saturation','Traffic costs more before it reaches the ad. Frequency and reach distinguish external competition from an exhausted audience.',['Compare frequency and reached audience against the prior window.','Check whether the increase is account-wide or lane-specific.'],['Broaden only when reach has flattened and frequency is climbing.','If frequency is stable, hold structure and reassess affordable CPA.'],'Do not call every CPM increase creative fatigue.','aud','Open Audience build'),
      r_creative:diagResult('Creative or delivery-mix deterioration','The auction held while fewer impressions became clicks. Validate fatigue against comparable fresh creative.',['Compare hook rate, link CTR, frequency and placement mix.','Run fresh creative under comparable delivery.'],['Retire the old asset only if fresh creative wins the same conditions.'],'Do not rotate every asset at once; that destroys the comparison.','creative','Open Creative testing'),
      r_dest:diagResult('Destination failure','Clicks are being purchased but are not becoming page sessions. Page speed, redirects or a broken URL sit between those events.',['Open every live destination on mobile.','Compare outbound clicks with landing-page views by URL.'],['Repair the page or link before changing ads.'],'No bid or audience change fixes a broken arrival step.','store','Open Store health'),
      r_offer:diagResult('Product-page or offer problem','Traffic arrives, but fewer visitors show product intent. Price, stock, message match and trust are the first suspects.',['Review price, stock, page version and paid-traffic mix.','Check whether one product or destination owns the decline.'],['Restore message match or fix the offer before producing more ads.'],'Do not blame checkout when shoppers never add to cart.','store','Open Store health'),
      r_checkout:diagResult('Cart-to-checkout friction','Visitors show intent but do not begin checkout. Unexpected shipping, weak trust or an offer condition is arriving too late.',['Test cart and checkout entry on mobile.','Check shipping, discounts and delivery-time disclosure.'],['Remove the first new point of friction and remeasure one full cycle.'],'Do not change creative when qualified visitors are already adding to cart.','store','Open Store health'),
      r_final:diagResult('Payment, final-step or Purchase-event failure','Checkout starts are stable and completed purchases fell. The break is at payment, fulfilment logic or event firing.',['Check gateway decline rate and checkout errors.','Confirm Purchase fires once at the intended business milestone.'],['Fix payment or event integrity before adjusting media.'],'Do not optimise to a Purchase event that no longer matches a valid order.','track','Open Tracking'),
      r_mix:diagResult('Composition shift','Every step rate held, so the summary moved because the traffic, product or customer mix changed.',['Split prospecting from retargeting and new from returning.','Break CPA down by product lane, placement and geography.'],['Manage the segment that changed instead of editing the whole account.'],'Do not use blended CPA to diagnose a stable funnel.','blend','Open Blended metrics')
    }
  },

  quickDiagnosis('roas','Performance','ROAS is falling','ROAS can fall because acquisition became more expensive, order value fell, or platform credit moved.', 'What changed alongside ROAS?',[
    ['CPA rose while AOV held',diagResult('Acquisition efficiency fell','The cost side moved while customer value held. Diagnose CPM, CTR and the funnel in order.',['Confirm CPA in the back end.','Locate the first cost-per-step increase.'],['Run the CPA rising diagnosis next.'],'Do not treat an unchanged AOV as an offer failure.','recovery','Open ROAS recovery')],
    ['AOV fell while CPA held',diagResult('Value or product mix fell','Media acquired customers at the same cost, but each order was worth less.',['Split AOV by product, discount and new versus returning.','Confirm event value excludes neither valid items nor valid revenue.'],['Correct the mix, offer or value payload.'],'Do not cut acquisition when customer cost is stable.','store','Open Store health')],
    ['Neither moved in the back end',diagResult('Attribution or reporting moved','Platform ROAS changed without the commercial inputs changing.',['Compare attribution settings and reporting windows.','Reconcile platform revenue to backend revenue.'],['Use MER and backend acquisition ROAS until the platform view stabilises.'],'Do not optimise to a credit-assignment change.','attr','Open Attribution')]
  ],'return on ad spend revenue value attribution'),

  quickDiagnosis('revenue-flat','Performance','Revenue is flat while ROAS looks healthy','An efficient platform number can hide retargeting concentration, low new-customer volume or a smaller order mix.','What happened to new-customer orders?',[
    ['They fell while returning orders rose',diagResult('The blend is being flattered by returning demand','Retargeting or existing customers are replacing acquisition, so reported efficiency improved without growth.',['Separate new-customer CPA and revenue.','Check prospecting share and exclusions.'],['Restore a deliberate prospecting allocation.'],'Do not scale retargeting because its blended ROAS looks strongest.','blend','Open Blended metrics')],
    ['They are flat with flat spend',diagResult('The account is efficient but not scaling','Nothing is broken; the current structure is holding the same volume.',['Check marginal CPA headroom and validated creative supply.'],['Scale in measured steps if the economics clear.'],'Do not promise growth from unchanged acquisition volume.','scale','Open Scale')],
    ['Orders held but revenue fell',diagResult('AOV or product mix declined','The same order volume is producing less revenue.',['Split orders by product, discount and subscription mix.'],['Work the offer and mix before adding spend.'],'Do not ask media to recover value lost after the click.','offers','Open Offers')]
  ],'growth mer new customer returning cannibalisation'),

  quickDiagnosis('cpm-rise','Performance','CPM jumped','A broad auction shift, audience saturation and a placement-mix change require different responses.','Where did CPM rise?',[
    ['Across nearly every campaign',diagResult('Market-wide auction pressure','The movement is external or seasonal when frequency and mix stay stable across lanes.',['Compare the same weekday and seasonal period.','Check account-wide placement mix.'],['Hold structure; reduce spend only if the new CPM breaks unit economics.'],'Do not rebuild campaigns to solve an auction price.','econ','Open Economics')],
    ['Only in one audience or lane',diagResult('Audience saturation or lane-specific competition','A local increase points to constrained reach rather than the entire auction.',['Check frequency and percent of audience reached.'],['Broaden or refresh only the affected lane.'],'Do not disturb healthy lanes.','aud','Open Audience build')],
    ['Only after placements changed',diagResult('Delivery mix changed','The campaign is buying a different inventory bundle, so the aggregate CPM is not comparable.',['Compare spend share, CPM and conversion rate by placement.'],['Judge marginal CPA by placement before excluding anything.'],'Do not chase the cheapest CPM without conversion quality.','diag','Stay in Diagnose')]
  ],'auction competition seasonality cost impressions'),

  quickDiagnosis('ctr-drop','Performance','CTR dropped','A falling click rate can be fatigue, a colder audience, a placement shift or a changed promise.','What changed with CTR?',[
    ['Frequency rose and fresh creative wins',diagResult('Creative fatigue','Repeated exposure reduced response and a fresh asset proves the creative is the variable.',['Confirm the comparison used the same audience and placement mix.'],['Replace the fatigued asset in stages.'],'Do not pause every incumbent before the replacement takes spend.','creative','Open Creative testing')],
    ['Audience or placement mix changed',diagResult('Delivery composition changed','The ad is now reaching different people or inventory, so the raw CTR comparison is not like-for-like.',['Compare CTR within each placement and audience.'],['Fix the unintended delivery shift or accept the new segment economics.'],'Do not rewrite the ad before controlling for mix.','aud','Open Audience build')],
    ['Nothing obvious changed',diagResult('Creative relevance is weakening','With auction and mix stable, the message is producing less intent.',['Compare hook rate and outbound CTR.','Check comments and landing-page message match.'],['Brief new hooks against the same proven concept.'],'Do not change the offer, audience and creative together.','briefs','Open Briefs')]
  ],'click through rate hook fatigue relevance'),

  quickDiagnosis('cpc-rise','Performance','CPC is rising','CPC is the product of impression cost and click rate. Read those two inputs before acting.','Which input explains the CPC increase?',[
    ['CPM rose; CTR held',diagResult('The auction became more expensive','The ad is converting impressions to clicks at the same rate.',['Check frequency and whether CPM rose account-wide.'],['Accept, broaden or reduce based on economics.'],'Do not replace a creative whose CTR held.','econ','Open Economics')],
    ['CTR fell; CPM held',diagResult('The ad or delivery mix weakened','Inventory cost is stable and fewer impressions become clicks.',['Compare frequency, hook rate and placement mix.'],['Validate fresh creative under comparable delivery.'],'Do not raise bids to compensate for a relevance loss.','creative','Open Creative testing')],
    ['Both worsened',diagResult('Two pressures are compounding','Auction cost and response deteriorated together.',['Separate the account-wide CPM change from lane-level CTR change.'],['Address the local CTR problem, then reassess affordability at the new CPM.'],'Do not make a single blended explanation fit both movements.','recovery','Open ROAS recovery')]
  ],'cost per click cpc ctr cpm'),

  quickDiagnosis('no-spend','Delivery and learning','Campaign is not spending','Approval state, schedule, audience availability and cost controls can each stop delivery.','What does the Delivery column show?',[
    ['Rejected, in review or scheduled',diagResult('The campaign is not eligible yet','A setup, review or schedule state is blocking the auction.',['Read the exact delivery status at ad, ad set and campaign level.'],['Resolve eligibility or wait for the stated start time.'],'Do not change bids while the ad cannot enter the auction.','preflight','Open Pre-flight')],
    ['Active, but zero impressions',diagResult('Audience or control is blocking entry','A tiny audience, conflicting exclusions, restrictive bid cap or billing issue can produce an active-looking zero.',['Check audience estimate, exclusions, billing and bid or cost cap.'],['Remove the single blocking constraint and wait for delivery.'],'Do not duplicate the campaign before identifying the block.','aud','Open Audience build')],
    ['Some spend, far below budget',diagResult('The system cannot find enough eligible conversions at the controls','Low delivery is often a tight cost cap or constrained audience rather than a broken campaign.',['Compare actual CPA with the cap and inspect audience size.'],['Loosen one control or consolidate fragmented ad sets.'],'Do not raise budget when the existing budget cannot deliver.','budget','Open Budget')]
  ],'zero delivery active no impressions underspend'),

  quickDiagnosis('spend-drop','Delivery and learning','Spend suddenly dropped','A sharp delivery change is usually eligibility, audience depletion, cost control or a recent edit.','What changed just before spend fell?',[
    ['A disapproval, restriction or billing alert',diagResult('Eligibility interrupted delivery','The account or asset lost auction access.',['Inspect Account Quality and billing before performance metrics.'],['Contain the issue and resolve the stated blocker.'],'Do not compensate by launching duplicates.','preflight','Open Pre-flight')],
    ['Audience shrank or exclusions changed',diagResult('Eligible reach collapsed','The ad set has fewer people it can legally and structurally serve.',['Audit audience windows, seed refresh and exclusions.'],['Repair the audience definition or consolidate.'],'Do not broaden blindly in a restricted product lane.','aud','Open Audience build')],
    ['A bid, budget or optimisation edit was made',diagResult('The edit changed auction participation','A tighter control or learning reset can immediately suppress spend.',['Review change history and the exact edit time.'],['Reverse only the causal edit, then allow a delivery cycle.'],'Do not stack more edits on top of an unreadable change.','budget','Open Budget')],
    ['Nothing changed internally',diagResult('Auction conditions or demand changed','External competition, seasonality or lower available demand can reduce delivery.',['Check CPM, search volume, impression share and weekday pattern.'],['Hold structure unless the new economics no longer clear.'],'Do not invent an internal cause without change-history evidence.','diag','Stay in Diagnose')]
  ],'delivery collapsed stopped spending change history'),

  {
    k:'learn',cat:'Delivery and learning',n:'Ad set will not exit learning',
    d:'Learning problems usually come from insufficient conversion volume, repeated edits or fragmented delivery.',tags:'learning limited 50 conversions ad set fragmentation edits',start:'q1',
    nodes:{
      q1:{q:'Is the ad set receiving roughly 50 optimised conversions per week?',o:[['No','r_budget'],['Yes','q2']]},
      q2:{q:'Was there a meaningful edit during the last seven days?',o:[['Yes','r_edit'],['No','q3']]},
      q3:{q:'Are more than eight creatives competing inside the ad set?',o:[['Yes','r_dilute'],['No','q4']]},
      q4:{q:'Is the audience narrow or heavily excluded?',o:[['Yes','r_narrow'],['No','r_wait']]}
    },
    ends:{
      r_budget:diagResult('The conversion signal is underfed','The budget, CPA and number of ad sets do not produce enough weekly conversions per learning cell.',['Calculate weekly budget divided by target CPA.','Count every ad set optimising to the same event.'],['Consolidate until each remaining cell has a plausible signal.'],'Adding more ad sets makes this worse.','budget','Open Budget'),
      r_edit:diagResult('The learning period was reset','Frequent budget, bid, audience or creative changes prevent a stable read.',['Open change history and identify the latest significant edit.'],['Freeze changes for a full seven-day read.'],'Do not edit daily in response to daily variance.','routine','Open Routines'),
      r_dilute:diagResult('Delivery is diluted across too many ads','Most assets cannot earn enough spend for a useful read.',['Count active ads and their share of spend.'],['Keep a deliberate test set and archive dormant assets.'],'Do not call an asset a loser before it receives a minimum read.','creative','Open Creative testing'),
      r_narrow:diagResult('The eligible audience is too constrained','Small pools and stacked exclusions limit conversion opportunities.',['Audit audience size, overlap and exclusion windows.'],['Broaden or merge adjacent audiences within policy limits.'],'Do not remove required compliance exclusions.','aud','Open Audience build'),
      r_wait:diagResult('The signal may be noisy rather than structurally broken','If volume, edits, creative count and audience all clear, allow time and judge business outcomes.',['Confirm the optimised event is firing cleanly.'],['Hold the structure and monitor seven-day CPA.'],'Do not optimise solely to the learning-status label.','track','Open Tracking')
    }
  },

  quickDiagnosis('cbo-ignore','Delivery and learning','CBO ignores one ad set','CBO allocates to predicted opportunity, not evenly. Uneven spend can be rational or can hide an unread test.','What is the ignored ad set for?',[
    ['It is a controlled test that needs a fair read',diagResult('CBO is the wrong testing allocator','The test cannot answer its question without guaranteed cell spend.',['Confirm the goal is comparison rather than maximum immediate conversions.'],['Move the controlled test to ABO with defined spend per cell.'],'Do not force equal spend inside a scaling CBO.','creative','Open Creative testing')],
    ['It is a scaling ad set similar to the winner',diagResult('CBO predicts less incremental value','Overlap or weaker history makes the ad set redundant.',['Compare audience overlap, CPA and marginal reach.'],['Consolidate if it adds no distinct reach.'],'Do not keep duplicate structure for appearance.','build','Open Structure')],
    ['It is new and has almost no history',diagResult('The incumbent has a delivery advantage','Early signals favour the proven ad set before the new one earns evidence.',['Check whether the new ad set received any minimum test spend elsewhere.'],['Validate it in ABO before expecting CBO to scale it.'],'Do not judge an unserved cell as a failed audience.','creative','Open Creative testing')]
  ],'campaign budget optimisation allocation spend ad set'),

  quickDiagnosis('volatile','Delivery and learning','Results swing sharply day to day','Small samples, recent edits and shifting delivery mix create volatility that a daily CPA cannot explain.','How much conversion data sits behind each day?',[
    ['Fewer than about 10 purchases',diagResult('The daily sample is too small','One or two orders can move CPA dramatically at low volume.',['Read a rolling seven-day window and inspect spend per result.'],['Make decisions only after the minimum spend or conversion threshold.'],'Do not optimise from one low-volume day.','routine','Open Routines')],
    ['Enough data, but edits were made',diagResult('The system is re-learning','The before and after periods are not comparable during a delivery reset.',['Mark edit dates on the trend.'],['Wait one full delivery cycle after the last material change.'],'Do not add another change to smooth the first one.','routine','Open Routines')],
    ['Enough data and no edits',diagResult('Delivery composition is moving','Placements, products, audiences or returning-customer share may be changing under a stable total.',['Break results down by delivery and customer mix.'],['Manage the unstable segment rather than the aggregate.'],'Do not average away a segment-level failure.','blend','Open Blended metrics')]
  ],'variance noisy unstable daily results'),

  {
    k:'budget',cat:'Budget and scaling',n:'Should I increase budget?',
    d:'Scale only when sustained efficiency, marginal economics, creative supply and learning stability agree.',tags:'raise budget increase scale marginal cpa',start:'q1',
    nodes:{
      q1:{q:'Has CPA held at or below target for 14 consecutive days?',o:[['No','r_no'],['Yes','q2']]},
      q2:{q:'Is marginal CPA on the latest spend increment acceptable?',o:[['No','r_ceiling'],['Yes','q3']]},
      q3:{q:'Are at least two validated creatives available?',o:[['No','r_pipeline'],['Yes','q4']]},
      q4:{q:'Is delivery stable and outside a recent edit cooldown?',o:[['No','r_wait'],['Yes','r_go']]}
    },
    ends:{
      r_no:diagResult('Hold the budget','Increasing spend on an unstable or above-target lane scales the current problem.',['Identify which cost layer is off target.'],['Fix or validate the cause before revisiting scale.'],'Do not use more budget to escape poor learning.','recovery','Open ROAS recovery'),
      r_ceiling:diagResult('Current marginal economics do not clear','The blend is healthy because older spend is cheaper; the newest dollars are not.',['Calculate the CPA of the last increment, not total CPA.'],['Add a new validated creative or stop at the current ceiling.'],'Do not scale from blended CPA alone.','econ','Open Economics'),
      r_pipeline:diagResult('Build creative capacity first','A single winner cannot safely carry the next spend level.',['Measure runway and production turnaround.'],['Validate a second winner before adding budget.'],'Do not create a larger single-creative dependency.','briefs','Open Briefs'),
      r_wait:diagResult('Finish the cooldown','The next change would overlap with an unread prior change.',['Confirm the last material edit time.'],['Wait 48 to 72 hours or one full delivery cycle.'],'Do not stack increases.','scale','Open Scale'),
      r_go:diagResult('Increase in one controlled step','The lane clears efficiency, marginal, creative and stability gates.',['Record current spend, CPA and marginal CPA as the baseline.'],['Increase 20 to 25 percent, then wait 48 to 72 hours and remeasure.'],'Do not schedule the next increase before reading this one.','scale','Open Scale')
    }
  },

  {
    k:'scale-break',cat:'Budget and scaling',n:'Performance broke after a budget increase',
    d:'Locate whether the increment exposed auction cost, creative reach, funnel weakness or a reporting fault.',tags:'scale failure post increase marginal performance budget',start:'q1',
    nodes:{
      q1:{q:'Does the back end confirm the same deterioration?',o:[['No','r_track'],['Yes','q2']]},
      q2:{q:'Where did the first cost-per-step increase appear?',o:[['CPM or cost per click','r_auction'],['Cost per add to cart','r_creative'],['Cost per checkout or purchase only','r_funnel'],['All rates held; only mix changed','r_mix']]}
    },
    ends:{
      r_track:diagResult('The apparent scaling failure is measurement','The business result did not break with the platform result.',['Reconcile the exact pre- and post-increase cohorts.'],['Hold the new budget until signal integrity is known.'],'Do not reverse a profitable increase because attribution moved.','track','Open Tracking'),
      r_auction:diagResult('The incremental audience costs more to reach','Scale entered more expensive inventory or audience pockets.',['Compare marginal CPM, CTR and frequency.'],['Keep the step only if marginal CPA remains affordable; otherwise roll back once.'],'Do not restructure the whole lane.','scale','Open Scale'),
      r_creative:diagResult('Creative supply is the scaling constraint','The incremental audience is less persuaded by the current assets.',['Confirm landing-page and checkout rates held.'],['Add a proven creative before adding more spend.'],'Do not ask the same asset to cover an ever-broader audience.','creative','Open Creative testing'),
      r_funnel:diagResult('Scale exposed a store-side constraint','Qualified traffic still arrived, but the page or checkout converted less of it.',['Check stock, site speed, payment errors and delivery disclosure during the spike.'],['Fix capacity or friction before restoring the increment.'],'Do not call this audience saturation.','store','Open Store health'),
      r_mix:diagResult('The increment changed composition','More spend shifted product, placement or customer mix while within-segment rates held.',['Split marginal results by product and new-customer status.'],['Cap or correct the segment that absorbed the increment.'],'Do not reverse all scale from an aggregate mix change.','blend','Open Blended metrics')
    }
  },

  quickDiagnosis('budget-cut','Budget and scaling','Budget was cut sharply','A smaller budget usually needs fewer learning cells, not a proportional trim across every cell.','At the new budget, how many lanes still clear their learning requirement?',[
    ['Only one or two',diagResult('Consolidate the structure','Spreading the cut leaves every lane underfed.',['Rank lanes by contribution and value-to-CPA ratio.'],['Close the weakest lanes and fully fund the survivors.'],'Do not reduce every ad set evenly.','budget','Open Budget')],
    ['Most lanes still clear',diagResult('Preserve structure and cut by marginal value','The account can retain coverage if the remaining cells still receive enough signal.',['Rank the most recent spend increments by marginal CPA.'],['Remove the least efficient increment first.'],'Do not cut the testing allocation to zero.','econ','Open Economics')],
    ['Not sure',diagResult('Calculate capacity before editing','The structure decision needs target CPA, weekly budget and conversions per cell.',['Use weekly budget divided by target CPA, then divide by the conversion threshold.'],['Set the supported cell count before making cuts.'],'Do not guess based on campaign count.','budget','Open Budget')]
  ],'spend reduction lower budget consolidate'),

  quickDiagnosis('budget-double','Budget and scaling','Budget was doubled','New budget is only usable when the account has efficient headroom and enough creative to absorb it.','How many validated creatives are ready to scale?',[
    ['Fewer than two',diagResult('Creative supply is the immediate constraint','Deploying the full increase would force unproven assets or overexpose one winner.',['Calculate winner runway and production lead time.'],['Use part of the increase for production and hold the rest.'],'Do not spend the entire approval just because it exists.','briefs','Open Briefs')],
    ['Two or more, with marginal headroom',diagResult('Scale in measured tranches','The account can absorb more spend, but not in one jump.',['Record marginal CPA and audience headroom.'],['Increase 20 to 25 percent per step with a 48 to 72 hour read.'],'Do not double a live budget in one edit.','scale','Open Scale')],
    ['Creative exists, but marginal CPA is already high',diagResult('Budget is not the binding constraint','More of the same delivery would buy unprofitable volume.',['Recheck affordable CPA and alternative lanes.'],['Allocate to a new validated lever or keep the reserve unspent.'],'Do not hide weak marginal economics inside the blend.','channels','Open Channel mix')]
  ],'double spend budget approval headroom'),

  quickDiagnosis('pacing','Budget and scaling','Spend is pacing too fast or too slow','Pacing needs to be separated from efficiency: a campaign can hit the right total and buy the wrong results.','Which pacing problem is happening?',[
    ['Overspending and CPA is above target',diagResult('The current pace is unaffordable','Delivery is consuming budget faster than efficient demand appears.',['Check intraday spend, bid strategy and the latest marginal CPA.'],['Reduce the cap once and monitor a full day.'],'Do not daypart reactively from a few hours of data.','budget','Open Budget')],
    ['Overspending but CPA is healthy',diagResult('The pace may be acceptable','Faster spend is not a problem if the period cap and marginal economics still clear.',['Project month-end spend against the approved cap.'],['Adjust only enough to meet the period total.'],'Do not suppress profitable demand to make a daily line look smooth.','forecast','Open Forecast')],
    ['Underspending',diagResult('Eligibility or controls are constraining delivery','A budget increase cannot solve a campaign already failing to spend its current cap.',['Check audience, cost controls, rank and approval status.'],['Remove one proven constraint, then reassess.'],'Do not raise the nominal budget first.','preflight','Open Pre-flight')]
  ],'pace daily monthly overspend underspend')
];

/* Additional diagnostic groups are appended below. */
DIAGNOSES=DIAGNOSES.concat([
  quickDiagnosis('creative-no-spend','Creative','New creative gets no spend','An asset cannot be judged until it receives a minimum read under comparable delivery.','Where was the new creative launched?',[
    ['Inside a scaling CBO with incumbents',diagResult('The incumbent delivery advantage is starving the test','CBO is optimising the campaign, not providing a fair comparison.',['Compare spend share before comparing results.'],['Validate the asset in a controlled ABO cell.'],'Do not label an unserved creative a loser.','creative','Open Creative testing')],
    ['Inside ABO, but the ad still receives almost nothing',diagResult('An eligibility, quality or audience issue is suppressing it','Guaranteed ad-set budget does not guarantee equal ad delivery.',['Check ad status, quality ranking, format and destination.'],['Fix eligibility, then relaunch the test with a defined minimum read.'],'Do not duplicate repeatedly to force spend.','preflight','Open Pre-flight')],
    ['It received enough spend but no conversions',diagResult('The creative has a readable performance verdict','Delivery is no longer the explanation once the minimum spend threshold is met.',['Read hook, CTR, landing-page view and add-to-cart cost before calling it creative failure.'],['Classify the first failed layer and record the learning.'],'Do not kill qualified traffic for a downstream checkout failure.','creative','Open Creative testing')]
  ],'asset ad no delivery testing minimum read'),

  quickDiagnosis('fatigue','Creative','Winning creative is fatiguing','True fatigue combines repeated exposure with declining response and improves when fresh creative receives comparable delivery.','Which pattern do you see?',[
    ['Frequency high, CTR down, fresh creative wins',diagResult('Validated creative fatigue','The old asset lost response under the same conditions and the replacement recovered it.',['Confirm CPC and CPA moved with CTR.'],['Reduce the fatigued asset while the winner absorbs delivery.'],'Do not pause the incumbent before the replacement is serving.','creative','Open Creative testing')],
    ['CPM up, but fresh creative also struggles',diagResult('Auction pressure, not fatigue','A new asset did not restore performance, so the market or delivery mix changed.',['Compare account-wide CPM and placement mix.'],['Hold the creative and manage affordability or reach.'],'Do not burn the pipeline rotating healthy assets.','econ','Open Economics')],
    ['Frequency rose, but CTR and CPA are stable',diagResult('No actionable fatigue yet','Repeated exposure alone is expected; performance has not deteriorated.',['Continue monitoring CTR, CPC and CPA together.'],['Keep the asset live and prepare its successor.'],'Do not rotate from frequency alone.','creative','Open Creative testing')]
  ],'winner tired frequency refresh hook'),

  quickDiagnosis('all-lose','Creative','Every new concept loses','A whole batch failing alike often points to test design, the offer or the destination rather than universal bad creative.','Did the new concepts receive fair spend and qualified clicks?',[
    ['No, delivery was uneven or below the minimum read',diagResult('The batch was not actually tested','The result measures allocation, not creative quality.',['Compare spend per asset against the minimum test threshold.'],['Rerun fewer cells with guaranteed spend.'],'Do not write the next brief from unread results.','creative','Open Creative testing')],
    ['Yes, clicks were qualified but conversion fell downstream',diagResult('The failure is after the ad','The batch delivered intent and the page or checkout lost it.',['Compare cost per add to cart and checkout by asset.'],['Fix the shared destination or offer.'],'Do not order another batch against an unchanged funnel.','store','Open Store health')],
    ['Yes, and hook plus CTR were weak across the batch',diagResult('The brief or proposition missed','Multiple executions failing at attention suggests the shared strategic input is wrong.',['Compare registers, promises and audience awareness stage.'],['Write a new concept brief, not cosmetic variants.'],'Do not test six new executions of the same failed idea.','briefs','Open Briefs')]
  ],'batch creative tests concepts fail'),

  quickDiagnosis('winner-scale','Creative','Test winner fails in scaling','A controlled-test winner can fail when spend, audience mix and competitive context change.','Did the scaled asset receive a comparable minimum read?',[
    ['No, the scaling campaign barely served it',diagResult('The scaling verdict is unreadable','Incumbents starved the incoming asset before it could prove itself.',['Compare spend and impressions, not only CPA.'],['Keep testing evidence separate or create a controlled transition.'],'Do not kill it from a handful of impressions.','creative','Open Creative testing')],
    ['Yes, but the audience or placement mix changed',diagResult('The winner did not transfer to the new context','The asset may be strong only for the pocket it won in.',['Compare placement, frequency and audience composition.'],['Adapt the concept to the scaling inventory or keep it in its proven lane.'],'Do not assume a universal winner.','aud','Open Audience build')],
    ['Yes, under comparable delivery, and it lost',diagResult('The test produced a false or temporary winner','Normal variance or a short-lived pocket created the original result.',['Check whether the original test cleared the graduation threshold.'],['Record the failed transfer and promote the next validated asset.'],'Do not rewrite the graduation rule after the fact.','creative','Open Creative testing')]
  ],'graduate scaling transfer false winner'),

  quickDiagnosis('pipeline-empty','Creative','Creative pipeline is empty','When a winner is declining and no validated successor exists, protect volume while rebuilding production capacity.','How much runway does the current winner have?',[
    ['Less than one production cycle',diagResult('The pipeline is already in recovery mode','Normal production will arrive after the current asset is exhausted.',['Calculate days to the fatigue threshold and real review turnaround.'],['Re-cut proven footage, ship no-shoot formats and reduce the winner gradually.'],'Do not launch untested work at full scaling weight.','briefs','Open Briefs')],
    ['At least one production cycle',diagResult('There is time to restore the cadence','The gap is recoverable if the next batch starts now and testing spend stays protected.',['Confirm the brief, owner and compliance-review date.'],['Start the next mixed-register batch immediately.'],'Do not borrow the test budget during the recovery.','briefs','Open Briefs')],
    ['No reliable runway estimate',diagResult('Measure creative capacity first','Without frequency, CTR trajectory and production lead time, the risk cannot be scheduled.',['Use the fatigue read and record production turnaround.'],['Set a replacement date before planning the batch.'],'Do not manage the pipeline from intuition.','creative','Open Creative testing')]
  ],'no assets production runway successor backlog'),

  quickDiagnosis('lpv-low','Funnel and store','Clicks are not becoming landing-page views','A low landing-page-view rate isolates the gap between ad click and a loaded destination.','Is the rate below roughly 65 percent across all live URLs?',[
    ['Yes, across most URLs',diagResult('Site speed or measurement is failing broadly','A site-wide pattern points to load performance, consent or LPV event integrity.',['Test mobile load time and the LPV event on major devices.'],['Fix the shared site or measurement layer.'],'Do not edit every ad URL independently.','store','Open Store health')],
    ['No, only one URL is weak',diagResult('One destination is broken or slow','The problem follows a specific page or redirect path.',['Open the exact final URL and trace redirects.'],['Repair or replace that destination.'],'Do not blame the campaign carrying the bad URL.','preflight','Open Pre-flight')],
    ['The metric differs by placement only',diagResult('Click quality or click definition differs by placement','Some placements generate accidental or low-intent clicks that never become sessions.',['Compare outbound clicks, not all clicks, by placement.'],['Judge placement value on purchases and LPVs, then exclude only with enough data.'],'Do not optimise from link clicks with mixed definitions.','store','Open Store health')]
  ],'landing page view lpv clicks sessions speed redirect'),

  quickDiagnosis('atc-drop','Funnel and store','Add-to-cart rate fell','When sessions hold and add-to-cart falls, inspect the offer, product page, stock and traffic mix.','Where is the decline?',[
    ['One product or landing page',diagResult('A product-page condition changed','Price, stock, variant state or message match is local to the affected destination.',['Compare current page, inventory and price with the prior period.'],['Restore the broken condition or pause only that lane.'],'Do not change every campaign for one page.','store','Open Store health')],
    ['Across the site after a release',diagResult('The site change is the leading cause','A shared theme, app or cart change can depress intent everywhere at once.',['Review release time and device-level conversion.'],['Roll back or fix the site change, then remeasure.'],'Do not refresh creative to cover a site regression.','store','Open Store health')],
    ['Only in a new audience or placement',diagResult('Traffic quality changed','The destination held, but the incoming segment is less product-ready.',['Compare hook, CTR and on-page engagement within the new segment.'],['Adjust message, bid or allocation for that segment.'],'Do not redesign a page that converts the incumbent traffic.','aud','Open Audience build')]
  ],'cart product page offer stock conversion'),

  quickDiagnosis('checkout-start-drop','Funnel and store','Checkout initiation fell','Stable adds to cart with fewer checkout starts isolates cart friction, offer conditions or the event.','Does the back end show the same drop?',[
    ['No, only the platform event fell',diagResult('InitiateCheckout tracking is broken','Real checkout starts held while the advertising signal weakened.',['Test browser and server events with matching event IDs.'],['Repair the event and avoid optimisation changes until it is stable.'],'Do not treat a missing event as cart abandonment.','pixel','Open Pixel and CAPI')],
    ['Yes, after shipping or discount changes',diagResult('Cart economics created friction','The shopper encounters a new cost or failed expectation before checkout.',['Test thresholds, discount logic and shipping visibility.'],['Make total cost and eligibility clear before the cart.'],'Do not ask ads to overcome a surprise at checkout.','offers','Open Offers')],
    ['Yes, with no known commercial change',diagResult('Cart experience or device failure','A UI, app or browser issue may block the transition.',['Test the cart-to-checkout path on top devices and browsers.'],['Fix the failing path and monitor completion by device.'],'Do not average mobile and desktop together.','store','Open Store health')]
  ],'initiate checkout cart start event shipping'),

  quickDiagnosis('checkout-complete-drop','Funnel and store','Checkout completion fell','Stable checkout starts with fewer valid orders isolates payment, shipping, trust or approval flow.','Which evidence moved with completion?',[
    ['Gateway declines or errors rose',diagResult('Payment acceptance is failing','The shopper reached the final step and the payment layer rejected more attempts.',['Break declines down by reason, device and payment method.'],['Repair the gateway issue or add a working alternative.'],'Do not lower ad spend before fixing payment acceptance.','store','Open Store health')],
    ['Shipping or delivery abandonment rose',diagResult('Late cost or timing disclosure is causing exits','The final total or one-to-two-week expectation arrives after intent is formed.',['Review shipping, taxes and delivery messaging before checkout.'],['Move the disclosure earlier and simplify the final step.'],'Do not hide timing to improve upstream conversion.','offers','Open Offers')],
    ['Rx payments hold but approved orders fell',diagResult('The optimisation event is misaligned with fulfilment','Payment is not the same as a clinically approved or shipped order.',['Compare paid, approved and fulfilled Rx cohorts.'],['Optimise and report against the approved business milestone.'],'Do not count declined prescriptions as acquired customers.','track','Open Tracking')]
  ],'purchase checkout completion payment gateway shipping rx'),

  quickDiagnosis('aov-drop','Funnel and store','Average order value dropped','AOV moves with product mix, discounting, bundles and value payload integrity.','What changed with order count?',[
    ['Orders rose while revenue stayed flat',diagResult('The mix shifted toward lower-value orders','Acquisition volume grew, but lower-priced products or heavier discounts absorbed it.',['Split order count and revenue by product and discount.'],['Manage contribution by lane, not order volume alone.'],'Do not celebrate purchase growth without value.','offers','Open Offers')],
    ['Orders held and discounts increased',diagResult('Promotion depth reduced value','The offer converted the same number of orders at a lower collected amount.',['Calculate contribution after discount and fulfilment cost.'],['Set an efficiency target that reflects the promoted AOV.'],'Do not compare promoted ROAS to full-price periods unadjusted.','econ','Open Economics')],
    ['Backend AOV held; platform AOV fell',diagResult('The value payload or attribution is wrong','The commercial value did not change with the platform value.',['Inspect value, currency, tax, shipping and item parameters.'],['Repair the payload and reconcile the same order IDs.'],'Do not change offers from a platform-only AOV decline.','pixel','Open Pixel and CAPI')]
  ],'average order value revenue mix discount bundle'),

  {
    k:'order-mismatch',cat:'Measurement',n:'Meta and backend order counts disagree',
    d:'Align scope first, then separate duplicate, missing and timing patterns.',tags:'shopify meta purchases reconcile orders delta tracking',start:'q1',
    nodes:{
      q1:{q:'Are dates, timezone, attribution window and order status aligned?',o:[['No or not sure','r_scope'],['Yes','q2']]},
      q2:{q:'Which side reports more purchases?',o:[['Meta reports more','q3'],['Backend reports more','r_missing'],['The gap changes direction','r_timing']]},
      q3:{q:'Do browser and server events share the same event_id?',o:[['No or not sure','r_dedup'],['Yes','r_business']]}
    },
    ends:{
      r_scope:diagResult('The comparison is not aligned yet','Different timezones, windows or order states manufacture a gap before tracking is tested.',['Use one reporting timezone and the same created-at order cohort.','State whether refunds, cancellations and view-through orders are included.'],['Rebuild the comparison with matching definitions.'],'Do not calculate a discrepancy from unlike scopes.','track','Open Tracking'),
      r_missing:diagResult('Meta is missing valid conversions or credit','Consent loss, blocked browser events, server gaps or attribution limits can leave backend orders unmatched.',['Check CAPI coverage and match quality.','Inspect UTM and click-ID persistence.'],['Repair missing signals; use backend truth for commercial reporting.'],'Do not widen attribution merely to make totals match.','pixel','Open Pixel and CAPI'),
      r_timing:diagResult('Event timing or timezone is shifting orders across windows','The total may reconcile over longer periods while daily rows disagree.',['Match by order ID and compare event time with order creation time.'],['Correct timezone conversion and event timing.'],'Do not optimise from daily deltas that reverse later.','track','Open Tracking'),
      r_dedup:diagResult('Browser and server events are double counting','Without the same event name and event_id, Meta sees two conversions.',['Inspect Purchase plus AddToCart and InitiateCheckout, not Purchase alone.'],['Use the same unique event_id on browser and server.'],'Do not disable CAPI as the permanent fix.','pixel','Open Pixel and CAPI'),
      r_business:diagResult('The platform event may not match a valid backend order','Renewals, failed Rx approvals or thank-you reloads can look like acquisition purchases.',['Match every reported event to order ID and business status.'],['Exclude renewals and invalid orders from the acquisition event.'],'Do not let a technical Purchase define commercial truth.','track','Open Tracking')
    }
  },

  quickDiagnosis('revenue-mismatch','Measurement','Orders match but revenue differs','Matching counts with different totals points to value, currency, discounts, refunds or order-state rules.','Which pattern fits the gap?',[
    ['A consistent percentage difference',diagResult('The value definition differs','Tax, shipping, discount or currency treatment is consistently included on one side.',['Compare one matched order field by field.'],['Standardise value and currency at the event source.'],'Do not apply a blanket reporting multiplier as a permanent fix.','pixel','Open Pixel and CAPI')],
    ['A few orders create most of the gap',diagResult('High-value events are wrong or missing','One duplicate, refund or malformed value can move revenue while counts still look healthy.',['Sort matched order deltas by absolute value.'],['Correct the outlier event logic and replay only when safe.'],'Do not average away large order-level faults.','track','Open Tracking')],
    ['The gap grows after refunds or Rx decisions',diagResult('Commercial status is not reflected in platform value','The ad event records payment while the backend later removes invalid revenue.',['Compare paid, refunded, approved and fulfilled cohorts.'],['Report acquisition on the agreed final business status.'],'Do not treat gross payment as retained revenue.','store','Open Store health')]
  ],'revenue value currency tax shipping refund delta'),

  quickDiagnosis('double-events','Measurement','Conversions suddenly doubled','A sharp platform-only jump often follows duplicate browser and server events or a repeated page trigger.','Did backend orders also double?',[
    ['No, only platform conversions doubled',diagResult('Duplicate event firing is likely','Real orders did not support the conversion jump.',['Inspect event_id across browser and server.','Reload the thank-you page and watch event count.'],['Repair deduplication or the repeated trigger immediately.'],'Do not optimise or report from inflated conversion volume.','pixel','Open Pixel and CAPI')],
    ['Yes, orders and revenue doubled',diagResult('The increase may be real demand','Tracking is not the first explanation when the backend confirms both count and value.',['Check traffic source, inventory and fulfilment capacity.'],['Scale only if marginal CPA and operational capacity clear.'],'Do not suppress a verified demand spike as a tracking anomaly.','forecast','Open Forecast')],
    ['Only one mid-funnel event doubled',diagResult('Deduplication is incomplete by event','Purchase may be clean while AddToCart or InitiateCheckout counts twice.',['Test event_id on every optimised and diagnostic event.'],['Apply deduplication consistently across the funnel.'],'Do not rely on a clean Purchase event as proof of full integrity.','pixel','Open Pixel and CAPI')]
  ],'duplicate events twice dedup purchase capi pixel'),

  quickDiagnosis('missing-event','Measurement','An event stopped firing','Determine whether the failure is browser-only, server-only, page-specific or total before changing optimisation.','Where is the event missing?',[
    ['Browser missing; server still fires',diagResult('Client-side instrumentation or consent changed','The server preserves some signal while the browser path is blocked or broken.',['Check consent state, pixel load and recent theme changes.'],['Repair the browser path without duplicating the server event.'],'Do not add a second pixel as a shortcut.','pixel','Open Pixel and CAPI')],
    ['Server missing; browser still fires',diagResult('CAPI delivery or backend mapping failed','The browser path hides the loss until cookies or consent remove coverage.',['Inspect server response codes, tokens and event mapping.'],['Restore CAPI with the same event_id as browser.'],'Do not accept browser-only Purchase as durable measurement.','pixel','Open Pixel and CAPI')],
    ['Both missing on one page or product',diagResult('The page-specific trigger broke','A template, app or URL path is bypassing the shared instrumentation.',['Test the affected page against a working page.'],['Fix the template or route and verify in Test Events.'],'Do not change the campaign optimisation event.','track','Open Tracking')],
    ['Both missing everywhere',diagResult('The shared measurement layer is down','A container, pixel, consent or deployment change affected the whole site.',['Check recent releases and base tag loading.'],['Treat as an incident and restore signal before optimisation.'],'Do not make performance decisions during the outage.','pixel','Open Pixel and CAPI')]
  ],'zero event pixel capi stopped firing'),

  quickDiagnosis('attribution-shift','Measurement','Reported results changed after an attribution setting','A new window or model changes who receives credit; it does not change the orders that happened.','Did backend orders and revenue move too?',[
    ['No, only platform results moved',diagResult('Credit moved; performance did not','The setting reassigned conversions across campaigns or channels.',['Record the old and new attribution definitions.','Compare MER and backend new-customer orders.'],['Annotate the change and avoid cross-window trend comparisons.'],'Do not optimise to a reporting discontinuity.','attr','Open Attribution')],
    ['Yes, the backend also moved',diagResult('A real business change happened at the same time','Attribution may explain part of the report, but not the commercial movement.',['Separate the setting-change date from traffic, offer and site changes.'],['Diagnose backend CPA and revenue independently.'],'Do not use attribution as a blanket explanation.','recovery','Open ROAS recovery')],
    ['The change affected one channel only',diagResult('Cross-channel credit was redistributed','Capture channels often gain credit that demand-creation channels lose.',['Compare branded search, Meta assists and direct traffic.'],['Use incrementality or a holdout for the material budget decision.'],'Do not fund the loudest reporting platform automatically.','attr','Open Attribution')]
  ],'window 7 day click view through model credit')
]);

DIAGNOSES=DIAGNOSES.concat([
  quickDiagnosis('frequency-rise','Audiences','Frequency keeps rising','Frequency is only actionable when paired with reach, response and conversion trends.','What is happening alongside frequency?',[
    ['Reach flattened and CTR plus CPA worsened',diagResult('The audience is saturating','The same people are seeing the ads more often and responding less.',['Compare cumulative reach with effective audience size.'],['Broaden the pool or rotate validated creative.'],'Do not raise budget into a saturated pool.','aud','Open Audience build')],
    ['Reach is still growing and CPA is stable',diagResult('Repeated exposure is not yet harmful','Frequency rose because delivery accumulated, but new reach and economics still clear.',['Monitor marginal reach and CTR.'],['Keep delivery stable and prepare the next asset.'],'Do not rotate from frequency alone.','aud','Open Audience build')],
    ['CTR fell, but fresh creative also fell',diagResult('The market or inventory changed','Fresh creative did not repair response, so fatigue is not proven.',['Check CPM, placement mix and audience composition.'],['Address the changed delivery condition.'],'Do not burn more assets proving the same external shift.','creative','Open Creative testing')]
  ],'saturation reach repeated audience tired'),

  quickDiagnosis('retarget-small','Audiences','Retargeting pool is too small','A small warm pool can be a traffic-volume fact, an event gap, an over-short window or conflicting exclusions.','Which input is limiting the pool?',[
    ['Site traffic itself is low',diagResult('Prospecting has not created enough warm demand','Retargeting cannot scale beyond the audience prospecting feeds.',['Compare eligible visitors per day with minimum delivery size.'],['Keep the pool consolidated and prioritise prospecting.'],'Do not force a separate retargeting campaign below the delivery floor.','channels','Open Channel mix')],
    ['Traffic is healthy, but the audience count is low',diagResult('Event capture or audience rules are excluding valid users','The source events, consent coverage or exclusions do not match real traffic.',['Compare event counts with analytics sessions.','Audit inclusion and exclusion windows.'],['Repair the source audience before adding budget.'],'Do not widen to unrelated engagement to hide a tracking fault.','pixel','Open Pixel and CAPI')],
    ['The window is intentionally short',diagResult('The stage may be too fragmented','Multiple tiny recency cells cannot each learn at the available volume.',['Calculate population by recency band.'],['Merge adjacent stages while preserving the hottest exclusion logic.'],'Do not keep a sophisticated funnel that cannot deliver.','aud','Open Audience build')]
  ],'warm remarketing pool size visitors'),

  quickDiagnosis('audience-overlap','Audiences','Audiences overlap or compete','Nested lookalikes, overlapping retargeting windows and duplicate lane audiences can bid for the same people.','Where is the overlap?',[
    ['Nested lookalikes such as 1% and 1–3%',diagResult('The smaller lookalike is contained inside the larger one','Without exclusions the ad sets compete for the same highest-ranked users.',['Confirm containment in Audience Overlap.'],['Run non-overlapping bands or consolidate.'],'Do not treat nested percentages as independent pools.','aud','Open Audience build')],
    ['Retargeting windows overlap',diagResult('Funnel stages are not mutually exclusive','A recent checkout visitor can sit in every broader warm segment unless excluded downward.',['Audit hot-to-warm exclusion order.'],['Exclude each higher-intent stage from the broader stage below it.'],'Do not let every retargeting ad set chase the hottest users.','aud','Open Audience build')],
    ['Prospecting includes warm users or purchasers',diagResult('Acquisition reporting is contaminated','Warm and existing customers are being bought and counted as prospecting.',['Check rolling retargeting and purchaser exclusions.'],['Apply stage and customer exclusions consistently.'],'Do not trust new-customer CPA until the overlap is removed.','aud','Open Audience build')]
  ],'self competition exclusion nested lookalike retargeting'),

  quickDiagnosis('lookalike-weak','Audiences','Lookalike underperforms broad','Seed quality, seed freshness, insufficient sample and unfair delivery can all make a lookalike look weak.','What is true about the seed?',[
    ['It mixes low- and high-value customers',diagResult('The seed teaches an average customer, not the desired one','A broad purchaser seed treats a low-AOV and high-AOV order as equally valuable.',['Split high-value, member and product-lane customers.'],['Build the lookalike from the outcome you want repeated.'],'Do not optimise seed size at the expense of seed meaning.','aud','Open Audience build')],
    ['It is small, stale or not refreshed',diagResult('The seed signal is weak','A tiny or outdated source produces an unstable model.',['Check eligible seed count and last refresh.'],['Refresh automatically and wait for sufficient volume.'],'Do not judge percentage bands from a poor source.','aud','Open Audience build')],
    ['The seed is strong and both received fair spend',diagResult('Broad is the better audience in this account','Strong purchase signal can let broad delivery outperform a constrained proxy.',['Compare new-customer CPA and incremental reach.'],['Consolidate into broad if the advantage persists.'],'Do not keep the lookalike because it sounds more strategic.','aud','Open Audience build')]
  ],'lal seed broad purchaser high value'),

  {
    k:'disapproved',cat:'Policy and account',n:'An ad was disapproved',
    d:'Review ad copy, creative and destination as one message before deciding whether to fix or appeal.',tags:'policy rejected ad health claim appeal destination',start:'q1',
    nodes:{
      q1:{q:'Have copy, creative and the final landing page all been reviewed together?',o:[['No','r_review'],['Yes','q2']]},
      q2:{q:'Is there a clear policy breach?',o:[['No, it appears misclassified','r_appeal'],['Yes, but it is non-medical and fixable','r_fix'],['Yes or unsure, and it touches health claims','r_escalate']]}
    },
    ends:{
      r_review:diagResult('Complete the full-message review first','The destination often triggers a rejection even when the ad text appears clean.',['Check disease-named navigation, testimonials, quantified outcomes and personal-attribute language.'],['Record the exact policy label and offending surface.'],'Do not appeal before understanding the full message.','comp','Open Copy check'),
      r_appeal:diagResult('Submit one evidence-based review request','A clean message can be misclassified, especially in regulated categories.',['Save the policy label, ad ID, destination and approved claim evidence.'],['Request review once through the proper channel.'],'Do not duplicate the ad repeatedly hoping one passes.','preflight','Open Pre-flight'),
      r_fix:diagResult('Remove the specific breach and relaunch cleanly','A clear non-medical violation should be corrected at its source.',['Name the exact element and log the pattern.'],['Create a compliant replacement and run pre-flight again.'],'Do not make cosmetic edits that preserve the same claim.','comp','Open Copy check'),
      r_escalate:diagResult('Stop and escalate the claim decision','Health-claim language requires medical or legal ownership, not improvisation by media.',['Capture the ad, destination, policy notice and proposed remedy.'],['Wait for approved language before relaunching.'],'Do not rewrite medical meaning just to pass review.','preflight','Open Pre-flight')
    }
  },

  quickDiagnosis('repeat-disapproval','Policy and account','Disapprovals keep repeating','Repeated rejections indicate a shared asset, destination, claim pattern or account-level classifier issue.','Do the rejected ads share the same destination or message pattern?',[
    ['Yes, they share a destination',diagResult('The landing page is the common trigger','Navigation, testimonials or product claims can contaminate every ad pointing there.',['Audit the entire reachable destination, not only the hero section.'],['Create or repair a compliant dedicated landing path.'],'Do not keep rewriting ad copy against the same risky page.','preflight','Open Pre-flight')],
    ['Yes, they share a claim or grammar pattern',diagResult('The creative system is reproducing a policy risk','The same second-person health state, treatment implication or outcome claim is recurring.',['Tag the repeated pattern in the rejection log.'],['Fix the brief template and approved-claim library.'],'Do not solve each rejection one at a time.','comp','Open Copy check')],
    ['No, policy labels vary across clean ads',diagResult('Account or domain classification may be elevated','Varied false positives can indicate a broader classifier or authorisation issue.',['Verify domain authorisation, business status and recent account-quality history.'],['Escalate with a concise evidence pack.'],'Do not increase launch volume during the review pattern.','preflight','Open Pre-flight')]
  ],'many rejected ads repeat policy classifier'),

  quickDiagnosis('limited-health','Policy and account','Health ad has limited delivery','Regulated category authorisation, geography, audience rules and claim-sensitive destinations can restrict eligible inventory.','Is the required advertiser and domain authorisation confirmed?',[
    ['No or not in writing',diagResult('The lane is not cleared to scale','Certification alone may not grant the platform authorisation required for prescription promotion.',['Confirm the exact business, domain, product and eligible geographies.'],['Keep spend at zero until written and in-product status agree.'],'Do not infer permission from another advertiser or domain.','preflight','Open Pre-flight')],
    ['Yes, but delivery is limited in one geography',diagResult('Geographic policy eligibility differs','A permitted message or product in one country may be restricted in another.',['Split delivery and policy review by country.'],['Remove ineligible geography or adapt with approved counsel.'],'Do not use one global campaign for different claim boundaries.','build','Open Structure')],
    ['Yes, and all eligible settings look clean',diagResult('The classifier or destination still sees elevated risk','Even authorised advertisers can be limited by the message or reachable page.',['Review ad, page, redirects and account-quality label together.'],['Use approved claims and request review when clearly misclassified.'],'Do not broaden language into an implied treatment claim.','comp','Open Copy check')]
  ],'regulated restricted prescription authorization legit script geo'),

  {
    k:'account-restricted',cat:'Policy and account',n:'The ad account is restricted',
    d:'Contain risk, preserve evidence and use the official review path once.',tags:'disabled banned account quality suspension appeal',start:'q1',
    nodes:{
      q1:{q:'Does the notice identify a specific ad, destination, billing issue or policy?',o:[['Yes','q2'],['No or unclear','r_audit']]},
      q2:{q:'Can the stated issue be verified and remediated?',o:[['Yes','r_fix'],['No, it appears incorrect','r_appeal'],['It involves a health or legal claim','r_escalate']]}
    },
    ends:{
      r_audit:diagResult('Run a 72-hour containment audit','The cause is unclear, so recent launches and every live destination need one evidence set.',['Save notices and IDs; list all changes from the prior 72 hours.','Audit affiliate and externally controlled destinations too.'],['Pause high-risk launches and prepare one coherent case.'],'Do not open a replacement ad account.','preflight','Open Pre-flight'),
      r_fix:diagResult('Remediate the named issue before review','A review request is stronger when the exact cause is already removed.',['Document before, remedy and current state.'],['Use the official appeal once with the remediation described.'],'Do not relaunch the same rejected asset under a new name.','preflight','Open Pre-flight'),
      r_appeal:diagResult('Prepare one evidence-based appeal','An incorrect restriction needs precise IDs, policy context and proof, not repeated submissions.',['Capture account ID, notice, affected assets and compliant evidence.'],['Submit once and track the case.'],'Do not flood support channels with conflicting explanations.','preflight','Open Pre-flight'),
      r_escalate:diagResult('Legal or medical review owns the remedy','The account response must not invent claim interpretation.',['Preserve all notices, assets and destinations.'],['Get approved remediation language before filing.'],'Do not improvise a medical-policy argument.','comp','Open Copy check')
    }
  },

  quickDiagnosis('g-search-no-sales','Google Ads','Search spends with no purchases','Search waste comes from irrelevant queries, weak intent-to-page match or broken conversion measurement.','What do the search terms show?',[
    ['Mostly irrelevant or informational queries',diagResult('Keyword and negative coverage is too broad','The campaign is paying for demand it cannot convert.',['Classify terms into brand, exact intent, adjacent, informational and irrelevant.'],['Add proven negatives and tighten match strategy.'],'Do not pause converting keywords because their parent match type is broad.','google','Open Google Ads')],
    ['Relevant commercial queries, weak landing conversion',diagResult('The destination or offer is losing qualified demand','Search intent is present but the page does not satisfy it.',['Compare query promise, ad copy and landing-page message.'],['Build the closest product-specific destination.'],'Do not solve page mismatch with higher bids.','store','Open Store health')],
    ['Backend purchases exist, Google shows none',diagResult('Google conversion tracking is broken','The commercial outcome exists without the platform signal.',['Test primary conversion, enhanced conversions and click-ID persistence.'],['Repair measurement before changing keywords.'],'Do not switch bidding strategy on missing conversion data.','track','Open Tracking')]
  ],'keywords search terms waste no conversions'),

  quickDiagnosis('g-brand-flat','Google Ads','Branded search ROAS is high while total revenue is flat','Branded search often captures demand created elsewhere and can look incremental when it is not.','What happened when brand spend increased?',[
    ['Brand conversions rose; total orders did not',diagResult('Credit shifted into paid brand','The campaign captured orders that likely would have arrived through organic or direct.',['Compare total brand demand and new-customer orders.'],['Run a controlled brand pause or geo test for the material decision.'],'Do not fund brand from reported ROAS alone.','attr','Open Attribution')],
    ['Total orders rose with brand demand',diagResult('The campaign may be capturing missed demand','Incrementality is plausible when commercial volume moved too.',['Check impression share, competitor pressure and organic coverage.'],['Scale only where incremental orders persist.'],'Do not assume every branded click is cannibalised.','google','Open Google Ads')],
    ['Meta fell before brand search rose',diagResult('Cross-channel credit moved down the journey','Meta may have created demand that Google captured at the final search.',['Compare lagged branded search volume with Meta reach.'],['Judge the pair on MER or a holdout.'],'Do not cut demand creation based on last-click capture.','attr','Open Attribution')]
  ],'brand cannibalisation incrementality organic direct'),

  quickDiagnosis('g-pmax-brand','Google Ads','PMax is taking branded traffic','Performance Max can absorb high-intent brand searches unless exclusions are deliberately applied.','Are brand exclusions active and verified?',[
    ['No',diagResult('PMax is free to claim brand demand','Reported PMax efficiency is likely inflated by conversions the brand campaign already owned.',['Inspect brand search categories and brand-campaign volume.'],['Apply the approved brand exclusion and annotate the change.'],'Do not compare pre- and post-exclusion ROAS as the same product.','google','Open Google Ads')],
    ['Yes, but brand traffic still appears',diagResult('Exclusion scope or matching needs verification','The applied list, account scope or close variants may not cover actual queries.',['Verify exclusion status, brand list and query-category evidence.'],['Correct the exclusion and monitor brand share.'],'Do not assume a saved setting is active everywhere.','google','Open Google Ads')],
    ['Not sure because reporting is opaque',diagResult('Run a triangulation check','PMax will not provide full search-term detail, so brand movement must be inferred from available categories and campaign shifts.',['Compare PMax launch with brand impressions, clicks and conversions.'],['Use exclusions and a controlled test rather than trusting blended PMax ROAS.'],'Do not treat opacity as evidence of incrementality.','google','Open Google Ads')]
  ],'performance max branded search exclusion'),

  quickDiagnosis('g-shopping-drop','Google Ads','Shopping dropped after PMax launched','PMax can outrank Standard Shopping on shared inventory, making the older campaign appear broken.','Do both campaigns contain the same products?',[
    ['Yes',diagResult('PMax is taking priority on shared inventory','The traffic moved campaigns; the products did not stop working.',['Compare total Shopping plus PMax revenue and product coverage.'],['Assign product ownership deliberately or evaluate the combined result.'],'Do not bid the campaigns against the same catalog accidentally.','google','Open Google Ads')],
    ['No, product sets are separate',diagResult('The drop has another cause','Feed eligibility, demand, bids, budget or rank should be checked for the affected products.',['Inspect Merchant Center issues and impression-share loss.'],['Repair the product-level cause.'],'Do not blame PMax without overlapping inventory.','google','Open Google Ads')],
    ['Not sure',diagResult('Product ownership is undefined','Without listing-group documentation, campaign comparison is unreadable.',['Export product IDs by campaign and find overlap.'],['Create an explicit inventory map before changing bids.'],'Do not restructure until overlap is known.','google','Open Google Ads')]
  ],'standard shopping performance max priority inventory'),

  quickDiagnosis('g-impression-share','Google Ads','Impression share is being lost','Lost share to budget and lost share to rank require opposite fixes.','Which loss is larger?',[
    ['Search lost IS to budget',diagResult('Eligible demand exceeds the daily budget','The auction is winnable, but the campaign is absent when budget runs out.',['Confirm CPA and marginal conversion value still clear.'],['Increase budget in steps while monitoring marginal CPA.'],'Do not raise bids when budget is the binding constraint.','google','Open Google Ads')],
    ['Search lost IS to rank',diagResult('Ad Rank is the constraint','More budget buys little when bids, quality or landing experience prevent entry.',['Review Quality Score components and top impression rate.'],['Improve relevance and landing experience before paying more per click.'],'Do not treat rank loss as underspending.','google','Open Google Ads')],
    ['Both are low; impression share is already high',diagResult('The current query set is near its ceiling','Additional budget or bid pressure has little remaining inventory to capture.',['Measure remaining profitable headroom.'],['Expand keywords, geography or campaign type deliberately.'],'Do not force scale from an exhausted query set.','google','Open Google Ads')]
  ],'search lost is budget rank quality score'),

  {
    k:'month-miss',cat:'Operations',n:'Month one badly missed target',
    d:'The first-month review should distinguish bad measurement, weak conversion and a failed concept from an under-read test.',tags:'monthly target miss launch first month plan',start:'q1',
    nodes:{
      q1:{q:'Has tracking been reconciled to the back end?',o:[['No','r_track'],['Yes','q2']]},
      q2:{q:'Is paid landing-page conversion below roughly 2 percent?',o:[['Yes','r_page'],['No','q3']]},
      q3:{q:'Did every concept fail similarly?',o:[['Yes','r_upstream'],['No, one concept clearly led','r_winner']]}
    },
    ends:{
      r_track:diagResult('Measurement must be verified first','A launch miss caused by tracking needs the opposite response from a real sales miss.',['Reconcile count, value, currency and event timing.'],['Restate the month only after the signal is trustworthy.'],'Do not rewrite the media plan from unreconciled data.','track','Open Tracking'),
      r_page:diagResult('Conversion rate is the first constraint','Qualified paid traffic cannot reach target economics through a page converting below the required floor.',['Check message match, mobile speed, offer and delivery disclosure.'],['Fix the destination before expanding campaigns.'],'Do not add more lanes to diversify a page failure.','store','Open Store health'),
      r_upstream:diagResult('The shared offer, page or audience hypothesis missed','Uniform failure across fairly served concepts points above the executions.',['Confirm fair spend and compare add-to-cart cost.'],['Change the proposition or destination before the next batch.'],'Do not make six cosmetic variants of the same failed idea.','briefs','Open Briefs'),
      r_winner:diagResult('The batch produced a direction, not a total failure','One leading concept is enough to define the next structured test.',['Confirm it cleared the minimum read and downstream quality.'],['Graduate it and test angles within the winning concept.'],'Do not call a one-in-three hit rate a failed launch.','creative','Open Creative testing')
    }
  },

  quickDiagnosis('report-gap','Operations','Weekly report totals do not agree','Reporting gaps usually come from timezone, filters, attribution scope or different business definitions.','Where do the totals diverge?',[
    ['Spend differs between exports',diagResult('Account, date or currency scope differs','Spend should reconcile closely before conversion definitions enter the discussion.',['Match account IDs, timezone, dates, currency and tax treatment.'],['Create one locked reporting scope.'],'Do not blend exports with different cutoffs.','report','Open Weekly report')],
    ['Spend matches; orders differ',diagResult('Conversion scope or event integrity differs','Attribution, order status, deduplication or consent creates the count gap.',['Match order IDs and state the attribution window.'],['Use backend valid orders as commercial truth.'],'Do not silently substitute platform purchases for orders.','track','Open Tracking')],
    ['Orders match; revenue differs',diagResult('Value definition differs','Currency, tax, shipping, discounts, refunds or Rx status is inconsistent.',['Compare value on a few matched order IDs.'],['Standardise the revenue rule in the report.'],'Do not force totals to match with manual adjustments.','report','Open Weekly report')]
  ],'weekly reporting totals dashboard export discrepancy'),

  quickDiagnosis('demand-spike','Operations','An external demand spike arrived','A short window changes the tradeoff between learning efficiency, inventory and absolute contribution.','Can inventory and fulfilment support the spike?',[
    ['No or uncertain',diagResult('Operational capacity is the first constraint','Buying demand that cannot be fulfilled creates refunds, delays and account risk.',['Confirm stock, consultation capacity and delivery promise.'],['Cap spend to fulfilment capacity.'],'Do not let urgency exceed what operations can deliver.','forecast','Open Forecast')],
    ['Yes, with a validated winner ready',diagResult('Use the proven path and a defined reserve','A short window favours an existing campaign over a new learning cycle.',['Set the maximum affordable marginal CPA and exit date.'],['Increase the winner deliberately and accept measured efficiency loss.'],'Do not create a new fragmented campaign for a brief event.','scale','Open Scale')],
    ['Yes, but no validated creative exists',diagResult('The account cannot safely absorb the full spike','Untested creative and urgency-sensitive health messaging add performance and policy risk together.',['Identify compliant proven assets that can be adapted quickly.'],['Use only controlled capacity and protect the account.'],'Do not bypass testing or claim review because demand is temporary.','preflight','Open Pre-flight')]
  ],'seasonal external event surge inventory demand'),

  quickDiagnosis('lane-drag','Operations','One product lane is dragging the portfolio','A weak lane may have the wrong target, a local funnel problem or genuinely inferior marginal economics.','Is the lane target based on its own AOV and margin?',[
    ['No, it uses an account-wide target',diagResult('The lane may be mispriced by the scorecard','A low-AOV and high-AOV product cannot share one CPA or ROAS target honestly.',['Calculate contribution and repeat value for the lane.'],['Set a lane-specific acquisition envelope.'],'Do not cut the lane from an account-wide target.','econ','Open Economics')],
    ['Yes, but one funnel step is weak',diagResult('The lane has a local conversion constraint','A shared account restructure would disturb healthy products without fixing the affected step.',['Locate the first cost-per-step deterioration.'],['Fix the lane destination, offer or checkout.'],'Do not average the failure into the portfolio.','store','Open Store health')],
    ['Yes, tracking and funnel are clean',diagResult('The lane is currently the weakest use of marginal budget','A real, comparable underperformance should lose allocation to stronger opportunities.',['Compare marginal contribution and strategic role.'],['Reduce or pause the lane with a documented re-entry condition.'],'Do not keep it live only for structural symmetry.','channels','Open Channel mix')]
  ],'product portfolio lane weak target contribution')
]);

var TREES={};
DIAGNOSES.forEach(function(d){TREES[d.k]=d});
var selectedDiag='cpa';
var diagPath=[];

function diagSafe(value){return esc(String(value==null?'':value))}
function diagCurrent(tree){
  var id=tree.start,trail=[];
  for(var i=0;i<diagPath.length;i++){
    var node=tree.nodes[id];
    if(!node||!node.o[diagPath[i]])break;
    trail.push(node.o[diagPath[i]][0]);
    id=node.o[diagPath[i]][1];
  }
  return {id:id,trail:trail};
}
function diagResultList(title,items){
  if(!items||!items.length)return '';
  return '<div class="diag-result-card"><h5>'+diagSafe(title)+'</h5><ol>'+items.map(function(item){return '<li>'+diagSafe(item)+'</li>'}).join('')+'</ol></div>';
}
function diagVerdict(result){
  var html='<div class="diag-verdict"><span>Likely diagnosis</span><h4>'+diagSafe(result.t)+'</h4><p>'+diagSafe(result.b)+'</p>';
  if((result.check&&result.check.length)||(result.act&&result.act.length)){
    html+='<div class="diag-result-grid">'+diagResultList('Check now',result.check)+diagResultList('Take action',result.act)+'</div>';
  }
  if(result.avoid)html+='<div class="diag-avoid"><b>Avoid</b>'+diagSafe(result.avoid)+'</div>';
  if(result.go)html+='<div class="diag-tool"><button class="btn p" type="button" data-go="'+diagSafe(result.go)+'">'+diagSafe(result.goLabel||'Open related tool')+' <i class="bi bi-arrow-right ms-1"></i></button></div>';
  return html+'</div>';
}
function renderTree(){
  var tree=TREES[selectedDiag]||DIAGNOSES[0];
  selectedDiag=tree.k;
  $('d-kicker').textContent=tree.cat;
  $('d-title').textContent=tree.n;
  $('d-intro').textContent=tree.d;
  var current=diagCurrent(tree),id=current.id;
  $('d-back').disabled=diagPath.length===0;
  $('d-reset').disabled=diagPath.length===0;
  if(tree.ends[id]){
    $('d-crumbs').textContent=current.trail.length?'Path · '+current.trail.join(' → '):'Diagnosis reached';
    $('d-node').innerHTML=diagVerdict(tree.ends[id]);
    return;
  }
  var node=tree.nodes[id];
  if(!node){diagPath=[];return renderTree()}
  $('d-crumbs').textContent=current.trail.length?'Path · '+current.trail.join(' → '):'Step 1 · Choose the answer supported by the data.';
  $('d-node').innerHTML='<div class="node"><div class="q">'+diagSafe(node.q)+'</div>'+
    (node.why?'<div class="why">'+diagSafe(node.why)+'</div>':'')+
    '<div class="opts">'+node.o.map(function(option,index){return '<button class="opt" type="button" data-i="'+index+'">'+diagSafe(option[0])+'</button>'}).join('')+'</div></div>';
}
function matchingDiagnoses(){
  var query=$('d-search').value.toLowerCase().trim(),category=$('d-category').value;
  return DIAGNOSES.filter(function(d){
    var categoryMatch=!category||d.cat===category;
    var haystack=(d.n+' '+d.cat+' '+d.d+' '+d.tags+' '+JSON.stringify(d.nodes)+' '+JSON.stringify(d.ends)).toLowerCase();
    return categoryMatch&&(!query||haystack.indexOf(query)>-1);
  });
}
function renderDiagList(list){
  $('d-count').textContent=list.length+' of '+DIAGNOSES.length+' situations';
  $('d-list').innerHTML=list.length?list.map(function(d){
    return '<button class="diag-item'+(d.k===selectedDiag?' on':'')+'" type="button" data-diag="'+diagSafe(d.k)+'" aria-pressed="'+(d.k===selectedDiag?'true':'false')+'">'+
      '<span class="n">'+diagSafe(d.n)+'</span><span class="c">'+diagSafe(d.cat)+'</span></button>';
  }).join(''):'<div class="diag-empty">No situation matches. Try a broader word or clear the category.</div>';
}
function applyDiagFilters(){
  var list=matchingDiagnoses();
  if(list.length&&!list.some(function(d){return d.k===selectedDiag})){
    selectedDiag=list[0].k;
    diagPath=[];
    renderTree();
  }
  renderDiagList(list);
}
function selectDiagnosis(key,preserveFilters){
  if(!TREES[key])return;
  if(!preserveFilters){$('d-search').value='';$('d-category').value=''}
  selectedDiag=key;
  diagPath=[];
  renderDiagList(matchingDiagnoses());
  renderTree();
}

$('d-category').innerHTML='<option value="">All categories</option>'+DIAG_CATEGORIES.map(function(category){return '<option value="'+diagSafe(category)+'">'+diagSafe(category)+'</option>'}).join('');
$('d-total').textContent=DIAGNOSES.length+' guided situations';
$('d-node').setAttribute('aria-live','polite');
$('d-list').addEventListener('click',function(event){var button=event.target.closest('[data-diag]');if(button)selectDiagnosis(button.dataset.diag,true)});
$('d-node').addEventListener('click',function(event){var button=event.target.closest('.opt');if(!button)return;diagPath.push(+button.dataset.i);renderTree()});
$('d-back').addEventListener('click',function(){if(diagPath.length){diagPath.pop();renderTree()}});
$('d-reset').addEventListener('click',function(){diagPath=[];renderTree()});
$('d-search').addEventListener('input',applyDiagFilters);
$('d-category').addEventListener('change',applyDiagFilters);
$('d-clear').addEventListener('click',function(){$('d-search').value='';$('d-category').value='';applyDiagFilters();$('d-search').focus()});
applyDiagFilters();
