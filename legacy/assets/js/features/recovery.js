/* ================= ROAS RECOVERY ================= */
var RVSTATE={break:'',bkVerdict:'',incVerdict:''};
function calcRecovery(){
  var s0=+$('rv-s0').value||0,a0=+$('rv-a0').value||0,i0=+$('rv-i0').value||0,p0=+$('rv-p0').value||0;
  var s1=+$('rv-s1').value||0,a1=+$('rv-a1').value||0,i1=+$('rv-i1').value||0,p1=+$('rv-p1').value||0;
  var ca0=a0?s0/a0:0, ci0=i0?s0/i0:0, cp0=p0?s0/p0:0;
  var ca1=a1?s1/a1:0, ci1=i1?s1/i1:0, cp1=p1?s1/p1:0;
  var da=ca0?((ca1-ca0)/ca0*100):0, di=ci0?((ci1-ci0)/ci0*100):0, dp=cp0?((cp1-cp0)/cp0*100):0;
  var addA=da, addI=di-da, addP=dp-di;
  var rows=[
   ['Cost per add to cart',ca0,ca1,da,addA,'Everything above the product page. CPM, creative, audience, traffic quality.'],
   ['Cost per initiated checkout',ci0,ci1,di,addI,'The product page and the offer. Price, delivery expectation, page content.'],
   ['Cost per purchase',cp0,cp1,dp,addP,'Checkout itself. Trust, shipping cost, payment, form friction.']];
  var worst={v:-999,i:0};
  rows.forEach(function(r,i){ if(r[4]>worst.v){worst={v:r[4],i:i}} });
  $('rv-rows').innerHTML=rows.map(function(r,i){
    var hot=(i===worst.i&&r[4]>3);
    return '<tr'+(hot?' style="background:#fbeaea"':'')+'><td><b>'+r[0]+'</b></td>'+
      '<td class="num">$'+r[1].toFixed(2)+'</td><td class="num">$'+r[2].toFixed(2)+'</td>'+
      '<td class="num" style="color:'+(r[3]>0?'var(--fail)':'var(--pass)')+'">'+(r[3]>=0?'+':'')+r[3].toFixed(1)+'%</td>'+
      '<td class="num" style="font-weight:'+(hot?'700':'400')+'">'+(r[4]>=0?'+':'')+r[4].toFixed(1)+'pts</td>'+
      '<td style="font-size:12.5px;color:var(--ink-3)">'+r[5]+'</td></tr>';
  }).join('');
  var r=$('rv-read'); r.className='readout'; var cls,label,val,body;
  var flat=Math.abs(addI)<4&&Math.abs(addP)<4;
  if(dp<=2){
    cls='is-pass';label='Cost per purchase held';val='NO BREAK';
    body='Cost per purchase moved '+dp.toFixed(1)+' percent, which is inside normal variation. If ROAS dropped with the funnel costs flat, the cause is average order value or product mix rather than acquisition efficiency. Check basket composition before touching campaigns.';
    RVSTATE.break='none';
  } else if(flat&&da>5){
    cls='is-warn';label='Traffic cost, not a funnel break';val='UPSTREAM';
    body='All three costs rose by roughly the same '+da.toFixed(0)+' percent, which means the funnel converted as it always did and the traffic simply cost more to buy. This is CPM, creative fatigue or audience saturation, not a page or checkout problem. Go to pass two, because a delivery composition shift is the most common cause of a uniform cost rise you did not initiate.';
    RVSTATE.break='upstream';
  } else if(worst.i===0){
    cls='is-warn';label='Break above the product page';val='TRAFFIC';
    body='Cost per add to cart rose '+da.toFixed(1)+' percent and carried most of the deterioration. The people arriving are less inclined to add to cart than they were, which is a creative, audience or placement question rather than a site one. Check CTR and CPM separately, then run the breakdown sweep to see whether delivery moved.';
    RVSTATE.break='traffic';
  } else if(worst.i===1){
    cls='is-fail';label='Break at the product page';val='OFFER';
    body='Cost per add to cart moved '+da.toFixed(1)+' percent while cost per initiated checkout added a further '+addI.toFixed(1)+
      ' points on top. Traffic is arriving and the product page is converting less of it. Check price changes, stock state, and whether the one to two week delivery expectation on Rx products is surfacing late. This is not a media problem and no bidding change fixes it.';
    RVSTATE.break='offer';
  } else {
    cls='is-fail';label='Break at checkout';val='CHECKOUT';
    body='Cost per initiated checkout moved '+di.toFixed(1)+' percent and cost per purchase added a further '+addP.toFixed(1)+
      ' points. People are reaching checkout and not completing, which is the most expensive leak in the funnel because everything upstream has already been paid for. Check shipping cost visibility, payment failures, and whether anything changed in the checkout flow. On this catalog also check the delivery timeline disclosure.';
    RVSTATE.break='checkout';
  }
  r.classList.add(cls);
  $('rv-label').textContent=label;$('rv-val').textContent=val;$('rv-body').textContent=body;
  $('rv-cols').textContent=
   'ADS MANAGER COLUMN SET · ROAS DIAGNOSIS\n'+'='.repeat(48)+'\n\n'+
   'Columns > Customise columns, add:\n\n'+
   '  Cost per Adds to Cart\n'+
   '  Cost per Checkouts Initiated\n'+
   '  Cost per Purchase\n'+
   '  Adds to Cart\n'+
   '  Checkouts Initiated\n'+
   '  Purchases\n'+
   '  CPM\n'+
   '  CTR, link click-through rate\n'+
   '  Landing page views\n'+
   '  Frequency\n'+
   '  Purchase ROAS\n\n'+
   'Save the set as "ROAS diagnosis" so it is one click\n'+
   'next time rather than rebuilt under pressure.\n\n'+
   'Then: Breakdowns > by Delivery > Age, Gender,\n'+
   '      Placement, Platform, Device\n\n'+
   'Then: Columns > Compare attribution settings,\n'+
   '      add the incremental view where available.';
  finalVerdict();
}
['rv-s0','rv-a0','rv-i0','rv-p0','rv-s1','rv-a1','rv-i1','rv-p1'].forEach(function(id){$(id).addEventListener('input',calcRecovery)});

