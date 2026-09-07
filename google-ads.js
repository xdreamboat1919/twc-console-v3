/* ================= GOOGLE ADS ================= */
function calcBrandInc(){
  var sp=+$('gb-sp').value||0, cv=+$('gb-cv').value||0, aov=+$('gb-aov').value||0,
      org=+$('gb-org').value||0, can=(+$('gb-can').value||0)/100, comp=$('gb-comp').value==='1';
  var eff=comp?Math.max(0,can-0.25):can;
  var inc=cv*(1-eff);
  var cpa=cv?sp/cv:0, tcpa=inc?sp/inc:0;
  var roas=sp?(cv*aov)/sp:0, iroas=sp?(inc*aov)/sp:0;
  var annual=sp*eff*12;
  $('gb-cpa').textContent='$'+cpa.toFixed(0);
  $('gb-true').textContent=inc?'$'+tcpa.toFixed(0):'undefined';
  $('gb-roas').textContent=roas.toFixed(2);
  $('gb-iroas').textContent=iroas.toFixed(2);
  $('gb-cost').textContent=money(annual);
  $('gb-tbox').className='stat '+(tcpa<=cpa*2?'hi':tcpa<=cpa*4?'md':'lo');
  var r=$('gb-read'); r.className='readout'; var cls,label,val,body;
  if(comp&&eff<0.5){
    cls='is-warn';label='Defensive spend, partly justified';val='DEFEND';
    body='Competitors are bidding on your brand, which is the one condition that makes branded search genuinely incremental. Someone searching your name who sees a competitor first is a customer you can lose. Effective cannibalisation drops to '+(eff*100).toFixed(0)+
      ' percent, giving a true CPA of $'+tcpa.toFixed(0)+' against a reported $'+cpa.toFixed(0)+
      '. That is defensible. Keep it, and keep it narrow: exact match on your brand terms only, not broad match that bleeds into category searches.';
  } else if(eff>=0.75){
    cls='is-fail';label='Mostly buying traffic you already had';val='CANNIBAL';
    body='At '+(eff*100).toFixed(0)+' percent cannibalisation, roughly '+Math.round(cv*eff)+' of '+cv+
      ' monthly conversions would have arrived through organic anyway. True CPA is $'+tcpa.toFixed(0)+' against a reported $'+cpa.toFixed(0)+
      ', and roughly '+money(annual)+' a year is being spent to appear above your own organic listing. Reported ROAS of '+roas.toFixed(2)+
      ' is the number that makes this look like the best channel in the account, and incremental ROAS of '+iroas.toFixed(2)+' is closer to what it earns. Run the pause test before reallocating, because the assumption is doing all the work here.';
  } else {
    cls='is-warn';label='Partly incremental';val='MIXED';
    body='At '+(eff*100).toFixed(0)+' percent cannibalisation, true CPA of $'+tcpa.toFixed(0)+' against a reported $'+cpa.toFixed(0)+
      '. Some of this spend is buying customers and some is buying clicks you already owned. The cannibalisation figure is an assumption until tested, and the test below costs a week of brand impressions to settle a number that governs the budget every month after.';
  }
  r.classList.add(cls);
  $('gb-label').textContent=label;$('gb-val').textContent=val;$('gb-body').textContent=body;
  $('gb-test').textContent=
   'BRAND SEARCH PAUSE TEST\n'+'='.repeat(48)+'\n\n'+
   'WHAT IT ANSWERS\n'+
   '  Whether branded search converts customers or buys\n'+
   '  clicks from people who would have found you anyway.\n\n'+
   '1  BASELINE  · 2 weeks\n'+
   '   Record total revenue, total orders and organic\n'+
   '   branded sessions. Not brand campaign revenue.\n'+
   '   The whole business is the unit of measurement.\n\n'+
   '2  PAUSE     · 1 to 2 weeks\n'+
   '   Pause the brand campaign entirely.\n'+
   '   Change nothing else. No Meta budget shifts,\n'+
   '   no new creative, no promotions.\n\n'+
   '3  MEASURE\n'+
   '   Total revenue, pause period vs baseline\n'+
   '   Organic branded sessions, pause vs baseline\n'+
   '   Total orders, pause vs baseline\n\n'+
   '4  READ\n'+
   '   Total revenue flat, organic sessions rose\n'+
   '     -> organic absorbed the traffic. Cannibalisation\n'+
   '        is high and the spend is largely defensive.\n'+
   '   Total revenue fell by roughly the brand revenue\n'+
   '     -> genuinely incremental. Keep and fund it.\n'+
   '   Total revenue fell by less than brand revenue\n'+
   '     -> partial. The gap is your real cannibalisation.\n\n'+
   'RUN IT WHEN\n'+
   '  No competitor is actively bidding on your brand,\n'+
   '  and no promotion or launch is running.\n\n'+
   'DO NOT\n'+
   '  Judge this on the brand campaign\u2019s own numbers.\n'+
   '  It will always look excellent, because the people\n'+
   '  clicking it were already looking for you.';
}
['gb-sp','gb-cv','gb-aov','gb-org','gb-can','gb-comp'].forEach(function(id){$(id).addEventListener('input',calcBrandInc)});

