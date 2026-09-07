/* ================= ICP ================= */
var ICPT=[['Under $75',1],['$75 to $199',2],['$200 to $399',3],['$400 and above',4]];
function calcICP(){
  var rows=ICPT.map(function(t){
    var i=t[1];
    var n=+$('ic-n'+i).value||0, a=+$('ic-a'+i).value||0, f=+$('ic-f'+i).value||0, r=+$('ic-r'+i).value||0;
    return {label:t[0],n:n,a:a,f:f,r:r,rev:n*a*f};
  });
  var totN=rows.reduce(function(x,y){return x+y.n},0);
  var totR=rows.reduce(function(x,y){return x+y.rev},0);
  rows.forEach(function(row,idx){
    var i=idx+1;
    $('ic-v'+i).textContent=money(row.rev);
    $('ic-s'+i).textContent=totR?(row.rev/totR*100).toFixed(1)+'%':'—';
  });
  var top=rows[3], topNp=totN?top.n/totN*100:0, topRp=totR?top.rev/totR*100:0;
  $('ic-tot').textContent=totN.toLocaleString();
  $('ic-rev').textContent=money(totR);
  $('ic-topn').textContent=topNp.toFixed(1)+'%';
  $('ic-topr').textContent=topRp.toFixed(1)+'%';
  var conc=topNp?topRp/topNp:0;
  $('ic-conbox').className='stat '+(conc>=2.5?'hi':conc>=1.5?'md':'lo');
  var seed=rows[2].n+rows[3].n;
  $('ic-seed').textContent=seed.toLocaleString();
  var n=$('ic-note');
  if(conc>=2.5){n.className='note good';n.textContent='The top tier is '+topNp.toFixed(1)+' percent of customers and '+topRp.toFixed(1)+' percent of revenue, a concentration of '+conc.toFixed(1)+' times. That is a strong ICP signal. Seed lookalikes on the top two tiers combined, which gives a '+seed.toLocaleString()+' person seed, comfortably above the 500 minimum and specific enough to model the profitable cohort rather than the median one.';}
  else if(conc>=1.5){n.className='note warn';n.textContent='Concentration of '+conc.toFixed(1)+' times is real but moderate. The top tier is worth seeding on, and the difference from an all-purchaser lookalike will be smaller than in a sharply concentrated base. Build both and let performance decide which survives.';}
  else{n.className='note';n.textContent='Revenue is distributed fairly evenly across tiers, so a value-based seed will not differ much from an all-purchaser one. Look instead at product mix or repeat behaviour as the segmenting variable, because order value is not separating the base here.';}
  var best=rows.slice().sort(function(x,y){return (y.a*y.f*(1+y.r/100))-(x.a*x.f*(1+x.r/100))})[0];
  $('ic-out').textContent=
   'IDEAL CUSTOMER PROFILE\n\n'+
   'DEFINITION      First order at or above $200\n'+
   'SIZE            '+seed.toLocaleString()+' customers ('+(totN?(seed/totN*100).toFixed(1):0)+'% of base)\n'+
   'REVENUE SHARE   '+(totR?((rows[2].rev+rows[3].rev)/totR*100).toFixed(1):0)+'%\n'+
   'AVG ORDER       $'+((rows[2].a*rows[2].n+rows[3].a*rows[3].n)/Math.max(1,seed)).toFixed(0)+'\n'+
   'ORDERS PER YEAR '+(((rows[2].f*rows[2].n)+(rows[3].f*rows[3].n))/Math.max(1,seed)).toFixed(2)+'\n'+
   'REPEAT RATE     '+(((rows[2].r*rows[2].n)+(rows[3].r*rows[3].n))/Math.max(1,seed)).toFixed(0)+'%\n'+
   'STRONGEST TIER  '+best.label+'\n\n'+
   'MEta AUDIENCE SETUP\n'+
   '  Source        Customer list, exported from Shopify\n'+
   '  Filter        Total spent >= $200\n'+
   '  Fields        email, phone, first name, last name, country\n'+
   '  Hashing       Handled on upload, do not pre-hash manually\n'+
   '  Audience      PR03_LAL-HIGHAOV-1-2\n'+
   '  Refresh       Quarterly. A seed built in month two is stale by month eight.\n\n'+
   'CREATIVE IMPLICATION\n'+
   '  Brief against this profile, not against the median customer.\n'+
   '  A $'+top.a.toFixed(0)+' order supports longer-form video and premium\n'+
   '  creator cost that a $'+rows[0].a.toFixed(0)+' order cannot justify.';
}
[1,2,3,4].forEach(function(i){['n','a','f','r'].forEach(function(k){$('ic-'+k+i).addEventListener('input',calcICP)})});

