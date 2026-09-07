/* ================= FORECAST ================= */
function calcForecast(){
  var day=+$('fc-day').value||0, cpa0=+$('fc-cpa').value||1, floor=+$('fc-floor').value||1,
      imp=(+$('fc-imp').value||0)/100, aov=+$('fc-aov').value||0,
      l2=+$('fc-l2').value||0, l3=+$('fc-l3').value||0, pen=(+$('fc-pen').value||0)/100;
  var mo=day*30, cpa=cpa0, ts=0,tr=0,tc=0, rows='';
  for(var m=1;m<=12;m++){
    var lanes=1+(l2&&m>=l2?1:0)+(l3&&m>=l3?1:0);
    var eff=cpa;
    if((l2&&m===l2)||(l3&&m===l3))eff=cpa*(1+pen);
    else if((l2&&m===l2+1)||(l3&&m===l3+1))eff=cpa*(1+pen*0.4);
    var pu=eff?mo/eff:0, rev=pu*aov, roas=mo?rev/mo:0;
    ts+=mo;tr+=rev;tc+=pu;
    var dip=((l2&&m===l2)||(l3&&m===l3));
    rows+='<tr'+(dip?' style="background:#fbf2e0"':'')+'><td class="num">'+m+'</td><td class="num">'+money(mo)+'</td>'+
      '<td class="num">$'+eff.toFixed(0)+'</td><td class="num">'+Math.round(pu)+'</td>'+
      '<td class="num">'+money(rev)+'</td><td class="num">'+roas.toFixed(2)+'</td><td class="num">'+lanes+'</td></tr>';
    cpa=Math.max(floor,cpa*(1-imp));
  }
  $('fc-rows').innerHTML=rows;
  $('fc-ts').textContent=money(ts); $('fc-tr').textContent=money(tr);
  $('fc-roas').textContent=(ts?tr/ts:0).toFixed(2);
  $('fc-cust').textContent=Math.round(tc).toLocaleString();
  $('fc-exit').textContent='$'+cpa.toFixed(0);
  var r=ts?tr/ts:0;
  $('fc-rbox').className='stat '+(r>=3?'hi':r>=2?'md':'lo');
  var n=$('fc-note');
  var dips=[]; if(l2)dips.push('month '+l2); if(l3)dips.push('month '+l3);
  n.className='note'+(r>=2.5?' good':' warn');
  n.textContent='Twelve months at '+money(day)+' daily reaches '+money(tr)+' revenue at a '+r.toFixed(2)+' blended ROAS and '+Math.round(tc).toLocaleString()+' customers.'+
    (dips.length?' The highlighted rows are '+dips.join(' and ')+', where a new lane enters at cold-start efficiency and pulls the blend down. That dip is a correct decision producing a temporarily worse number, and a stakeholder who was not warned will read it as failure.':'')+
    ' CPA floors at $'+floor+', because improvement flattens once the model has learned what it can. A forecast with unbounded improvement is a forecast nobody should sign.';
}
['fc-day','fc-cpa','fc-floor','fc-imp','fc-aov','fc-l2','fc-l3','fc-pen'].forEach(function(id){$(id).addEventListener('input',calcForecast)});
