import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(projectDir, file), 'utf8');
const html = read('index.html');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) throw new Error(`Duplicate element IDs: ${duplicateIds.join(', ')}`);

const views = [
  ...html.matchAll(/<section\b[^>]*class="[^"]*\bview\b[^"]*"[^>]*id="v-([^"]+)"/g),
].map((match) => match[1]);
const navigation = read('assets/js/config/navigation.js');
const navigationTargets = [
  ...navigation.matchAll(/\['([a-z][a-z0-9-]*)','[^']+','bi-[^']+'\]/g),
].map((match) => match[1]);

if (views.length !== 52 || navigationTargets.length !== 52) {
  throw new Error(
    `Expected 52 views and targets; found ${views.length} views and ${navigationTargets.length} targets.`,
  );
}
if (new Set(navigationTargets).size !== navigationTargets.length) {
  throw new Error('Navigation contains a duplicate target.');
}
const missingTargets = views.filter((view) => !navigationTargets.includes(view));
const missingViews = navigationTargets.filter((target) => !views.includes(target));
if (missingTargets.length || missingViews.length) {
  throw new Error(
    `Navigation mismatch. Missing targets: ${missingTargets.join(', ')}; missing views: ${missingViews.join(', ')}`,
  );
}

const inAppTargets = [...html.matchAll(/\bdata-go="([^"]+)"/g)].map((match) => match[1]);
const unknownInAppTargets = [
  ...new Set(inAppTargets.filter((target) => !navigationTargets.includes(target))),
];
if (unknownInAppTargets.length) {
  throw new Error(`Unknown data-go targets: ${unknownInAppTargets.join(', ')}`);
}

const referenceRequirements = [
  'Optimization strategy',
  'Forecasting and scale economics',
  'Scale-readiness gate',
  'Creative testing and scale system',
  'The required scale pack',
  'Platform notes and source discipline',
  'How to push a winning creative into scale',
];
for (const requirement of referenceRequirements) {
  if (!html.includes(requirement))
    throw new Error(`Reference operating manual is missing: ${requirement}`);
}

if (/<style\b/i.test(html)) throw new Error('Executable styles must live under assets/css.');
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
  ([, attributes, body]) => !/\bsrc=/.test(attributes) && body.trim(),
);
if (inlineScripts.length) throw new Error('Executable scripts must live under assets/js.');

const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:https?:|#|data:|mailto:|tel:|javascript:)/.test(reference));
for (const reference of localReferences) {
  const target = path.join(projectDir, reference.split('?', 1)[0]);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw new Error(`Missing local asset: ${reference}`);
  }
}

const cssFiles = localReferences
  .filter((reference) => reference.split('?', 1)[0].endsWith('.css'))
  .map((reference) => reference.split('?', 1)[0]);
for (const file of cssFiles) {
  const css = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  const opens = (css.match(/{/g) || []).length;
  const closes = (css.match(/}/g) || []).length;
  if (opens !== closes) throw new Error(`Unbalanced CSS blocks in ${file}: ${opens}/${closes}`);
}

const scriptFiles = localReferences
  .filter((reference) => reference.split('?', 1)[0].endsWith('.js'))
  .map((reference) => reference.split('?', 1)[0]);
for (const file of scriptFiles) {
  new vm.Script(read(file), { filename: file });
}

const competitorSource = read('assets/js/features/competitors.js');
for (const required of [
  'Ritual',
  'Seed',
  'Supergut',
  'Observed, not assumed',
  'Public facts',
  'Not observable',
  'Scale decision',
]) {
  if (!html.includes(required) && !competitorSource.includes(required))
    throw new Error(`Competitor intelligence is missing: ${required}`);
}
for (const unsafeInference of [
  'almost certainly profitable',
  'proof of ROAS',
  'guarantee performance',
]) {
  if (
    html.toLowerCase().includes(unsafeInference) ||
    competitorSource.toLowerCase().includes(unsafeInference)
  ) {
    throw new Error(`Competitor intelligence overstates public evidence: ${unsafeInference}`);
  }
}
const competitorLinks = [
  ...competitorSource.matchAll(/ad:'(https:\/\/www\.facebook\.com\/ads\/library\/\?id=\d+)'/g),
].map((match) => match[1]);
if (competitorLinks.length < 12 || new Set(competitorLinks).size !== competitorLinks.length) {
  throw new Error(
    `Expected at least 12 unique Meta competitor examples; found ${competitorLinks.length}.`,
  );
}
const competitorRoot = { innerHTML: '', dataset: {}, addEventListener() {} };
const competitorContext = {
  console,
  $: (id) =>
    id === 'competitor-app' ? competitorRoot : { value: '', textContent: '', innerHTML: '' },
};
vm.createContext(competitorContext);
new vm.Script(competitorSource, { filename: 'assets/js/features/competitors.js' }).runInContext(
  competitorContext,
);
competitorContext.renderCompetitors();
if (
  competitorRoot.innerHTML.length < 10000 ||
  !competitorRoot.innerHTML.includes('Observed funnel') ||
  !competitorRoot.innerHTML.includes('TWC test queue')
) {
  throw new Error(
    'Competitor intelligence renderer did not build its funnel, ads and pipeline workspace.',
  );
}

