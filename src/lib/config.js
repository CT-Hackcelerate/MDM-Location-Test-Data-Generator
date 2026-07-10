// -------------------------------------------------------------------------
// Environment + endpoint configuration
// -------------------------------------------------------------------------

export const ENVIRONMENTS = ['dev', 'qa', 'uat']

// Which proxy base a call routes through (see vite.config.js).
export const BASES = {
  mdmace: {
    proxy: (env) => `/proxy/mdmace/${env}`,
    real: (env) => `https://mdmace-${env}.davita.com`,
  },
  kafka: {
    proxy: (env) => `/proxy/kafka/${env}`,
    real: (env) => `https://intgkafka-${env}-rest-apis.int-svcs-np.davita.com`,
  },
  soap: {
    proxy: (env) => `/proxy/soap/${env}`,
    real: (env) => `https://mdm-${env}.davita.com:443`,
  },
}

// Build the relative proxy URL the browser actually fetches.
export function proxyUrl(base, env, path) {
  return `${BASES[base].proxy(env)}${path}`
}

// Build the real target URL (display only — never fetched directly).
export function realUrl(base, env, path) {
  return `${BASES[base].real(env)}${path}`
}

// Shared DB2 query endpoint used for uniqueness pre-validation.
export const DB2_QUERY_PATH = '/Common/IS03/executeDB2Query'

// -------------------------------------------------------------------------
// Domain catalog
// -------------------------------------------------------------------------

export const DOMAINS = {
  legalEntity: {
    label: 'Legal Entity',
    base: 'mdmace',
    path: '/Location/IS06/legalEntityMDMProcess',
    format: 'json',
    subToggles: { label: 'Type', options: ['Domestic', 'International'] },
  },
  orgAssignment: {
    label: 'Org Assignment',
    base: 'mdmace',
    path: '/Location/IS06/orgAssignment',
    format: 'json',
    subToggles: { label: 'Level', options: ['Palmer', 'Division', 'Group', 'Region'] },
  },
  facilityHierarchy: {
    label: 'Facility Hierarchy',
    base: 'mdmace',
    path: '/Location/IS06/facilityHierarchy',
    format: 'json',
    subToggles: { label: 'Type', options: ['OPER', 'SG&A'] },
  },
  facilityMaster: {
    label: 'Facility Master',
    base: 'mdmace',
    path: '/Location/IS06/facilityMasterMDMProcess',
    format: 'json',
    subToggles: { label: 'Type', options: ['Domestic', 'International'] },
    prefixes: [
      'None/Standard',
      'ACQ-',
      'CLSD-',
      'CNXL-',
      'DNVO-',
      'HOLD-',
      'SOLD-',
      'TERM-',
      'JV DNVO-',
      'DIVEST-',
      'DARK-',
      'INTL',
    ],
  },
  karma: {
    label: 'Karma',
    base: 'mdmace',
    path: '/Location/IS06/locationKarmaLoad',
    format: 'json',
  },
  mna: {
    label: 'MNA',
    base: 'soap',
    path: '/MDMWSProvider/MDMService',
    format: 'xml',
  },
  nshn: {
    label: 'NSHN',
    base: 'soap',
    path: '/MDMWSProvider/MDMService',
    format: 'xml',
  },
}

export const DOMAIN_ORDER = [
  'legalEntity',
  'orgAssignment',
  'facilityHierarchy',
  'facilityMaster',
  'karma',
  'mna',
  'nshn',
]
