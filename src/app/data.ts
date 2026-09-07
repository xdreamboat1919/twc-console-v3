export const navigation = [
  'Overview',
  'Campaigns',
  'Ad sets',
  'Creatives',
  'Audiences',
  'Reports',
  'Experiments',
  'Alerts',
  'Notes',
] as const;

export const metrics = [
  { label: 'Spend', value: '$18,742', change: '12.4%', tone: 'positive' },
  { label: 'Orders', value: '1,246', change: '15.7%', tone: 'positive' },
  { label: 'CPA', value: '$15.04', change: '8.6%', tone: 'positive' },
  { label: 'ROAS', value: '3.86x', change: '14.3%', tone: 'positive' },
] as const;

export const campaigns = [
  {
    name: 'Skincare hero',
    status: 'On track',
    spend: '$9,842',
    orders: '682',
    cpa: '$14.43',
    roas: '4.21x',
    note: 'Strong creative fatigue resistance',
    tone: 'healthy',
  },
  {
    name: 'Preparedness kit',
    status: 'Needs attention',
    spend: '$8,900',
    orders: '564',
    cpa: '$15.78',
    roas: '3.41x',
    note: 'Rising CPA, review landing page',
    tone: 'watch',
  },
] as const;

export const suggestedPrompts = [
  'Why is CPA increasing for Preparedness kit?',
  'Show top levers to lower CPA',
  'Suggest creative tests for Skincare hero',
] as const;