const diagnostics = read('assets/js/features/diagnostics.js');
const diagnosticElements = new Map();
const diagnosticContext = {
  esc: (value) =>
    String(value).replace(
      /[&<>]/g,
      (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character],
    ),
  $: (id) => {
    if (!diagnosticElements.has(id)) {
      diagnosticElements.set(id, {
        value: '',
        innerHTML: '',
        textContent: '',
        disabled: false,
        addEventListener() {},
        setAttribute() {},
        focus() {},
      });
    }
    return diagnosticElements.get(id);
  },
};
vm.createContext(diagnosticContext);
new vm.Script(diagnostics, { filename: 'assets/js/features/diagnostics.js' }).runInContext(
  diagnosticContext,
);
const diagnosticCatalog = diagnosticContext.DIAGNOSES;
const diagnosticKeys = diagnosticCatalog.map((diagnostic) => diagnostic.k);
if (diagnosticKeys.length !== 48 || new Set(diagnosticKeys).size !== 48) {
  throw new Error(
    `Expected 48 unique diagnostic situations; found ${diagnosticKeys.length} entries and ${new Set(diagnosticKeys).size} unique keys.`,
  );
}
const expectedDiagnosticCategories = [
  'Performance',
  'Delivery and learning',
  'Budget and scaling',
  'Creative',
  'Funnel and store',
  'Measurement',
  'Audiences',
  'Policy and account',
  'Google Ads',
  'Operations',
];
for (const category of expectedDiagnosticCategories) {
  if (!diagnosticCatalog.some((diagnostic) => diagnostic.cat === category))
    throw new Error(`Missing diagnostic category: ${category}`);
}
for (const diagnostic of diagnosticCatalog) {
  if (!diagnostic.nodes[diagnostic.start])
    throw new Error(`Diagnostic ${diagnostic.k} has no valid start node.`);
  const queue = [diagnostic.start],
    visited = new Set(),
    reachedEnds = new Set();
  while (queue.length) {
    const target = queue.shift();
    if (visited.has(target)) continue;
    visited.add(target);
    if (diagnostic.ends[target]) {
      const result = diagnostic.ends[target];
      reachedEnds.add(target);
      if (!result.t || !result.b || !result.check.length || !result.act.length) {
        throw new Error(`Diagnostic ${diagnostic.k} has an incomplete result at ${target}.`);
      }
      if (result.go && !navigationTargets.includes(result.go)) {
        throw new Error(`Diagnostic ${diagnostic.k} links to unknown view ${result.go}.`);
      }
      continue;
    }
    const node = diagnostic.nodes[target];
    if (!node || !node.q || !node.o || node.o.length < 2) {
      throw new Error(`Diagnostic ${diagnostic.k} has an invalid decision node at ${target}.`);
    }
    for (const option of node.o) {
      if (!diagnostic.nodes[option[1]] && !diagnostic.ends[option[1]]) {
        throw new Error(`Diagnostic ${diagnostic.k} points to missing target ${option[1]}.`);
      }
      queue.push(option[1]);
    }
  }
  if (!reachedEnds.size) throw new Error(`Diagnostic ${diagnostic.k} has no reachable result.`);
}

JSON.parse(read('.devcontainer/devcontainer.json'));
const session = read('assets/js/services/session.js');
if (
  !session.includes('TWC.dataSource.captureFields') ||
  !session.includes('TWC.dataSource.applyFields')
) {
  throw new Error('Session handling must use the shared data-source service.');
}
if (!session.includes('return {v:9')) throw new Error('Session schema version must be 9.');
for (const collection of [
  'dailyRecords',
  'optimizationActions',
  'changeRecords',
  'experimentRecords',
  'scaleCandidates',
  'scaleSteps',
  'creativeIdeas',
  'creativeAssets',
]) {
  if (!session.includes(`${collection}:${collection}`))
    throw new Error(`Session export is missing ${collection}.`);
}
if (!session.includes('workspaceState:'))
  throw new Error('Session export is missing the production workspace.');

const namingElements = new Map();
const namingValues = {
  'n-geo': 'US',
  'n-prod': 'MED-KIT',
  'n-fun': 'ACQ',
  'n-pur': 'CT-CONCEPT',
  'n-bud': 'ABO',
  'n-gate': '',
  'n-asn': '1',
  'n-aud': 'BROAD',
  'n-asd': 'PREPAREDNESS',
  'c-date': '2025-10-27',
  'c-project': 'HealthInsurancePost',
  'c-family': 'VideoInspiredStatics',
  'c-id': '1146',
  'c-source': 'internal',
  'c-format': 'static',
  'c-style': 'trendmeme',
  'c-message': 'insurancecost',
  'c-hook': 'insuranceoffer',
  'c-group': 'general',
  'c-gender': 'Female',
  'c-age': '20s',
  'c-length': 'IMG',
  'c-placement': 'paid',
  'c-version': '3',
  'c-claim': 'AC-01',
  'u-url': 'https://example.com/path',
  'u-src': 'facebook',
  'u-med': 'paid_social',
  'u-term': 'broad',
};
const namingContext = {
  Date,
  String,
  Math,
  parseInt,
  encodeURIComponent,
  pad: (n) => String(n).padStart(2, '0'),
  $: (id) => {
    if (!namingElements.has(id))
      namingElements.set(id, {
        value: namingValues[id] || '',
        textContent: '',
        addEventListener(type, handler) {
          this[type] = handler;
        },
      });
    return namingElements.get(id);
  },
};
vm.createContext(namingContext);
const namingSource = read('assets/js/features/campaign-tools.js');
new vm.Script(
  namingSource.slice(0, namingSource.indexOf('/* ---------- 03 STRUCTURE ---------- */')),
).runInContext(namingContext);
namingContext.buildNames();
const expectedAssetName =
  '20251027_HealthInsurancePost_VideoInspiredStatics_CID-1146_s-internal_f-static_as-trendmeme_m-insurancecost_h-insuranceoffer_g-general_gen-Female_age-20s_len-IMG_lp-paid_V3';
