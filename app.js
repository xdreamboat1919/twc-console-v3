/* ================= BOOT ================= */
function renderAll(){
  renderRoutine(); renderFlow(); renderOpsAll(); renderGrowthAll();
  buildNames(); buildStruct(); renderCTest(); calcBudget(); calcPace();
  calcEcon(); calcMarg(); renderCreatives(); checkCopy();
  calcRec(); calcFatigue(); renderTree();
  routeClass(); scanEvents(); renderSpec(); calcFunnel();
  renderPixel(); renderParams(); renderPxSpec();
  calcICP(); calcLTV(); calcSegs(); renderShopify(); calcShopRec();
  calcLal(); calcStack(); calcExcl();
  renderBriefs(); calcForecast(); buildReport(); calcOffer(); calcMER(); calcSig(); calcSat();
  calcCohort(); calcRefund(); calcSubs(); calcGateway(); calcStoreFunnel();
  calcPath(); calcWindows(); calcKill(); calcIncr(); calcSurvey();
  calcBlend(); calcAcqBlend();
  calcRecovery(); calcBreak(); calcIncr2();
  calcOffers(); calcChannels(); renderPF(); renderComp(); renderRules();
  calcBrandInc(); renderGStruct(); calcGWaste(); calcGScale();
  renderMake(); renderMakeBp();
  calcScaleDiag(); calcDist(); calcSupply(); calcSelfComp();
  calcRamp(); calcLayers(); calcReady();
  if(typeof renderProductionAll==='function')renderProductionAll();
  if(typeof renderPipeline==='function')renderPipeline();
  if(typeof renderCompetitors==='function')renderCompetitors();
  if($('mm-idx'))$('mm-idx').textContent='1 of '+Object.keys(MAPS).length;
}
async function startConsole(){
  var restored=false;
  if(window.TWC&&TWC.store)restored=await TWC.store.restore();
  var requestedView=window.location.hash.slice(1);
  setActive(SECMETA[requestedView]?requestedView:'routine');
  renderAll();
  if(!restored&&typeof workspaceAudit==='function')workspaceAudit('Workspace','Production workspace initialized','Campaign Console 2.0');
  if(window.TWC&&TWC.store){TWC.store.watch();TWC.store.schedule(restored?'workspace restored':'workspace initialized')}
}
startConsole();