/* ================= LTV AND CAC ================= */
function ltvAt(annualRet){
  var aov=+$('lv-aov').value||0, mar=(+$('lv-mar').value||0)/100, freq=+$('lv-freq').value||0, hor=+$('lv-hor').value||12;
  var m=Math.pow(Math.max(0.001,annualRet/100),1/12);
  var perMonth=aov*mar*(freq/12), surv=1, cum=0, curve=[];
  for(var t=0;t<hor;t++){
    cum+=perMonth*surv;
    curve.push({m:t+1,s:surv,c:perMonth*surv,cum:cum});
    surv*=m;
  }
  return {ltv:cum,curve:curve,perMonth:perMonth};
}
function calcLTV(){
  var lo=ltvAt(+$('lv-rl').value||20), ex=ltvAt(+$('lv-re').value||40), hi=ltvAt(+$('lv-rh').value||60);
  var mem=(+$('lv-mem').value||0)/100;
  var blended=ex.ltv*(1-mem)+ex.ltv*2.5*mem;
  $('lv-low').textContent=money(lo.ltv); $('lv-exp').textContent=money(ex.ltv); $('lv-high').textContent=money(hi.ltv);
  $('lv-spread').textContent=ex.ltv?'±'+Math.round((hi.ltv-lo.ltv)/2/ex.ltv*100)+'%':'—';
  $('lv-memv').textContent=money(blended);
  $('lv-expbox').className='stat hi';
  var step=Math.max(1,Math.round(ex.curve.length/8));
  $('lv-curve').innerHTML=ex.curve.filter(function(_,i){return i%step===0||i===ex.curve.length-1}).map(function(r){
    return '<tr><td class="num">'+r.m+'</td><td class="num">'+(r.s*100).toFixed(0)+'%</td><td class="num">$'+r.c.toFixed(2)+'</td><td class="num">'+money(r.cum)+'</td></tr>';
  }).join('');
  var spread=ex.ltv?(hi.ltv-lo.ltv)/ex.ltv:0;
  var n=$('lv-note');
  if(spread>0.9){n.className='note warn';n.textContent='The retention range produces an LTV spread of '+Math.round(spread*100)+' percent, which is wide enough that bidding against the expected figure carries real risk. Bid against the conservative number until you have twelve months of cohort data, and treat the optimistic figure as upside rather than as plan.';}
  else{n.className='note';n.textContent='LTV spread of '+Math.round(spread*100)+' percent across the retention range. Contribution per month is $'+ex.perMonth.toFixed(2)+' at expected retention. The curve above shows how much of the value arrives late, which is what the payback period below turns into a cash flow question.';}
  calcCAC();
}
function calcCAC(){
  var sp=+$('cc-spend').value||0, nw=+$('cc-new').value||1, all=+$('cc-all').value||1, oth=+$('cc-other').value||0;
  var paid=sp/Math.max(1,nw), blend=(sp+oth)/Math.max(1,all), orgp=all?((all-nw)/all*100):0;
  var ex=ltvAt(+$('lv-re').value||40);
  $('cc-paid').textContent=money(paid); $('cc-blend').textContent=money(blend);
  $('cc-org').textContent=orgp.toFixed(0)+'%';
  $('cc-max').textContent=money(ex.ltv/3);
  var ratio=paid?ex.ltv/paid:0;
  var pb=0,cum=0;
  for(var i=0;i<ex.curve.length;i++){cum=ex.curve[i].cum; if(cum>=paid){pb=ex.curve[i].m;break}}
  if(!pb)pb=ex.curve.length+1;
  $('lc-ratio').textContent=ratio.toFixed(2);
  $('lc-pb').textContent=pb>ex.curve.length?'>'+ex.curve.length+' mo':pb+' mo';
  $('lc-cont').textContent=money(ex.ltv-paid);
  $('lc-head').textContent=money(Math.max(0,ex.ltv/3-paid));
  var r=$('lc-read'); r.className='readout'; var cls,label,body;
  if(ratio<1){cls='is-fail';label='Losing money per customer';
    body='Every acquisition costs more than it returns over '+(+$('lv-hor').value)+' months. This is not a bidding problem to optimise, it is an economics problem. Raise AOV, improve retention, or reduce CAC before adding budget, because scaling this ratio scales the loss.';}
  else if(ratio<2){cls='is-fail';label='Marginal';
    body='A ratio of '+ratio.toFixed(2)+' leaves nothing for overhead, product or the cost of capital. Workable briefly while a new lane learns, and not sustainable as a steady state.';}
  else if(ratio<3){cls='is-warn';label='Workable but tight';
    body='A ratio of '+ratio.toFixed(2)+' funds the business without much room. Scale carefully and watch marginal CPA at every increment, because the ratio deteriorates as you push past the efficient audience.';}
  else if(ratio<5){cls='is-pass';label='Healthy';
    body='A ratio of '+ratio.toFixed(2)+' supports scaling. You can afford up to '+money(ex.ltv/3)+' per customer at a three to one target, which is '+money(Math.max(0,ex.ltv/3-paid))+' of headroom above current CAC. Spend it on the levers in order: creative volume first, then AOV, then lanes, then budget.';}
  else{cls='is-warn';label='Probably underinvesting';
    body='A ratio of '+ratio.toFixed(2)+' usually means acquisition is too conservative rather than that the business is exceptionally efficient. You can afford '+money(ex.ltv/3)+' per customer and are paying '+money(paid)+'. Bidding higher would buy volume the business can clearly absorb, and leaving that unspent is growth left on the table.';}
  r.classList.add(cls);
  $('lc-label').textContent=label; $('lc-val').textContent=ratio.toFixed(2)+':1';
  $('lc-fill').style.width=Math.min(100,ratio/3*55)+'%'; $('lc-mark').style.left='55%';
  $('lc-body').textContent=body;
  var pbox=$('lc-pbbox'), pn=$('lc-pbnote');
  if(pb<=3){pbox.className='stat hi';pn.className='note good';pn.textContent='Payback inside three months. Cash returns fast enough to fund the next cohort from the last one, which is what allows aggressive scaling without external capital.';}
  else if(pb<=6){pbox.className='stat hi';pn.className='note good';pn.textContent='Payback of '+pb+' months is healthy for this AOV. Scaling is a working capital question rather than a profitability one.';}
  else if(pb<=12){pbox.className='stat md';pn.className='note warn';pn.textContent='Payback of '+pb+' months means each cohort ties up cash for most of a year. The ratio can look healthy while the business runs out of money, so confirm the cash position supports the scaling rate before increasing budget.';}
  else{pbox.className='stat lo';pn.className='note bad';pn.textContent='Payback beyond twelve months is a cash flow risk regardless of the LTV to CAC ratio. Prioritise anything that pulls value forward: bundles that raise first-order value, membership attach at checkout, and a second purchase inside ninety days.';}
}
['lv-aov','lv-mar','lv-freq','lv-hor','lv-rl','lv-re','lv-rh','lv-mem'].forEach(function(id){$(id).addEventListener('input',calcLTV)});
['cc-spend','cc-new','cc-all','cc-other'].forEach(function(id){$(id).addEventListener('input',calcCAC)});