if (namingContext.$('o-cid').textContent !== expectedAssetName)
  throw new Error('Creative naming convention does not match the required token order');
if (
  !namingContext
    .$('o-utm')
    .textContent.includes('utm_content=' + encodeURIComponent(expectedAssetName))
)
  throw new Error('UTM content must use the complete creative asset name');
namingContext.$('c-version').value = '4';
namingContext.$('name-generate').click();
if (
  !namingContext.$('o-cid').textContent.endsWith('_V4') ||
  !namingContext.$('o-utm').textContent.includes('_V4')
)
  throw new Error('Generate name and UTM button did not refresh both outputs');

const operationsCenter = read('assets/js/features/operations-center.js');
const growthLab = read('assets/js/features/growth-lab.js');
const productionCore = read('assets/js/features/production-core.js');
const operationElements = new Map();
const ctElements = new Map();
const ctContext = {
  Number,
  Object,
  Array,
  String,
  Math,
  Date,
  money: (n) => '$' + n,
  $: (id) => {
    if (!ctElements.has(id))
      ctElements.set(id, {
        value: '',
        innerHTML: '',
        textContent: '',
        style: {},
        classList: { add() {} },
        addEventListener() {},
      });
    return ctElements.get(id);
  },
};
vm.createContext(ctContext);
const ctSource = read('assets/js/features/optimization.js');
new vm.Script(ctSource.slice(ctSource.indexOf('var CTEST='))).runInContext(ctContext);
ctContext.$('ct-day').value = '3050';
ctContext.$('ct-cpa').value = '120';
ctContext.$('ct-prod').value = 'MED-KIT';
for (const stage of Object.keys(ctContext.CTEST))
  for (const count of [4, 6, 8, 10, 12]) {
    ctContext.$('ct-stage2').value = stage;
    ctContext.$('ct-assets').value = String(count);
    ctContext.renderCTest();
    if (
      !ctContext
        .$('ct-spec')
        .innerHTML.includes('4 ad sets, ABO, one variant each, ' + count + ' assets per cell')
    )
      throw new Error('Creative-test structure failed selected count');
    if (
      (
        ctContext
          .$('ct-out')
          .textContent.match(new RegExp('Assets           ' + count + '\\n', 'g')) || []
      ).length !== 4
    )
      throw new Error('Build sheet must show selected count in all four cells');
    if (
      (ctContext.$('ct-fall').textContent.match(new RegExp('<br/>' + count + ' assets', 'g')) || [])
        .length !== 4
    )
      throw new Error('Diagram must show selected count in all four cells');
    if (ctContext.$('ct-fall').textContent.includes('undefined'))
      throw new Error('Missing test variant label');
  }
for (const count of [5, 7, 9, 11]) {
  ctContext.$('ct-assets').value = String(count);
  ctContext.renderCTest();
  if (ctContext.$('ct-assets').value !== '6')
    throw new Error('Creative-test planner accepted an odd asset count');
}
ctContext.$('ct-stage2').value = 'concept';
ctContext.$('ct-day').value = '1800';
ctContext.$('ct-cpa').value = '120';
ctContext.$('ct-assets').value = '10';
ctContext.renderCTest();
if (
  ctContext.$('ct-label').textContent !== 'Below stable-delivery benchmark' ||
  ctContext.$('ct-val').textContent !== '2 CELLS'
)
  throw new Error('Underfunded four-cell test must not receive a RUN status');
for (const expected of [
  '$1800',
  '$450',
  '26.3 purchases per week',
  '$858',
  '$3429',
  '$45 daily per asset',
])
  if (!ctContext.$('ct-body').textContent.includes(expected))
    throw new Error('Budget recommendation is missing ' + expected);
ctContext.$('ct-day').value = '3600';
ctContext.renderCTest();
if (
  ctContext.$('ct-label').textContent !== 'Budget supports four-cell delivery' ||
  ctContext.$('ct-val').textContent !== 'RUN'
)
  throw new Error('Funded four-cell test must receive a RUN status');
if (!read('assets/js/services/session.js').includes("'ct-assets'"))
  throw new Error('Creative-test selection must persist in sessions');
if (!read('assets/js/services/session.js').includes("'s-assets'"))
  throw new Error('Campaign structure asset selection must persist in sessions');