var BKSETS={
 place:[['Feed',3800,34,3100,26],['Reels',2900,26,4100,21],['Stories',1700,14,1600,11],['Advantage+ other',1400,10,1200,3],['Audience Network',700,4,500,0]],
 age:[['18-24',900,5,1400,4],['25-34',2600,19,2500,16],['35-44',3100,25,2900,20],['45-54',2300,22,2000,14],['55+',1600,17,1700,7]],
 gender:[['Female',6100,52,5900,38],['Male',4100,34,4300,22],['Unknown',300,2,300,1],['—',0,0,0,0],['—',0,0,0,0]],
 platform:[['Facebook',5900,50,5100,33],['Instagram',4200,36,5000,27],['Messenger',200,1,200,1],['Audience Network',200,1,200,0],['—',0,0,0,0]],
 device:[['Mobile app',7800,64,7900,46],['Mobile web',1900,17,1800,12],['Desktop',800,7,800,3],['—',0,0,0,0],['—',0,0,0,0]]
};
var BKDATA=JSON.parse(JSON.stringify(BKSETS.place));
$('bk-dim').addEventListener('change',function(){
  BKDATA=JSON.parse(JSON.stringify(BKSETS[this.value]));
  calcBreak();
});
function calcBreak(){
  var t0s=0,t0p=0,t1s=0,t1p=0;
  BKDATA.forEach(function(r){t0s+=r[1];t0p+=r[2];t1s+=r[3];t1p+=r[4]});
  var c0=t0p?t0s/t0p:0, c1=t1p?t1s/t1p:0;
  var eff=0,mix=0,topShift={v:0,n:''};
  BKDATA.forEach(function(r){
    var w0=t0p?r[2]/t0p:0, w1=t1p?r[4]/t1p:0;
    var k0=r[2]?r[1]/r[2]:0, k1=r[4]?r[3]/r[4]:0;
    if(r[2]||r[4]){ eff+=w0*(k1-k0); mix+=k0*(w1-w0); }
    var sh=(t1s?r[3]/t1s:0)-(t0s?r[1]/t0s:0);
    if(Math.abs(sh)>Math.abs(topShift.v)){topShift={v:sh,n:r[0]}}
  });
  $('bk-rows').innerHTML=BKDATA.map(function(r,i){
    if(!r[1]&&!r[3])return '';
    var k1=r[4]?r[3]/r[4]:0;
    var sh=(t1s?r[3]/t1s:0)-(t0s?r[1]/t0s:0);
    return '<tr><td><b>'+r[0]+'</b></td>'+
      ['1','2','3','4'].map(function(_,j){
        return '<td><input type="number" data-bk="'+i+'-'+(j+1)+'" value="'+r[j+1]+'" style="width:84px"></td>';
      }).join('')+
      '<td class="num" style="color:'+(r[4]?'inherit':'var(--fail)')+'">'+(r[4]?'$'+k1.toFixed(0):'no conv')+'</td>'+
      '<td class="num" style="color:'+(Math.abs(sh)>0.05?(sh>0?'var(--warn)':'var(--ink-3)'):'inherit')+'">'+(sh>=0?'+':'')+(sh*100).toFixed(1)+'pts</td></tr>';
  }).join('');
  $('bk-c0').textContent=c0?'$'+c0.toFixed(0):'—';
  $('bk-c1').textContent=c1?'$'+c1.toFixed(0):'—';
  $('bk-eff').textContent=(eff>=0?'+':'')+'$'+eff.toFixed(0);
  $('bk-mix').textContent=(mix>=0?'+':'')+'$'+mix.toFixed(0);
  $('bk-top').textContent=topShift.n+' '+(topShift.v>=0?'+':'')+(topShift.v*100).toFixed(0)+'pts';
  $('bk-ebox').className='stat '+(eff<=0?'hi':'lo');
  $('bk-mbox').className='stat '+(mix<=0?'hi':'lo');
  var n=$('bk-note');
  var dim=$('bk-dim').options[$('bk-dim').selectedIndex].text.toLowerCase();
  if(Math.abs(mix)>Math.abs(eff)*1.3){
    n.className='note bad';
    n.textContent='Delivery moved. Of the $'+(c1-c0).toFixed(0)+' change in blended CPA, $'+mix.toFixed(0)+
      ' came from spend shifting between '+dim+' buckets and only $'+eff.toFixed(0)+
      ' from any bucket getting worse. The largest shift is '+topShift.n+' at '+(topShift.v*100).toFixed(0)+
      ' points of spend share. Meta reallocated without you asking, which is common during high-competition periods. Consider whether that bucket deserves the spend before assuming performance declined.';
    RVSTATE.bkVerdict='mix';
  } else if(eff>0){
    n.className='note warn';
    n.textContent='The buckets themselves got worse rather than the mix moving. Efficiency effect of $'+eff.toFixed(0)+
      ' against a mix effect of $'+mix.toFixed(0)+'. Delivery composition is not the cause, so the answer is upstream in the auction, the creative or the funnel. Return to pass one if you have not already.';
    RVSTATE.bkVerdict='efficiency';
  } else {
    n.className='note good';
    n.textContent='No meaningful composition shift and no bucket deterioration on this dimension. Check the other breakdowns before ruling delivery out, because a shift can hide in placement while age looks stable.';
    RVSTATE.bkVerdict='clean';
  }
  finalVerdict();
}
$('bk-rows').addEventListener('input',function(e){
  var k=e.target.dataset.bk; if(!k)return;
  var parts=k.split('-');
  BKDATA[+parts[0]][+parts[1]]=+e.target.value||0;
  calcBreak();
});

