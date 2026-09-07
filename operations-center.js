/* ================= DAILY OPERATIONS CENTER ================= */
var dailyRecords=[];
var optimizationActions=[];
var changeRecords=[];
var experimentRecords=[];

var dpEditing='';
var aqEditing='';
var clEditing='';
var clSourceAction='';
var xtEditing='';

function opsEsc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,function(character){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
  });
}
function opsId(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function opsToday(){
  var date=new Date();
  date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
  return date.toISOString().slice(0,10);
}
function opsAddDays(days){
  var date=new Date();
  date.setDate(date.getDate()+days);
  date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
  return date.toISOString().slice(0,10);
}
function opsNum(value){
  if(value===null||value===undefined||String(value).trim()==='')return null;
  var number=Number(String(value).replace(/[$,%\s]/g,''));
  return isFinite(number)?number:null;
}
function opsZero(value){return value==null?0:value}
function opsPercent(value,digits){return value==null?'—':value.toFixed(digits==null?1:digits)+'%'}
function opsMoney(value,digits){
  if(value==null)return '—';
  if(typeof wsMoney==='function')return wsMoney(value,digits);
  return '$'+Number(value).toLocaleString(undefined,{minimumFractionDigits:digits||0,maximumFractionDigits:digits||0});
}
function opsSlug(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function opsActiveStatus(status){return status!=='Resolved'}
function opsIsOverdue(date,status){return !!date&&date<opsToday()&&opsActiveStatus(status)}
function opsEmptyRow(columns,title,body){
  return '<tr><td colspan="'+columns+'" class="ops-empty"><b>'+opsEsc(title)+'</b>'+opsEsc(body)+'</td></tr>';
}
function opsSetStatBox(id,state){
  var element=$(id); if(!element)return;
  element.classList.remove('hi','md','lo');
  if(state)element.classList.add(state);
}

/* ---------- daily performance ---------- */
var DP_FIELDS={
  date:'dp-date',platform:'dp-platform',account:'dp-account',campaign:'dp-campaign',product:'dp-product',stage:'dp-stage',
  budget:'dp-budget',spend:'dp-spend',impressions:'dp-impressions',clicks:'dp-clicks',lpv:'dp-lpv',atc:'dp-atc',checkouts:'dp-checkouts',
  platformOrders:'dp-platform-orders',platformRevenue:'dp-platform-revenue',backendOrders:'dp-backend-orders',backendRevenue:'dp-backend-revenue',
  newCustomers:'dp-new-customers',targetCpa:'dp-target-cpa',targetRoas:'dp-target-roas'
};
var DP_NUMERIC=['budget','spend','impressions','clicks','lpv','atc','checkouts','platformOrders','platformRevenue','backendOrders','backendRevenue','newCustomers','targetCpa','targetRoas'];

function dpReadForm(){
  var record={};
  Object.keys(DP_FIELDS).forEach(function(key){record[key]=$(DP_FIELDS[key]).value.trim()});
  DP_NUMERIC.forEach(function(key){record[key]=opsNum(record[key])});
  return record;
}
function dpWriteForm(record){
  Object.keys(DP_FIELDS).forEach(function(key){
    var value=record&&record[key]!=null?record[key]:'';
    $(DP_FIELDS[key]).value=value;
  });
}
function dpResetForm(){
  dpEditing='';
  dpWriteForm({date:opsToday(),platform:'Meta Ads',stage:'Prospecting'});
  $('dp-save').textContent='Add performance record';
  $('dp-cancel').hidden=true;
  $('dp-form-note').textContent='Required: date, account, campaign, spend, and at least one order source.';
}
function dpTruth(record){
  return {
    orders:record.backendOrders!=null?record.backendOrders:record.platformOrders,
    revenue:record.backendRevenue!=null?record.backendRevenue:record.platformRevenue,
    source:record.backendOrders!=null||record.backendRevenue!=null?'Backend':'Platform fallback'
  };
}
function dpMetrics(record){
  var truth=dpTruth(record),spend=opsZero(record.spend),orders=truth.orders,revenue=truth.revenue;
  return {
    orders:orders,revenue:revenue,source:truth.source,
    pacing:record.budget>0?spend/record.budget*100:null,
    roas:spend>0&&revenue!=null?revenue/spend:null,
    cpa:orders>0?spend/orders:null,
    ctr:record.impressions>0?opsZero(record.clicks)/record.impressions*100:null,
    lpvRate:record.clicks>0?opsZero(record.lpv)/record.clicks*100:null,
    atcRate:record.lpv>0?opsZero(record.atc)/record.lpv*100:null,
    checkoutStart:record.atc>0?opsZero(record.checkouts)/record.atc*100:null,
    checkoutComplete:record.checkouts>0?opsZero(orders)/record.checkouts*100:null,
    orderGap:record.platformOrders!=null&&record.backendOrders!=null?(record.platformOrders-record.backendOrders)/Math.max(1,record.backendOrders)*100:null,
    revenueGap:record.platformRevenue!=null&&record.backendRevenue!=null?(record.platformRevenue-record.backendRevenue)/Math.max(1,record.backendRevenue)*100:null
  };
}
function dpSignal(record){
  var metric=dpMetrics(record),gap=Math.abs(metric.orderGap==null?0:metric.orderGap),revenueGap=Math.abs(metric.revenueGap==null?0:metric.revenueGap),rule=typeof wsRuleValue==='function'?function(key,fallback){return wsRuleValue(key,record,fallback)}:function(key,fallback){return fallback};
  if(opsZero(record.spend)===0)return {key:'no-spend',level:'high',label:'No spend',reason:'The campaign recorded no spend.'};
  if(gap>rule('orderMismatchCritical',25))return {key:'order-mismatch',level:'critical',label:'Order mismatch',reason:'Platform and backend orders differ by '+gap.toFixed(0)+'%.'};
  if(gap>rule('orderMismatchHigh',15))return {key:'order-mismatch',level:'high',label:'Order mismatch',reason:'Platform and backend orders differ by '+gap.toFixed(0)+'%.'};
  if(revenueGap>rule('orderMismatchHigh',15)&&gap<=rule('orderMismatchHigh',15))return {key:'revenue-mismatch',level:'high',label:'Revenue mismatch',reason:'Platform and backend revenue differ by '+revenueGap.toFixed(0)+'%.'};
  if(record.targetCpa>0&&metric.cpa!=null&&metric.cpa>record.targetCpa*rule('cpaHighMultiplier',1.25))return {key:'cpa',level:'high',label:'CPA above target',reason:'CPA is '+((metric.cpa/record.targetCpa-1)*100).toFixed(0)+'% above target.'};
  if(record.targetRoas>0&&metric.roas!=null&&metric.roas<record.targetRoas*rule('roasLowMultiplier',.8))return {key:'roas',level:'high',label:'ROAS below target',reason:'ROAS is '+((1-metric.roas/record.targetRoas)*100).toFixed(0)+'% below target.'};
  if(metric.pacing!=null&&(metric.pacing>rule('pacingHigh',115)||metric.pacing<rule('pacingLow',85)))return {key:'pacing',level:'medium',label:metric.pacing>rule('pacingHigh',115)?'Overspending':'Underspending',reason:'Spend is pacing at '+metric.pacing.toFixed(0)+'% of budget.'};
  if(metric.ctr!=null&&metric.ctr<rule('ctrLow',.9))return {key:'ctr-drop',level:'medium',label:'Low CTR',reason:'Link CTR is '+metric.ctr.toFixed(2)+'%.'};
  if(metric.lpvRate!=null&&metric.lpvRate<rule('lpvLow',65))return {key:'lpv-low',level:'medium',label:'Low landing rate',reason:'Only '+metric.lpvRate.toFixed(0)+'% of clicks became landing-page views.'};
  if(metric.atcRate!=null&&metric.atcRate<rule('atcLow',4))return {key:'atc-drop',level:'medium',label:'Low add-to-cart rate',reason:'Landing-page to add-to-cart rate is '+metric.atcRate.toFixed(1)+'%.'};
  if(metric.checkoutStart!=null&&metric.checkoutStart<rule('checkoutLow',40))return {key:'checkout-start-drop',level:'medium',label:'Cart friction',reason:'Only '+metric.checkoutStart.toFixed(0)+'% of carts started checkout.'};
  if(metric.checkoutComplete!=null&&metric.checkoutComplete<rule('checkoutLow',40))return {key:'checkout-complete-drop',level:'medium',label:'Checkout leak',reason:'Only '+metric.checkoutComplete.toFixed(0)+'% of checkouts became orders.'};
  return {key:'lane-drag',level:'healthy',label:'Within guardrails',reason:'No configured threshold is currently breached.'};
}
function dpRecommendation(signal){
  var guidance={
    'no-spend':'Check eligibility, schedule, audience constraints, billing, and cost controls before rebuilding the campaign.',
    'order-mismatch':'Reconcile order IDs, dates, timezone, attribution scope, event timing, and deduplication before changing delivery.',
    'revenue-mismatch':'Compare matched order values, currency, tax, shipping, discounts, refunds, and value payload rules.',
    'cpa':'Confirm the movement in backend orders, then locate the first deteriorating cost per funnel step.',
    'roas':'Separate acquisition cost from order-value movement, then diagnose the input that changed.',
    'pacing':'Check delivery eligibility, audience capacity, bid controls, and the reporting cutoff before changing budget.',
    'ctr-drop':'Compare hook rate, frequency, placement mix, and fresh creative under equivalent delivery.',
    'lpv-low':'Open every destination on mobile and inspect page speed, redirects, and click-to-session loss.',
    'atc-drop':'Review message match, stock, price, trust, and product-page conversion before producing more traffic.',
    'checkout-start-drop':'Test cart entry, shipping disclosure, discount behavior, and mobile friction.',
    'checkout-complete-drop':'Check gateway declines, checkout errors, valid order states, and Purchase-event firing.'
  };
  return guidance[signal.key]||'Run the linked diagnosis, verify the cause, and make one controlled change.';
}
function dpMetricClass(value,bad,warning,direction){
  if(value==null)return '';
  if(direction==='low')return value<bad?'ops-metric-bad':value<warning?'ops-metric-warn':'ops-metric-good';
  return value>bad?'ops-metric-bad':value>warning?'ops-metric-warn':'ops-metric-good';
}
function dpUpdateDateFilter(){
  var filter=$('dp-filter-date'),current=filter.value||'latest';
  var dates=[].concat(dailyRecords.map(function(record){return record.date}).filter(Boolean)).filter(function(date,index,list){return list.indexOf(date)===index}).sort().reverse();
  filter.innerHTML='<option value="latest">Latest date</option><option value="">All dates</option>'+dates.map(function(date){return '<option value="'+opsEsc(date)+'">'+opsEsc(date)+'</option>'}).join('');
  filter.value=current==='latest'||current===''||dates.indexOf(current)>-1?current:'latest';
  return dates;
}
function renderDaily(){
  var dates=dpUpdateDateFilter(),dateFilter=$('dp-filter-date').value,platform=$('dp-filter-platform').value;
  var selectedDate=dateFilter==='latest'?(dates[0]||''):dateFilter;
  var scopedRecords=dailyRecords.filter(function(record){return (!selectedDate||record.date===selectedDate)&&(!platform||record.platform===platform)});
  var totals=scopedRecords.reduce(function(sum,record){
    var metric=dpMetrics(record),signal=dpSignal(record);
    sum.spend+=opsZero(record.spend);sum.revenue+=opsZero(metric.revenue);sum.orders+=opsZero(metric.orders);
    sum.impressions+=opsZero(record.impressions);sum.clicks+=opsZero(record.clicks);if(signal.level!=='healthy')sum.alerts++;
    return sum;
  },{spend:0,revenue:0,orders:0,impressions:0,clicks:0,alerts:0});
  var totalRoas=totals.spend?totals.revenue/totals.spend:null,totalCpa=totals.orders?totals.spend/totals.orders:null,totalCtr=totals.impressions?totals.clicks/totals.impressions*100:null;
  $('dp-total-spend').textContent=opsMoney(totals.spend);
  $('dp-total-revenue').textContent=opsMoney(totals.revenue);
  $('dp-total-roas').textContent=totalRoas==null?'—':totalRoas.toFixed(2);
  $('dp-total-cpa').textContent=opsMoney(totalCpa);
  $('dp-total-ctr').textContent=opsPercent(totalCtr,2);
  $('dp-total-alerts').textContent=totals.alerts;
  opsSetStatBox('dp-roas-box',scopedRecords.length?(totalRoas>=2?'hi':totalRoas>=1?'md':'lo'):'');
  opsSetStatBox('dp-alert-box',totals.alerts?'lo':scopedRecords.length?'hi':'');

  var query=$('dp-search').value.toLowerCase().trim(),status=$('dp-filter-status').value;
  var records=scopedRecords.slice().sort(function(a,b){return b.date.localeCompare(a.date)}).filter(function(record){
    var signal=dpSignal(record),haystack=(record.account+' '+record.campaign+' '+record.product+' '+record.stage).toLowerCase();
    return (!query||haystack.indexOf(query)>-1)&&(!status||signal.level===status);
  });
  var scopeLabel=selectedDate?selectedDate:'all dates';
  $('dp-record-count').textContent=records.length+' shown · '+dailyRecords.length+' total · '+scopeLabel;
  $('dp-rows').innerHTML=records.length?records.map(function(record){
    var metric=dpMetrics(record),signal=dpSignal(record),pacingClass=metric.pacing==null?'':(metric.pacing<85||metric.pacing>115?'ops-metric-warn':'ops-metric-good');
    var roasClass=record.targetRoas>0?dpMetricClass(metric.roas,record.targetRoas*.8,record.targetRoas,'low'):'';
    var cpaClass=record.targetCpa>0?dpMetricClass(metric.cpa,record.targetCpa*1.25,record.targetCpa,'high'):'';
    return '<tr><td><span class="ops-date">'+opsEsc(record.date)+'</span><span class="ops-sub">'+opsEsc(record.platform)+'</span></td>'+ 
      '<td><span class="ops-main">'+opsEsc(record.account)+'</span><span class="ops-sub">'+opsEsc(record.campaign)+'</span><span class="ops-sub">'+opsEsc(record.product||'No product set')+'</span></td>'+ 
      '<td>'+opsEsc(record.stage)+'</td>'+ 
      '<td class="num">'+opsMoney(record.spend)+'<span class="ops-sub">of '+opsMoney(record.budget)+'</span></td>'+ 
      '<td class="num '+pacingClass+'">'+opsPercent(metric.pacing,0)+'</td>'+ 
      '<td class="num '+roasClass+'">'+(metric.roas==null?'—':metric.roas.toFixed(2))+'</td>'+ 
      '<td class="num '+cpaClass+'">'+opsMoney(metric.cpa)+'</td>'+ 
      '<td class="num">'+opsPercent(metric.ctr,2)+'</td>'+ 
      '<td class="num">'+(metric.orders==null?'—':metric.orders)+'<span class="ops-sub">'+opsEsc(metric.source)+'</span></td>'+ 
      '<td><span class="ops-badge '+signal.level+'">'+opsEsc(signal.label)+'</span><span class="ops-sub">'+opsEsc(signal.reason)+'</span></td>'+ 
      '<td><div class="ops-actions"><button type="button" data-dp-diag="'+record.id+'">Diagnose</button><button type="button" data-dp-action="'+record.id+'">Queue</button><button type="button" data-dp-scale="'+record.id+'">Scale gate</button><button type="button" data-dp-edit="'+record.id+'">Edit</button><button type="button" class="danger" data-dp-remove="'+record.id+'">Remove</button></div></td></tr>';
  }).join(''):opsEmptyRow(11,'No performance records yet','Add a manual record above or import the CSV template.');
  renderOpsHome();
}
function dpSave(){
  var record=dpReadForm();
  if(!record.date||!record.account||!record.campaign||record.spend==null||(record.platformOrders==null&&record.backendOrders==null)){
    $('dp-form-note').textContent='Complete the required fields before saving: date, account, campaign, spend, and one order source.';
    return;
  }
  if(typeof workspaceLinkDaily==='function')workspaceLinkDaily(record,false);
  var duplicate=dailyRecords.find(function(item){return item.id!==dpEditing&&typeof workspaceImportNameKey==='function'&&workspaceImportNameKey(item)===workspaceImportNameKey(record)});
  if(duplicate){$('dp-form-note').textContent='A record already exists for this date, account, campaign and product. Edit that row instead of creating a duplicate.';return}
  if(dpEditing){
    var current=dailyRecords.find(function(item){return item.id===dpEditing});
    if(current){Object.assign(current,record);current.updated=new Date().toISOString();if(typeof workspaceAudit==='function')workspaceAudit('Performance','Performance record updated',record.account+' · '+record.campaign,current.id)}
    toast('Performance record updated');
  }else{
    record.id=opsId('perf');record.created=new Date().toISOString();dailyRecords.push(record);if(typeof workspaceAudit==='function')workspaceAudit('Performance','Performance record added',record.account+' · '+record.campaign,record.id);toast('Performance record added');
  }
  dpResetForm();renderDaily();if(typeof renderProductionAll==='function')renderProductionAll();
}
function dpEdit(id){
  var record=dailyRecords.find(function(item){return item.id===id});if(!record)return;
  dpEditing=id;dpWriteForm(record);$('dp-save').textContent='Update performance record';$('dp-cancel').hidden=false;
  $('dp-form-note').textContent='Editing '+record.account+' / '+record.campaign+'.';window.scrollTo(0,0);
}
function dpOpenDiagnosis(id){
  var record=dailyRecords.find(function(item){return item.id===id});if(!record)return;
  var signal=dpSignal(record);setActive('diag');selectDiagnosis(signal.key);
}
function dpCreateAction(id){
  var record=dailyRecords.find(function(item){return item.id===id});if(!record)return;
  var existing=optimizationActions.find(function(item){return item.sourceId===id&&item.status!=='Resolved'});
  if(existing){setActive('actions');toast('This exception is already in the queue');return}
  var signal=dpSignal(record);
  optimizationActions.push({id:opsId('action'),created:new Date().toISOString(),sourceId:id,sourceType:'Daily performance',diagnosis:signal.key,
    problem:record.account+' / '+record.campaign+': '+signal.reason,priority:signal.level==='critical'?'Critical':signal.level==='medium'?'Medium':signal.level==='healthy'?'Monitor':'High',
    recommendation:dpRecommendation(signal),owner:'',due:opsAddDays(signal.level==='critical'?0:1),recheck:opsAddDays(3),status:'Open'});
  renderActions();setActive('actions');toast('Exception added to the optimization queue');
}

var DP_CSV_COLUMNS=['date','platform','account','campaign','product','stage','daily_budget','spend','impressions','clicks','landing_page_views','add_to_cart','checkouts','platform_orders','platform_revenue','backend_orders','backend_revenue','new_customers','target_cpa','target_roas'];
function dpParseCsv(text){
  var rows=[],row=[],field='',quoted=false;
  for(var index=0;index<text.length;index++){
    var character=text[index],next=text[index+1];
    if(character==='"'&&quoted&&next==='"'){field+='"';index++;continue}
    if(character==='"'){quoted=!quoted;continue}
    if(character===','&&!quoted){row.push(field);field='';continue}
    if((character==='\n'||character==='\r')&&!quoted){
      if(character==='\r'&&next==='\n')index++;
      row.push(field);if(row.some(function(value){return value.trim()!==''}))rows.push(row);row=[];field='';continue;
    }
    field+=character;
  }
  row.push(field);if(row.some(function(value){return value.trim()!==''}))rows.push(row);
  return rows;
}
function dpImportCsv(file){
  if(typeof workspacePrepareImport==='function'){workspacePrepareImport(file);return}
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var rows=dpParseCsv(reader.result);if(rows.length<2)throw new Error('No data rows');
      var headers=rows.shift().map(function(header){return header.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')});
      ['date','account','campaign','spend'].forEach(function(required){if(headers.indexOf(required)<0)throw new Error('Missing '+required)});
      var map={daily_budget:'budget',landing_page_views:'lpv',add_to_cart:'atc',platform_orders:'platformOrders',platform_revenue:'platformRevenue',backend_orders:'backendOrders',backend_revenue:'backendRevenue',new_customers:'newCustomers',target_cpa:'targetCpa',target_roas:'targetRoas'};
      var added=0,skipped=0;
      rows.forEach(function(values){
        var record={platform:'Meta Ads',stage:'Prospecting'};
        headers.forEach(function(header,column){var key=map[header]||header;if(Object.prototype.hasOwnProperty.call(DP_FIELDS,key))record[key]=(values[column]||'').trim()});
        DP_NUMERIC.forEach(function(key){record[key]=opsNum(record[key])});
        record.platform=record.platform||'Meta Ads';record.stage=record.stage||'Prospecting';
        if(!record.date||!record.account||!record.campaign||record.spend==null||(record.platformOrders==null&&record.backendOrders==null)){skipped++;return}
        record.id=opsId('perf');record.created=new Date().toISOString();dailyRecords.push(record);added++;
      });
      renderDaily();toast('Imported '+added+' record'+(added===1?'':'s')+(skipped?' · '+skipped+' skipped':''));
    }catch(error){alert('The CSV could not be imported. Use the console template and keep its required columns. '+error.message)}
  };
  reader.readAsText(file);
}
function dpCsvValue(value){
  if(value==null)return '';
  var text=String(value);
  return /[",\r\n]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;
}
function dpExportCsv(){
  if(!dailyRecords.length){alert('There are no performance records to export yet.');return}
  var keys=['date','platform','account','campaign','product','stage','budget','spend','impressions','clicks','lpv','atc','checkouts','platformOrders','platformRevenue','backendOrders','backendRevenue','newCustomers','targetCpa','targetRoas'];
  var rows=[DP_CSV_COLUMNS.join(',')].concat(dailyRecords.map(function(record){return keys.map(function(key){return dpCsvValue(record[key])}).join(',')}));
  dl(new Blob([rows.join('\n')+'\n'],{type:'text/csv'}),'twc-daily-performance-'+opsToday()+'.csv');toast('Performance data exported');
}

/* ---------- optimization queue ---------- */
var AQ_FIELDS={problem:'aq-problem',priority:'aq-priority',recommendation:'aq-recommendation',owner:'aq-owner',due:'aq-due',recheck:'aq-recheck',status:'aq-status'};
function aqReadForm(){var item={};Object.keys(AQ_FIELDS).forEach(function(key){item[key]=$(AQ_FIELDS[key]).value.trim()});return item}
function aqWriteForm(item){Object.keys(AQ_FIELDS).forEach(function(key){$(AQ_FIELDS[key]).value=item&&item[key]!=null?item[key]:''})}
function aqResetForm(){aqEditing='';aqWriteForm({priority:'High',status:'Open',due:opsAddDays(1),recheck:opsAddDays(3)});$('aq-save').textContent='Add to queue';$('aq-cancel').hidden=true}
function aqSave(){
  var item=aqReadForm();if(!item.problem||!item.recommendation){alert('Add the observed problem and recommended next step before saving.');return}
  if(aqEditing){var current=optimizationActions.find(function(entry){return entry.id===aqEditing});if(current){Object.assign(current,item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Optimization action updated',item.problem,current.id)}toast('Queue item updated')}
  else{item.id=opsId('action');item.created=new Date().toISOString();item.sourceType='Manual';item.sourceId='';item.diagnosis='';optimizationActions.push(item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Optimization action created',item.problem,item.id);toast('Action added to the queue')}
  aqResetForm();renderActions();
}
function aqEdit(id){var item=optimizationActions.find(function(entry){return entry.id===id});if(!item)return;aqEditing=id;aqWriteForm(item);$('aq-save').textContent='Update queue item';$('aq-cancel').hidden=false;window.scrollTo(0,0)}
function aqLogChange(id){
  var item=optimizationActions.find(function(entry){return entry.id===id});if(!item)return;
  clResetForm();clSourceAction=id;
  var source=dailyRecords.find(function(record){return record.id===item.sourceId});
  $('cl-scope').value=source?(source.account+' / '+source.campaign):item.problem;
  $('cl-reason').value=item.recommendation;
  $('cl-expected').value='Resolve: '+item.problem;
  setActive('changes');clCheckOverlap();
}
function renderActions(){
  var active=optimizationActions.filter(function(item){return item.status!=='Resolved'}),overdue=active.filter(function(item){return opsIsOverdue(item.due,item.status)});
  $('aq-open').textContent=active.filter(function(item){return item.status==='Open'||item.status==='Actioned'}).length;
  $('aq-critical').textContent=active.filter(function(item){return item.priority==='Critical'}).length;
  $('aq-overdue').textContent=overdue.length;
  $('aq-monitoring').textContent=optimizationActions.filter(function(item){return item.status==='Monitoring'}).length;
  $('aq-resolved').textContent=optimizationActions.filter(function(item){return item.status==='Resolved'}).length;
  opsSetStatBox('aq-critical-box',active.some(function(item){return item.priority==='Critical'})?'lo':'');
  opsSetStatBox('aq-overdue-box',overdue.length?'lo':'');
  var query=$('aq-search').value.toLowerCase().trim(),priority=$('aq-filter-priority').value,status=$('aq-filter-status').value;
  var order={Critical:0,High:1,Medium:2,Monitor:3};
  var items=optimizationActions.slice().sort(function(a,b){return (order[a.priority]-order[b.priority])||(a.due||'9999').localeCompare(b.due||'9999')}).filter(function(item){
    var haystack=(item.problem+' '+item.recommendation+' '+item.owner).toLowerCase();
    return (!query||haystack.indexOf(query)>-1)&&(!priority||item.priority===priority)&&(!status||item.status===status);
  });
  $('aq-count').textContent=items.length+' of '+optimizationActions.length+' items';
  $('aq-rows').innerHTML=items.length?items.map(function(item){
    var overdueItem=opsIsOverdue(item.due,item.status);
    return '<tr><td><span class="ops-badge '+opsSlug(item.priority)+'">'+opsEsc(item.priority)+'</span>'+ (overdueItem?'<span class="ops-sub"><span class="ops-badge overdue">Overdue</span></span>':'')+'</td>'+ 
      '<td><span class="ops-main">'+opsEsc(item.problem)+'</span><span class="ops-sub">'+opsEsc(item.recommendation)+'</span>'+(item.sourceType?'<span class="ops-source">'+opsEsc(item.sourceType)+'</span>':'')+'</td>'+ 
      '<td>'+opsEsc(item.owner||'Unassigned')+'<span class="ops-sub">Due '+opsEsc(item.due||'not set')+'</span></td>'+ 
      '<td><span class="ops-date">'+opsEsc(item.recheck||'Not set')+'</span></td>'+ 
      '<td><span class="ops-badge '+opsSlug(item.status)+'">'+opsEsc(item.status)+'</span></td>'+ 
      '<td><div class="ops-actions"><button type="button" data-aq-change="'+item.id+'">Log change</button><button type="button" data-aq-status="Monitoring" data-aq-id="'+item.id+'">Monitor</button><button type="button" data-aq-status="Resolved" data-aq-id="'+item.id+'">Resolve</button><button type="button" data-aq-edit="'+item.id+'">Edit</button><button type="button" class="danger" data-aq-remove="'+item.id+'">Remove</button></div></td></tr>';
  }).join(''):opsEmptyRow(6,'The optimization queue is clear','Create an action manually or send an exception here from Daily performance.');
  renderOpsHome();opsRefreshReport();
}

/* ---------- change log ---------- */
var CL_FIELDS={date:'cl-date',scope:'cl-scope',type:'cl-type',status:'cl-status',before:'cl-before',after:'cl-after',cooldown:'cl-cooldown',recheck:'cl-recheck',reason:'cl-reason',expected:'cl-expected',result:'cl-result'};
function clReadForm(){var item={};Object.keys(CL_FIELDS).forEach(function(key){item[key]=$(CL_FIELDS[key]).value.trim()});item.cooldown=opsNum(item.cooldown);return item}
function clWriteForm(item){Object.keys(CL_FIELDS).forEach(function(key){$(CL_FIELDS[key]).value=item&&item[key]!=null?item[key]:''})}
function clResetForm(){clEditing='';clSourceAction='';clWriteForm({date:opsToday(),type:'Budget',status:'Cooldown',cooldown:72,recheck:opsAddDays(3)});$('cl-save').textContent='Log change';$('cl-cancel').hidden=true;$('cl-warning').hidden=true}
function clDisplayStatus(item){return item.status==='Cooldown'&&item.recheck&&item.recheck<=opsToday()?'Ready to review':item.status}
function clCheckOverlap(){
  var scope=$('cl-scope').value.trim().toLowerCase(),recheck=$('cl-recheck').value;
  var overlap=scope&&changeRecords.find(function(item){return item.id!==clEditing&&item.scope.toLowerCase()===scope&&clDisplayStatus(item)==='Cooldown'&&(!item.recheck||item.recheck>=opsToday())});
  var warning=$('cl-warning');
  if(overlap){warning.hidden=false;warning.textContent='Another change to this scope is still cooling down until '+(overlap.recheck||'its review')+'. A second change may make the result impossible to attribute.'}
  else{warning.hidden=true;warning.textContent=''}
  if(recheck&&$('cl-date').value&&recheck<$('cl-date').value){warning.hidden=false;warning.textContent='The recheck date must be on or after the change date.'}
}
function clSave(){
  var item=clReadForm();if(!item.date||!item.scope||!item.reason||!item.expected||!item.recheck){alert('Complete the date, scope, reason, expected result, and recheck date.');return}
  if(item.recheck<item.date){alert('The recheck date cannot be before the change date.');return}
  if(clEditing){var current=changeRecords.find(function(entry){return entry.id===clEditing});if(current){Object.assign(current,item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Controlled change updated',item.scope+' · '+item.reason,current.id)}toast('Change updated')}
  else{item.id=opsId('change');item.created=new Date().toISOString();item.sourceActionId=clSourceAction;changeRecords.push(item);if(clSourceAction){var action=optimizationActions.find(function(entry){return entry.id===clSourceAction});if(action&&action.status==='Open')action.status='Actioned'}if(typeof workspaceAudit==='function')workspaceAudit('Decision','Controlled change logged',item.scope+' · '+item.reason,item.id);toast('Change logged')}
  clResetForm();renderChanges();renderActions();
}
function clEdit(id){var item=changeRecords.find(function(entry){return entry.id===id});if(!item)return;clEditing=id;clSourceAction=item.sourceActionId||'';clWriteForm(item);$('cl-save').textContent='Update change';$('cl-cancel').hidden=false;clCheckOverlap();window.scrollTo(0,0)}
function renderChanges(){
  var derived=changeRecords.map(function(item){return {item:item,status:clDisplayStatus(item)}});
  $('cl-cooldowns').textContent=derived.filter(function(entry){return entry.status==='Cooldown'}).length;
  $('cl-ready').textContent=derived.filter(function(entry){return entry.status==='Ready to review'}).length;
  $('cl-success').textContent=derived.filter(function(entry){return entry.status==='Successful'}).length;
  $('cl-inconclusive').textContent=derived.filter(function(entry){return entry.status==='Inconclusive'}).length;
  opsSetStatBox('cl-ready-box',derived.some(function(entry){return entry.status==='Ready to review'})?'md':'');
  var query=$('cl-search').value.toLowerCase().trim(),filter=$('cl-filter-status').value;
  var items=changeRecords.slice().sort(function(a,b){return b.date.localeCompare(a.date)}).filter(function(item){var status=clDisplayStatus(item),haystack=(item.scope+' '+item.reason+' '+item.expected+' '+item.result).toLowerCase();return (!query||haystack.indexOf(query)>-1)&&(!filter||status===filter)});
  $('cl-count').textContent=items.length+' of '+changeRecords.length+' changes';
  $('cl-rows').innerHTML=items.length?items.map(function(item){var status=clDisplayStatus(item);return '<tr>'+ 
    '<td><span class="ops-date">'+opsEsc(item.date)+'</span><span class="ops-sub">'+opsEsc(item.type)+'</span></td>'+ 
    '<td><span class="ops-main">'+opsEsc(item.scope)+'</span></td>'+ 
    '<td>'+opsEsc(item.before||'—')+' <span class="ops-sub">to '+opsEsc(item.after||'—')+'</span></td>'+ 
    '<td><span class="ops-main">'+opsEsc(item.reason)+'</span><span class="ops-sub">Expected: '+opsEsc(item.expected)+'</span>'+(item.result?'<span class="ops-sub">Result: '+opsEsc(item.result)+'</span>':'')+'</td>'+ 
    '<td><span class="ops-date">'+opsEsc(item.recheck)+'</span><span class="ops-sub">'+opsEsc(item.cooldown==null?'No':item.cooldown)+'h cooldown</span></td>'+ 
    '<td><span class="ops-badge '+opsSlug(status)+'">'+opsEsc(status)+'</span></td>'+ 
    '<td><div class="ops-actions">'+(status==='Ready to review'?'<button type="button" data-cl-status="Successful" data-cl-id="'+item.id+'">Success</button><button type="button" data-cl-status="Inconclusive" data-cl-id="'+item.id+'">Inconclusive</button>':'')+'<button type="button" data-cl-edit="'+item.id+'">Edit</button><button type="button" class="danger" data-cl-remove="'+item.id+'">Remove</button></div></td></tr>'}).join(''):opsEmptyRow(7,'No changes logged yet','Create a queue item, take one controlled action, and log it here.');
  renderOpsHome();opsRefreshReport();
}

/* ---------- experiment center ---------- */
var XT_FIELDS={name:'xt-name',channel:'xt-channel',product:'xt-product',testType:'xt-test-type',testMode:'xt-test-mode',budget:'xt-budget',hypothesis:'xt-hypothesis',variable:'xt-variable',owner:'xt-owner',control:'xt-control',variant:'xt-variant',metric:'xt-metric',guardrail:'xt-guardrail',read:'xt-read',split:'xt-split',audienceControl:'xt-audience-control',placementControl:'xt-placement-control',winnerRule:'xt-winner-rule',stopLoss:'xt-stop-loss',complianceGate:'xt-compliance-gate',start:'xt-start',end:'xt-end',status:'xt-status',resultStatus:'xt-result-status',baselineRate:'xt-baseline-rate',mde:'xt-mde',confidenceTarget:'xt-confidence-target',controlVisitors:'xt-control-visitors',controlConversions:'xt-control-conversions',variantVisitors:'xt-variant-visitors',variantConversions:'xt-variant-conversions',learning:'xt-learning',next:'xt-next'};
function xtReadForm(){var item={};Object.keys(XT_FIELDS).forEach(function(key){item[key]=$(XT_FIELDS[key]).value.trim()});return item}
function xtWriteForm(item){Object.keys(XT_FIELDS).forEach(function(key){$(XT_FIELDS[key]).value=item&&item[key]!=null?item[key]:''})}
function xtResetForm(){xtEditing='';xtWriteForm({channel:'Meta Ads',testType:'Meta creative A/B',testMode:'ABO cells',variable:'Creative concept',metric:'CPA',split:50,audienceControl:'Same audience, exclusions, geo and optimization event',placementControl:'Same placements, devices and schedule',winnerRule:'Best primary metric after minimum read while guardrail holds',stopLoss:'Stop after 1.5× target CPA with zero backend orders',complianceGate:'Claim reference, destination and required authorization approved',start:opsToday(),end:opsAddDays(7),status:'Planned',resultStatus:'Pending',mde:20,confidenceTarget:95});$('xt-save').textContent='Save experiment';$('xt-cancel').hidden=true;if(typeof renderExperimentStatsPreview==='function')renderExperimentStatsPreview()}
function xtSave(){
  var item=xtReadForm();
  if(!item.name||!item.hypothesis||!item.control||!item.variant||!item.metric||!item.read||!item.testType||!item.testMode||!item.winnerRule||!item.stopLoss||!item.start||!item.end){alert('Define the name, hypothesis, control, variant, test type, test mode, metric, minimum read, winner rule, stop-loss, and dates before saving.');return}
  if(item.split&&(+item.split<1||+item.split>99)){alert('Control traffic must be between 1 and 99 percent.');return}
  if(item.end<item.start){alert('The read date cannot be before the start date.');return}
  if(typeof workspaceExperimentStats==='function'){item.stats=workspaceExperimentStats(item);if(item.stats.cleared&&item.resultStatus==='Pending')item.resultStatus=item.stats.verdict==='Variant wins'?'Winner':item.stats.verdict==='Control wins'?'Loser':'Inconclusive'}
  if(xtEditing){var current=experimentRecords.find(function(entry){return entry.id===xtEditing});if(current){Object.assign(current,item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Experiment updated',item.name,current.id)}toast('Experiment updated')}
  else{item.id=opsId('test');item.created=new Date().toISOString();experimentRecords.push(item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Experiment created',item.name,item.id);toast('Experiment saved')}
  xtResetForm();renderExperiments();
}
function xtEdit(id){var item=experimentRecords.find(function(entry){return entry.id===id});if(!item)return;xtEditing=id;xtWriteForm(item);$('xt-save').textContent='Update experiment';$('xt-cancel').hidden=false;window.scrollTo(0,0)}
function xtCreateAction(id){
  var item=experimentRecords.find(function(entry){return entry.id===id});if(!item)return;
  var sourceId='experiment:'+id,existing=optimizationActions.find(function(action){return action.sourceId===sourceId&&action.status!=='Resolved'});
  if(existing){setActive('actions');toast('This experiment already has an open action');return}
  optimizationActions.push({id:opsId('action'),created:new Date().toISOString(),sourceId:sourceId,sourceType:'Experiment',diagnosis:'',problem:'Experiment decision: '+item.name,priority:'Medium',recommendation:item.next||item.learning||'Read the primary metric against the guardrail and document the next test.',owner:item.owner,due:item.end||opsAddDays(1),recheck:opsAddDays(3),status:'Open'});
  renderActions();setActive('actions');toast('Experiment follow-up added to the queue');
}
function renderExperiments(){
  $('xt-planned').textContent=experimentRecords.filter(function(item){return item.status==='Planned'}).length;
  $('xt-running').textContent=experimentRecords.filter(function(item){return item.status==='Running'}).length;
  var due=experimentRecords.filter(function(item){return item.status!=='Complete'&&item.end&&item.end<=opsToday()}).length;
  $('xt-due').textContent=due;$('xt-complete').textContent=experimentRecords.filter(function(item){return item.status==='Complete'}).length;opsSetStatBox('xt-due-box',due?'md':'');
  var query=$('xt-search').value.toLowerCase().trim(),filter=$('xt-filter-status').value;
  var items=experimentRecords.slice().sort(function(a,b){return (a.end||'9999').localeCompare(b.end||'9999')}).filter(function(item){var haystack=(item.name+' '+item.product+' '+item.owner+' '+item.hypothesis).toLowerCase();return (!query||haystack.indexOf(query)>-1)&&(!filter||item.status===filter)});
  $('xt-count').textContent=items.length+' of '+experimentRecords.length+' experiments';
  $('xt-rows').innerHTML=items.length?items.map(function(item){return '<tr>'+ 
    '<td><span class="ops-main">'+opsEsc(item.name)+'</span><span class="ops-sub">'+opsEsc(item.channel)+' · '+opsEsc(item.product||'No lane')+'</span><span class="ops-sub">'+opsEsc(item.testType||'General test')+' · '+opsEsc(item.testMode||'Mode not set')+'</span><span class="ops-sub">'+opsEsc(item.owner||'Unassigned')+(item.budget?' · $'+opsEsc(item.budget)+' budget':'')+'</span></td>'+ 
    '<td><span class="ops-main">'+opsEsc(item.hypothesis)+'</span><span class="ops-source">Variable: '+opsEsc(item.variable)+'</span></td>'+ 
    '<td><span class="ops-sub">Control</span>'+opsEsc(item.control)+'<span class="ops-sub">Variant</span>'+opsEsc(item.variant)+'</td>'+ 
    '<td>'+opsEsc(item.metric)+'<span class="ops-sub">'+opsEsc(item.read)+'</span><span class="ops-sub">Guardrail: '+opsEsc(item.guardrail||'Not set')+'</span><span class="ops-sub">Winner: '+opsEsc(item.winnerRule||'Not set')+'</span><span class="ops-sub">Stop: '+opsEsc(item.stopLoss||'Not set')+'</span>'+(item.stats&&item.stats.confidence!=null?'<span class="ops-source">Confidence '+item.stats.confidence.toFixed(1)+'% · '+opsEsc(item.stats.verdict)+'</span>':'')+'</td>'+
    '<td><span class="ops-date">'+opsEsc(item.start)+'</span><span class="ops-sub">Read '+opsEsc(item.end)+'</span></td>'+ 
    '<td><span class="ops-badge '+opsSlug(item.status)+'">'+opsEsc(item.status)+'</span><span class="ops-sub"><span class="ops-badge '+opsSlug(item.resultStatus)+'">'+opsEsc(item.resultStatus)+'</span></span></td>'+ 
    '<td><div class="ops-actions">'+(item.status==='Planned'?'<button type="button" data-xt-status="Running" data-xt-id="'+item.id+'">Start</button>':'')+(item.status!=='Complete'?'<button type="button" data-xt-status="Complete" data-xt-id="'+item.id+'">Complete</button>':'')+'<button type="button" data-xt-action="'+item.id+'">Queue next</button><button type="button" data-xt-edit="'+item.id+'">Edit</button><button type="button" class="danger" data-xt-remove="'+item.id+'">Remove</button></div></td></tr>'}).join(''):opsEmptyRow(7,'No experiments designed yet','Define one hypothesis, one variable, and the minimum read before launching.');
  renderOpsHome();opsRefreshReport();
}

/* ---------- shared command center and report ---------- */
function renderOpsHome(){
  if(!$('home-records'))return;
  $('home-records').textContent=dailyRecords.length;
  $('home-alerts').textContent=dailyRecords.filter(function(record){return dpSignal(record).level!=='healthy'}).length;
  $('home-actions').textContent=optimizationActions.filter(function(item){return item.status!=='Resolved'}).length;
  $('home-overdue').textContent=optimizationActions.filter(function(item){return opsIsOverdue(item.due,item.status)}).length;
  $('home-rechecks').textContent=changeRecords.filter(function(item){return clDisplayStatus(item)==='Ready to review'}).length;
  $('home-tests').textContent=experimentRecords.filter(function(item){return item.status==='Running'}).length;
  if(typeof renderGrowthHome==='function')renderGrowthHome();
}
function opsRefreshReport(){if(typeof buildReport==='function'&&$('rp-out'))buildReport()}
function opsReportSummary(){
  var open=optimizationActions.filter(function(item){return item.status!=='Resolved'}),ready=changeRecords.filter(function(item){return clDisplayStatus(item)==='Ready to review'}),running=experimentRecords.filter(function(item){return item.status==='Running'}),completed=experimentRecords.filter(function(item){return item.status==='Complete'});
  var lines='12  OPERATIONAL DECISIONS\n'+
    '    Open actions          '+open.length+'\n'+
    '    Critical actions      '+open.filter(function(item){return item.priority==='Critical'}).length+'\n'+
    '    Overdue actions       '+open.filter(function(item){return opsIsOverdue(item.due,item.status)}).length+'\n'+
    '    Changes due to read   '+ready.length+'\n';
  open.slice(0,3).forEach(function(item){lines+='    · '+item.priority+' — '+item.problem+'\n'});
  lines+='\n13  EXPERIMENT PIPELINE\n'+
    '    Running               '+running.length+'\n'+
    '    Completed             '+completed.length+'\n';
  running.slice(0,3).forEach(function(item){lines+='    · '+item.name+' — read '+item.end+'\n'});
  return lines+'\n';
}
function opsShiftDate(iso,days){
  var date=new Date(iso+'T12:00:00');if(isNaN(date.getTime()))return '';
  date.setDate(date.getDate()+days);return date.toISOString().slice(0,10);
}
function opsAggregatePeriod(startExclusive,endInclusive){
  return dailyRecords.filter(function(record){return record.date>startExclusive&&record.date<=endInclusive}).reduce(function(sum,record){
    var truth=dpTruth(record);sum.rows++;sum.spend+=opsZero(record.spend);sum.truthRevenue+=opsZero(truth.revenue);sum.truthOrders+=opsZero(truth.orders);sum.platformRevenue+=opsZero(record.platformRevenue);sum.platformOrders+=opsZero(record.platformOrders);sum.backendOrders+=opsZero(record.backendOrders);sum.platformRevenueRows+=record.platformRevenue==null?0:1;sum.platformOrderRows+=record.platformOrders==null?0:1;sum.newCustomers+=opsZero(record.newCustomers);sum.atc+=opsZero(record.atc);sum.checkouts+=opsZero(record.checkouts);return sum;
  },{rows:0,spend:0,truthRevenue:0,truthOrders:0,platformRevenue:0,platformOrders:0,backendOrders:0,platformRevenueRows:0,platformOrderRows:0,newCustomers:0,atc:0,checkouts:0});
}
function opsPopulateWeeklyReport(){
  if(!dailyRecords.length){alert('Add or import Daily performance records before filling the weekly report.');return}
  var end=$('rp-wk').value.trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(end)){alert('Enter the week ending date as YYYY-MM-DD first.');return}
  var current=opsAggregatePeriod(opsShiftDate(end,-7),end),priorEnd=opsShiftDate(end,-7),prior=opsAggregatePeriod(opsShiftDate(end,-14),priorEnd);
  if(!current.spend&&!current.truthOrders){alert('No Daily performance records fall inside the selected seven-day period.');return}
  $('rp-sp').value=current.spend;$('rp-rv').value=current.rows&&current.platformRevenueRows===current.rows?current.platformRevenue:current.truthRevenue;$('rp-pu').value=current.rows&&current.platformOrderRows===current.rows?current.platformOrders:current.truthOrders;$('rp-be').value=current.backendOrders;$('rp-atc').value=current.atc;$('rp-ic').value=current.checkouts;
  $('rp-psp').value=prior.spend;$('rp-prv').value=prior.rows&&prior.platformRevenueRows===prior.rows?prior.platformRevenue:prior.truthRevenue;$('rp-ppu').value=prior.rows&&prior.platformOrderRows===prior.rows?prior.platformOrders:prior.truthOrders;$('rp-patc').value=prior.atc;$('rp-pic').value=prior.checkouts;
  $('rp-new').value=current.truthOrders?Math.round(current.newCustomers/current.truthOrders*100):0;
  buildReport();toast('Weekly report filled from Daily performance');
}
function renderOpsAll(){renderDaily();renderActions();renderChanges();renderExperiments();renderOpsHome()}

/* ---------- event bindings ---------- */
$('dp-save').addEventListener('click',dpSave);
$('dp-cancel').addEventListener('click',dpResetForm);
$('dp-search').addEventListener('input',renderDaily);
$('dp-filter-date').addEventListener('change',renderDaily);
$('dp-filter-platform').addEventListener('change',renderDaily);
$('dp-filter-status').addEventListener('change',renderDaily);
$('dp-template').addEventListener('click',function(){
  dl(new Blob([DP_CSV_COLUMNS.join(',')+'\n'],{type:'text/csv'}),'twc-daily-performance-template.csv');toast('CSV template downloaded');
});
$('dp-export').addEventListener('click',dpExportCsv);
$('dp-import').addEventListener('click',function(){$('dp-file').click()});
$('dp-file').addEventListener('change',function(event){var file=event.target.files[0];if(file)dpImportCsv(file);event.target.value=''});
$('dp-rows').addEventListener('click',function(event){
  var button=event.target.closest('button');if(!button)return;
  if(button.dataset.dpDiag)dpOpenDiagnosis(button.dataset.dpDiag);
  if(button.dataset.dpAction)dpCreateAction(button.dataset.dpAction);
  if(button.dataset.dpScale&&typeof growthCreateCandidateFromDaily==='function')growthCreateCandidateFromDaily(button.dataset.dpScale);
  if(button.dataset.dpEdit)dpEdit(button.dataset.dpEdit);
  if(button.dataset.dpRemove&&confirm('Remove this performance record?')){var removed=dailyRecords.find(function(item){return item.id===button.dataset.dpRemove});dailyRecords=dailyRecords.filter(function(item){return item.id!==button.dataset.dpRemove});if(removed&&typeof workspaceAudit==='function')workspaceAudit('Performance','Performance record archived',removed.account+' · '+removed.campaign,removed.id);renderDaily();if(typeof renderProductionAll==='function')renderProductionAll();toast('Performance record removed')}
});

$('aq-save').addEventListener('click',aqSave);$('aq-cancel').addEventListener('click',aqResetForm);$('aq-search').addEventListener('input',renderActions);$('aq-filter-priority').addEventListener('change',renderActions);$('aq-filter-status').addEventListener('change',renderActions);
$('aq-rows').addEventListener('click',function(event){
  var button=event.target.closest('button');if(!button)return;
  if(button.dataset.aqChange)aqLogChange(button.dataset.aqChange);
  if(button.dataset.aqEdit)aqEdit(button.dataset.aqEdit);
  if(button.dataset.aqStatus){var item=optimizationActions.find(function(entry){return entry.id===button.dataset.aqId});if(item){item.status=button.dataset.aqStatus;if(typeof workspaceAudit==='function')workspaceAudit('Decision','Optimization action marked '+item.status.toLowerCase(),item.problem,item.id);renderActions();toast('Action marked '+item.status.toLowerCase())}}
  if(button.dataset.aqRemove&&confirm('Remove this queue item?')){var removed=optimizationActions.find(function(item){return item.id===button.dataset.aqRemove});optimizationActions=optimizationActions.filter(function(item){return item.id!==button.dataset.aqRemove});if(removed&&typeof workspaceAudit==='function')workspaceAudit('Decision','Optimization action archived',removed.problem,removed.id);renderActions();toast('Queue item removed')}
});

$('cl-save').addEventListener('click',clSave);$('cl-cancel').addEventListener('click',clResetForm);$('cl-search').addEventListener('input',renderChanges);$('cl-filter-status').addEventListener('change',renderChanges);$('cl-scope').addEventListener('input',clCheckOverlap);$('cl-date').addEventListener('change',clCheckOverlap);$('cl-recheck').addEventListener('change',clCheckOverlap);
$('cl-rows').addEventListener('click',function(event){
  var button=event.target.closest('button');if(!button)return;
  if(button.dataset.clEdit)clEdit(button.dataset.clEdit);
  if(button.dataset.clStatus){var item=changeRecords.find(function(entry){return entry.id===button.dataset.clId});if(item){item.status=button.dataset.clStatus;if(typeof workspaceAudit==='function')workspaceAudit('Decision','Controlled change marked '+item.status.toLowerCase(),item.scope,item.id);renderChanges();toast('Change marked '+item.status.toLowerCase())}}
  if(button.dataset.clRemove&&confirm('Remove this change record?')){var removed=changeRecords.find(function(item){return item.id===button.dataset.clRemove});changeRecords=changeRecords.filter(function(item){return item.id!==button.dataset.clRemove});if(removed&&typeof workspaceAudit==='function')workspaceAudit('Decision','Controlled change archived',removed.scope,removed.id);renderChanges();toast('Change record removed')}
});

$('xt-save').addEventListener('click',xtSave);$('xt-cancel').addEventListener('click',xtResetForm);$('xt-search').addEventListener('input',renderExperiments);$('xt-filter-status').addEventListener('change',renderExperiments);
$('xt-rows').addEventListener('click',function(event){
  var button=event.target.closest('button');if(!button)return;
  if(button.dataset.xtEdit)xtEdit(button.dataset.xtEdit);
  if(button.dataset.xtAction)xtCreateAction(button.dataset.xtAction);
  if(button.dataset.xtStatus){var item=experimentRecords.find(function(entry){return entry.id===button.dataset.xtId});if(item){item.status=button.dataset.xtStatus;if(typeof workspaceExperimentStats==='function')item.stats=workspaceExperimentStats(item);if(typeof workspaceAudit==='function')workspaceAudit('Decision','Experiment marked '+item.status.toLowerCase(),item.name,item.id);renderExperiments();toast('Experiment marked '+item.status.toLowerCase())}}
  if(button.dataset.xtRemove&&confirm('Remove this experiment?')){var removed=experimentRecords.find(function(item){return item.id===button.dataset.xtRemove});experimentRecords=experimentRecords.filter(function(item){return item.id!==button.dataset.xtRemove});if(removed&&typeof workspaceAudit==='function')workspaceAudit('Decision','Experiment archived',removed.name,removed.id);renderExperiments();toast('Experiment removed')}
});

$('rp-use-daily').addEventListener('click',opsPopulateWeeklyReport);

$('rp-wk').value=opsToday();dpResetForm();aqResetForm();clResetForm();xtResetForm();