const testStore = {
  schedule() {},
  saveNow() {
    return Promise.resolve(true);
  },
  backups() {
    return Promise.resolve([]);
  },
  restoreBackup() {
    return Promise.resolve(false);
  },
  removeBackup() {
    return Promise.resolve(false);
  },
};
const operationContext = {
  console,
  Date,
  Math,
  Number,
  String,
  Object,
  Array,
  JSON,
  Intl,
  URL,
  isFinite,
  $: (id) => {
    if (!operationElements.has(id)) {
      operationElements.set(id, {
        value: '',
        textContent: '',
        innerHTML: '',
        hidden: false,
        disabled: false,
        className: '',
        tagName: 'INPUT',
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener() {},
        setAttribute() {},
        click() {},
        focus() {},
        close() {},
        showModal() {},
      });
    }
    return operationElements.get(id);
  },
  dl() {},
  toast() {},
  alert() {},
  confirm() {
    return true;
  },
  setActive() {},
  selectDiagnosis() {},
  document: {
    querySelectorAll() {
      return [];
    },
  },
  TWC: { store: testStore },
  window: { scrollTo() {}, TWC: { store: testStore } },
  Blob: class {},
  FileReader: class {},
};
vm.createContext(operationContext);
new vm.Script(operationsCenter, {
  filename: 'assets/js/features/operations-center.js',
}).runInContext(operationContext);
new vm.Script(growthLab, { filename: 'assets/js/features/growth-lab.js' }).runInContext(
  operationContext,
);
const metricCheck = operationContext.dpMetrics({
  spend: 200,
  backendOrders: 2,
  backendRevenue: 600,
  impressions: 10000,
  clicks: 150,
});
if (metricCheck.cpa !== 100 || metricCheck.roas !== 3 || metricCheck.ctr !== 1.5) {
  throw new Error('Daily performance metrics failed their deterministic check.');
}
const signalCheck = operationContext.dpSignal({
  spend: 200,
  backendOrders: 2,
  backendRevenue: 200,
  targetCpa: 50,
});
if (signalCheck.key !== 'cpa' || signalCheck.level !== 'high')
  throw new Error('Daily exception routing failed its deterministic check.');
const reconciliationCheck = operationContext.dpSignal({
  spend: 200,
  platformOrders: 20,
  backendOrders: 10,
  platformRevenue: 1000,
  backendRevenue: 600,
});
if (reconciliationCheck.key !== 'order-mismatch' || reconciliationCheck.level !== 'critical')
  throw new Error('Reconciliation priority failed its deterministic check.');
const csvCheck = operationContext.dpParseCsv('account,campaign,spend\n"US, Main",P01,100\n');
if (csvCheck.length !== 2 || csvCheck[1][0] !== 'US, Main')
  throw new Error('CSV parser failed its quoted-field check.');
operationContext.dailyRecords.push({
  date: '2026-09-05',
  spend: 200,
  platformOrders: 3,
  platformRevenue: 750,
  backendOrders: 2,
  backendRevenue: 600,
  newCustomers: 2,
  atc: 10,
  checkouts: 5,
});
const periodCheck = operationContext.opsAggregatePeriod('2026-08-31', '2026-09-07');
if (periodCheck.spend !== 200 || periodCheck.platformOrders !== 3 || periodCheck.truthOrders !== 2)
  throw new Error('Weekly performance aggregation failed its deterministic check.');
operationContext.optimizationActions.push({
  status: 'Open',
  priority: 'Critical',
  due: '2000-01-01',
  problem: 'Check signal',
});
operationContext.changeRecords.push({ status: 'Cooldown', recheck: '2000-01-01' });
operationContext.experimentRecords.push({
  status: 'Running',
  name: 'Concept test',
  end: '2099-01-01',
});
const reportCheck = operationContext.opsReportSummary();
if (
  !reportCheck.includes('Critical actions      1') ||
  !reportCheck.includes('Changes due to read   1') ||
  !reportCheck.includes('Concept test')
) {
  throw new Error('Operational weekly-report summary failed its deterministic check.');
}

const scaleCheck = operationContext.scaleAssessment({
  platform: 'Meta Ads',
  stage: 'Prospecting',
  budget: 1000,
  targetCpa: 120,
  targetRoas: 2.5,
  spend: 4800,
  orders: 48,
  revenue: 14400,
  stableDays: 14,
  marginalCpa: 110,
  validatedCreatives: 3,
  frequency: 1.8,
  reach: 40,
  dataState: 'reconciled',
  learning: 'stable',
  compliance: 'yes',
  inventoryDays: 30,
  cashflow: 'yes',
});
if (scaleCheck.decision !== 'Ready' || scaleCheck.cpa !== 100 || scaleCheck.roas !== 3) {
  throw new Error('Scale readiness gate failed its deterministic check.');
}
const rollbackCheck = operationContext.scaleAssessment({
  platform: 'Meta Ads',
  stage: 'Prospecting',
  budget: 1000,
  targetCpa: 120,
  spend: 4800,
  orders: 48,
  revenue: 14400,
  stableDays: 14,
  marginalCpa: 160,
  validatedCreatives: 3,
  frequency: 1.8,
  reach: 40,
  dataState: 'reconciled',
  learning: 'stable',
  compliance: 'yes',
  inventoryDays: 30,
  cashflow: 'yes',
});
if (rollbackCheck.decision !== 'Roll back')
  throw new Error('Scale rollback gate failed its deterministic check.');