function calcIncr2(){
  var d0=+$('in-d0').value||0,i0=+$('in-i0').value||0,d1=+$('in-d1').value||0,i1=+$('in-i1').value||0;
  var sp=+$('in-sp').value||1,aov=+$('in-aov').value||0;
  var repDrop=d0?((d1-d0)/d0*100):0, incDrop=i0?((i1-i0)/i0*100):0;
  var s0=d0?i0/d0*100:0, s1=d1?i1/d1*100:0;
  var iroas=sp?(i1*aov)/sp:0;
  $('in-rep').textContent=repDrop.toFixed(1)+'%';
  $('in-inc').textContent=incDrop.toFixed(1)+'%';
  $('in-s0').textContent=s0.toFixed(0)+'%';
  $('in-s1').textContent=s1.toFixed(0)+'%';
  $('in-roas').textContent=iroas.toFixed(2);
  $('in-ibox').className='stat '+(incDrop>=-5?'hi':incDrop>=-20?'md':'lo');
  var r=$('in-read'); r.className='readout'; var cls,label,val,body;
  if(incDrop>=-5&&repDrop<-10){
    cls='is-pass';label='Credit lost, not demand';val='NOT REAL';
    body='Reported conversions fell '+Math.abs(repDrop).toFixed(0)+' percent while incremental conversions held within '+Math.abs(incDrop).toFixed(0)+
      ' percent. The ads are still causing roughly the same number of purchases and Meta is claiming fewer of them, which usually means attribution moved rather than performance. Incremental share rose from '+s0.toFixed(0)+' to '+s1.toFixed(0)+
      ' percent, meaning a larger proportion of what you are credited with is genuinely caused. This is a reporting event, not a business one, and reacting to it by cutting budget would remove demand you are actually creating.';
    RVSTATE.incVerdict='credit';
  } else if(incDrop<-20){
    cls='is-fail';label='Real demand loss';val='REAL';
    body='Incremental conversions fell '+Math.abs(incDrop).toFixed(0)+' percent, so the ads are causing materially fewer purchases than they were. This is a genuine performance problem rather than an attribution artefact, and the answer sits in whatever pass one and pass two identified. Incremental ROAS of '+iroas.toFixed(2)+
      ' is the number to judge any recovery against, because the reported figure will move for reasons unrelated to whether the ads are working.';
    RVSTATE.incVerdict='real';
  } else if(s1<s0-8){
    cls='is-warn';label='Doing less work';val='HARVESTING';
    body='Incremental share fell from '+s0.toFixed(0)+' to '+s1.toFixed(0)+
      ' percent, meaning a growing proportion of credited conversions would have happened anyway. The account is harvesting existing demand rather than creating new demand, which frequently accompanies a drift toward retargeting or a narrowing audience. Check the prospecting and retargeting split before concluding anything about creative.';
    RVSTATE.incVerdict='harvest';
  } else {
    cls='is-warn';label='Partly real';val='MIXED';
    body='Reported fell '+Math.abs(repDrop).toFixed(0)+' percent and incremental fell '+Math.abs(incDrop).toFixed(0)+
      ' percent. Some of the drop is genuine and some is attribution. Judge the recovery on the incremental line, and expect the reported figure to move independently of anything you do.';
    RVSTATE.incVerdict='mixed';
  }
  r.classList.add(cls);
  $('in-label').textContent=label;$('in-val').textContent=val;$('in-body').textContent=body;
  finalVerdict();
}
['in-d0','in-i0','in-d1','in-i1','in-sp','in-aov'].forEach(function(id){$(id).addEventListener('input',calcIncr2)});