var GSPEC={
 brand:{n:'Branded search',bid:'Manual CPC or Target impression share',match:'Exact and phrase only',
  spec:'STRUCTURE\n  One campaign, one ad group per brand theme\n    Brand core        [the wellness company]\n    Brand + product   [twc emergency kit]\n    Misspellings      exact match only\n\nMATCH TYPES\n  Exact and phrase only. Broad match on brand terms\n  bleeds into category searches and quietly turns a\n  defensive campaign into an expensive non-brand one.\n\nNEGATIVES\n  Competitor names, careers, login, reviews, complaints\n  Anything that is research rather than purchase\n\nBIDDING\n  Target impression share, absolute top, 90 to 95%\n  Not maximise conversions. You are defending a\n  position, not finding customers.\n\nBUDGET\n  Capped. This campaign should never be budget limited\n  and should never absorb more than it needs to hold\n  the position.\n\nAD COPY\n  Confirm they are in the right place. Include the\n  offer and the trust signals. This is reassurance\n  rather than persuasion.',
  note:'Bidding to maximise conversions on brand is how a defensive campaign becomes an expensive one. It will find more conversions by bidding on looser matches, and every one of them was already yours.'},
 nonbrand:{n:'Non-brand search',bid:'Maximise conversions, then Target CPA',match:'Phrase and exact, broad only with strong negatives',
  spec:'STRUCTURE\n  One campaign per lane, one ad group per tight theme\n    Kits        [emergency medical kit] [home medical kit]\n    Supplements [nac supplement] [longevity supplement]\n\nMATCH TYPES\n  Start phrase and exact. Add broad only once the\n  negative list is mature, and review search terms\n  weekly for the first two months.\n\nNEGATIVES\n  Build before launch, not after. Minimum list:\n  free, cheap, diy, how to make, side effects,\n  recall, lawsuit, competitor names, job, salary\n\nBIDDING\n  Start with Maximise conversions while signal forms.\n  Move to Target CPA only when account history,\n  forecasts, and current platform guidance show the\n  target will not choke delivery.\n\nADS\n  2 RSAs per ad group, genuinely different angles.\n  Pin the brand into headline 1 on one, leave the\n  other unpinned, and compare at ad level.\n\nEXTENSIONS\n  Sitelinks, callouts, structured snippets. On this\n  catalog the contents list works well as structured\n  snippets and it is claim-safe.',
  note:'The negative list built before launch is worth more than any bidding decision made after it. Most non-brand waste is in terms nobody chose, and the first month sets the pattern for everything that follows.'},
 shop:{n:'Standard Shopping',bid:'Target ROAS once data allows',match:'Feed-driven, no keywords',
  spec:'STRUCTURE\n  Campaign per lane, product groups by custom label\n    custom_label_0  margin band\n    custom_label_1  compliance tier\n    custom_label_2  subscription eligible\n\nFEED REQUIREMENTS\n  id matches the content_ids sent in ViewContent\n  availability synced at least daily\n  price matching the landing page exactly\n  product_type set to the COMPLIANCE tier,\n    not the merchandising category\n\nWHY product_type MATTERS\n  It is what lets you exclude gated and high-claim\n  products from a campaign that would otherwise\n  serve them automatically.\n\nNEGATIVES\n  Shopping takes negatives. Use them.\n\nPRIORITY\n  If Performance Max runs on the same products, PMax\n  wins the auction. Standard Shopping will look like\n  it stopped working when it was simply outranked.',
  note:'The last line is the one that surprises people. Running PMax and standard Shopping on the same inventory means PMax takes the traffic, and the Shopping campaign appears to fail for reasons that have nothing to do with how it was built.'},
 pmax:{n:'Performance Max',bid:'Target ROAS with a floor',match:'Automated across all inventory',
  spec:'STRUCTURE\n  One asset group per THEME, never per product\n    Preparedness · Physician authority · Contents\n  Listing groups split by compliance tier\n\nEXCLUSIONS\n  Brand exclusions ON. Without it PMax can serve\n  against branded searches and take credit for demand\n  that another campaign would otherwise capture.\n  Use account or campaign negatives where eligible.\n\nASSETS PER GROUP\n  Build a complete, diverse asset group across text,\n  image, logo, and video formats. Review current limits\n  in the platform instead of relying on a fixed count.\n\nSIGNALS\n  Audience signals are a hint, not targeting.\n  Feed the high-value customer list as a signal.\n\nREPORTING LIMITS\n  Placement-level cost and complete search-term detail\n  remain limited. Asset conversion metrics are available,\n  but are credited to multiple components and cannot be\n  added into the campaign total. Keep campaign-level\n  commercial truth primary.',
  note:'Brand exclusions being off is the most common PMax mistake and the most expensive. It lets PMax absorb branded search traffic and report it as new performance, which inflates the campaign and hollows out the brand campaign at the same time.'},
 dgen:{n:'Demand Gen',bid:'Maximise conversions',match:'Audience and creative driven',
  spec:'STRUCTURE\n  Closest thing Google has to a Meta campaign.\n  One ad group per CONCEPT, exactly as on Meta.\n    AG01 Preparedness\n    AG02 Access\n    AG03 Authority\n\nCREATIVE\n  Meta assets transfer directly here. Same\n  interruption model, same hook mechanics.\n  Supply both image and video per ad group.\n\nAUDIENCE\n  Lookalike segments from the customer list,\n  plus interest signals. Broader beats narrow\n  once conversion volume supports it.\n\nTESTING\n  Read this like a Meta concept test. Separate\n  ad groups give near-guaranteed delivery, which\n  search and PMax do not.\n\nEXCLUSIONS\n  Existing customers, at the lane window.',
  note:'This is where the thirty-two brief deck earns a second life. Demand Gen is the one Google surface where Meta creative and Meta testing methodology both transfer without rework.'},
 yt:{n:'YouTube',bid:'Target CPA or CPM by objective',match:'Audience and placement driven',
  spec:'STRUCTURE\n  Campaign per objective, ad group per audience\n  In-stream skippable for reach and consideration\n  In-feed for intent\n\nCREATIVE\n  The first five seconds carry the weight the\n  first three carry on Meta. Product visible\n  before the skip point.\n\n  Hook rate translates directly. A Meta asset\n  with a strong 3-second rate will usually hold\n  its 5-second rate here.\n\nLENGTH\n  15s for reach, 30 to 60s for consideration.\n  The high AOV on this catalog supports longer\n  formats that a low-AOV brand could not justify.\n\nAUDIENCE\n  Custom segments from search behaviour, plus\n  customer list and lookalikes.\n\nMEASUREMENT\n  View-through conversions dominate here and are\n  the weakest signal available. Judge YouTube on\n  its effect on total business volume rather than\n  on its own reported conversions.',
  note:'The measurement note is the important one. YouTube reports heavily on view-through, which credits an impression the viewer may not have registered. If YouTube looks like your best channel on platform numbers, check total revenue rather than believing it.'}
};
function renderGStruct(){
  var k=$('gs-type').value, G=GSPEC[k];
  var lane=$('gs-lane').value, day=+$('gs-day').value||0, cpa=+$('gs-cpa').value||1;
  var conv=cpa?(day*7/cpa):0;
  $('gs-spec').innerHTML=[
    ['Type',G.n],['Bidding',G.bid],['Matching',G.match],
    ['Weekly conversions at this budget',conv.toFixed(1)+(conv<15?'  ·  below the 30-in-30 threshold for smart bidding':'')]
  ].map(function(r){
    return '<tr><td style="width:200px;color:var(--ink-3);font-size:12.5px;vertical-align:top">'+r[0]+'</td><td>'+r[1]+'</td></tr>';
  }).join('');
  renderGoogleDiagram();
  $('gs-out').textContent=G.n.toUpperCase()+'  ·  '+lane.toUpperCase()+'  ·  '+money(day)+'/day\n'+'='.repeat(52)+'\n\n'+G.spec;
  var n=$('gs-note');
  if(conv<15&&(k==='nonbrand'||k==='pmax'||k==='shop')){
    n.className='note bad';
    n.textContent='At '+money(day)+' daily against a $'+cpa+' target, this campaign produces roughly '+conv.toFixed(1)+
      ' conversions a week. Smart bidding needs around thirty conversions in thirty days before Target CPA or Target ROAS behaves, and below that it will underdeliver rather than optimise. Start on maximise conversions, or consolidate into fewer campaigns until the volume supports the bidding strategy. '+G.note;
  } else {
    n.className='note';
    n.textContent=G.note;
  }
}
['gs-type','gs-lane','gs-day','gs-cpa'].forEach(function(id){$(id).addEventListener('input',renderGStruct)});