const creativeCheck = operationContext.creativeMetrics({
  format: 'UGC video',
  spend: 1200,
  impressions: 100000,
  threeSecondPlays: 25000,
  thruplays: 5000,
  clicks: 1500,
  lpv: 1200,
  atc: 120,
  checkouts: 60,
  backendOrders: 12,
  revenue: 3600,
  newCustomers: 10,
  contribution: 1800,
  refunds: 1,
});
if (
  creativeCheck.hook !== 25 ||
  creativeCheck.hold !== 20 ||
  creativeCheck.ctr !== 1.5 ||
  creativeCheck.cpa !== 100 ||
  creativeCheck.roas !== 3 ||
  creativeCheck.contributionAfterMedia !== 600 ||
  Math.abs(creativeCheck.refundRate - 8.333333333333334) > 1e-9
) {
  throw new Error('Creative scorecard metrics failed their deterministic check.');
}
const verdictCheck = operationContext.creativeVerdict({
  date: '2026-09-01',
  format: 'UGC video',
  spend: 1200,
  minimumRead: 360,
  impressions: 100000,
  threeSecondPlays: 25000,
  thruplays: 5000,
  clicks: 1500,
  lpv: 1200,
  atc: 60,
  checkouts: 30,
  platformPurchases: 12,
  backendOrders: 12,
  revenue: 3600,
  newCustomers: 10,
  targetCpa: 120,
  targetRoas: 2.5,
  fairDelivery: 'yes',
  eligibility: 'Unrestricted',
  claimId: 'CLM-001',
  claimSource: 'Approved library',
  personal: 'yes',
  beforeAfter: 'yes',
  testimonial: 'yes',
  landing: 'yes',
  disclaimer: 'yes',
  authorization: 'yes',
  reviewer: 'Legal',
  approvalDate: '2026-09-01',
});
if (verdictCheck.label !== 'Graduate')
  throw new Error(`Creative verdict expected Graduate; received ${verdictCheck.label}.`);
const complianceCheck = operationContext.creativeVerdict({
  format: 'Static image',
  spend: 1200,
  minimumRead: 360,
  impressions: 100000,
  clicks: 1500,
  lpv: 1200,
  atc: 60,
  checkouts: 30,
  backendOrders: 12,
  revenue: 3600,
  targetCpa: 120,
  targetRoas: 2.5,
  fairDelivery: 'yes',
  eligibility: 'Unknown',
  personal: 'review',
  beforeAfter: 'review',
  testimonial: 'review',
  landing: 'review',
  disclaimer: 'review',
  authorization: 'review',
});
if (complianceCheck.label !== 'Blocked')
  throw new Error('Incomplete compliance must block creative graduation.');

new vm.Script(productionCore, { filename: 'assets/js/features/production-core.js' }).runInContext(
  operationContext,
);
const migratedWorkspace = operationContext.workspaceMigrate({
  accounts: [{ id: 'acct-1', name: 'Meta US' }],
});
if (
  migratedWorkspace.schemaVersion !== 2 ||
  migratedWorkspace.accounts.length !== 1 ||
  !Array.isArray(migratedWorkspace.auditLog)
) {
  throw new Error('Workspace schema migration failed its deterministic check.');
}
operationContext.workspaceState = operationContext.workspaceDefaults();
operationContext.workspaceState.accounts.push({
  id: 'acct-1',
  name: 'Meta US',
  platform: 'Meta Ads',
  status: 'Active',
});
operationContext.workspaceState.products.push({
  id: 'prod-1',
  name: 'Core offer',
  status: 'Active',
});
operationContext.workspaceState.campaigns.push({
  id: 'camp-1',
  name: 'Prospecting',
  accountId: 'acct-1',
  productId: 'prod-1',
  status: 'Active',
});
operationContext.workspaceState.targetProfiles.push(
  { id: 'target-ws', scope: 'Workspace', scopeId: '', effective: '2026-01-01', targetCpa: 180 },
  {
    id: 'target-acct',
    scope: 'Account',
    scopeId: 'acct-1',
    effective: '2026-01-01',
    targetCpa: 140,
  },
  {
    id: 'target-camp',
    scope: 'Campaign',
    scopeId: 'camp-1',
    effective: '2026-01-01',
    targetCpa: 110,
  },
);
const targetCheck = operationContext.workspaceTargetFor({
  date: '2026-09-01',
  accountId: 'acct-1',
  productId: 'prod-1',
  campaignId: 'camp-1',
});
if (!targetCheck || targetCheck.id !== 'target-camp')
  throw new Error('Target inheritance failed its deterministic check.');
operationContext.workspaceState.rules.push({
  id: 'rule-1',
  key: 'ctrLow',
  scope: 'Campaign',
  scopeId: 'camp-1',
  value: 1.25,
});
if (
  operationContext.wsRuleValue('ctrLow', { campaignId: 'camp-1' }, 0) !== 1.25 ||
  operationContext.wsRuleValue('refreshDays', {}, 0) !== 14
) {
  throw new Error('Scoped decision-rule resolution failed its deterministic check.');
}
const invalidRecordCheck = operationContext.workspaceValidateRecord({
  date: '2026-09-01',
  account: 'Meta US',
  campaign: 'Prospecting',
  spend: 100,
  impressions: 100,
  clicks: 120,
  backendOrders: 1,
});
if (!invalidRecordCheck.errors.some((error) => error.includes('Clicks exceed impressions')))
  throw new Error('Performance-row validation failed its deterministic check.');
