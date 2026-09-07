var $=(id)=> document.getElementById(id);
function money(n){return typeof wsMoney==='function'?wsMoney(n):'$'+Math.round(n).toLocaleString()}
function pad(n){return String(Math.max(1,Number.parseInt(n)||1)).padStart(2,'0')}
function esc(s){return s.replace(/[&<>]/g,(c)=> {'&':'&amp;','<':'&lt;','>':'&gt;'}[c])}

/* ================= NAVIGATION ================= */
var SECMETA={};
NAV.forEach((g)=> {g[2].forEach((it)=> {SECMETA[it[0]]={name:it[1],group:g[0],icon:it[2]}})});
function navHTML(){
  var n=0,h='';
  NAV.forEach((g,groupIndex)=> {
    h+='<details class="navgroup"'+(groupIndex===0?' open':'')+'>'+
       '<summary><i class="bi '+g[1]+' navicon"></i><span>'+g[0]+'</span>'+
       '<span class="navcount">'+g[2].length+'</span><i class="bi bi-chevron-down navchev"></i></summary>'+
       '<div class="navlinks">';
    g[2].forEach((it)=> {
      n++;
      h+='<a href="#'+it[0]+'" data-v="'+it[0]+'"><i class="num">'+String(n).padStart(2,'0')+'</i>'+it[1]+'</a>';
    });
    h+='</div></details>';
  });
  return h;
}
$('nav').innerHTML=navHTML();
$('nav2').innerHTML=navHTML();

function setActive(v){
  Array.prototype.forEach.call(document.querySelectorAll('#nav a,#nav2 a'),(x)=> {
    var active=x.dataset.v===v;
    x.classList.toggle('on',active);
    if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');
  });
  Array.prototype.forEach.call(document.querySelectorAll('#nav details,#nav2 details'),(group)=> {
    group.open=!!group.querySelector('a[data-v="'+v+'"]');
  });
  Array.prototype.forEach.call(document.querySelectorAll('.view'),(x)=> {x.classList.remove('on')});
  var sec=$('v-'+v); if(sec)sec.classList.add('on');
  var m=SECMETA[v]||{};
  $('tb-grp').textContent=(m.group||'')+' /';
  $('tb-sec').textContent=m.name||'';
  if(window.location.hash!=='#'+v)history.replaceState(null,'','#'+v);
  window.scrollTo(0,0);
  if(v==='maps')setTimeout(drawMap,40);
  if(v==='build')setTimeout(()=> {svFit();cvFit()},80);
  if(v==='google')setTimeout(gvFit,80);
  if(v==='pipeline'&&typeof renderPipeline==='function')renderPipeline();
}
function onNav(e){
  var a=e.target.closest('a[data-v]'); if(!a)return; e.preventDefault();
  setActive(a.dataset.v);
  var oc=document.getElementById('navCanvas');
  if(oc&&window.bootstrap){var i=bootstrap.Offcanvas.getInstance(oc); if(i)i.hide();}
}
$('nav').addEventListener('click',onNav);
$('nav2').addEventListener('click',onNav);
function go(v){setActive(v)}

/* ================= TOAST ================= */
function toast(msg){
  var el=$('toast'); if(!el||!window.bootstrap){return}
  $('toastMsg').textContent=msg;
  bootstrap.Toast.getOrCreateInstance(el).show();
}

/* ================= COMMAND PALETTE ================= */
var CMD=[];
NAV.forEach((g)=> {g[2].forEach((it)=> {
  CMD.push({t:it[1],g:g[0],i:it[2],act:((v)=> ()=> {setActive(v)})(it[0])});
})});
var cmdSel=0,cmdCur=[];
function cmdRender(q){
  q=(q||'').toLowerCase().trim();
  cmdCur=CMD.concat(Object.keys(MAPS).map((k)=> ({t:MAPS[k].t,g:'Map',i:'bi-bounding-box',act:()=> {setActive('maps');setTimeout(()=> {selectMap(k)},60)}}))).concat(SCEN.map((sc)=> ({t:sc.n,g:'Scenario',i:'bi-signpost-split',act:()=> {setActive('scen');$('sc-sel').value=sc.k;renderScen()}}))).concat((typeof DIAGNOSES==='undefined'?[]:DIAGNOSES).map((diag)=> ({t:diag.n,g:'Diagnosis · '+diag.cat,i:'bi-search-heart',act:()=> {setActive('diag');selectDiagnosis(diag.k)}})));
  if(q)cmdCur=cmdCur.filter((c)=> (c.t+' '+c.g).toLowerCase().indexOf(q)>-1);
  cmdSel=0;
  $('cmdList').innerHTML=cmdCur.length?cmdCur.slice(0,40).map((c,i)=> '<div class="cmditem'+(i===0?' sel':'')+'" data-i="'+i+'"><i class="bi '+c.i+'"></i>'+c.t+'<span class="g">'+c.g+'</span></div>').join(''):'<div class="cmdempty">Nothing matches that.</div>';
}
function cmdMove(d){
  var items=$('cmdList').querySelectorAll('.cmditem'); if(!items.length)return;
  cmdSel=Math.max(0,Math.min(items.length-1,cmdSel+d));
  Array.prototype.forEach.call(items,(x,i)=> {x.classList.toggle('sel',i===cmdSel)});
  items[cmdSel].scrollIntoView({block:'nearest'});
}
function cmdRun(i){
  var c=cmdCur[i]; if(!c)return;
  var m=document.getElementById('cmdBox');
  if(window.bootstrap){var inst=bootstrap.Modal.getInstance(m); if(inst)inst.hide();}
  setTimeout(c.act,120);
}
function openCmd(){
  if(!window.bootstrap)return;
  bootstrap.Modal.getOrCreateInstance($('cmdBox')).show();
}
document.addEventListener('DOMContentLoaded',()=> {
  var box=$('cmdBox');
  if(box){
    box.addEventListener('shown.bs.modal',()=> {$('cmdInput').value='';cmdRender('');$('cmdInput').focus()});
  }
  $('cmdInput').addEventListener('input',function(){cmdRender(this.value)});
  $('cmdInput').addEventListener('keydown',(e)=> {
    if(e.key==='ArrowDown'){e.preventDefault();cmdMove(1)}
    if(e.key==='ArrowUp'){e.preventDefault();cmdMove(-1)}
    if(e.key==='Enter'){e.preventDefault();cmdRun(cmdSel)}
  });
  $('cmdList').addEventListener('click',(e)=> {
    var it=e.target.closest('.cmditem'); if(it)cmdRun(+it.dataset.i);
  });
  $('cmdOpen').addEventListener('click',openCmd);
  Array.prototype.forEach.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'),(el)=> {
    new bootstrap.Tooltip(el);
  });
  $('save2').addEventListener('click',()=> {$('save').click()});
  $('load2').addEventListener('click',()=> {$('load').click()});
  $('printBtn').addEventListener('click',()=> {window.print()});
});
document.addEventListener('keydown',(e)=> {
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd()}
});

document.addEventListener('click',(e)=> {
  var b=e.target.closest('.btn[data-c]'); if(!b)return;
  navigator.clipboard.writeText($(b.dataset.c).textContent).then(()=> {
    var o=b.textContent; b.textContent='Copied'; b.classList.add('done');
    toast('Copied to clipboard');
    setTimeout(()=> {b.textContent=o;b.classList.remove('done')},1400);
  });
});
document.addEventListener('click',(e)=> {
  var b=e.target.closest('[data-go]'); if(!b)return;
  go(b.dataset.go);
});