var GWCAT=[['Brand terms',1,'Review the incrementality question above, not the CPA'],
 ['Exact intent',2,'Protect and scale. This is the campaign working.'],
 ['Adjacent',3,'Tighten match types, or move to its own ad group with its own bid'],
 ['Informational',4,'Negative, or route to content rather than a product page'],
 ['Irrelevant',5,'Negative immediately. This is pure waste.']];
function calcGWaste(){
  var tot=0,waste=0,brand=0,rows=[];
  GWCAT.forEach(function(c){
    var i=c[1];
    var sp=+$('gw-s'+i).value||0, cv=+$('gw-c'+i).value||0;
    var k=cv?sp/cv:0;
    $('gw-k'+i).textContent=cv?'$'+k.toFixed(0):'no conv';
    $('gw-a'+i).innerHTML='<span style="font-size:12.5px;color:var(--ink-3)">'+c[2]+'</span>';
    tot+=sp;
    if(i>=4)waste+=sp;
    if(i===1)brand=sp;
    rows.push({n:c[0],sp:sp,cv:cv,k:k});
  });
  var pct=tot?waste/tot*100:0, bpct=tot?brand/tot*100:0;
  $('gw-tot').textContent=money(tot);
  $('gw-waste').textContent=money(waste);
  $('gw-pct').textContent=pct.toFixed(1)+'%';
  $('gw-brand').textContent=bpct.toFixed(0)+'%';
  $('gw-annual').textContent=money(waste*12);
  $('gw-wbox').className='stat '+(pct<8?'hi':pct<18?'md':'lo');
  var n=$('gw-note');
  var msg='';
  if(pct>=18){msg='Informational and irrelevant terms carry '+pct.toFixed(0)+' percent of search spend, or '+money(waste*12)+
    ' a year. Build the negative list from the search terms report before touching bids, because bidding changes redistribute waste rather than removing it. ';}
  else if(pct>=8){msg='Waste at '+pct.toFixed(0)+' percent is within a normal range for an account with broad or phrase match running, and it is still '+money(waste*12)+
    ' a year. A monthly negative sweep keeps this from drifting upward. ';}
  else {msg='Waste at '+pct.toFixed(0)+' percent is tight, which usually means match types are conservative. Worth checking whether that is also limiting reach on the exact-intent terms that convert. ';}
  if(bpct>=45){msg+='Separately, brand carries '+bpct.toFixed(0)+
    ' percent of search spend. On this account the customer path frequently includes a brand search after seeing a Meta ad, so a large brand share usually means Google is being credited for demand Meta created. Run the pause test above before treating branded ROAS as performance.';}
  n.className='note'+(pct>=18||bpct>=45?' bad':pct>=8?' warn':' good');
  n.textContent=msg;
}
GWCAT.forEach(function(c){['s','c'].forEach(function(f){var id='gw-'+f+c[1]; if($(id))$(id).addEventListener('input',calcGWaste)})});