const productionAggregateCheck = operationContext.workspaceAggregate([
  {
    spend: 200,
    backendOrders: 2,
    backendRevenue: 600,
    platformOrders: 3,
    platformRevenue: 900,
    impressions: 10000,
    clicks: 150,
  },
]);
if (
  productionAggregateCheck.cpa !== 100 ||
  productionAggregateCheck.roas !== 3 ||
  productionAggregateCheck.ctr !== 1.5
) {
  throw new Error('Production aggregation failed its deterministic check.');
}
const forecastCheck = operationContext.forecastScenarios({
  currentSpend: 100,
  currentOrders: 2,
  currentRevenue: 300,
  proposedSpend: 120,
  elasticLow: 0.45,
  elasticBase: 0.7,
  elasticHigh: 1,
  horizon: 10,
  margin: 50,
  inventory: 100,
  cash: 2000,
});
if (
  forecastCheck.length !== 3 ||
  Math.abs(forecastCheck[1].totalOrders - 22.8) > 1e-9 ||
  forecastCheck[1].inventoryPass !== true ||
  forecastCheck[1].cashPass !== true
) {
  throw new Error('Forecast range failed its deterministic check.');
}
const experimentStatsCheck = operationContext.workspaceExperimentStats({
  baselineRate: 10,
  mde: 40,
  confidenceTarget: 95,
  controlVisitors: 10000,
  controlConversions: 1000,
  variantVisitors: 10000,
  variantConversions: 1400,
});
if (
  experimentStatsCheck.verdict !== 'Variant wins' ||
  experimentStatsCheck.confidence < 95 ||
  !experimentStatsCheck.cleared
) {
  throw new Error('Experiment confidence logic failed its deterministic check.');
}
if (
  operationContext.wsSafeLink('javascript:alert(1)') !== '' ||
  !operationContext.wsSafeLink('https://example.com/evidence')
) {
  throw new Error('Governance URL safety failed its deterministic check.');
}

new vm.Script(read('assets/js/features/pipeline.js'), { filename: 'pipeline.js' }).runInContext(
  operationContext,
);
const pc = operationContext;
const migratedPipeline = pc.workspaceMigrate({
  pipeline: { items: [{ id: 'keep-me' }], settings: { weeklyBudget: 1400 } },
});
if (
  migratedPipeline.pipeline.items[0].id !== 'keep-me' ||
  migratedPipeline.pipeline.settings.weeklyBudget !== 1400 ||
  migratedPipeline.pipeline.settings.cellBudget !== 350
)
  throw new Error('Pipeline restore/default migration failed');
const capacity = pc.plCapacity({
  weeklyBudget: 700,
  cellBudget: 350,
  testDays: 7,
  baselineRate: 3,
  mde: 30,
  confidence: 95,
  expectedCpc: 2,
});
if (capacity.cells !== 2 || capacity.available !== 700 || !(capacity.required > 0))
  throw new Error('Pipeline capacity calculation failed');
if (!pc.plReadiness({}).length) throw new Error('Empty brief must not pass launch readiness');
const ready = {
  id: 'test-ready',
  name: 'Product walkthrough',
  product: 'Kits',
  campaign: 'Prospecting',
  owner: 'Xavier',
  hypothesis: 'If contents are shown, more qualified buyers purchase',
  variable: 'Concept',
  control: 'Current winner',
  offer: 'Same offer',
  winnerRule: 'CPA at or below 100 after planned evidence',
  stopRule: 'Stop at declared loss',
  guardrail: 'Nonnegative contribution',
  claimId: 'C1',
  claimVersion: '1',
  reviewer: 'Reviewer',
  assetUrl: 'https://example.com/asset',
  destination: 'https://example.com/product',
  approvalRef: 'https://example.com/approval',
  approvedAt: '2026-01-01',
  approvalExpiry: '2099-01-01',
  copyApproved: true,
  destinationApproved: true,
  trackingChecked: true,
  cellBudget: 1000,
  minimumSpend: 500,
  minimumExposure: 1000,
  targetCpa: 100,
  maxLoss: 500,
  scheduledStart: '2026-01-01',
  scheduledEnd: '2026-01-07',
  readAfter: '2026-01-10',
  width: 1080,
  height: 1920,
  requiredRatio: '9:16',
  format: 'Video',
  captions: true,
  safeArea: true,
  thumbnail: true,
  specReviewed: true,
  stage: 'Learning',
  outcome: 'Win',
  winnerStage: 'Validated',
  readComplete: true,
  finding: 'Lower CPA',
  limitations: 'One execution only',
  observedSpend: 500,
  observedImpressions: 10000,
  orders: 10,
  contribution: 800,
  confirmationPassed: true,
  confirmationEvidence: 'https://example.com/confirmation',
  confirmedAt: '2026-01-20',
};
if (pc.plReadiness(ready, '2026-02-01').length || pc.plPromotion(ready, '2026-02-01').length)
  throw new Error('Complete evidence should pass validation');
if (!pc.plPromotion({ ...ready, confirmationPassed: false }, '2026-02-01').length)
  throw new Error('Missing confirmation must block winner promotion');
if (!pc.plReadiness({ ...ready, approvalExpiry: '2026-01-02' }, '2026-02-01').length)
  throw new Error('Expired approval must block launch');
if (!pc.plSpecs({ ...ready, width: 1000, height: 1000 }).includes('Aspect ratio mismatch'))
  throw new Error('Specification mismatch was missed');
if (!pc.plPromotion({ ...ready, winnerStage: 'Scalable' }, '2026-02-01').length)
  throw new Error('Unverified scale promotion must be blocked');