function finalVerdict(){
  var el=$('rv-final'); if(!el)return;
  var b=RVSTATE.break, k=RVSTATE.bkVerdict, i=RVSTATE.incVerdict;
  var lines=[];
  if(i==='credit'){
    lines.push(['f-ok','Do not act on the reported drop','Incremental conversions held. Cutting budget here removes demand the ads are genuinely creating, and the reported figure will recover on its own as attribution settles.']);
  }
  if(i==='real'||i==='mixed'){
    if(b==='checkout')lines.push(['f-high','Fix checkout first','The break is at the most expensive step, where everything upstream has already been paid for. Shipping cost visibility, payment failures, and on this catalog the delivery timeline disclosure.']);
    if(b==='offer')lines.push(['f-high','Fix the product page','Traffic is arriving and converting less. Price, stock, page content, and whether the Rx delivery expectation surfaces late.']);
    if(b==='traffic')lines.push(['f-med','Creative and audience','The people arriving are less inclined to add to cart. Check CTR and CPM separately, then rotate creative validated against fresh assets rather than on frequency alone.']);
    if(b==='upstream')lines.push(['f-med','Traffic cost, not conversion','All three costs rose uniformly. The funnel is fine and the traffic got more expensive. Recalculate the affordable CPA at the new CPM before restructuring anything.']);
  }
  if(k==='mix'){
    lines.push(['f-med','Delivery moved without you','Spend shifted between buckets. Decide whether that bucket deserves it. Excluding a placement is a legitimate response and it also narrows delivery, so measure rather than assume.']);
  }
  if(i==='harvest'){
    lines.push(['f-med','Check the prospecting split','A falling incremental share usually means the account is harvesting rather than creating. Enforce the prospecting and retargeting split before concluding anything about creative.']);
  }
  if(!lines.length){
    lines.push(['f-ok','Nothing conclusive yet','Complete all three passes. The verdict assembles from the funnel break, the delivery composition and the incremental read together, because any one of them alone produces a confident wrong answer.']);
  }
  el.innerHTML=lines.map(function(l,idx){
    return '<div class="flag '+l[0]+'"><b>'+(idx+1)+' · '+l[1]+'</b>'+l[2]+'</div>';
  }).join('');
}