/* ================= GOOGLE STRUCTURE DIAGRAM ================= */
var gv={s:1,x:0,y:0,drag:false,px:0,py:0};
function gvApply(){$('gt-canvas').style.transform='translate('+gv.x+'px,'+gv.y+'px) scale('+gv.s+')';$('gt-zoom').textContent=Math.round(gv.s*100)+'%'}
function gvPrep(){
  var g=$('gt-canvas').querySelector('svg'); if(!g)return;
  var vb=g.getAttribute('viewBox'),w,h;
  if(vb){var a=vb.split(/[\s,]+/);w=parseFloat(a[2]);h=parseFloat(a[3])}else{w=g.clientWidth||900;h=g.clientHeight||600}
  g.style.maxWidth='none';g.setAttribute('width',w);g.setAttribute('height',h);g.dataset.w=w;g.dataset.h=h;
}
function gvFit(){
  var g=$('gt-canvas').querySelector('svg'); if(!g)return;
  var st=$('gt-stage');
  var w=parseFloat(g.dataset.w)||g.clientWidth,h=parseFloat(g.dataset.h)||g.clientHeight;
  gv.s=Math.max(0.12,Math.min((st.clientWidth-44)/w,(st.clientHeight-44)/h,1.6));
  gv.x=(st.clientWidth-w*gv.s)/2;gv.y=(st.clientHeight-h*gv.s)/2;gvApply();
}
function gvZoom(f,cx,cy){
  var st=$('gt-stage'),r=st.getBoundingClientRect();
  if(cx===undefined){cx=st.clientWidth/2;cy=st.clientHeight/2}else{cx=cx-r.left;cy=cy-r.top}
  var ns=Math.max(0.12,Math.min(6,gv.s*f));
  gv.x=cx-(cx-gv.x)*(ns/gv.s);gv.y=cy-(cy-gv.y)*(ns/gv.s);gv.s=ns;gvApply();
}
(function(){
  var st=$('gt-stage');
  st.addEventListener('wheel',function(e){e.preventDefault();gvZoom(e.deltaY<0?1.12:1/1.12,e.clientX,e.clientY)},{passive:false});
  st.addEventListener('pointerdown',function(e){if(e.target.closest('.mmctl'))return;gv.drag=true;gv.px=e.clientX;gv.py=e.clientY;st.classList.add('drag');st.setPointerCapture(e.pointerId)});
  st.addEventListener('pointermove',function(e){if(!gv.drag)return;gv.x+=e.clientX-gv.px;gv.y+=e.clientY-gv.py;gv.px=e.clientX;gv.py=e.clientY;gvApply()});
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){st.addEventListener(ev,function(){gv.drag=false;st.classList.remove('drag')})});
  st.addEventListener('dblclick',function(e){if(!e.target.closest('.mmctl'))gvZoom(1.5,e.clientX,e.clientY)});
})();
$('gz-in').addEventListener('click',function(){gvZoom(1.25)});
$('gz-out').addEventListener('click',function(){gvZoom(1/1.25)});
$('gz-fit').addEventListener('click',gvFit);
$('gz-pres').addEventListener('click',function(){
  var st=$('gt-stage'),on=st.classList.toggle('present');
  document.body.classList.toggle('presenting',on);
  $('gz-pres').textContent=on?'Exit':'Present';setTimeout(gvFit,60);
});
$('gz-svg').addEventListener('click',function(){
  var g=$('gt-canvas').querySelector('svg'); if(!g)return;
  var c=g.cloneNode(true);c.setAttribute('xmlns','http://www.w3.org/2000/svg');
  var bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width','100%');bg.setAttribute('height','100%');bg.setAttribute('fill','#ffffff');
  c.insertBefore(bg,c.firstChild);
  dl(new Blob([new XMLSerializer().serializeToString(c)],{type:'image/svg+xml;charset=utf-8'}),'google-'+$('gs-type').value+'.svg');
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&$('gt-stage').classList.contains('present')){$('gz-pres').click()}
});