const marg = pc.plMarginal({
  beforeSpend: 100,
  afterSpend: 200,
  beforeOrders: 2,
  afterOrders: 3,
  beforeContribution: 200,
  afterContribution: 350,
});
if (marg.cpa !== 100 || marg.contribution !== 50) throw new Error('Marginal scale math failed');
if (
  pc.plMarginal({ beforeSpend: 100, afterSpend: 200, beforeOrders: 2, afterOrders: 2 }).cpa !== null
)
  throw new Error('Zero added orders must not produce marginal CPA');
pc.workspaceState.pipeline.items = [
  { ...ready, id: 'parent' },
  { ...ready, id: 'replacement', replacementFor: 'parent' },
];
if (!pc.plCoverage(pc.plItems())[0].replacement)
  throw new Error('Valid assigned replacement must cover its parent');
pc.workspaceState.pipeline.items[1].product = 'Other';
if (pc.plCoverage(pc.plItems())[0].replacement)
  throw new Error('Replacement cannot cover a different product');
pc.workspaceState.pipeline.items = [
  { id: 'a', parentId: 'b' },
  { id: 'b', parentId: '' },
];
if (!pc.plCycle('b', 'a')) throw new Error('Lineage cycle must be rejected');
if (pc.plValidDate('2026-02-30')) throw new Error('Impossible date must be rejected');
new vm.Script(read('assets/js/features/restart.js'), { filename: 'restart.js' }).runInContext(pc);
const restart = pc.rsDefaults();
pc.workspaceState.pipeline.restart = restart;
pc.workspaceState.pipeline.items = [];
if (pc.rsSpend(restart, 30) !== 64800)
  throw new Error('Restart ramp must calculate $64,800 for 30 days');
if (pc.rsCells(restart).length !== 8 || pc.rsEconomics(restart, 'kit', 1).weeklyOrders >= 50)
  throw new Error('Four cells per product and early ramp warning failed');
restart.mixed = true;
if (
  pc.rsCells(restart).length !== 8 ||
  pc.rsEconomics(restart, 'skin', 4).perCell !== 375 ||
  pc.rsEconomics(restart, 'kit', 4).perCell !== 375
)
  throw new Error('Legacy mixed pool must not change four-cell budget allocation');
restart.mixed = false;
if (!pc.rsLaunchIssues(restart).length || !pc.rsCatalogIssues(restart).length)
  throw new Error('Unreviewed restart/catalog must stay blocked');
restart.assetsPerCell = 4;
if (pc.rsBatch('kit-1') !== 4 || pc.rsBatch('kit-1') !== 0)
  throw new Error('Four-asset batch must be repeat-safe');
restart.assetsPerCell = 6;
if (pc.rsBatch('kit-1') !== 2 || pc.rsBatch('kit-1') !== 0)
  throw new Error('Six-asset selection must add only the two missing slots');
restart.assetsPerCell = 4;
if (pc.rsBatch('kit-1') !== 0 || pc.plItems().length !== 6)
  throw new Error('Reducing the target must preserve existing assets');
restart.assetsPerCell = 6;
if (
  new Set(pc.plItems().map((x) => x.requiredRatio)).size !== 3 ||
  pc.plItems().some((x) => x.copyApproved || x.assetId || x.winnerStage !== 'Unproven')
)
  throw new Error('Generated briefs require ratio diversity and fresh approvals');
pc.plItems()[0].name = 'Manually edited brief';
pc.rsBatch('kit-1');
if (pc.plItems()[0].name !== 'Manually edited brief')
  throw new Error('Batch generation overwrote work');
pc.plItems()[0].concept = 'Different variant';
if (!pc.rsRosterIssues(pc.rsCell('kit-1')).some((x) => x.includes('single variant')))
  throw new Error('Mixed variants must be flagged');
pc.plItems()[0].concept = 'Preparedness';
const restoredRestart = pc.workspaceMigrate({
  pipeline: { restart: { decision: 'Keep evidence', days: [{ date: '2026-01-01' }], ramp: [1] } },
}).pipeline.restart;
if (
  restoredRestart.decision !== 'Keep evidence' ||
  restoredRestart.days.length !== 1 ||
  restoredRestart.ramp.length !== 4
)
  throw new Error('Restart migration lost records or failed to repair a malformed ramp');
if (restoredRestart.kitConcepts.length !== 4 || restoredRestart.assetsPerCell !== 6)
  throw new Error('Legacy sessions must gain four kit variants and a valid asset target');
for (const count of [4, 6, 8, 10, 12]) {
  const saved = pc.workspaceState.pipeline.items;
  pc.workspaceState.pipeline.items = [];
  restart.assetsPerCell = count;
  for (const cell of ['skin-1', 'kit-1']) {
    if (pc.rsBatch(cell) !== count || pc.rsBatch(cell) !== 0)
      throw new Error('Batch size or deduplication failed at ' + count);
    const items = pc.rsCellItems(pc.rsCell(cell));
    if (
      new Set(items.map((x) => x.name)).size !== count ||
      new Set(items.map((x) => x.requiredRatio)).size !== 3
    )
      throw new Error('Asset IDs or placement coverage failed at ' + count);
    if (pc.rsRosterIssues(pc.rsCell(cell)).length)
      throw new Error('Valid asset count flagged at ' + count);
  }
  if (
    pc.workspaceMigrate({ pipeline: { restart: { assetsPerCell: count } } }).pipeline.restart
      .assetsPerCell !== count
  )
    throw new Error('Saved asset count lost on restore');
  pc.workspaceState.pipeline.items = saved;
}
for (const invalid of [3, 5, 7, 9, 11, 13, 6.5])
  if (pc.rsAssetCount({ assetsPerCell: invalid }) !== 6)
    throw new Error('Invalid asset count accepted');