/* ================= SEGMENTS ================= */
var SEGS=[
 {k:'champ',n:'Champions',w:.06,d:'Purchased in 90d · 2+ orders · above value threshold',a:'Seed lookalikes · membership upsell',p:1,
  m:'AUDIENCE      SEG_CHAMPIONS\nSOURCE        Customer list from Shopify\nFILTER        Orders >= 2 AND last order <= 90d AND total spent >= threshold\nUSE           1) Seed for PR03 lookalike\n              2) Membership upsell campaign\n              3) Exclude from all prospecting\nREFRESH       Monthly\nEXCLUDE FROM  Every acquisition campaign'},
 {k:'loyal',n:'Loyal',w:.10,d:'2+ orders · last order 90 to 180d',a:'Replenishment · cross-sell',p:2,
  m:'AUDIENCE      SEG_LOYAL\nFILTER        Orders >= 2 AND last order between 90d and 180d\nUSE           Replenishment campaign, product-specific\n              Cross-sell into adjacent lane\nCREATIVE      Convenience and subscribe-and-save, not introduction\nEXCLUDE FROM  Prospecting · new customer campaigns'},
 {k:'new',n:'New, one order',w:.22,d:'1 order · within 90d',a:'Second purchase · membership',p:2,
  m:'AUDIENCE      SEG_NEW_1ORDER\nFILTER        Orders = 1 AND first order <= 90d\nUSE           Second-purchase campaign. This is the highest-leverage\n              retention moment in the whole base.\nCREATIVE      Cross-sell the natural complement, or the membership\n              savings arithmetic. Not a repeat of acquisition creative.\nEXCLUDE FROM  Prospecting'},
 {k:'hv1',n:'High value, one order',w:.05,d:'1 order · above threshold · 90 to 270d',a:'Highest-value reactivation',p:1,
  m:'AUDIENCE      SEG_HIGHVALUE_LAPSING\nFILTER        Orders = 1 AND total spent >= threshold\n              AND last order between 90d and 270d\nUSE           Priority reactivation. These customers proved they will\n              spend at the top of the range and then did not return.\n              Recovering one is worth several new low-tier acquisitions.\nCREATIVE      Replenishment for kits, or the membership case.\nBUDGET        Justifies a materially higher CPA than prospecting.'},
 {k:'risk',n:'At risk',w:.13,d:'2+ orders · last order 180 to 365d',a:'Reactivation offer',p:3,
  m:'AUDIENCE      SEG_AT_RISK\nFILTER        Orders >= 2 AND last order between 180d and 365d\nUSE           Reactivation. Run through email and SMS first, and use\n              paid only for the portion that does not respond.\nCREATIVE      What changed since they last bought. New products,\n              improved terms, membership.'},
 {k:'lost',n:'Lapsed',w:.30,d:'No order in 365d',a:'Suppress from paid · owned channels only',p:4,
  m:'AUDIENCE      SEG_LAPSED\nFILTER        Last order > 365d\nUSE           Suppression list on prospecting, so you are not paying\n              prospecting rates to reach people you already have.\n              Win-back belongs in email, not in paid media.\nEXCLUDE FROM  All prospecting campaigns'},
 {k:'kit',n:'Kit owners',w:.14,d:'Purchased a kit · any recency',a:'Replenishment at 120 to 180d',p:2,
  m:'AUDIENCE      SEG_KIT_OWNERS\nFILTER        Product type = emergency kit\nUSE           Replenish My Kit at the 120 to 180 day window.\n              A kit is a durable purchase, so retargeting at day 45\n              buys nothing and burns frequency.\nEXCLUDE FROM  Kit prospecting for 180 days'}
];
function calcSegs(){
  var tot=+$('sg-tot').value||0, hv=+$('sg-hv').value||250;
  $('sg-rows').innerHTML=SEGS.map(function(sg){
    var size=Math.round(tot*sg.w);
    var pc=sg.p===1?'p-scale':sg.p===2?'p-retest':sg.p===3?'p-iterate':'p-kill';
    var pl=sg.p===1?'Highest':sg.p===2?'High':sg.p===3?'Medium':'Suppress';
    return '<tr><td><b>'+sg.n+'</b></td><td class="num">'+size.toLocaleString()+'</td><td style="font-size:12.5px;color:var(--ink-3)">'+sg.d.replace('value threshold','$'+hv)+'</td>'+
      '<td style="font-size:12.5px">'+sg.a+'</td><td><span class="pill '+pc+'">'+pl+'</span></td></tr>';
  }).join('');
  var small=SEGS.filter(function(sg){return tot*sg.w<1000});
  var n=$('sg-note');
  if(small.length){n.className='note warn';n.textContent=small.length+' segment'+(small.length===1?' is':'s are')+' below 1,000 people, which is the practical floor for a Meta custom audience to deliver. Consolidate those into an adjacent segment rather than building ad sets that will never exit learning. Sizes are modelled from the base you entered and should be replaced with real Shopify counts.';}
  else{n.className='note';n.textContent='Every segment clears the 1,000 person floor. Build the highest priority ones first, and remember that the value of a segment is the action it enables, not the fact that it exists. A segment with no distinct creative and no distinct budget is a report, not an audience.';}
  if(!$('sg-sel').options.length){
    $('sg-sel').innerHTML=SEGS.map(function(sg){return '<option value="'+sg.k+'">'+sg.n+'</option>'}).join('');
  }
  renderSegSetup();
}
function renderSegSetup(){
  var k=$('sg-sel').value, sg=SEGS.filter(function(x){return x.k===k})[0]||SEGS[0];
  var tot=+$('sg-tot').value||0, hv=+$('sg-hv').value||250;
  $('sg-out').textContent=sg.m.replace(/threshold/g,'$'+hv)+'\n\nESTIMATED SIZE  '+Math.round(tot*sg.w).toLocaleString();
  $('sg-setup').textContent=sg.p===1
    ? 'Highest priority. Build this before any other segment, because it either seeds the lookalike that drives prospecting or it recovers customers worth more than several new ones.'
    : sg.p===4
    ? 'Build this as a suppression list rather than a targeting audience. Its job is to stop you paying prospecting rates to reach people you already acquired.'
    : 'Build once the highest priority segments are live and populated. Each segment needs its own creative and its own budget line, or it is not doing any work.';
}
['sg-tot','sg-rep','sg-act','sg-hv'].forEach(function(id){$(id).addEventListener('input',calcSegs)});
$('sg-sel').addEventListener('change',renderSegSetup);