function googleMermaid(){
  var k=$('gs-type').value, lane=$('gs-lane').value, day=+$('gs-day').value||0, cpa=+$('gs-cpa').value||1;
  var L={kit:'KITS',supp:'SUPP',skin:'SKIN',farms:'FARMS'}[lane];
  var m='flowchart TD\n', cap='';
  if(k==='brand'){
    m+='  C["BRAND_'+L+'<br/>'+money(day)+' / day<br/>Target impression share 90-95%"]\n';
    m+='  C --> A1["AG · Brand core<br/>exact + phrase"]\n  C --> A2["AG · Brand + product<br/>exact"]\n  C --> A3["AG · Misspellings<br/>exact only"]\n';
    m+='  A1 --> R1["2 RSAs<br/>reassure, not persuade"]\n';
    m+='  N(["Negatives<br/>competitors · careers · login<br/>reviews · complaints"])\n  N -.-> C\n';
    m+='  W{"Bidding to<br/>maximise conversions?"}\n  C -.-> W\n';
    m+='  W -->|yes| BAD["Becomes a non-brand campaign<br/>at brand prices"]\n';
    m+='  W -->|no| OK["Holds the position<br/>at a capped cost"]\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n';
    m+='  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m+='  class C camp\n  class BAD bad\n  class OK good\n  class N meta';
    cap='3 ad groups · exact and phrase only';
  } else if(k==='nonbrand'){
    m+='  C["NONBRAND_'+L+'<br/>'+money(day)+' / day<br/>Max conversions until 30 in 30"]\n';
    m+='  C --> A1["AG · Theme 1<br/>tight keyword set"]\n  C --> A2["AG · Theme 2"]\n  C --> A3["AG · Theme 3"]\n';
    m+='  A1 --> K1["Phrase + exact"]\n  K1 --> R1["2 RSAs<br/>different angles<br/>one pinned, one not"]\n';
    m+='  N(["Negatives, built BEFORE launch<br/>free · cheap · diy · how to make<br/>side effects · recall · lawsuit"])\n  N -.-> C\n';
    m+='  ST["Search terms report<br/>weekly for 8 weeks"]\n  C --> ST\n';
    m+='  ST -->|"converting terms"| NEW["New exact keyword"]\n  NEW --> A1\n';
    m+='  ST -->|"wasted terms"| N\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef loop fill:#e8eff7,stroke:#24507f,color:#24507f\n';
    m+='  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m+='  class C camp\n  class ST,NEW loop\n  class N meta';
    cap='3 ad groups · search terms loop';
  } else if(k==='shop'){
    m+='  C["SHOPPING_'+L+'<br/>'+money(day)+' / day"]\n';
    m+='  F["Product feed"] --> C\n';
    m+='  F --> PT["product_type = COMPLIANCE TIER<br/>not merchandising category"]\n';
    m+='  C --> G1["Product group · high margin<br/>custom_label_0"]\n  C --> G2["Product group · mid"]\n  C --> G3["Product group · low / excluded"]\n';
    m+='  PT -.->|"excludes gated<br/>and Tier 5"| G3\n';
    m+='  PM["Performance Max<br/>on the same products"] -.->|"OUTRANKS"| C\n';
    m+='  C --> LOSE["Shopping appears to fail<br/>it was simply outbid"]\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n';
    m+='  class C camp\n  class PM,LOSE bad';
    cap='Feed-driven · product groups by label';
  } else if(k==='pmax'){
    m+='  C["PMAX_'+L+'<br/>'+money(day)+' / day<br/>Target ROAS with a floor"]\n';
    m+='  C --> AG1["Asset group · PREPAREDNESS<br/>5 headlines · 5 desc<br/>3 image ratios · 1 video"]\n';
    m+='  C --> AG2["Asset group · AUTHORITY"]\n  C --> AG3["Asset group · CONTENTS"]\n';
    m+='  AG1 --> LG["Listing group<br/>split by compliance tier"]\n';
    m+='  BX(["Brand exclusions<br/>MUST BE ON"])\n  BX -.-> C\n';
    m+='  BX2{"Off?"}\n  C -.-> BX2\n';
    m+='  BX2 -->|off| CANN["Absorbs branded search<br/>reports it as new performance<br/>hollows out the brand campaign"]\n';
    m+='  BLIND(["Reporting limits:<br/>placement cost · search-term detail<br/>asset conversions are non-additive"])\n';
    m+='  C -.-> BLIND\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n';
    m+='  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m+='  class C camp\n  class CANN bad\n  class BX,BLIND meta';
    cap='Asset groups by theme, never by product';
  } else if(k==='dgen'){
    m+='  C["DEMANDGEN_'+L+'<br/>'+money(day)+' / day<br/>Maximise conversions"]\n';
    m+='  C --> A1["AG01 · Concept PREPAREDNESS"]\n  C --> A2["AG02 · Concept ACCESS"]\n  C --> A3["AG03 · Concept AUTHORITY"]\n';
    m+='  A1 --> AS["Image + video assets"]\n';
    m+='  META["Meta creative deck<br/>32 briefs"] -.->|"transfers directly"| AS\n';
    m+='  SIG(["Audience signal<br/>high-value customer list<br/>a hint, not targeting"])\n  SIG -.-> C\n';
    m+='  C --> RD{"Read like a<br/>Meta concept test"}\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n';
    m+='  classDef meta fill:#f2f5f9,stroke:#c2cbd8,color:#6b7889\n';
    m+='  class C camp\n  class META,AS good\n  class SIG meta';
    cap='Concept per ad group · Meta method transfers';
  } else {
    m+='  C["YOUTUBE_'+L+'<br/>'+money(day)+' / day"]\n';
    m+='  C --> A1["AG · In-stream skippable<br/>reach and consideration"]\n  C --> A2["AG · In-feed<br/>intent"]\n';
    m+='  A1 --> V["Video<br/>first 5 seconds carry the weight<br/>product visible before the skip"]\n';
    m+='  META["Meta hook-led video"] -.->|"3s rate predicts 5s rate"| V\n';
    m+='  C --> M{"Reported conversions"}\n';
    m+='  M -->|"heavily view-through"| WARN["Weakest signal available<br/>judge on total business volume<br/>not on platform numbers"]\n';
    m+='  classDef camp fill:#14213d,stroke:#14213d,color:#ffffff\n  classDef bad fill:#fbeaea,stroke:#96302f,color:#96302f\n';
    m+='  classDef good fill:#e6f3ed,stroke:#166b4d,color:#166b4d\n';
    m+='  class C camp\n  class WARN bad\n  class META,V good';
    cap='In-stream and in-feed · 5-second rule';
  }
  return {m:m,cap:cap,title:GSPEC[k].n,sub:L+' · '+money(day)+' daily · $'+cpa+' target'};
}
function renderGoogleDiagram(){
  var o=googleMermaid();
  $('gt-cap').textContent=o.cap;
  $('gt-ptitle').textContent=o.title;
  $('gt-psub').textContent=o.sub;
  var box=$('gt-canvas'), fall=$('gt-fall');
  if(typeof mermaid==='undefined'||!initMermaid()){box.innerHTML='';fall.style.display='block';fall.textContent=o.m;return}
  fall.style.display='none';box.innerHTML='';
  try{
    mermaid.render('gtmm'+Date.now(),o.m).then(function(r){box.innerHTML=r.svg;gvPrep();gvFit()})
      .catch(function(){fall.style.display='block';fall.textContent=o.m});
  }catch(err){fall.style.display='block';fall.textContent=o.m}
}