restart.assetsPerCell = 12;
if (pc.rsBatch('kit-1') !== 6 || pc.plItems().length !== 12)
  throw new Error('Existing six-asset cell must extend to twelve');
pc.plItems().push({ ...pc.plItems()[0], id: 'overflow', restartSlot: 'overflow' });
if (!pc.rsRosterIssues(pc.rsCell('kit-1')).some((x) => x.includes('4–12')))
  throw new Error('Thirteen assets must be flagged');
pc.workspaceState.pipeline.items = pc.plItems().slice(0, 6);
restart.assetsPerCell = 6;
const cellRead = {
  cell: 'kit-1',
  start: '2026-01-01',
  end: '2026-01-14',
  readAfter: '2026-01-17',
  minimumSpend: 500,
  minimumOrders: 10,
  spend: 600,
  orders: 10,
  comparable: true,
  clean: true,
  finding: 'Read',
  limits: 'Observational',
  evidence: 'https://example.com/read',
  decision: 'Confirmed concept',
  confirmed: true,
};
if (pc.rsReadIssues(cellRead, '2026-02-01').length)
  throw new Error('Complete cell evidence failed');
if (
  !pc.rsReadIssues({ ...cellRead, confirmed: false }, '2026-02-01').length ||
  !pc.rsReadIssues({ ...cellRead, readAfter: '2026-03-01' }, '2026-02-01').length
)
  throw new Error('Unconfirmed or immature cell read passed');
restart.mixed = true;
if (!pc.rsReadIssues({ ...cellRead, cell: 'skin-mixed' }, '2026-02-01').length)
  throw new Error('Mixed pool must not confirm a concept');
restart.mixed = false;
Object.assign(restart, {
  start: '2026-01-01',
  reason: 'Destination issue',
  reasonEvidence: 'https://example.com/fix',
  remediated: true,
  accepted: true,
  decision: 'Approved detailed concept-cell budget',
  owner: 'Owner',
  backup: 'Backup',
  checkEvidence: 'Week zero evidence',
});
pc.RS_CHECKS.forEach((c) => (restart.checks[c[0]] = true));
if (pc.rsLaunchIssues(restart).length) throw new Error('Completed week zero did not clear');
if (!pc.rsLaunchIssues({ ...restart, reason: 'Supplement / skincare claim' }).length)
  throw new Error('Skincare claim cause must force a reviewed alternative');
pc.workspaceState.pipeline.items = ['skin-1', 'skin-2', 'kit-1', 'kit-2'].map((cell, i) => ({
  ...ready,
  id: 'winner-' + i,
  concept: pc.rsCell(cell).concept,
  assetUrl: 'https://example.com/asset-' + i,
  restartCell: cell,
  product: cell.startsWith('skin') ? restart.skinName : restart.kitName,
  targetCpa: cell.startsWith('skin') ? 35 : 90,
  observedSpend: 300,
  minimumSpend: 250,
}));
restart.days = Array.from({ length: 90 }, (_, i) => ({
  date: pc.wsShift(restart.start, i),
  skinSpend: 300,
  skinOrders: 10,
  skinMeta: 10,
  kitSpend: 600,
  kitOrders: 10,
  kitMeta: 10,
  disapprovals: 0,
  health: true,
  matched: true,
  evidence: 'Daily verified evidence',
}));
if (!pc.rsGate(restart, '2026-04-01').pass) throw new Error('Complete 90-day fixture must pass');
pc.plItems()[1].assetUrl = pc.plItems()[0].assetUrl;
if (pc.rsGate(restart, '2026-04-01').creative)
  throw new Error('Duplicate asset cannot count as two validated creatives');
pc.plItems()[1].assetUrl = 'https://example.com/asset-1';
restart.days[0].disapprovals = 1;
if (pc.rsGate(restart, '2026-04-01').health)
  throw new Error('A single disapproval must fail restart health');
restart.days[0].disapprovals = 0;
const removedDay = restart.days.pop();
if (pc.rsGate(restart, '2026-04-01').pass) throw new Error('Missing day cannot count as clean');
restart.days.push(removedDay);
restart.days[89].matched = false;
if (pc.rsGate(restart, '2026-04-01').recon)
  throw new Error('Unmatched attribution scope must fail reconciliation');
restart.days[89].matched = true;
for (const tab of [
  'restart',
  'cells',
  'gate',
  'board',
  'planning',
  'checks',
  'learning',
  'scaling',
  'report',
]) {
  pc.plTab = tab;
  pc.renderPipeline();
  if (!operationElements.get('pipeline-app').innerHTML.includes('aria-pressed="true"'))
    throw new Error('Pipeline tab failed render: ' + tab);
}
pc.workspaceState.pipeline = pc.workspaceDefaults().pipeline;
for (const tab of ['restart', 'cells', 'gate']) {
  pc.plTab = tab;
  pc.renderPipeline();
}
console.log(
  `Validated ${views.length} views, ${ids.length} IDs, ${cssFiles.length} stylesheets, and ${scriptFiles.length} scripts, including restart migration, all workspace renders, ramp math, repeat-safe batches, concept evidence and the 90-day gate.`,
);
