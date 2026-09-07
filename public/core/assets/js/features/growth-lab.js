/* ================= SCALE + CREATIVE OPERATING SYSTEM ================= */
var scaleCandidates = [];
var scaleSteps = [];
var creativeIdeas = [];
var creativeAssets = [];

var glScaleEditing = '';
var glStepEditing = '';
var glIdeaEditing = '';
var glAssetEditing = '';

function glNum(value) {
  return typeof opsNum === 'function' ? opsNum(value) : value === '' ? null : Number(value);
}
function glZero(value) {
  return value == null ? 0 : Number(value) || 0;
}
function glPct(value, digits) {
  return value == null ? '—' : Number(value).toFixed(digits == null ? 1 : digits) + '%';
}
function glMoney(value, digits) {
  return typeof opsMoney === 'function'
    ? opsMoney(value, digits)
    : value == null
      ? '—'
      : '$' + Number(value).toFixed(digits || 0);
}
function glEsc(value) {
  return typeof opsEsc === 'function' ? opsEsc(value) : String(value == null ? '' : value);
}
function glSlug(value) {
  return typeof opsSlug === 'function'
    ? opsSlug(value)
    : String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
}
function glToday() {
  return typeof opsToday === 'function' ? opsToday() : new Date().toISOString().slice(0, 10);
}
function glAddDays(days) {
  return typeof opsAddDays === 'function' ? opsAddDays(days) : glToday();
}
function glId(prefix) {
  return typeof opsId === 'function' ? opsId(prefix) : prefix + '-' + Date.now();
}
function glEmpty(columns, title, body) {
  return typeof opsEmptyRow === 'function'
    ? opsEmptyRow(columns, title, body)
    : '<tr><td colspan="' + columns + '">' + glEsc(title) + ' — ' + glEsc(body) + '</td></tr>';
}
function glSetBox(id, state) {
  if (typeof opsSetStatBox === 'function') opsSetStatBox(id, state);
}
function glBoolState(value) {
  return value === 'yes' ? 'pass' : value === 'no' ? 'fail' : 'warn';
}
function glCsvQuote(value) {
  var text = String(value == null ? '' : value);
  return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
function glDownloadCsv(name, columns, rows) {
  var csv =
    columns.join(',') +
    '\n' +
    rows.map((row) => columns.map((column) => glCsvQuote(row[column])).join(',')).join('\n');
  dl(new Blob([csv], { type: 'text/csv' }), name);
  toast('CSV downloaded');
}
function glGateHtml(gates) {
  return (
    '<div class="growth-gates">' +
    gates
      .map(
        (gate) =>
          '<span class="growth-gate ' +
          gate.state +
          '"><i class="bi ' +
          (gate.state === 'pass'
            ? 'bi-check-circle'
            : gate.state === 'fail'
              ? 'bi-x-circle'
              : 'bi-exclamation-circle') +
          '"></i>' +
          glEsc(gate.name) +
          '</span>',
      )
      .join('') +
    '</div>'
  );
}
function glReasonHtml(reasons) {
  return reasons.length
    ? '<ul class="growth-reasons">' +
        reasons.map((reason) => '<li>' + glEsc(reason) + '</li>').join('') +
        '</ul>'
    : '';
}

/* ---------- scale candidates ---------- */
var GL_SCALE_FIELDS = {
  platform: 'gl-sc-platform',
  account: 'gl-sc-account',
  campaign: 'gl-sc-campaign',
  product: 'gl-sc-product',
  stage: 'gl-sc-stage',
  budget: 'gl-sc-budget',
  targetCpa: 'gl-sc-target-cpa',
  targetRoas: 'gl-sc-target-roas',
  spend: 'gl-sc-spend',
  orders: 'gl-sc-orders',
  revenue: 'gl-sc-revenue',
  stableDays: 'gl-sc-stable-days',
  marginalCpa: 'gl-sc-marginal-cpa',
  marginalRoas: 'gl-sc-marginal-roas',
  validatedCreatives: 'gl-sc-creatives',
  frequency: 'gl-sc-frequency',
  reach: 'gl-sc-reach',
  dataState: 'gl-sc-data',
  learning: 'gl-sc-learning',
  compliance: 'gl-sc-compliance',
  inventoryDays: 'gl-sc-inventory',
  cashflow: 'gl-sc-cashflow',
  notes: 'gl-sc-notes',
};
var GL_SCALE_NUMERIC = [
  'budget',
  'targetCpa',
  'targetRoas',
  'spend',
  'orders',
  'revenue',
  'stableDays',
  'marginalCpa',
  'marginalRoas',
  'validatedCreatives',
  'frequency',
  'reach',
  'inventoryDays',
];
function glReadFields(map, numeric) {
  var item = {};
  Object.keys(map).forEach((key) => {
    item[key] = String($(map[key]).value == null ? '' : $(map[key]).value).trim();
  });
  numeric.forEach((key) => {
    item[key] = glNum(item[key]);
  });
  return item;
}
function glWriteFields(map, item) {
  Object.keys(map).forEach((key) => {
    $(map[key]).value = item && item[key] != null ? item[key] : '';
  });
}
function scaleAssessment(candidate) {
  var spend = glZero(candidate.spend),
    orders = glZero(candidate.orders),
    revenue = glZero(candidate.revenue);
  var cpa = orders > 0 ? spend / orders : null,
    roas = spend > 0 ? revenue / spend : null,
    gates = [],
    reasons = [];
  function gate(name, state, note) {
    gates.push({ name: name, state: state, note: note });
    if (state !== 'pass' && note) reasons.push(note);
  }

  if (candidate.dataState === 'broken')
    gate(
      'Data',
      'fail',
      'Fix the platform-to-backend mismatch or event fault before changing delivery.',
    );
  else if (candidate.dataState === 'fallback')
    gate(
      'Data',
      'warn',
      'Only platform-reported results are available; reconcile commercial truth before a material increase.',
    );
  else gate('Data', 'pass', 'Backend truth reconciled.');

  var econState = 'warn',
    econNote = 'Set a target and enough backend results to judge economics.';
  if (candidate.targetCpa > 0 && cpa != null) {
    econState =
      cpa <= candidate.targetCpa ? 'pass' : cpa <= candidate.targetCpa * 1.15 ? 'warn' : 'fail';
    econNote =
      econState === 'pass'
        ? 'CPA clears target.'
        : 'Backend CPA is ' + glPct((cpa / candidate.targetCpa - 1) * 100, 0) + ' above target.';
  }
  if (candidate.targetRoas > 0 && roas != null) {
    var rState =
      roas >= candidate.targetRoas ? 'pass' : roas >= candidate.targetRoas * 0.9 ? 'warn' : 'fail';
    if (rState === 'fail' || (rState === 'warn' && econState === 'pass')) econState = rState;
    if (rState !== 'pass')
      econNote =
        'Backend ROAS is ' + glPct((1 - roas / candidate.targetRoas) * 100, 0) + ' below target.';
  }
  gate('Economics', econState, econNote);

  var minimumRead = candidate.targetCpa > 0 ? candidate.targetCpa * 3 : 0;
  var enoughRead = orders >= 10 || (minimumRead > 0 && spend >= minimumRead);
  var stabilityState =
    candidate.stableDays >= 14 && enoughRead
      ? 'pass'
      : candidate.stableDays >= 7 && spend > 0
        ? 'warn'
        : 'fail';
  gate(
    'Stability',
    stabilityState,
    stabilityState === 'pass'
      ? 'Read window is stable.'
      : 'Build at least a 14-day record and clear the minimum read before scaling.',
  );

  var marginalState = 'warn',
    marginalNote = 'Marginal efficiency from the prior increment is not recorded.';
  if (candidate.targetCpa > 0 && candidate.marginalCpa != null) {
    marginalState =
      candidate.marginalCpa <= candidate.targetCpa
        ? 'pass'
        : candidate.marginalCpa <= candidate.targetCpa * 1.15
          ? 'warn'
          : 'fail';
    marginalNote =
      marginalState === 'pass'
        ? 'Marginal CPA clears target.'
        : 'Marginal CPA is ' +
          glPct((candidate.marginalCpa / candidate.targetCpa - 1) * 100, 0) +
          ' above target.';
  } else if (candidate.targetRoas > 0 && candidate.marginalRoas != null) {
    marginalState =
      candidate.marginalRoas >= candidate.targetRoas
        ? 'pass'
        : candidate.marginalRoas >= candidate.targetRoas * 0.85
          ? 'warn'
          : 'fail';
    marginalNote =
      marginalState === 'pass'
        ? 'Marginal ROAS clears target.'
        : 'Marginal ROAS is below the declared guardrail.';
  }
  gate('Marginal', marginalState, marginalNote);

  var creativeState =
    candidate.validatedCreatives >= 2
      ? 'pass'
      : candidate.validatedCreatives === 1
        ? 'warn'
        : 'fail';
  gate(
    'Creative depth',
    creativeState,
    creativeState === 'pass'
      ? 'Two or more validated assets are live.'
      : 'Validate at least two live creatives so one fatigue event cannot collapse volume.',
  );

  var deliveryState =
    candidate.learning === 'stable' ? 'pass' : candidate.learning === 'learning' ? 'fail' : 'warn';
  var saturation = candidate.frequency > 2.5 || candidate.reach > 70;
  if (saturation && deliveryState === 'pass') deliveryState = 'warn';
  gate(
    'Delivery',
    deliveryState,
    candidate.learning === 'learning'
      ? 'Delivery is still learning or limited.'
      : saturation
        ? 'Frequency or audience reach suggests saturation risk.'
        : candidate.learning === 'unknown'
          ? 'Confirm the learning and delivery state.'
          : 'Delivery is stable.',
  );

  var operationsState =
    candidate.cashflow === 'no' || (candidate.inventoryDays != null && candidate.inventoryDays < 7)
      ? 'fail'
      : candidate.cashflow === 'yes' && candidate.inventoryDays >= 14
        ? 'pass'
        : 'warn';
  gate(
    'Operations',
    operationsState,
    operationsState === 'pass'
      ? 'Inventory and cash-flow capacity confirmed.'
      : operationsState === 'fail'
        ? 'Inventory or cash flow cannot support the increase.'
        : 'Confirm at least 14 days of inventory cover and cash-flow capacity.',
  );

  var complianceState =
    candidate.compliance === 'yes' ? 'pass' : candidate.compliance === 'no' ? 'fail' : 'warn';
  gate(
    'Compliance',
    complianceState,
    complianceState === 'pass'
      ? 'Campaign and destination are approved.'
      : complianceState === 'fail'
        ? 'Compliance is blocked; do not expand delivery.'
        : 'Compliance review is due before scaling.',
  );

  var states = gates.map((item) => item.state),
    decision = 'Ready',
    next = 'Plan one controlled budget step with a 48–72 hour cooldown.';
  if (candidate.dataState === 'broken') {
    decision = 'Fix tracking';
    next = 'Open tracking and reconciliation before any budget action.';
  } else if (marginalState === 'fail') {
    decision = 'Roll back';
    next = 'Return to the previous efficient budget and work the limiting input.';
  } else if (
    complianceState === 'fail' ||
    operationsState === 'fail' ||
    econState === 'fail' ||
    candidate.learning === 'learning'
  ) {
    decision = 'Hold';
    next = 'Resolve the failed gate; more spend will amplify the constraint.';
  } else if (creativeState !== 'pass') {
    decision = 'Build creative';
    next = 'Validate a second replacement before increasing spend.';
  } else if (states.indexOf('warn') > -1 || states.indexOf('fail') > -1) {
    decision = 'Conditional';
    next = 'Collect the missing evidence and rerun the gate.';
  }
  var points = gates.reduce(
    (total, item) => total + (item.state === 'pass' ? 1 : item.state === 'warn' ? 0.5 : 0),
    0,
  );
  return {
    decision: decision,
    next: next,
    gates: gates,
    reasons: reasons,
    cpa: cpa,
    roas: roas,
    score: Math.round((points / gates.length) * 100),
  };
}
function glScalePreview() {
  var assessment = scaleAssessment(glReadFields(GL_SCALE_FIELDS, GL_SCALE_NUMERIC));
  $('gl-sc-preview').innerHTML =
    '<div class="growth-decision"><span class="growth-verdict ' +
    glSlug(assessment.decision) +
    '">' +
    glEsc(assessment.decision) +
    '</span><span>' +
    assessment.score +
    '% gate score</span></div><div>' +
    glGateHtml(assessment.gates) +
    glReasonHtml(assessment.reasons.slice(0, 3)) +
    '</div>';
}
function glScaleReset() {
  glScaleEditing = '';
  glWriteFields(GL_SCALE_FIELDS, {
    platform: 'Meta Ads',
    stage: 'Prospecting',
    stableDays: 14,
    validatedCreatives: 2,
    dataState: 'reconciled',
    learning: 'stable',
    compliance: 'yes',
    inventoryDays: 30,
    cashflow: 'yes',
  });
  $('gl-sc-save').textContent = 'Add scale candidate';
  $('gl-sc-cancel').hidden = true;
  glScalePreview();
}
function glScaleSave() {
  var item = glReadFields(GL_SCALE_FIELDS, GL_SCALE_NUMERIC);
  if (!item.account || !item.campaign || item.budget == null) {
    alert('Enter the account, campaign, and current daily budget.');
    return;
  }
  if (!(item.targetCpa > 0) && !(item.targetRoas > 0)) {
    alert('Set a target CPA, target ROAS, or both.');
    return;
  }
  if (glScaleEditing) {
    var current = scaleCandidates.find((entry) => entry.id === glScaleEditing);
    if (current) {
      Object.assign(current, item);
      if (typeof workspaceAudit === 'function')
        workspaceAudit(
          'Scale',
          'Scale candidate updated',
          item.account + ' / ' + item.campaign,
          current.id,
        );
    }
    toast('Scale candidate updated');
  } else {
    item.id = glId('scale');
    item.created = new Date().toISOString();
    scaleCandidates.push(item);
    if (typeof workspaceAudit === 'function')
      workspaceAudit(
        'Scale',
        'Scale candidate added',
        item.account + ' / ' + item.campaign,
        item.id,
      );
    toast('Scale candidate added');
  }
  glScaleReset();
  renderScaleControl();
}
function glScaleEdit(id) {
  var item = scaleCandidates.find((entry) => entry.id === id);
  if (!item) return;
  glScaleEditing = id;
  glWriteFields(GL_SCALE_FIELDS, item);
  $('gl-sc-save').textContent = 'Update scale candidate';
  $('gl-sc-cancel').hidden = false;
  glScalePreview();
  window.scrollTo(0, 0);
}
function growthCreateCandidateFromDaily(id) {
  var record = dailyRecords.find((entry) => entry.id === id);
  if (!record) return;
  var metric = dpMetrics(record);
  var winners = creativeAssets.filter(
    (asset) => asset.campaign === record.campaign && creativeVerdict(asset).label === 'Graduate',
  ).length;
  glScaleReset();
  glWriteFields(GL_SCALE_FIELDS, {
    platform: record.platform,
    account: record.account,
    campaign: record.campaign,
    product: record.product,
    stage: record.stage,
    budget: record.budget,
    targetCpa: record.targetCpa,
    targetRoas: record.targetRoas,
    spend: record.spend,
    orders: metric.orders,
    revenue: metric.revenue,
    stableDays: 1,
    validatedCreatives: winners,
    frequency: null,
    reach: null,
    dataState:
      record.backendOrders != null || record.backendRevenue != null ? 'reconciled' : 'fallback',
    learning: 'unknown',
    compliance: 'review',
    inventoryDays: null,
    cashflow: 'unknown',
    notes:
      'Imported from Daily performance on ' +
      record.date +
      '. Complete the multi-day and operational gates.',
  });
  glScalePreview();
  setActive('scaleops');
  toast('Daily record loaded into the scale gate');
}
function glScaleStructure(candidate) {
  if (candidate.platform === 'Google Ads') return 'Platform-native automated allocation';
  if (
    candidate.stage === 'Prospecting' &&
    candidate.validatedCreatives >= 2 &&
    candidate.learning === 'stable'
  )
    return 'CBO';
  return 'ABO';
}
function glScaleScore(candidate) {
  var assessment = scaleAssessment(candidate),
    efficiency = 50;
  if (candidate.targetCpa > 0 && assessment.cpa != null)
    efficiency = Math.max(0, Math.min(100, (candidate.targetCpa / assessment.cpa) * 80));
  else if (candidate.targetRoas > 0 && assessment.roas != null)
    efficiency = Math.max(0, Math.min(100, (assessment.roas / candidate.targetRoas) * 80));
  var stability = Math.min(100, (glZero(candidate.stableDays) / 14) * 100),
    creative = Math.min(100, (glZero(candidate.validatedCreatives) / 3) * 100),
    marginal = assessment.gates.filter((gate) => gate.name === 'Marginal')[0];
  return Math.round(
    efficiency * 0.35 +
      stability * 0.2 +
      creative * 0.2 +
      (marginal.state === 'pass' ? 100 : marginal.state === 'warn' ? 50 : 0) * 0.25,
  );
}
function glScaleCandidateOptions() {
  var current = $('gl-step-candidate').value;
  $('gl-step-candidate').innerHTML =
    '<option value="">Select a candidate</option>' +
    scaleCandidates
      .map(
        (candidate) =>
          '<option value="' +
          candidate.id +
          '">' +
          glEsc(candidate.account + ' / ' + candidate.campaign) +
          '</option>',
      )
      .join('');
  if (scaleCandidates.some((candidate) => candidate.id === current))
    $('gl-step-candidate').value = current;
}
function renderScaleCandidates() {
  var assessments = scaleCandidates.map((candidate) => ({
    candidate: candidate,
    assessment: scaleAssessment(candidate),
  }));
  $('gl-sc-ready').textContent = assessments.filter(
    (entry) => entry.assessment.decision === 'Ready',
  ).length;
  $('gl-sc-conditional').textContent = assessments.filter(
    (entry) => entry.assessment.decision === 'Conditional',
  ).length;
  $('gl-sc-blocked').textContent = assessments.filter(
    (entry) => ['Ready', 'Conditional'].indexOf(entry.assessment.decision) === -1,
  ).length;
  glSetBox(
    'gl-sc-ready-box',
    assessments.some((entry) => entry.assessment.decision === 'Ready') ? 'hi' : '',
  );
  glSetBox(
    'gl-sc-blocked-box',
    assessments.some((entry) => ['Ready', 'Conditional'].indexOf(entry.assessment.decision) === -1)
      ? 'lo'
      : '',
  );
  var query = $('gl-sc-search').value.toLowerCase().trim(),
    filter = $('gl-sc-filter').value;
  var items = assessments.filter((entry) => {
    var candidate = entry.candidate,
      haystack = (
        candidate.account +
        ' ' +
        candidate.campaign +
        ' ' +
        candidate.product
      ).toLowerCase();
    return (
      (!query || haystack.indexOf(query) > -1) && (!filter || entry.assessment.decision === filter)
    );
  });
  $('gl-sc-count').textContent = items.length + ' of ' + scaleCandidates.length + ' candidates';
  $('gl-sc-rows').innerHTML = items.length
    ? items
        .map((entry) => {
          var candidate = entry.candidate,
            assessment = entry.assessment;
          return (
            '<tr><td><span class="ops-main">' +
            glEsc(candidate.account) +
            '</span><span class="ops-sub">' +
            glEsc(candidate.campaign) +
            '</span><span class="ops-sub">' +
            glEsc(candidate.platform + ' · ' + (candidate.product || 'No lane')) +
            '</span></td>' +
            '<td><span class="growth-kpi"><b>Spend</b>' +
            glMoney(candidate.spend) +
            '</span><span class="growth-kpi"><b>CPA</b>' +
            glMoney(assessment.cpa) +
            '</span><span class="growth-kpi"><b>ROAS</b>' +
            (assessment.roas == null ? '—' : assessment.roas.toFixed(2)) +
            '</span><span class="ops-sub">Targets ' +
            glMoney(candidate.targetCpa) +
            ' / ' +
            (candidate.targetRoas || '—') +
            ' ROAS</span></td>' +
            '<td><span class="growth-kpi"><b>Stable</b>' +
            glZero(candidate.stableDays) +
            'd</span><span class="growth-kpi"><b>Marginal CPA</b>' +
            glMoney(candidate.marginalCpa) +
            '</span><span class="growth-kpi"><b>Validated</b>' +
            glZero(candidate.validatedCreatives) +
            '</span><span class="growth-kpi"><b>Frequency</b>' +
            (candidate.frequency == null ? '—' : candidate.frequency) +
            '</span></td>' +
            '<td><span class="growth-verdict ' +
            glSlug(assessment.decision) +
            '">' +
            assessment.decision +
            '</span><span class="ops-sub">' +
            assessment.score +
            '% gate score</span>' +
            glGateHtml(assessment.gates) +
            '</td>' +
            '<td><span class="ops-main">' +
            glEsc(assessment.next) +
            '</span><span class="ops-sub">' +
            glEsc(assessment.reasons[0] || 'All declared gates cleared.') +
            '</span></td>' +
            '<td><div class="ops-actions"><button type="button" data-sc-plan="' +
            candidate.id +
            '">Plan step</button><button type="button" data-sc-creative="' +
            candidate.id +
            '">Build creative</button><button type="button" data-sc-edit="' +
            candidate.id +
            '">Edit</button><button type="button" class="danger" data-sc-remove="' +
            candidate.id +
            '">Remove</button></div></td></tr>'
          );
        })
        .join('')
    : glEmpty(
        6,
        'No scale candidates yet',
        'Send a campaign from Daily performance or enter the evidence above.',
      );
  glScaleCandidateOptions();
}
function glScaleToCreative(id) {
  var candidate = scaleCandidates.find((entry) => entry.id === id);
  if (!candidate) return;
  creativeIdeas.push({
    id: glId('idea'),
    created: new Date().toISOString(),
    product: candidate.product,
    awareness: 'Product aware',
    source: 'Team insight',
    competitor: '',
    pain: 'Scale constraint: ' + scaleAssessment(candidate).decision,
    outcome: 'Create a validated replacement that can carry incremental spend',
    concept: 'Scale support for ' + candidate.campaign,
    angle: '',
    hook: '',
    format: 'UGC video',
    creator: '',
    offer: '',
    claim: '',
    priority: 'High',
    difficulty: 'Medium',
    status: 'Backlog',
  });
  renderCreativeIdeas();
  setActive('creativeops');
  toast('Scale constraint added to the creative backlog');
}

/* ---------- budget ladder ---------- */
var GL_STEP_FIELDS = {
  candidateId: 'gl-step-candidate',
  date: 'gl-step-date',
  method: 'gl-step-method',
  structure: 'gl-step-structure',
  currentBudget: 'gl-step-current',
  proposedBudget: 'gl-step-proposed',
  cooldown: 'gl-step-cooldown',
  recheck: 'gl-step-recheck',
  rollbackMetric: 'gl-step-rollback-metric',
  rollbackValue: 'gl-step-rollback-value',
  status: 'gl-step-status',
  notes: 'gl-step-notes',
};
var GL_STEP_NUMERIC = ['currentBudget', 'proposedBudget', 'cooldown', 'rollbackValue'];
function scaleStepForecast(step, candidate) {
  var current = glZero(step.currentBudget),
    proposed = glZero(step.proposedBudget),
    ratio = current > 0 ? proposed / current : 1,
    days = Math.max(1, glZero(candidate && candidate.stableDays) || 1);
  var baseline =
    candidate && candidate.orders > 0
      ? candidate.orders / days
      : candidate && candidate.targetCpa > 0
        ? current / candidate.targetCpa
        : 0;
  function projected(elasticity) {
    return baseline * Math.max(0, 1 + (ratio - 1) * elasticity);
  }
  return {
    increase: current > 0 ? (proposed / current - 1) * 100 : null,
    conservative: projected(0.45),
    base: projected(0.7),
    aggressive: projected(1),
  };
}
function glStepPreview() {
  var step = glReadFields(GL_STEP_FIELDS, GL_STEP_NUMERIC),
    candidate = scaleCandidates.find((entry) => entry.id === step.candidateId),
    forecast = scaleStepForecast(step, candidate || {}),
    rec = candidate ? glScaleStructure(candidate) : '—';
  $('gl-step-increase').textContent = forecast.increase == null ? '—' : glPct(forecast.increase, 0);
  $('gl-step-rec').textContent = rec;
  $('gl-step-conservative').textContent = forecast.conservative
    ? forecast.conservative.toFixed(1)
    : '—';
  $('gl-step-base').textContent = forecast.base ? forecast.base.toFixed(1) : '—';
  $('gl-step-aggressive').textContent = forecast.aggressive ? forecast.aggressive.toFixed(1) : '—';
  var note = $('gl-step-note');
  if (!candidate) {
    note.className = 'note';
    note.textContent =
      'Select a scale candidate to apply its evidence, budget, targets, and structure recommendation.';
  } else if (scaleAssessment(candidate).decision !== 'Ready') {
    note.className = 'note bad';
    note.textContent =
      'This candidate is ' +
      scaleAssessment(candidate).decision.toLowerCase() +
      '. Planning is allowed, but execution should wait until its failed or missing gates are resolved.';
  } else if (forecast.increase > 25) {
    note.className = 'note warn';
    note.textContent =
      'This is a ' +
      forecast.increase.toFixed(0) +
      '% increase. Break it into steps of 25% or less and re-read marginal efficiency after each cooldown.';
  } else {
    note.className = 'note good';
    note.textContent =
      'The step stays inside the controlled-increase range. Forecasts are scenarios, not promises; the declared rollback rule remains the decision boundary.';
  }
}
function glStepReset() {
  glStepEditing = '';
  glWriteFields(GL_STEP_FIELDS, {
    date: glToday(),
    method: 'Vertical budget increase',
    structure: 'Use recommendation',
    cooldown: 72,
    recheck: glAddDays(3),
    rollbackMetric: 'Marginal CPA',
    status: 'Planned',
  });
  $('gl-step-save').textContent = 'Save step and log change';
  $('gl-step-cancel').hidden = true;
  glScaleCandidateOptions();
  glStepPreview();
}
function glPlanScale(id) {
  var candidate = scaleCandidates.find((entry) => entry.id === id);
  if (!candidate) return;
  glStepReset();
  $('gl-step-candidate').value = id;
  $('gl-step-current').value = candidate.budget || '';
  $('gl-step-proposed').value = candidate.budget ? Math.round(candidate.budget * 1.2) : '';
  $('gl-step-rollback-metric').value = candidate.targetCpa ? 'Marginal CPA' : 'Marginal ROAS';
  $('gl-step-rollback-value').value = candidate.targetCpa
    ? Number(candidate.targetCpa * 1.15).toFixed(2)
    : candidate.targetRoas
      ? Number(candidate.targetRoas * 0.85).toFixed(2)
      : '';
  $('gl-step-notes').value = scaleAssessment(candidate).next;
  glStepPreview();
  setActive('scaleops');
  $('gl-step-candidate').focus();
  toast('Budget ladder prepared');
}
function glStepSave() {
  var step = glReadFields(GL_STEP_FIELDS, GL_STEP_NUMERIC),
    candidate = scaleCandidates.find((entry) => entry.id === step.candidateId);
  if (
    !candidate ||
    !step.date ||
    step.currentBudget == null ||
    step.proposedBudget == null ||
    !step.recheck ||
    step.rollbackValue == null
  ) {
    alert('Select a candidate and complete the budgets, dates, and rollback threshold.');
    return;
  }
  if (step.proposedBudget <= 0 || step.currentBudget <= 0) {
    alert('Current and proposed budgets must be greater than zero.');
    return;
  }
  if (step.recheck < step.date) {
    alert('The recheck date cannot be before the change date.');
    return;
  }
  var forecast = scaleStepForecast(step, candidate);
  step.forecast = forecast;
  step.campaign = candidate.campaign;
  step.account = candidate.account;
  step.product = candidate.product;
  step.recommendation = glScaleStructure(candidate);
  if (glStepEditing) {
    var current = scaleSteps.find((entry) => entry.id === glStepEditing);
    if (current) {
      Object.assign(current, step);
      if (typeof workspaceAudit === 'function')
        workspaceAudit(
          'Scale',
          'Scale step updated',
          step.account + ' / ' + step.campaign,
          current.id,
        );
    }
    toast('Scale step updated');
  } else {
    step.id = glId('step');
    step.created = new Date().toISOString();
    var log = {
      id: glId('change'),
      created: new Date().toISOString(),
      sourceActionId: '',
      sourceType: 'Scale control room',
      date: step.date,
      scope: candidate.account + ' / ' + candidate.campaign,
      type: 'Budget',
      status:
        step.status === 'Success'
          ? 'Successful'
          : step.status === 'Rolled back'
            ? 'Unsuccessful'
            : 'Cooldown',
      before: glMoney(step.currentBudget) + '/day',
      after: glMoney(step.proposedBudget) + '/day',
      cooldown: step.cooldown,
      recheck: step.recheck,
      reason: step.notes || 'Controlled ' + step.method.toLowerCase() + '.',
      expected:
        'Incremental orders while ' +
        step.rollbackMetric.toLowerCase() +
        ' remains inside ' +
        step.rollbackValue +
        '.',
      result: '',
    };
    changeRecords.push(log);
    step.changeId = log.id;
    scaleSteps.push(step);
    if (typeof workspaceAudit === 'function')
      workspaceAudit(
        'Scale',
        'Scale step created',
        step.account +
          ' / ' +
          step.campaign +
          ' · ' +
          glMoney(step.currentBudget) +
          ' to ' +
          glMoney(step.proposedBudget),
        step.id,
      );
    toast('Scale step saved and change logged');
  }
  glStepReset();
  renderScaleControl();
  if (typeof renderChanges === 'function') renderChanges();
}
function glStepEdit(id) {
  var step = scaleSteps.find((entry) => entry.id === id);
  if (!step) return;
  glStepEditing = id;
  glWriteFields(GL_STEP_FIELDS, step);
  $('gl-step-save').textContent = 'Update scale step';
  $('gl-step-cancel').hidden = false;
  glStepPreview();
  window.scrollTo(0, 0);
}
function glStepStatus(id, status) {
  var step = scaleSteps.find((entry) => entry.id === id);
  if (!step) return;
  step.status = status;
  var change = changeRecords.find((entry) => entry.id === step.changeId);
  if (change) {
    change.status =
      status === 'Success'
        ? 'Successful'
        : status === 'Rolled back'
          ? 'Unsuccessful'
          : status === 'Hold'
            ? 'Inconclusive'
            : 'Cooldown';
    if (status === 'Rolled back')
      change.result = 'Rolled back after the declared guardrail failed.';
    if (status === 'Success')
      change.result = 'Increment held through the cooldown and cleared the guardrail.';
  }
  if (status === 'Success') {
    var candidate = scaleCandidates.find((entry) => entry.id === step.candidateId);
    if (candidate) candidate.budget = step.proposedBudget;
  }
  if (typeof workspaceAudit === 'function')
    workspaceAudit(
      'Scale',
      'Scale step marked ' + status.toLowerCase(),
      step.account + ' / ' + step.campaign,
      step.id,
    );
  renderScaleControl();
  if (typeof renderChanges === 'function') renderChanges();
  toast('Scale step marked ' + status.toLowerCase());
}
function renderScaleSteps() {
  var filter = $('gl-step-filter').value,
    items = scaleSteps
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .filter((step) => !filter || step.status === filter);
  $('gl-sc-cooldowns').textContent = scaleSteps.filter(
    (step) => step.status === 'Cooldown' || step.status === 'Planned',
  ).length;
  $('gl-sc-rollbacks').textContent = scaleSteps.filter(
    (step) => step.status === 'Rolled back',
  ).length;
  $('gl-step-count').textContent = items.length + ' of ' + scaleSteps.length + ' steps';
  $('gl-step-rows').innerHTML = items.length
    ? items
        .map((step) => {
          var f = step.forecast || {},
            status = step.status;
          return (
            '<tr><td><span class="ops-date">' +
            glEsc(step.date) +
            '</span><span class="ops-main">' +
            glEsc(step.account + ' / ' + step.campaign) +
            '</span><span class="ops-sub">' +
            glEsc(step.product || 'No lane') +
            '</span></td><td><span class="growth-kpi">' +
            glMoney(step.currentBudget) +
            ' → ' +
            glMoney(step.proposedBudget) +
            '</span><span class="ops-sub">' +
            glPct(f.increase, 0) +
            '</span></td><td>' +
            glEsc(step.method) +
            '<span class="ops-sub">' +
            glEsc(step.structure === 'Use recommendation' ? step.recommendation : step.structure) +
            '</span></td><td><span class="growth-kpi"><b>Low</b>' +
            (f.conservative ? f.conservative.toFixed(1) : '—') +
            '</span><span class="growth-kpi"><b>Base</b>' +
            (f.base ? f.base.toFixed(1) : '—') +
            '</span><span class="growth-kpi"><b>High</b>' +
            (f.aggressive ? f.aggressive.toFixed(1) : '—') +
            '</span></td><td>' +
            glEsc(step.rollbackMetric) +
            '<span class="ops-sub">' +
            glEsc(step.rollbackValue) +
            '</span></td><td><span class="ops-date">' +
            glEsc(step.recheck) +
            '</span><span class="ops-sub">' +
            glZero(step.cooldown) +
            'h cooldown</span></td><td><span class="growth-verdict ' +
            glSlug(status) +
            '">' +
            glEsc(status) +
            '</span></td><td><div class="ops-actions">' +
            (status === 'Planned'
              ? '<button type="button" data-step-status="Cooldown" data-step-id="' +
                step.id +
                '">Launch</button>'
              : '') +
            (status === 'Cooldown'
              ? '<button type="button" data-step-status="Success" data-step-id="' +
                step.id +
                '">Success</button><button type="button" data-step-status="Hold" data-step-id="' +
                step.id +
                '">Hold</button><button type="button" data-step-status="Rolled back" data-step-id="' +
                step.id +
                '">Roll back</button>'
              : '') +
            '<button type="button" data-step-edit="' +
            step.id +
            '">Edit</button><button type="button" class="danger" data-step-remove="' +
            step.id +
            '">Remove</button></div></td></tr>'
          );
        })
        .join('')
    : glEmpty(
        8,
        'No scale steps logged',
        'Plan a controlled increase from a candidate that cleared the gate.',
      );
}
function renderPortfolio() {
  var budget = glNum($('gl-portfolio-budget').value) || 0,
    eligible = scaleCandidates.filter(
      (candidate) => scaleAssessment(candidate).decision === 'Ready',
    ),
    total = eligible.reduce((sum, candidate) => sum + glScaleScore(candidate), 0);
  $('gl-portfolio-rows').innerHTML = eligible.length
    ? eligible
        .map((candidate) => {
          var score = glScaleScore(candidate),
            raw = total ? (budget * score) / total : 0,
            cap = glZero(candidate.budget) * 0.25,
            allocation = Math.min(raw, cap || raw),
            constraint = raw > allocation ? 'Capped at 25% step' : 'Inside step cap';
          return (
            '<tr><td><span class="ops-main">' +
            glEsc(candidate.campaign) +
            '</span><span class="ops-sub">' +
            glEsc(candidate.product || candidate.account) +
            '</span></td><td><span class="growth-verdict ready">Ready</span></td><td class="num growth-score">' +
            score +
            '</td><td class="num">' +
            glMoney(allocation) +
            '</td><td class="num">' +
            glMoney(glZero(candidate.budget) + allocation) +
            '</td><td>' +
            constraint +
            '</td></tr>'
          );
        })
        .join('')
    : glEmpty(
        6,
        'No eligible candidates',
        'Only candidates with every scale gate cleared receive incremental budget.',
      );
}
function renderScaleControl() {
  renderScaleCandidates();
  renderScaleSteps();
  renderPortfolio();
  glScalePreview();
  renderGrowthHome();
  growthRefreshReport();
}

/* ---------- creative research backlog ---------- */
var GL_IDEA_FIELDS = {
  product: 'gl-idea-product',
  awareness: 'gl-idea-awareness',
  source: 'gl-idea-source',
  competitor: 'gl-idea-competitor',
  pain: 'gl-idea-pain',
  outcome: 'gl-idea-outcome',
  concept: 'gl-idea-concept',
  angle: 'gl-idea-angle',
  hook: 'gl-idea-hook',
  format: 'gl-idea-format',
  creator: 'gl-idea-creator',
  offer: 'gl-idea-offer',
  claim: 'gl-idea-claim',
  priority: 'gl-idea-priority',
  difficulty: 'gl-idea-difficulty',
  status: 'gl-idea-status',
};
function glIdeaReset() {
  glIdeaEditing = '';
  glWriteFields(GL_IDEA_FIELDS, {
    awareness: 'Problem aware',
    source: 'Customer review',
    format: 'UGC video',
    priority: 'Medium',
    difficulty: 'Medium',
    status: 'Backlog',
  });
  $('gl-idea-save').textContent = 'Add backlog item';
  $('gl-idea-cancel').hidden = true;
}
function glIdeaSave() {
  var item = glReadFields(GL_IDEA_FIELDS, []);
  if (!item.product || !item.pain || !item.outcome || !item.concept) {
    alert('Enter the product, customer pain, desired outcome, and concept.');
    return;
  }
  if (glIdeaEditing) {
    var current = creativeIdeas.find((entry) => entry.id === glIdeaEditing);
    if (current) {
      Object.assign(current, item);
      if (typeof workspaceAudit === 'function')
        workspaceAudit(
          'Creative',
          'Backlog item updated',
          item.product + ' · ' + item.concept,
          current.id,
        );
    }
    toast('Backlog item updated');
  } else {
    item.id = glId('idea');
    item.created = new Date().toISOString();
    creativeIdeas.push(item);
    if (typeof workspaceAudit === 'function')
      workspaceAudit(
        'Creative',
        'Backlog item added',
        item.product + ' · ' + item.concept,
        item.id,
      );
    toast('Backlog item added');
  }
  glIdeaReset();
  renderCreativeIdeas();
  renderGrowthHome();
  growthRefreshReport();
}
function glIdeaEdit(id) {
  var item = creativeIdeas.find((entry) => entry.id === id);
  if (!item) return;
  glIdeaEditing = id;
  glWriteFields(GL_IDEA_FIELDS, item);
  $('gl-idea-save').textContent = 'Update backlog item';
  $('gl-idea-cancel').hidden = false;
  window.scrollTo(0, 0);
}
function glIdeaToAsset(id) {
  var item = creativeIdeas.find((entry) => entry.id === id);
  if (!item) return;
  glAssetReset();
  glWriteFields(GL_ASSET_FIELDS, {
    date: glToday(),
    platform: item.format === 'Search ad' ? 'Google Ads' : 'Meta Ads',
    product: item.product,
    concept: item.concept,
    angle: item.angle,
    hook: item.hook,
    format: item.format,
    creator: item.creator,
    offer: item.offer,
    claimId: item.claim,
    status: 'Testing',
    targetCpa: 120,
    targetRoas: 2.5,
    minimumRead: 360,
    fairDelivery: 'unknown',
    eligibility: 'Unknown',
    personal: 'review',
    beforeAfter: 'review',
    testimonial: 'review',
    landing: 'review',
    disclaimer: 'review',
    authorization: 'review',
  });
  glAssetPreview();
  item.status = 'Ready to test';
  renderCreativeIdeas();
  $('gl-ca-id').focus();
  toast('Backlog item loaded into the asset scorecard');
}
function glPopulateExperiment(data) {
  xtResetForm();
  $('xt-name').value = data.name || '';
  $('xt-channel').value = data.channel || 'Meta Ads';
  $('xt-product').value = data.product || '';
  $('xt-test-type').value = data.testType || 'Meta creative A/B';
  $('xt-test-mode').value = data.testMode || 'ABO cells';
  $('xt-budget').value = data.budget || '';
  $('xt-hypothesis').value = data.hypothesis || '';
  $('xt-variable').value = data.variable || 'Creative concept';
  $('xt-control').value = data.control || 'Current best performer';
  $('xt-variant').value = data.variant || '';
  $('xt-metric').value = data.metric || 'CPA';
  $('xt-guardrail').value =
    data.guardrail || 'Backend CPA and valid-order rate must not deteriorate';
  $('xt-read').value = data.read || '$360 per variant or 10 backend orders';
  $('xt-split').value = data.split || 50;
  $('xt-audience-control').value =
    data.audienceControl || 'Same audience, exclusions, geo and optimization event';
  $('xt-placement-control').value =
    data.placementControl || 'Same placements, device mix and schedule';
  $('xt-winner-rule').value =
    data.winnerRule || 'Best primary metric after minimum read while guardrail holds';
  $('xt-stop-loss').value = data.stopLoss || 'Stop after 1.5× target CPA with zero backend orders';
  $('xt-compliance-gate').value =
    data.compliance || 'Claim reference, destination and required authorization approved';
  setActive('experiments');
  $('xt-name').focus();
}
function glIdeaToExperiment(id) {
  var item = creativeIdeas.find((entry) => entry.id === id);
  if (!item) return;
  glPopulateExperiment({
    name: item.product + ' · ' + item.concept + ' · ' + (item.hook || item.angle),
    channel: item.format === 'Search ad' ? 'Google Ads' : 'Meta Ads',
    product: item.product,
    testType: item.format === 'Search ad' ? 'Google RSA angle test' : 'Meta creative A/B',
    testMode: item.format === 'Search ad' ? 'Google traffic split' : 'ABO cells',
    hypothesis:
      'If we lead with ' +
      (item.angle || item.concept) +
      ', then ' +
      item.outcome.toLowerCase() +
      ' because it directly addresses ' +
      item.pain.toLowerCase() +
      '.',
    variable: item.hook ? 'Hook' : item.angle ? 'Creative concept' : 'Creative concept',
    variant: [item.concept, item.angle, item.hook].filter(Boolean).join(' / '),
    compliance: item.claim
      ? 'Approved claim ' + item.claim + ' and destination review required'
      : 'Claim reference and destination approval required',
  });
  item.status = 'Briefing';
  renderCreativeIdeas();
  toast('Clean test prepared from the backlog');
}
function renderCreativeIdeas() {
  var order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  var items = creativeIdeas
    .slice()
    .sort(
      (a, b) =>
        order[a.priority] - order[b.priority] || String(a.created).localeCompare(String(b.created)),
    );
  $('gl-idea-total').textContent = creativeIdeas.filter(
    (item) => item.status !== 'Archived',
  ).length;
  $('gl-idea-rows').innerHTML = items.length
    ? items
        .map(
          (item) =>
            '<tr><td><span class="ops-badge ' +
            glSlug(item.priority) +
            '">' +
            glEsc(item.priority) +
            '</span><span class="ops-sub">' +
            glEsc(item.awareness) +
            '</span></td><td><span class="ops-main">' +
            glEsc(item.pain) +
            '</span><span class="ops-sub">Outcome: ' +
            glEsc(item.outcome) +
            '</span><span class="ops-source">' +
            glEsc(item.source) +
            (item.competitor ? ' · ' + glEsc(item.competitor) : '') +
            '</span></td><td><span class="ops-main">' +
            glEsc(item.concept) +
            '</span><span class="ops-sub">Angle: ' +
            glEsc(item.angle || 'Not set') +
            '</span><span class="ops-sub">Hook: ' +
            glEsc(item.hook || 'Not set') +
            '</span></td><td>' +
            glEsc(item.format) +
            '<span class="ops-sub">' +
            glEsc(item.creator || 'Creator open') +
            ' · ' +
            glEsc(item.difficulty) +
            ' effort</span><span class="ops-sub">Offer: ' +
            glEsc(item.offer || 'Held constant') +
            '</span></td><td>' +
            glEsc(item.claim || 'Missing') +
            '</td><td><span class="ops-badge ' +
            glSlug(item.status) +
            '">' +
            glEsc(item.status) +
            '</span></td><td><div class="ops-actions"><button type="button" data-idea-test="' +
            item.id +
            '">Create test</button><button type="button" data-idea-asset="' +
            item.id +
            '">Log asset</button><button type="button" data-idea-edit="' +
            item.id +
            '">Edit</button><button type="button" class="danger" data-idea-remove="' +
            item.id +
            '">Remove</button></div></td></tr>',
        )
        .join('')
    : glEmpty(
        7,
        'The research backlog is empty',
        'Capture one customer tension and the testable creative territory it suggests.',
      );
}

/* ---------- creative performance scorecard ---------- */
var GL_ASSET_FIELDS = {
  date: 'gl-ca-date',
  platform: 'gl-ca-platform',
  campaign: 'gl-ca-campaign',
  adSet: 'gl-ca-adset',
  creativeId: 'gl-ca-id',
  product: 'gl-ca-product',
  concept: 'gl-ca-concept',
  angle: 'gl-ca-angle',
  hook: 'gl-ca-hook',
  format: 'gl-ca-format',
  creator: 'gl-ca-creator',
  offer: 'gl-ca-offer',
  status: 'gl-ca-status',
  replacementDate: 'gl-ca-replacement-date',
  assetUrl: 'gl-ca-asset-url',
  parentId: 'gl-ca-parent-id',
  version: 'gl-ca-version',
  primaryText: 'gl-ca-primary-text',
  headline: 'gl-ca-headline',
  landingUrl: 'gl-ca-landing-url',
  assignee: 'gl-ca-assignee',
  productionStage: 'gl-ca-production-stage',
  targetCpa: 'gl-ca-target-cpa',
  targetRoas: 'gl-ca-target-roas',
  minimumRead: 'gl-ca-min-read',
  fairDelivery: 'gl-ca-fair-delivery',
  spend: 'gl-ca-spend',
  impressions: 'gl-ca-impressions',
  threeSecondPlays: 'gl-ca-3s',
  thruplays: 'gl-ca-thruplays',
  clicks: 'gl-ca-clicks',
  lpv: 'gl-ca-lpv',
  atc: 'gl-ca-atc',
  checkouts: 'gl-ca-checkouts',
  platformPurchases: 'gl-ca-platform-purchases',
  backendOrders: 'gl-ca-backend-orders',
  revenue: 'gl-ca-revenue',
  newCustomers: 'gl-ca-new-customers',
  contribution: 'gl-ca-contribution',
  refunds: 'gl-ca-refunds',
  frequency: 'gl-ca-frequency',
  priorCtr: 'gl-ca-prior-ctr',
  priorCpa: 'gl-ca-prior-cpa',
  daysLive: 'gl-ca-days-live',
  spendShare: 'gl-ca-spend-share',
  eligibility: 'gl-ca-eligibility',
  claimId: 'gl-ca-claim-id',
  claimSource: 'gl-ca-claim-source',
  personal: 'gl-ca-personal',
  beforeAfter: 'gl-ca-before-after',
  testimonial: 'gl-ca-testimonial',
  landing: 'gl-ca-landing',
  disclaimer: 'gl-ca-disclaimer',
  authorization: 'gl-ca-authorization',
  reviewer: 'gl-ca-reviewer',
  approvalDate: 'gl-ca-approval-date',
  reviewDate: 'gl-ca-review-date',
};
var GL_ASSET_NUMERIC = [
  'targetCpa',
  'targetRoas',
  'minimumRead',
  'spend',
  'impressions',
  'threeSecondPlays',
  'thruplays',
  'clicks',
  'lpv',
  'atc',
  'checkouts',
  'platformPurchases',
  'backendOrders',
  'revenue',
  'newCustomers',
  'contribution',
  'refunds',
  'frequency',
  'priorCtr',
  'priorCpa',
  'daysLive',
  'spendShare',
];
function creativeMetrics(asset) {
  var orders = asset.backendOrders != null ? asset.backendOrders : asset.platformPurchases,
    spend = glZero(asset.spend),
    impressions = glZero(asset.impressions),
    clicks = glZero(asset.clicks),
    plays = glZero(asset.threeSecondPlays),
    isVideo = !/static|carousel|search/i.test(asset.format || '');
  var ctr = impressions ? (clicks / impressions) * 100 : null,
    cpa = orders > 0 ? spend / orders : null;
  return {
    orders: orders,
    source: asset.backendOrders != null ? 'Backend' : 'Platform fallback',
    hook: isVideo && impressions ? (plays / impressions) * 100 : null,
    hold: isVideo && plays ? (glZero(asset.thruplays) / plays) * 100 : null,
    ctr: ctr,
    cpc: clicks ? spend / clicks : null,
    lpvRate: clicks ? (glZero(asset.lpv) / clicks) * 100 : null,
    atcRate: asset.lpv > 0 ? (glZero(asset.atc) / asset.lpv) * 100 : null,
    checkoutStart: asset.atc > 0 ? (glZero(asset.checkouts) / asset.atc) * 100 : null,
    checkoutComplete: asset.checkouts > 0 ? (glZero(orders) / asset.checkouts) * 100 : null,
    cpa: cpa,
    roas: spend && asset.revenue != null ? asset.revenue / spend : null,
    newCpa: asset.newCustomers > 0 ? spend / asset.newCustomers : null,
    aov: orders > 0 ? glZero(asset.revenue) / orders : null,
    contributionAfterMedia: asset.contribution != null ? asset.contribution - spend : null,
    refundRate: orders > 0 && asset.refunds != null ? (asset.refunds / orders) * 100 : null,
    ctrDrop:
      asset.priorCtr > 0 && ctr != null ? ((asset.priorCtr - ctr) / asset.priorCtr) * 100 : null,
    cpaRise:
      asset.priorCpa > 0 && cpa != null ? ((cpa - asset.priorCpa) / asset.priorCpa) * 100 : null,
  };
}
function creativeCompliance(asset) {
  var blockers = [],
    reviews = [];
  if (asset.eligibility === 'Not eligible') blockers.push('Product or claim is not eligible.');
  else if (asset.eligibility === 'Unknown') reviews.push('Eligibility is unclassified.');
  [
    ['personal', 'Personal attributes'],
    ['beforeAfter', 'Before / after'],
    ['testimonial', 'Testimonial'],
    ['landing', 'Landing page'],
    ['disclaimer', 'Disclaimer'],
    ['authorization', 'Authorization'],
  ].forEach((entry) => {
    if (asset[entry[0]] === 'no') blockers.push(entry[1] + ' is blocked.');
    else if (asset[entry[0]] !== 'yes') reviews.push(entry[1] + ' needs review.');
  });
  if (!asset.claimId) reviews.push('Approved claim ID is missing.');
  if (!asset.claimSource) reviews.push('Claim source is missing.');
  if (!asset.reviewer || !asset.approvalDate)
    reviews.push('Reviewer and approval date are incomplete.');
  if (asset.reviewDate && asset.reviewDate < glToday())
    reviews.push('Compliance review date has passed.');
  return {
    status: blockers.length ? 'Blocked' : reviews.length ? 'Review due' : 'Approved',
    state: blockers.length ? 'fail' : reviews.length ? 'warn' : 'pass',
    reasons: blockers.concat(reviews),
  };
}
function creativeFatigue(asset, refreshDays) {
  var metric = creativeMetrics(asset),
    signals = [],
    frequency = typeof wsRuleValue === 'function' ? wsRuleValue('frequencyHigh', asset, 2.5) : 2.5,
    cadence =
      refreshDays ||
      (typeof wsRuleValue === 'function' ? wsRuleValue('refreshDays', asset, 14) : 14);
  if (asset.frequency > frequency) signals.push('Frequency ' + Number(asset.frequency).toFixed(1));
  if (metric.ctrDrop > 20) signals.push('CTR down ' + metric.ctrDrop.toFixed(0) + '%');
  if (metric.cpaRise > 25) signals.push('CPA up ' + metric.cpaRise.toFixed(0) + '%');
  if (asset.spendShare > 50)
    signals.push('Spend share ' + Number(asset.spendShare).toFixed(0) + '%');
  if (asset.daysLive > cadence) signals.push(glZero(asset.daysLive) + ' days live');
  return {
    level: signals.length >= 2 ? 'High risk' : signals.length === 1 ? 'Watch' : 'Healthy',
    signals: signals,
  };
}
function creativeVerdict(asset) {
  var metric = creativeMetrics(asset),
    compliance = creativeCompliance(asset),
    minimum =
      asset.minimumRead != null ? asset.minimumRead : asset.targetCpa > 0 ? asset.targetCpa * 3 : 0,
    label = 'Kill',
    reason = 'The asset cleared the read without an efficient or diagnosable signal.',
    action = 'Archive it with a failure hypothesis.';
  if (compliance.status !== 'Approved') {
    label = 'Blocked';
    reason = compliance.reasons[0] || 'Compliance approval is incomplete.';
    action =
      compliance.status === 'Blocked'
        ? 'Stop delivery and resolve the compliance packet.'
        : 'Complete the compliance review before launch or graduation.';
  } else if (glZero(asset.spend) < minimum || glZero(asset.impressions) < 1000) {
    label = 'Insufficient read';
    reason = 'Spend or impressions have not cleared the declared read.';
    action = 'Keep the cell unchanged until it clears the read.';
  } else if (asset.fairDelivery === 'no') {
    label = 'Retest';
    reason = 'The asset was starved, so performance is confounded by delivery.';
    action = 'Retest with guaranteed spend in a clean cell.';
  } else if (metric.hook != null && metric.hook < 20) {
    label = 'Iterate hook';
    reason = 'The opening did not earn enough three-second views.';
    action = 'Keep the concept and replace the first frame or opening line.';
  } else if (metric.hold != null && metric.hold < 15) {
    label = 'Iterate body';
    reason = 'The opening worked, but the body lost attention.';
    action = 'Tighten proof, pacing, demonstration, or story progression.';
  } else if (
    metric.ctr != null &&
    metric.ctr < (typeof wsRuleValue === 'function' ? wsRuleValue('ctrLow', asset, 0.9) : 0.9)
  ) {
    label = 'Iterate click';
    reason = 'Attention did not turn into qualified outbound action.';
    action = 'Strengthen the reason to care, product connection, or CTA.';
  } else if (
    metric.lpvRate != null &&
    metric.lpvRate < (typeof wsRuleValue === 'function' ? wsRuleValue('lpvLow', asset, 65) : 65)
  ) {
    label = 'Destination';
    reason = 'Clicks are not reliably becoming landing-page views.';
    action = 'Fix speed, redirects, destination health, or click quality.';
  } else if (
    metric.atcRate != null &&
    metric.atcRate < (typeof wsRuleValue === 'function' ? wsRuleValue('atcLow', asset, 4) : 4)
  ) {
    label = 'Offer';
    reason = 'Traffic arrived but the product page did not create enough cart intent.';
    action = 'Work message match, proof, price, stock, trust, and offer.';
  } else if (
    (metric.checkoutStart != null &&
      metric.checkoutStart <
        (typeof wsRuleValue === 'function' ? wsRuleValue('checkoutLow', asset, 40) : 40)) ||
    (metric.checkoutComplete != null &&
      metric.checkoutComplete <
        (typeof wsRuleValue === 'function' ? wsRuleValue('checkoutLow', asset, 40) : 40))
  ) {
    label = 'Checkout';
    reason = 'Qualified demand leaked in cart or checkout.';
    action = 'Fix shipping disclosure, gateway errors, mobile friction, or valid-order loss.';
  } else if (asset.backendOrders == null) {
    label = 'Support';
    reason = 'The asset cleared its media read, but backend commercial truth is missing.';
    action = 'Reconcile valid orders before graduation.';
  } else if (asset.platformPurchases > 0 && asset.backendOrders === 0) {
    label = 'Support';
    reason = 'Platform purchases did not become valid backend orders.';
    action = 'Inspect event quality, cancellations, eligibility, and fulfilment.';
  } else if (metric.refundRate != null && metric.refundRate > 15) {
    label = 'Support';
    reason =
      'Refund rate is ' +
      metric.refundRate.toFixed(0) +
      '%, so attributed purchases are not creating durable commercial value.';
    action = 'Inspect product fit, claims, fulfilment, and refund reasons before graduation.';
  } else if (metric.contributionAfterMedia != null && metric.contributionAfterMedia < 0) {
    label = 'Support';
    reason = 'Contribution after media is negative despite the attributed conversion result.';
    action =
      'Reconcile product margin, discounts, fulfilment cost, and paid acquisition before graduation.';
  } else {
    var cpaPass = !asset.targetCpa || (metric.cpa != null && metric.cpa <= asset.targetCpa),
      roasPass = !asset.targetRoas || (metric.roas != null && metric.roas >= asset.targetRoas);
    if (metric.orders > 0 && cpaPass && roasPass) {
      label = 'Graduate';
      reason = 'Backend efficiency clears the target after the minimum read.';
      action = 'Create a scale candidate and enter at a controlled share.';
    } else if (metric.ctr != null && metric.ctr >= 1.2 && metric.orders === 0) {
      label = 'Support';
      reason = 'Traffic quality is healthy but no valid orders are attributed.';
      action = 'Use an account-level pause or holdout to test assist value.';
    }
  }
  return { label: label, reason: reason, action: action, metric: metric, compliance: compliance };
}
function glAssetPreview() {
  var asset = glReadFields(GL_ASSET_FIELDS, GL_ASSET_NUMERIC),
    verdict = creativeVerdict(asset),
    fatigue = creativeFatigue(asset, glNum($('gl-refresh-days').value) || 14);
  var gates = [
    {
      name: 'Read',
      state:
        glZero(asset.spend) >= (asset.minimumRead || 0) && glZero(asset.impressions) >= 1000
          ? 'pass'
          : 'warn',
    },
    {
      name: 'Delivery',
      state: asset.fairDelivery === 'yes' ? 'pass' : asset.fairDelivery === 'no' ? 'fail' : 'warn',
    },
    { name: 'Backend', state: asset.backendOrders != null ? 'pass' : 'warn' },
    { name: 'Compliance', state: verdict.compliance.state },
    {
      name: 'Fatigue',
      state: fatigue.level === 'Healthy' ? 'pass' : fatigue.level === 'Watch' ? 'warn' : 'fail',
    },
  ];
  $('gl-ca-preview').innerHTML =
    '<div><div class="growth-decision"><span class="growth-verdict ' +
    glSlug(verdict.label) +
    '">' +
    glEsc(verdict.label) +
    '</span></div><span class="ops-sub">' +
    glEsc(verdict.reason) +
    '</span></div><div>' +
    glGateHtml(gates) +
    '<span class="ops-sub">Next: ' +
    glEsc(verdict.action) +
    '</span></div>';
}
function glAssetReset() {
  glAssetEditing = '';
  glWriteFields(GL_ASSET_FIELDS, {
    date: glToday(),
    platform: 'Meta Ads',
    format: 'UGC video',
    status: 'Testing',
    productionStage: 'Ready for testing',
    targetCpa: 120,
    targetRoas: 2.5,
    minimumRead: 360,
    fairDelivery: 'yes',
    eligibility: 'Unrestricted',
    personal: 'yes',
    beforeAfter: 'yes',
    testimonial: 'yes',
    landing: 'yes',
    disclaimer: 'yes',
    authorization: 'yes',
  });
  $('gl-ca-save').textContent = 'Add creative result';
  $('gl-ca-cancel').hidden = true;
  glAssetPreview();
}
function glAssetSave() {
  var asset = glReadFields(GL_ASSET_FIELDS, GL_ASSET_NUMERIC);
  if (
    !asset.date ||
    !asset.campaign ||
    !asset.creativeId ||
    !asset.concept ||
    asset.spend == null ||
    asset.impressions == null
  ) {
    alert('Enter the date, campaign, creative ID, concept, spend, and impressions.');
    return;
  }
  var duplicate = creativeAssets.find(
    (entry) =>
      entry.id !== glAssetEditing &&
      entry.date === asset.date &&
      entry.campaign === asset.campaign &&
      entry.creativeId === asset.creativeId,
  );
  if (duplicate) {
    alert(
      'This creative already has a result for the selected date and campaign. Edit the existing row.',
    );
    return;
  }
  if (glAssetEditing) {
    var current = creativeAssets.find((entry) => entry.id === glAssetEditing);
    if (current) {
      Object.assign(current, asset);
      current.updated = new Date().toISOString();
      if (typeof workspaceAudit === 'function')
        workspaceAudit('Creative', 'Creative result updated', asset.creativeId, current.id);
    }
    toast('Creative result updated');
  } else {
    asset.id = glId('asset');
    asset.created = new Date().toISOString();
    creativeAssets.push(asset);
    if (typeof workspaceAudit === 'function')
      workspaceAudit('Creative', 'Creative result added', asset.creativeId, asset.id);
    toast('Creative result added');
  }
  glAssetReset();
  renderCreativeIntelligence();
  if (typeof renderCreativeLearning === 'function') renderCreativeLearning();
}
function glAssetEdit(id) {
  var asset = creativeAssets.find((entry) => entry.id === id);
  if (!asset) return;
  glAssetEditing = id;
  glWriteFields(GL_ASSET_FIELDS, asset);
  $('gl-ca-save').textContent = 'Update creative result';
  $('gl-ca-cancel').hidden = false;
  glAssetPreview();
  window.scrollTo(0, 0);
}
function glAssetToScale(id) {
  var asset = creativeAssets.find((entry) => entry.id === id);
  if (!asset) return;
  var same = creativeAssets.filter(
      (entry) => entry.campaign === asset.campaign && creativeVerdict(entry).label === 'Graduate',
    ),
    spend = same.reduce((sum, entry) => sum + glZero(entry.spend), 0),
    orders = same.reduce((sum, entry) => sum + glZero(entry.backendOrders), 0),
    revenue = same.reduce((sum, entry) => sum + glZero(entry.revenue), 0),
    maxDays = same.reduce((max, entry) => Math.max(max, glZero(entry.daysLive)), 0);
  glScaleReset();
  glWriteFields(GL_SCALE_FIELDS, {
    platform: asset.platform,
    account: '',
    campaign: asset.campaign,
    product: asset.product,
    stage: 'Prospecting',
    budget: asset.daysLive ? asset.spend / asset.daysLive : asset.spend,
    targetCpa: asset.targetCpa,
    targetRoas: asset.targetRoas,
    spend: spend,
    orders: orders,
    revenue: revenue,
    stableDays: maxDays,
    validatedCreatives: same.length,
    frequency: asset.frequency,
    dataState: 'reconciled',
    learning: 'unknown',
    compliance: creativeCompliance(asset).status === 'Approved' ? 'yes' : 'review',
    inventoryDays: null,
    cashflow: 'unknown',
    notes:
      'Created from graduated creative ' +
      asset.creativeId +
      '. Complete campaign-level delivery, inventory, and cash-flow evidence.',
  });
  glScalePreview();
  setActive('scaleops');
  $('gl-sc-account').focus();
  toast('Winner loaded into the scale gate');
}
function glAssetToIteration(id) {
  var asset = creativeAssets.find((entry) => entry.id === id);
  if (!asset) return;
  var verdict = creativeVerdict(asset);
  creativeIdeas.push({
    id: glId('idea'),
    created: new Date().toISOString(),
    product: asset.product,
    awareness: 'Problem aware',
    source: 'Team insight',
    competitor: '',
    pain: 'Performance finding: ' + verdict.reason,
    outcome: verdict.action,
    concept: asset.concept,
    angle: asset.angle,
    hook: verdict.label === 'Iterate hook' ? 'New hook needed' : asset.hook,
    format: asset.format,
    creator: asset.creator,
    offer: asset.offer,
    claim: asset.claimId,
    priority: 'High',
    difficulty: 'Medium',
    status: 'Backlog',
  });
  renderCreativeIdeas();
  setActive('creativeops');
  toast('Iteration brief added to the backlog');
}
function glAssetToExperiment(id) {
  var asset = creativeAssets.find((entry) => entry.id === id);
  if (!asset) return;
  var verdict = creativeVerdict(asset);
  glPopulateExperiment({
    name: asset.product + ' · iterate ' + asset.creativeId,
    channel: asset.platform,
    product: asset.product,
    testType: asset.platform === 'Google Ads' ? 'Google RSA angle test' : 'Meta creative A/B',
    testMode: asset.platform === 'Google Ads' ? 'Google traffic split' : 'ABO cells',
    hypothesis:
      'If we apply the ' +
      verdict.label.toLowerCase() +
      ' learning, ' +
      verdict.action.toLowerCase(),
    variable:
      verdict.label === 'Iterate hook'
        ? 'Hook'
        : verdict.label === 'Iterate body'
          ? 'Format'
          : 'Creative concept',
    control: asset.creativeId,
    variant: 'Iteration of ' + asset.creativeId,
    read: glMoney(asset.minimumRead) + ' per variant or 10 backend orders',
    compliance:
      'Reuse approved claim ' +
      (asset.claimId || '[missing]') +
      ' only after destination and review-date checks',
  });
  toast('Iteration test prepared');
}
function glAssetQueueIssue(id) {
  var asset = creativeAssets.find((entry) => entry.id === id);
  if (!asset) return;
  var verdict = creativeVerdict(asset),
    sourceId = 'creative:' + id,
    existing = optimizationActions.find(
      (item) => item.sourceId === sourceId && item.status !== 'Resolved',
    );
  if (existing) {
    setActive('actions');
    toast('This creative issue is already in the queue');
    return;
  }
  optimizationActions.push({
    id: glId('action'),
    created: new Date().toISOString(),
    sourceId: sourceId,
    sourceType: 'Creative intelligence',
    diagnosis: '',
    problem: asset.creativeId + ': ' + verdict.reason,
    priority: verdict.label === 'Blocked' ? 'Critical' : 'High',
    recommendation: verdict.action,
    owner: '',
    due: glAddDays(verdict.label === 'Blocked' ? 0 : 1),
    recheck: glAddDays(3),
    status: 'Open',
  });
  renderActions();
  setActive('actions');
  toast('Creative finding added to the optimization queue');
}

function glKpi(label, value, state) {
  return (
    '<span class="growth-kpi' +
    (state ? ' ' + state : '') +
    '"><b>' +
    glEsc(label) +
    '</b>' +
    glEsc(value) +
    '</span>'
  );
}
function glComplianceList(compliance) {
  return (
    '<div class="growth-checklist"><span class="' +
    compliance.state +
    '"><i class="bi ' +
    (compliance.state === 'pass'
      ? 'bi-check-circle'
      : compliance.state === 'fail'
        ? 'bi-x-circle'
        : 'bi-exclamation-circle') +
    '"></i>' +
    glEsc(compliance.status) +
    '</span></div>' +
    (compliance.reasons.length
      ? '<span class="ops-sub">' + glEsc(compliance.reasons[0]) + '</span>'
      : '')
  );
}
function glSafeUrl(value) {
  if (typeof wsSafeLink === 'function') return wsSafeLink(value);
  try {
    var parsed = new URL(value);
    return /^https?:$/.test(parsed.protocol) ? parsed.href : '';
  } catch (error) {
    return '';
  }
}
function renderCreativeAssets() {
  var refresh = glNum($('gl-refresh-days').value) || 14,
    entries = creativeAssets.map((asset) => ({
      asset: asset,
      verdict: creativeVerdict(asset),
      fatigue: creativeFatigue(asset, refresh),
    })),
    query = $('gl-ca-search').value.toLowerCase().trim(),
    filter = $('gl-ca-filter').value;
  $('gl-ca-testing').textContent = creativeAssets.filter(
    (asset) => asset.status === 'Testing',
  ).length;
  $('gl-ca-graduate').textContent = entries.filter(
    (entry) => entry.verdict.label === 'Graduate',
  ).length;
  $('gl-ca-fatigue').textContent = entries.filter(
    (entry) => entry.fatigue.level === 'High risk',
  ).length;
  $('gl-ca-replacements').textContent = entries.filter(
    (entry) => entry.asset.status === 'Replacement ready' && entry.verdict.label === 'Graduate',
  ).length;
  glSetBox(
    'gl-ca-graduate-box',
    entries.some((entry) => entry.verdict.label === 'Graduate') ? 'hi' : '',
  );
  glSetBox(
    'gl-ca-fatigue-box',
    entries.some((entry) => entry.fatigue.level === 'High risk') ? 'lo' : '',
  );
  var items = entries.filter((entry) => {
    var asset = entry.asset,
      haystack = (
        asset.creativeId +
        ' ' +
        asset.concept +
        ' ' +
        asset.angle +
        ' ' +
        asset.hook +
        ' ' +
        asset.creator +
        ' ' +
        asset.campaign
      ).toLowerCase();
    return (!query || haystack.indexOf(query) > -1) && (!filter || entry.verdict.label === filter);
  });
  $('gl-ca-count').textContent = items.length + ' of ' + creativeAssets.length + ' assets';
  $('gl-ca-rows').innerHTML = items.length
    ? items
        .map((entry) => {
          var asset = entry.asset,
            verdict = entry.verdict,
            metric = verdict.metric,
            fatigue = entry.fatigue,
            url = glSafeUrl(asset.assetUrl);
          return (
            '<tr><td><span class="ops-main">' +
            glEsc(asset.creativeId) +
            (asset.version ? ' · ' + glEsc(asset.version) : '') +
            '</span><span class="ops-sub">' +
            glEsc(asset.concept || 'No concept') +
            ' · ' +
            glEsc(asset.angle || 'No angle') +
            '</span><span class="ops-sub">' +
            glEsc(asset.hook || 'No hook') +
            '</span><span class="ops-source">' +
            glEsc(asset.format + ' · ' + (asset.creator || 'No creator')) +
            '</span><span class="ops-sub">' +
            glEsc(asset.productionStage || 'Production stage not set') +
            ' · ' +
            glEsc(asset.assignee || 'Unassigned') +
            (asset.parentId ? ' · parent ' + glEsc(asset.parentId) : '') +
            '</span>' +
            (url
              ? '<a class="ops-source" href="' +
                glEsc(url) +
                '" target="_blank" rel="noopener">Open asset</a>'
              : '') +
            '</td>' +
            '<td>' +
            glKpi('Spend', glMoney(asset.spend)) +
            glKpi('Impr', glZero(asset.impressions).toLocaleString()) +
            glKpi('Share', glPct(asset.spendShare, 0)) +
            glKpi(
              'Read',
              glMoney(asset.minimumRead),
              glZero(asset.spend) >= glZero(asset.minimumRead) ? 'good' : 'warn',
            ) +
            '<span class="ops-sub">' +
            glEsc(
              asset.fairDelivery === 'yes'
                ? 'Fair delivery'
                : asset.fairDelivery === 'no'
                  ? 'Starved'
                  : 'Delivery unknown',
            ) +
            '</span></td>' +
            '<td>' +
            glKpi(
              'Hook',
              glPct(metric.hook, 1),
              metric.hook == null ? '' : metric.hook >= 20 ? 'good' : 'bad',
            ) +
            glKpi(
              'Hold',
              glPct(metric.hold, 1),
              metric.hold == null ? '' : metric.hold >= 15 ? 'good' : 'bad',
            ) +
            '</td>' +
            '<td>' +
            glKpi(
              'CTR',
              glPct(metric.ctr, 2),
              metric.ctr == null ? '' : metric.ctr >= 0.9 ? 'good' : 'bad',
            ) +
            glKpi('CPC', glMoney(metric.cpc, 2)) +
            glKpi(
              'LPV',
              glPct(metric.lpvRate, 0),
              metric.lpvRate == null ? '' : metric.lpvRate >= 65 ? 'good' : 'bad',
            ) +
            '</td>' +
            '<td>' +
            glKpi(
              'ATC',
              glPct(metric.atcRate, 1),
              metric.atcRate == null ? '' : metric.atcRate >= 4 ? 'good' : 'bad',
            ) +
            glKpi(
              'Start',
              glPct(metric.checkoutStart, 0),
              metric.checkoutStart == null ? '' : metric.checkoutStart >= 40 ? 'good' : 'bad',
            ) +
            glKpi(
              'Complete',
              glPct(metric.checkoutComplete, 0),
              metric.checkoutComplete == null ? '' : metric.checkoutComplete >= 40 ? 'good' : 'bad',
            ) +
            '</td>' +
            '<td>' +
            glKpi('Orders', metric.orders == null ? '—' : metric.orders) +
            glKpi(
              'CPA',
              glMoney(metric.cpa),
              metric.cpa == null || !asset.targetCpa
                ? ''
                : metric.cpa <= asset.targetCpa
                  ? 'good'
                  : 'bad',
            ) +
            glKpi(
              'ROAS',
              metric.roas == null ? '—' : metric.roas.toFixed(2),
              metric.roas == null || !asset.targetRoas
                ? ''
                : metric.roas >= asset.targetRoas
                  ? 'good'
                  : 'bad',
            ) +
            glKpi('New CPA', glMoney(metric.newCpa)) +
            glKpi('AOV', glMoney(metric.aov)) +
            glKpi(
              'Contribution',
              glMoney(metric.contributionAfterMedia),
              metric.contributionAfterMedia == null
                ? ''
                : metric.contributionAfterMedia >= 0
                  ? 'good'
                  : 'bad',
            ) +
            glKpi(
              'Refunds',
              glPct(metric.refundRate, 0),
              metric.refundRate == null ? '' : metric.refundRate <= 15 ? 'good' : 'bad',
            ) +
            '<span class="ops-source">' +
            glEsc(metric.source) +
            '</span></td>' +
            '<td><span class="growth-verdict ' +
            (fatigue.level === 'Healthy'
              ? 'ready'
              : fatigue.level === 'Watch'
                ? 'conditional'
                : 'blocked') +
            '">' +
            glEsc(fatigue.level) +
            '</span>' +
            glKpi(
              'CTR slope',
              metric.ctrDrop == null
                ? '—'
                : (metric.ctrDrop >= 0 ? '-' : '+') + Math.abs(metric.ctrDrop).toFixed(0) + '%',
              metric.ctrDrop > 20 ? 'bad' : '',
            ) +
            glKpi(
              'CPA slope',
              metric.cpaRise == null
                ? '—'
                : (metric.cpaRise >= 0 ? '+' : '-') + Math.abs(metric.cpaRise).toFixed(0) + '%',
              metric.cpaRise > 25 ? 'bad' : '',
            ) +
            '<span class="ops-sub">' +
            glEsc(fatigue.signals.join(' · ') || 'No threshold breached') +
            '</span></td>' +
            '<td>' +
            glComplianceList(verdict.compliance) +
            '<span class="ops-sub">Claim ' +
            glEsc(asset.claimId || 'missing') +
            '</span></td>' +
            '<td><span class="growth-verdict ' +
            glSlug(verdict.label) +
            '">' +
            glEsc(verdict.label) +
            '</span><span class="ops-sub">' +
            glEsc(verdict.reason) +
            '</span></td>' +
            '<td><div class="ops-actions">' +
            (verdict.label === 'Graduate'
              ? '<button type="button" data-ca-scale="' + asset.id + '">Send to scale</button>'
              : ['Destination', 'Offer', 'Checkout', 'Support', 'Blocked'].indexOf(verdict.label) >
                  -1
                ? '<button type="button" data-ca-queue="' + asset.id + '">Queue issue</button>'
                : '<button type="button" data-ca-iterate="' +
                  asset.id +
                  '">Iteration brief</button>') +
            '<button type="button" data-ca-test="' +
            asset.id +
            '">Create test</button><button type="button" data-ca-edit="' +
            asset.id +
            '">Edit</button><button type="button" class="danger" data-ca-remove="' +
            asset.id +
            '">Remove</button></div></td></tr>'
          );
        })
        .join('')
    : glEmpty(10, 'No creative results yet', 'Import the creative CSV or enter one asset above.');
}
function glShiftDate(iso, days) {
  if (typeof opsShiftDate === 'function') return opsShiftDate(iso, days);
  var date = new Date((iso || glToday()) + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function renderCreativeSupply() {
  var refresh = glNum($('gl-refresh-days').value) || 14,
    capacity = glNum($('gl-production-capacity').value) || 0,
    active = creativeAssets.filter(
      (asset) => ['Testing', 'Active winner'].indexOf(asset.status) > -1,
    ),
    replacements = creativeAssets.filter(
      (asset) =>
        asset.status === 'Replacement ready' && creativeVerdict(asset).label === 'Graduate',
    ),
    today = glToday(),
    horizon = glShiftDate(today, 14);
  var rows = active
      .map((asset) => {
        var fatigue = creativeFatigue(asset, refresh),
          due = asset.replacementDate || glShiftDate(asset.date || today, refresh),
          needs = fatigue.level !== 'Healthy' || due <= horizon;
        return { asset: asset, fatigue: fatigue, due: due, needs: needs };
      })
      .sort((a, b) => a.due.localeCompare(b.due)),
    dueCount = rows.filter((row) => row.needs).length,
    gap = Math.max(0, dueCount - replacements.length),
    util = capacity ? (dueCount / capacity) * 100 : dueCount ? 100 : 0,
    totalSpend = active.reduce((sum, asset) => sum + glZero(asset.spend), 0),
    top = active.reduce((max, asset) => Math.max(max, glZero(asset.spend)), 0),
    concentration = totalSpend ? (top / totalSpend) * 100 : null;
  $('gl-supply-due').textContent = dueCount;
  $('gl-supply-gap').textContent = gap;
  $('gl-supply-util').textContent = glPct(util, 0);
  $('gl-supply-concentration').textContent = glPct(concentration, 0);
  var note = $('gl-supply-note');
  if (gap > 0) {
    note.className = 'note bad';
    note.textContent =
      'The pipeline is short by ' +
      gap +
      ' validated replacement' +
      (gap === 1 ? '' : 's') +
      ' for assets due or already showing fatigue. Move that many briefs into production before increasing spend.';
  } else if (dueCount) {
    note.className = 'note warn';
    note.textContent =
      'Replacement demand is covered on paper. Keep the replacements in a controlled test until they graduate; production completion is not validation.';
  } else {
    note.className = 'note good';
    note.textContent =
      'No active asset is inside the 14-day replacement window or breaching a fatigue threshold. Maintain the research backlog so capacity remains ahead of demand.';
  }
  $('gl-supply-rows').innerHTML = rows.length
    ? rows
        .map((row) => {
          var replacement = row.needs ? replacements.shift() : null;
          return (
            '<tr><td><span class="ops-main">' +
            glEsc(row.asset.creativeId) +
            '</span><span class="ops-sub">' +
            glEsc(row.asset.campaign) +
            '</span></td><td><span class="growth-verdict ' +
            (row.fatigue.level === 'Healthy'
              ? 'ready'
              : row.fatigue.level === 'Watch'
                ? 'conditional'
                : 'blocked') +
            '">' +
            glEsc(row.fatigue.level) +
            '</span><span class="ops-sub">' +
            glEsc(row.fatigue.signals.join(' · ') || 'No threshold breached') +
            '</span></td><td><span class="ops-date">' +
            glEsc(row.due) +
            '</span><span class="ops-sub">' +
            (row.needs ? 'Inside planning window' : 'Scheduled later') +
            '</span></td><td>' +
            (replacement
              ? '<span class="growth-verdict graduate">' + glEsc(replacement.creativeId) + '</span>'
              : '<span class="growth-empty-compact">' +
                (row.needs ? 'None assigned' : 'Not required') +
                '</span>') +
            '</td><td>' +
            (row.needs
              ? '<button class="btn sm" type="button" data-ca-iterate="' +
                row.asset.id +
                '">Create replacement brief</button>'
              : 'Monitor on weekly review') +
            '</td></tr>'
          );
        })
        .join('')
    : glEmpty(
        5,
        'No active assets to schedule',
        'Add testing or active-winner assets to see refresh demand.',
      );
}

var GL_ASSET_CSV = [
  'date',
  'platform',
  'campaign',
  'ad_set',
  'creative_id',
  'product',
  'concept',
  'angle',
  'hook',
  'format',
  'creator',
  'offer',
  'status',
  'replacement_date',
  'asset_url',
  'parent_creative_id',
  'version',
  'primary_text',
  'headline',
  'landing_page_url',
  'production_owner',
  'production_stage',
  'target_cpa',
  'target_roas',
  'minimum_read',
  'fair_delivery',
  'spend',
  'impressions',
  'three_second_plays',
  'thruplays',
  'link_clicks',
  'landing_page_views',
  'add_to_cart',
  'checkouts',
  'platform_purchases',
  'backend_valid_orders',
  'revenue',
  'new_customers',
  'contribution_before_media',
  'refunded_orders',
  'frequency',
  'prior_ctr',
  'prior_cpa',
  'days_live',
  'spend_share',
  'eligibility_class',
  'claim_id',
  'claim_source',
  'personal_attributes_clear',
  'before_after_clear',
  'testimonial_clear',
  'landing_page_clear',
  'disclaimer_clear',
  'authorization_clear',
  'reviewer',
  'approval_date',
  'next_review_date',
];
var GL_ASSET_CSV_MAP = {
  date: 'date',
  platform: 'platform',
  campaign: 'campaign',
  ad_set: 'adSet',
  creative_id: 'creativeId',
  product: 'product',
  concept: 'concept',
  angle: 'angle',
  hook: 'hook',
  format: 'format',
  creator: 'creator',
  offer: 'offer',
  status: 'status',
  replacement_date: 'replacementDate',
  asset_url: 'assetUrl',
  parent_creative_id: 'parentId',
  version: 'version',
  primary_text: 'primaryText',
  headline: 'headline',
  landing_page_url: 'landingUrl',
  production_owner: 'assignee',
  production_stage: 'productionStage',
  target_cpa: 'targetCpa',
  target_roas: 'targetRoas',
  minimum_read: 'minimumRead',
  fair_delivery: 'fairDelivery',
  spend: 'spend',
  impressions: 'impressions',
  three_second_plays: 'threeSecondPlays',
  thruplays: 'thruplays',
  link_clicks: 'clicks',
  landing_page_views: 'lpv',
  add_to_cart: 'atc',
  checkouts: 'checkouts',
  platform_purchases: 'platformPurchases',
  backend_valid_orders: 'backendOrders',
  revenue: 'revenue',
  new_customers: 'newCustomers',
  contribution_before_media: 'contribution',
  refunded_orders: 'refunds',
  frequency: 'frequency',
  prior_ctr: 'priorCtr',
  prior_cpa: 'priorCpa',
  days_live: 'daysLive',
  spend_share: 'spendShare',
  eligibility_class: 'eligibility',
  claim_id: 'claimId',
  claim_source: 'claimSource',
  personal_attributes_clear: 'personal',
  before_after_clear: 'beforeAfter',
  testimonial_clear: 'testimonial',
  landing_page_clear: 'landing',
  disclaimer_clear: 'disclaimer',
  authorization_clear: 'authorization',
  reviewer: 'reviewer',
  approval_date: 'approvalDate',
  next_review_date: 'reviewDate',
};
function glNormalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
function glCsvReviewValue(value) {
  var normalized = String(value || '')
    .toLowerCase()
    .trim();
  if (['yes', 'true', 'clear', 'approved', 'pass', '1'].indexOf(normalized) > -1) return 'yes';
  if (['no', 'false', 'blocked', 'fail', '0'].indexOf(normalized) > -1) return 'no';
  return 'review';
}
function glAssetImport(file) {
  var reader = new FileReader();
  reader.onload = () => {
    try {
      var rows = dpParseCsv(reader.result);
      if (rows.length < 2) throw new Error('No data rows');
      var headers = rows.shift().map(glNormalizeHeader),
        added = 0,
        updated = 0,
        skipped = 0,
        seen = {};
      rows.forEach((row) => {
        var raw = {};
        headers.forEach((header, index) => {
          raw[header] = row[index] == null ? '' : row[index].trim();
        });
        var asset = {};
        GL_ASSET_CSV.forEach((column) => {
          var key = GL_ASSET_CSV_MAP[column],
            value = raw[column];
          asset[key] = GL_ASSET_NUMERIC.indexOf(key) > -1 ? glNum(value) : value;
        });
        asset.platform = asset.platform || 'Meta Ads';
        asset.status = asset.status || 'Testing';
        asset.productionStage = asset.productionStage || 'Ready for testing';
        asset.fairDelivery =
          glCsvReviewValue(asset.fairDelivery) === 'yes'
            ? 'yes'
            : glCsvReviewValue(asset.fairDelivery) === 'no'
              ? 'no'
              : 'unknown';
        asset.eligibility = asset.eligibility || 'Unknown';
        [
          'personal',
          'beforeAfter',
          'testimonial',
          'landing',
          'disclaimer',
          'authorization',
        ].forEach((key) => {
          asset[key] = glCsvReviewValue(asset[key]);
        });
        if (
          !asset.date ||
          !asset.campaign ||
          !asset.creativeId ||
          asset.spend == null ||
          asset.impressions == null
        ) {
          skipped++;
          return;
        }
        var key = [asset.date, asset.campaign, asset.creativeId].join('|').toLowerCase();
        if (seen[key]) {
          skipped++;
          return;
        }
        seen[key] = true;
        var existing = creativeAssets.find(
          (x) => [x.date, x.campaign, x.creativeId].join('|').toLowerCase() === key,
        );
        if (existing) {
          var id = existing.id,
            created = existing.created;
          Object.assign(existing, asset);
          existing.id = id;
          existing.created = created;
          existing.updated = new Date().toISOString();
          updated++;
        } else {
          asset.id = glId('asset');
          asset.created = new Date().toISOString();
          creativeAssets.push(asset);
          added++;
        }
      });
      if (typeof workspaceAudit === 'function')
        workspaceAudit(
          'Import',
          'Creative batch committed',
          (file.name || 'creative.csv') +
            ' · ' +
            added +
            ' new · ' +
            updated +
            ' updated · ' +
            skipped +
            ' blocked',
        );
      renderCreativeIntelligence();
      if (window.TWC && TWC.store) TWC.store.saveNow('creative import');
      toast(
        added + ' new · ' + updated + ' updated' + (skipped ? ' · ' + skipped + ' blocked' : ''),
      );
    } catch (error) {
      alert(
        'The creative CSV could not be imported. Use the template headers and keep one row per creative.',
      );
    }
  };
  reader.readAsText(file);
}
function glAssetExportRows() {
  return creativeAssets.map((asset) => {
    var row = {};
    GL_ASSET_CSV.forEach((column) => {
      row[column] = asset[GL_ASSET_CSV_MAP[column]];
    });
    return row;
  });
}
function renderCreativeIntelligence() {
  renderCreativeIdeas();
  renderCreativeAssets();
  renderCreativeSupply();
  glAssetPreview();
  renderGrowthHome();
  if (typeof renderCreativeLearning === 'function') renderCreativeLearning();
  growthRefreshReport();
}

/* ---------- shared summaries ---------- */
function renderGrowthHome() {
  if (!$('home-scale-ready')) return;
  $('home-scale-ready').textContent = scaleCandidates.filter(
    (candidate) => scaleAssessment(candidate).decision === 'Ready',
  ).length;
  $('home-scale-cooldowns').textContent = scaleSteps.filter(
    (step) => step.status === 'Cooldown' || step.status === 'Planned',
  ).length;
  $('home-creative-tests').textContent = creativeAssets.filter(
    (asset) => asset.status === 'Testing',
  ).length;
  $('home-creative-risks').textContent = creativeAssets.filter(
    (asset) =>
      creativeFatigue(asset, glNum($('gl-refresh-days').value) || 14).level === 'High risk',
  ).length;
}
function growthRefreshReport() {
  if (typeof buildReport === 'function' && $('rp-out')) buildReport();
}
function growthReportSummary() {
  var ready = scaleCandidates.filter(
      (candidate) => scaleAssessment(candidate).decision === 'Ready',
    ),
    cool = scaleSteps.filter((step) => step.status === 'Cooldown' || step.status === 'Planned'),
    rollbacks = scaleSteps.filter((step) => step.status === 'Rolled back'),
    verdicts = creativeAssets.map(creativeVerdict),
    graduates = verdicts.filter((verdict) => verdict.label === 'Graduate'),
    fatigue = creativeAssets.filter(
      (asset) =>
        creativeFatigue(asset, glNum($('gl-refresh-days').value) || 14).level === 'High risk',
    ),
    production = creativeIdeas.filter(
      (item) => ['Briefing', 'In production', 'Ready to test'].indexOf(item.status) > -1,
    );
  var lines =
    '14  SCALE CONTROL\n    Ready candidates       ' +
    ready.length +
    '\n    Steps in cooldown      ' +
    cool.length +
    '\n    Rollbacks              ' +
    rollbacks.length +
    '\n';
  ready.slice(0, 3).forEach((candidate) => {
    lines += '    · ' + candidate.campaign + ' — ' + glMoney(candidate.budget) + '/day\n';
  });
  lines +=
    '\n15  CREATIVE PIPELINE\n    Assets tracked         ' +
    creativeAssets.length +
    '\n    Graduates              ' +
    graduates.length +
    '\n    High fatigue risk      ' +
    fatigue.length +
    '\n    Ideas in production    ' +
    production.length +
    '\n';
  graduates.slice(0, 3).forEach((verdict, index) => {
    var asset = creativeAssets.filter((item) => creativeVerdict(item).label === 'Graduate')[index];
    if (asset)
      lines +=
        '    · WIN ' +
        asset.creativeId +
        ' — CPA ' +
        glMoney(verdict.metric.cpa) +
        ' / ROAS ' +
        (verdict.metric.roas == null ? '—' : verdict.metric.roas.toFixed(2)) +
        '\n';
  });
  return lines + '\n';
}
function renderGrowthAll() {
  renderScaleControl();
  renderCreativeIntelligence();
  renderGrowthHome();
}

/* ---------- event bindings ---------- */
Object.keys(GL_SCALE_FIELDS).forEach((key) => {
  $(GL_SCALE_FIELDS[key]).addEventListener('input', glScalePreview);
  $(GL_SCALE_FIELDS[key]).addEventListener('change', glScalePreview);
});
$('gl-sc-save').addEventListener('click', glScaleSave);
$('gl-sc-cancel').addEventListener('click', glScaleReset);
$('gl-sc-search').addEventListener('input', renderScaleCandidates);
$('gl-sc-filter').addEventListener('change', renderScaleCandidates);
$('gl-sc-rows').addEventListener('click', (event) => {
  var button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.scPlan) glPlanScale(button.dataset.scPlan);
  if (button.dataset.scCreative) glScaleToCreative(button.dataset.scCreative);
  if (button.dataset.scEdit) glScaleEdit(button.dataset.scEdit);
  if (button.dataset.scRemove && confirm('Remove this scale candidate?')) {
    var removed = scaleCandidates.find((item) => item.id === button.dataset.scRemove);
    scaleCandidates = scaleCandidates.filter((item) => item.id !== button.dataset.scRemove);
    if (removed && typeof workspaceAudit === 'function')
      workspaceAudit(
        'Scale',
        'Scale candidate removed',
        removed.account + ' / ' + removed.campaign,
        removed.id,
      );
    renderScaleControl();
    toast('Scale candidate removed');
  }
});
Object.keys(GL_STEP_FIELDS).forEach((key) => {
  $(GL_STEP_FIELDS[key]).addEventListener('input', glStepPreview);
  $(GL_STEP_FIELDS[key]).addEventListener('change', () => {
    if (key === 'candidateId' && !glStepEditing) {
      var candidate = scaleCandidates.find((entry) => entry.id === $('gl-step-candidate').value);
      if (candidate) {
        $('gl-step-current').value = candidate.budget || '';
        $('gl-step-proposed').value = candidate.budget ? Math.round(candidate.budget * 1.2) : '';
        $('gl-step-rollback-value').value = candidate.targetCpa
          ? Number(candidate.targetCpa * 1.15).toFixed(2)
          : candidate.targetRoas
            ? Number(candidate.targetRoas * 0.85).toFixed(2)
            : '';
      }
    }
    glStepPreview();
  });
});
$('gl-step-save').addEventListener('click', glStepSave);
$('gl-step-cancel').addEventListener('click', glStepReset);
$('gl-step-filter').addEventListener('change', renderScaleSteps);
$('gl-portfolio-budget').addEventListener('input', renderPortfolio);
$('gl-step-rows').addEventListener('click', (event) => {
  var button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.stepEdit) glStepEdit(button.dataset.stepEdit);
  if (button.dataset.stepStatus) glStepStatus(button.dataset.stepId, button.dataset.stepStatus);
  if (
    button.dataset.stepRemove &&
    confirm('Remove this scale step? The linked change-log record will remain as an audit trail.')
  ) {
    var removed = scaleSteps.find((item) => item.id === button.dataset.stepRemove);
    scaleSteps = scaleSteps.filter((item) => item.id !== button.dataset.stepRemove);
    if (removed && typeof workspaceAudit === 'function')
      workspaceAudit(
        'Scale',
        'Scale step removed',
        removed.account + ' / ' + removed.campaign,
        removed.id,
      );
    renderScaleControl();
    toast('Scale step removed');
  }
});
$('gl-idea-save').addEventListener('click', glIdeaSave);
$('gl-idea-cancel').addEventListener('click', glIdeaReset);
$('gl-idea-rows').addEventListener('click', (event) => {
  var button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.ideaTest) glIdeaToExperiment(button.dataset.ideaTest);
  if (button.dataset.ideaAsset) glIdeaToAsset(button.dataset.ideaAsset);
  if (button.dataset.ideaEdit) glIdeaEdit(button.dataset.ideaEdit);
  if (button.dataset.ideaRemove && confirm('Remove this backlog item?')) {
    var removed = creativeIdeas.find((item) => item.id === button.dataset.ideaRemove);
    creativeIdeas = creativeIdeas.filter((item) => item.id !== button.dataset.ideaRemove);
    if (removed && typeof workspaceAudit === 'function')
      workspaceAudit(
        'Creative',
        'Backlog item removed',
        removed.product + ' · ' + removed.concept,
        removed.id,
      );
    renderCreativeIdeas();
    renderGrowthHome();
    toast('Backlog item removed');
  }
});
Object.keys(GL_ASSET_FIELDS).forEach((key) => {
  $(GL_ASSET_FIELDS[key]).addEventListener('input', glAssetPreview);
  $(GL_ASSET_FIELDS[key]).addEventListener('change', glAssetPreview);
});
$('gl-ca-save').addEventListener('click', glAssetSave);
$('gl-ca-cancel').addEventListener('click', glAssetReset);
$('gl-ca-search').addEventListener('input', renderCreativeAssets);
$('gl-ca-filter').addEventListener('change', renderCreativeAssets);
$('gl-ca-template').addEventListener('click', () => {
  glDownloadCsv('twc-creative-performance-template.csv', GL_ASSET_CSV, []);
});
$('gl-ca-export').addEventListener('click', () => {
  glDownloadCsv('twc-creative-performance.csv', GL_ASSET_CSV, glAssetExportRows());
});
$('gl-ca-import').addEventListener('click', () => {
  $('gl-ca-file').click();
});
$('gl-ca-file').addEventListener('change', (event) => {
  var file = event.target.files[0];
  if (file) glAssetImport(file);
  event.target.value = '';
});
$('gl-ca-rows').addEventListener('click', (event) => {
  var button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.caScale) glAssetToScale(button.dataset.caScale);
  if (button.dataset.caIterate) glAssetToIteration(button.dataset.caIterate);
  if (button.dataset.caQueue) glAssetQueueIssue(button.dataset.caQueue);
  if (button.dataset.caTest) glAssetToExperiment(button.dataset.caTest);
  if (button.dataset.caEdit) glAssetEdit(button.dataset.caEdit);
  if (button.dataset.caRemove && confirm('Remove this creative result?')) {
    var removed = creativeAssets.find((item) => item.id === button.dataset.caRemove);
    creativeAssets = creativeAssets.filter((item) => item.id !== button.dataset.caRemove);
    if (removed && typeof workspaceAudit === 'function')
      workspaceAudit('Creative', 'Creative result removed', removed.creativeId, removed.id);
    renderCreativeIntelligence();
    toast('Creative result removed');
  }
});
$('gl-supply-rows').addEventListener('click', (event) => {
  var button = event.target.closest('[data-ca-iterate]');
  if (button) glAssetToIteration(button.dataset.caIterate);
});
$('gl-production-capacity').addEventListener('input', renderCreativeSupply);
$('gl-refresh-days').addEventListener('input', () => {
  renderCreativeAssets();
  renderCreativeSupply();
  renderGrowthHome();
});

glScaleReset();
glStepReset();
glIdeaReset();
glAssetReset();