/* ================= GOOGLE SCALING ================= */
function calcGScale(){
  var is=+$('gi-is').value||0, bud=+$('gi-bud').value||0, rank=+$('gi-rank').value||0,
      sp=+$('gi-sp').value||0, cpa=+$('gi-cpa').value||1, mx=+$('gi-max').value||1;
  var head=bud+rank;
  var atFullBudget=is+bud;
  var mult=is?atFullBudget/is:0;
  var spendNeeded=is?sp*(atFullBudget/is):sp;
  $('gi-head').textContent=head.toFixed(0)+'%';
  $('gi-spend').textContent=money(spendNeeded);
  $('gi-mult').textContent=mult.toFixed(2)+'x';
  $('gi-locked').textContent=rank.toFixed(0)+'%';
  $('gi-hbox').className='stat '+(head>=30?'hi':head>=12?'md':'lo');
  var r=$('gi-read'); r.className='readout'; var cls,label,val,body;
  if(head<10){
    cls='is-warn';label='Near the ceiling on this keyword set';val='EXPAND';
    body='Impression share of '+is+' percent with only '+head.toFixed(0)+
      ' percent unclaimed. There is very little headroom left on the keywords you are already bidding on, so raising budget or bids buys almost nothing. Scaling from here means new keyword themes from the search terms report, a new campaign type, or a new geography. This is the point at which Google scaling stops being a bidding exercise.';
  } else if(bud>rank*1.4){
    cls='is-pass';label='Budget limited, straightforward';val='BUDGET';
    body='You are losing '+bud+' percent of impression share to budget against '+rank+
      ' percent to rank, which means the auction is winnable and you simply are not showing up for it. Raising budget could take impression share from '+is+' to roughly '+atFullBudget.toFixed(0)+
      ' percent, around '+mult.toFixed(2)+' times current volume at roughly '+money(spendNeeded)+' daily. This is the cleanest scaling situation available on either platform, because the headroom is measured rather than assumed. Raise in steps and watch CPA, since the incremental impressions are the ones you were previously outbid on and may convert slightly worse.';
  } else if(rank>bud*1.4){
    cls='is-fail';label='Rank limited, budget will not help';val='RANK';
    body='You are losing '+rank+' percent of impression share to rank against only '+bud+
      ' percent to budget. Adding budget buys nothing here, because you are not being outspent, you are being outranked. The levers are ad relevance, expected click-through rate and landing page experience, which together set Quality Score, and then bids. Raising bids works and it raises CPA directly, so check the headroom against your $'+mx+
      ' ceiling first. Improving the landing page is usually the cheaper route and it improves conversion rate at the same time.';
  } else {
    cls='is-warn';label='Mixed constraint';val='BOTH';
    body='Losing '+bud+' percent to budget and '+rank+
      ' percent to rank, in roughly equal measure. Fix rank first, because budget added to a rank-limited campaign buys impressions at a worse position and a worse CPA. Work ad relevance and landing page experience, confirm impression share lost to rank falls, then raise budget into the space that opens.';
  }
  r.classList.add(cls);
  $('gi-label').textContent=label;$('gi-val').textContent=val;$('gi-body').textContent=body;
  var levers=[
   ['Impression share, budget','Direct and measured','Raise budget where lost IS to budget exceeds lost IS to rank. The only lever on either platform where the ceiling is reported rather than inferred.',bud>rank?'f-ok':'f-low'],
   ['Quality Score and rank','Cheaper than bidding','Ad relevance, expected CTR and landing page experience. Improves position without raising cost per click, and the landing page work improves conversion rate at the same time.',rank>bud?'f-ok':'f-low'],
   ['Keyword expansion','From the search terms report','Converting terms you did not choose become new exact keywords. This is the scaling input most accounts already have and never harvest.',head<15?'f-ok':'f-low'],
   ['Match type loosening','Only with mature negatives','Phrase to broad opens volume and opens waste in the same move. Do not do this until the negative list has been through eight weeks of weekly review.','f-low'],
   ['Campaign type expansion','Search to Shopping to PMax to Demand Gen','Each type reaches demand the others cannot. Demand Gen is where Meta creative transfers, which makes it the cheapest expansion if the creative already exists.',head<12?'f-ok':'f-low'],
   ['Bid strategy loosening','Last, and measured','Raising Target CPA finds more volume at a worse rate by definition. Use it to discover the ceiling, not to hold a position past it.','f-low']];
  $('gi-levers').innerHTML=levers.map(function(l,i){
    return '<div class="flag '+l[3]+'"><b>'+(i+1)+' · '+l[0]+' <span style="font-weight:400;font-size:12px;color:var(--ink-3)">· '+l[1]+'</span></b>'+l[2]+'</div>';
  }).join('');
}
['gi-is','gi-bud','gi-rank','gi-sp','gi-cpa','gi-max'].forEach(function(id){$(id).addEventListener('input',calcGScale)});
