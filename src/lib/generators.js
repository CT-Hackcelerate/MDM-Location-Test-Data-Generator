// -------------------------------------------------------------------------
// Synthetic data helpers + per-domain payload generators
// -------------------------------------------------------------------------
import {
  randomChain,
  randomNodeForLevel,
  minusTwoId,
  qualify,
} from './hierarchy.js'

// ---- random primitives ---------------------------------------------------

export function randDigits(n) {
  let s = ''
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10)
  return s
}

// 19-digit random (no leading zero) — used for meta.id / requestID
export function rand19() {
  return String(Math.floor(Math.random() * 9) + 1) + randDigits(18)
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---- date/time formatting -------------------------------------------------

function pad(n, w = 2) {
  return String(n).padStart(w, '0')
}

// YYYY-MM-DD
export function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// YYYY-MM-DD HH:mm:ss
export function fmtDateTimeSec(d) {
  return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// YYYY-MM-DD HH:mm:ss.fff  (milliseconds)
export function fmtDateTimeMs(d) {
  return `${fmtDateTimeSec(d)}.${pad(d.getMilliseconds(), 3)}`
}

// YYYY-MM-DD HH:mm:ss.ffffff  (JS gives ms only, pad remaining microseconds)
export function fmtTimestamp(d) {
  return `${fmtDateTimeSec(d)}.${pad(d.getMilliseconds(), 3)}${randDigits(3)}`
}

// XML variant uses a single-digit fractional second (".0")
export function fmtTimestampXml(d) {
  return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds(),
  )}.0`
}

function nowTimestamp() {
  return fmtTimestamp(new Date())
}

function addYears(base, years) {
  const d = new Date(base)
  d.setFullYear(d.getFullYear() + years)
  return d
}

// ---- fake vocab -----------------------------------------------------------

const COMPANIES = [
  'Summit Renal', 'Cascade Care', 'Beacon Health', 'Harbor Dialysis',
  'Cedar Ridge', 'Ironwood', 'Silverline', 'Northgate', 'Bluewater',
  'Redwood Kidney', 'Granite Peak', 'Meridian', 'Everest Renal', 'Lakeshore',
]
const SUFFIXES = ['LLC', 'Inc', 'Corp', 'Holdings', 'Group', 'Partners', 'PLLC']
const FIRST = ['James', 'Mary', 'Robert', 'Linda', 'Michael', 'Patricia', 'David', 'Jennifer', 'William', 'Karen']
const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Lopez']

const CITIES = [
  'Jacksonville', 'Franklin', 'Brentwood', 'Denver', 'Portland', 'Savannah',
  'Fresno', 'Boulder', 'Tacoma', 'Irvine', 'Berwyn', 'Charlotte', 'Aurora',
]

function fakeCompany() {
  return `${pick(COMPANIES)} ${pick(SUFFIXES)}`
}
function fakeFacilityName() {
  return `${pick(CITIES)} Dialysis Clinic`
}
function fakeName() {
  return `${pick(FIRST)} ${pick(LAST)}`
}
function fakeEmail(name) {
  return `${name.toLowerCase().replace(/[^a-z]/g, '.')}@davita-synth.com`
}
function taxNumber() {
  return `${randDigits(2)}-${randDigits(7)}`
}
function phone() {
  return randDigits(10)
}
// alphanumeric id, e.g. "04D0962298"
function alnumId(len = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[randInt(0, chars.length - 1)]
  return s
}

// A past Date within [minYear, maxYear].
function pastDate(minYear = 2016, maxYear = 2023) {
  return new Date(
    randInt(minYear, maxYear),
    randInt(0, 11),
    randInt(1, 28),
    randInt(0, 23),
    randInt(0, 59),
    randInt(0, 59),
    randInt(0, 999),
  )
}
function plusYears(d, years) {
  const n = new Date(d)
  n.setFullYear(n.getFullYear() + years)
  return n
}
// Returns { start, exp } license datetimes (.fff), exp ~7 years after start.
function licenseDates() {
  const start = pastDate(2006, 2022)
  return { start: fmtDateTimeMs(start), exp: fmtDateTimeMs(plusYears(start, 7)) }
}

// -------------------------------------------------------------------------
// Data dictionaries
// -------------------------------------------------------------------------
const DOMESTIC_LOBS = [
  'Charity', 'CKC-Chronic Kidney Care', 'Corporate', 'Corporate Top Level',
  'DaVita Complex Care', 'DaVita Ventures', 'DCR-Clinical Trials and Studies',
  'DCR-Research and Development', 'Dialysis', 'Dialysis Home Health Agency (SAHHD)',
  'Disease Management', 'DPC-Direct Primary Care', 'DPC-Paladina Clinic',
  'DVH-DaVita Village Health', 'HealthCare Partners', 'HomeChoice Partners',
  'IKC-Integrated Kidney Care', 'Insurance', 'Lab', 'Lifeline',
  'Nephrology Care Alliance', 'NPS', 'NPS-Managed Nephrology Practice', 'Pharmacy',
  'Physicains Billing Services', 'PSO (Patient Safety Organization)',
  'Real Estate Development', 'Software', 'Strategic Initiative',
]
const INTERNATIONAL_LOBS = [
  'INTL-Clinical Research', 'INTL-Corporate Top Level', 'INTL-Dialysis',
  'INTL-Dialysis Support', 'INTL-Health Services',
]
const INTERNATIONAL_TAX = [
  'XX-Brazil', 'XX-Chile', 'XX-China', 'XX-Colombi', 'XX-Denmark', 'XX-Ecuador',
  'XX-Germany', 'XX-HongKon', 'XX-India', 'XX-Japan', 'XX-Korea', 'XX-Malaysia',
  'XX-Managed', 'XX-Netherland', 'XX-Panama', 'XX-Philipp', 'XX-Poland',
  'XX-Portugal', 'XX-SaudiAr', 'XX-Singapo', 'XX-Sweden', 'XX-Taiwan', 'XX-Thailan',
  'XX-UKingdo',
]

// Facility Master dictionaries
const FM_CBO = [
  'Berwyn', 'Brentwood', 'Corporate Strategic Initiative', 'Denver',
  'HRIS System Mapping', 'International', 'Irvine', 'JV-Brent', 'JV-Tacoma',
  'MGMT Contract', 'None', 'SI Startup', 'Tacoma',
]
const FM_ACQ_COMPANY = [
  'Acquisition', 'CODA', 'CODA,RTC ACQ', 'Corporate Structure', 'DNP Acquisition',
  'DNP DNVO', 'DSI', 'Gambro', 'Managed', 'NY ACQ', 'Prison Contract',
  'REN - Gambro', 'SI ACQ', 'SI Startup',
]
const FM_PARENT_CHILD = ['Parent', 'Child']
const FM_FINANCE_ROLLUP = ['ANCL0', 'GHPR0', 'INTAN', 'INTGA', 'INTOP', 'OPER0', 'SG&A0']
const FM_PROCUREMENT = [
  'Acquisition', 'All Other', 'Corporate Request', 'Denovo', 'Field Request',
  'Managed', 'Payroll System Mapping',
]
const FM_LOB = [
  'Dialysis', 'Dialysis Acute only', 'Dialysis Support',
  'Dialysis Prison Contracts only', 'Corporate Top Level', 'NPS',
  'NPS-Managed Nephrology Practice', 'DaVitaCare', 'INTL-Dialysis',
  'INTL-Dialysis Support', 'Corporate', 'Lab', 'DCR-Clinical Trials and Studies',
  'Strategic Initiative', 'DVH-Health Plan', 'Pharmacy', 'Charity',
]
const FM_FACILITY_TYPE = [
  'Facilities Operations', 'Regional Office', 'N/A', 'Lifeline Services',
  'Division Office', 'Operations (NPS)', 'DaVita Care Services',
  'LAB-General Laboratory', 'International-Team Embassy', 'Executive',
  'Direct Primary Care', 'Corporate Finance', 'Dialysis Operations Support',
]
const FM_ADMINS = [
  'LORENA ALBA', 'VACANT POSITION', 'NOT APPLICABLE', 'N/A', 'TRISHA SORENSON',
  'MICHAEL HERRICK', 'CYNTHIA MOORE',
]
// Territory code -> short name (intersection of both dictionaries)
const FM_TERRITORY = [
  { code: 'US', name: 'United States' },
  { code: 'IT', name: 'Italy' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'EC', name: 'Ecuador' },
]

// Karma dictionaries
const KARMA_LOCATION_TYPE = [
  'Unknown', 'Freestanding Dialysis Facility', 'Acute Program', 'Prison System',
  'Other', 'null', 'Acquisition', 'Homechoice', 'At Home Program', 'Closed',
  'Temporarily Closed', 'DeNovo', 'Lifeline', 'PD Only Location',
]
const KARMA_REGULATORY_NAME = [
  'Grand Blanc Dialysis Center', 'Dyker Heights Dialysis Center',
  'Port Chester Dialysis and Renal Center', 'Celebration Dialysis',
  'Palmer Dialysis Center', 'Hunters Creek Dialysis',
]
const KARMA_FISCAL_INTERMEDIARY = [
  'Cahaba GBA - AL (J10)', 'Noridian - UT (JF)', 'Novitas (CO - JH)',
  'WPS - KS (J5)', 'Novitas (PA - JL)', 'WPS - NE (J5)', 'Cahaba GBA - GA (J10)',
  'Novitas (AR - JH)',
]
const KARMA_LC_COORDINATOR = ['Edmondson, Sharon', 'Cardno, Lynn', 'Kohel, Emily']
const KARMA_CERTSRV = ['In-center Hemo', 'PD', 'HEMO', 'null', 'Reuse', 'HHD']

// =========================================================================
// A. Legal Entity
// =========================================================================
export function genLegalEntity({ subToggle, legalId }) {
  const international = subToggle === 'International'
  const stamp = fmtDateTimeSec(new Date())
  return {
    meta: {
      id: rand19(),
      lastUpdated: stamp,
      tag: [{ display: 'legalEntity' }],
    },
    legalEntity: {
      legalIdentificationNumber: legalId || randDigits(6),
      legalEntityName: `SYNTH - ${fakeCompany()}`,
      taxNumber: international ? pick(INTERNATIONAL_TAX) : taxNumber(),
      lineOfBusiness: international ? pick(INTERNATIONAL_LOBS) : pick(DOMESTIC_LOBS),
      lastUpdateDate: stamp,
    },
  }
}

// =========================================================================
// B. Org Assignment
//    orgNumber / orgName are pulled from a REAL node of the selected level
//    in the combined rollup hierarchy (OPER & SG&A).
// =========================================================================
export function genOrgAssignment({ subToggle }) {
  const level = subToggle || 'Palmer'
  const node = randomNodeForLevel(level)

  const isPalmer = level === 'Palmer'
  const isGroup = level === 'Group'
  const isDivision = level === 'Division'
  const isRegion = level === 'Region'

  const groupName = fakeName()
  const divName = fakeName()

  return {
    meta: { id: rand19(), lastUpdated: nowTimestamp() },
    OrgAssignment: {
      orgNumber: node.id,
      orgName: node.name,
      smallPalmerVp: isPalmer ? fakeName() : '',
      groupVp: isGroup ? fakeName() : '',
      groupFinanceDirector: isGroup ? groupName : '',
      gfdEmail: isGroup ? fakeEmail(groupName) : '',
      divisionVp: isDivision ? fakeName() : '',
      divisionFinanceManager: isDivision ? divName : '',
      dfmEmail: isDivision ? fakeEmail(divName) : '',
      regionOperationsDirector: isRegion ? fakeName() : '',
      dateCreatedInOracle: '2023-01-01',
      lastUpdatedInOracle: '2023-01-01',
      lastTableRefreshDate: '2023-01-01',
    },
  }
}

// =========================================================================
// C. Facility Hierarchy
//    Nodes (id + name) come from ONE real Palmer→Group→Division→Region chain
//    in the combined rollup hierarchy. The Parent for each level keeps the
//    CRITICAL rule: parent numeric portion = child numeric portion - 2, and
//    the parent name is that node's ": ALL" rollup.
// =========================================================================
export function genFacilityHierarchy({ subToggle, facilityId }) {
  const type = subToggle === 'OPER' ? 'OPER' : 'SG&A'
  const chain = randomChain(type)

  // For a hierarchy node, produce the child + rollup-parent fields.
  const level = (node) => ({
    childId: node.id,
    childName: qualify(node.base, type),
    parentId: minusTwoId(node.id),
    parentName: qualify(node.base, 'ALL'),
  })

  const p = level(chain.palmer)
  const g = level(chain.group)
  const d = level(chain.division)
  const r = level(chain.region)

  return {
    meta: { id: rand19(), lastUpdated: nowTimestamp() },
    facilityHierarchy: {
      facilityIdentificationNumber: facilityId || randDigits(5),
      smallPalmerParentId: p.parentId,
      smallPalmerId: p.childId,
      smallPalmerParentName: p.parentName,
      smallPalmerName: p.childName,
      groupParentId: g.parentId,
      groupId: g.childId,
      groupParentName: g.parentName,
      groupName: g.childName,
      divisionParentId: d.parentId,
      divisionId: d.childId,
      divisionParentName: d.parentName,
      divisionName: d.childName,
      regionParentId: r.parentId,
      regionId: r.childId,
      regionParentName: r.parentName,
      regionName: r.childName,
    },
  }
}

// =========================================================================
// D. Facility Master
// =========================================================================
// Prefix -> which lifecycle dates are populated.
function prefixDates(prefix) {
  const start = new Date('2023-01-01T00:00:00')
  const acq = fmtDate(start)
  const startD = fmtDate(start)
  const end = fmtDate(addYears(start, 2))
  const denovo = fmtDate(addYears(start, 1))
  const nulls = {
    acquistionDate: null,
    operatingStartDate: null,
    accountingStartDate: null,
    operatingEndDate: null,
    accountingEndDate: null,
  }
  switch (prefix) {
    case 'ACQ-':
      return { ...nulls, acquistionDate: acq, operatingStartDate: startD, accountingStartDate: startD }
    case 'DNVO-':
    case 'JV DNVO-':
      return { ...nulls, operatingStartDate: denovo, accountingStartDate: denovo }
    case 'CLSD-':
    case 'SOLD-':
    case 'TERM-':
    case 'CNXL-':
    case 'DIVEST-':
    case 'DARK-':
      return {
        ...nulls,
        operatingStartDate: startD,
        accountingStartDate: startD,
        operatingEndDate: end,
        accountingEndDate: end,
      }
    case 'HOLD-':
      return nulls
    case 'INTL':
    case 'None/Standard':
    default:
      return { ...nulls, operatingStartDate: startD, accountingStartDate: startD }
  }
}

export function genFacilityMaster({ subToggle, prefix, facilityId, legalId }) {
  const pfx = prefix && prefix !== 'None/Standard' && prefix !== 'INTL' ? `${prefix} ` : ''
  const baseName = fakeFacilityName()
  const legalName = `${pfx}${baseName}`
  const dates = prefixDates(prefix)
  const international = subToggle === 'International' || prefix === 'INTL'
  const stamp = fmtTimestamp(new Date())

  const territory = international
    ? pick(FM_TERRITORY.filter((t) => t.code !== 'US'))
    : FM_TERRITORY[0] // US

  const lineOfBusiness = international
    ? pick(FM_LOB.filter((l) => l.startsWith('INTL-')))
    : pick(FM_LOB.filter((l) => !l.startsWith('INTL-')))

  return {
    meta: {
      id: rand19(),
      lastUpdated: stamp,
      tag: [{ display: 'facilityMaster' }],
    },
    facilityMaster: {
      facilityIdentificationNumber: facilityId || randDigits(5),
      facilityLegalName: legalName,
      facilityDescription: legalName,
      facilityCommonName: `SYNTH - ${legalName}`,
      cbo: international ? 'International' : pick(FM_CBO),
      cms5StarRating: String(randInt(1, 5)),
      acquisitionCompany: prefix === 'ACQ-' ? pick(FM_ACQ_COMPANY) : null,
      formerFacilityId: 'N/A',
      accountingStartDate: dates.accountingStartDate,
      accountingEndDate: dates.accountingEndDate,
      operatingStartDate: dates.operatingStartDate,
      operatingEndDate: dates.operatingEndDate,
      parentChild: pick(FM_PARENT_CHILD),
      acquistionDate: dates.acquistionDate,
      financeMajorRollUp: pick(FM_FINANCE_ROLLUP),
      legalEntityIdNumber: legalId || randDigits(6),
      procurementMethod: pick(FM_PROCUREMENT),
      businessSegment: international ? 'INTL-DaVita International' : 'DKC-DaVita Kidney Care',
      lineOfBusiness,
      facilityType: pick(FM_FACILITY_TYPE),
      facilityAdministrator: pick(FM_ADMINS),
      physicalStreet1: '5001 POPLAR FARMS',
      physicalStreet2: null,
      physicalCity: 'FRANKLIN',
      physicalState: 'TN',
      physicalZip: '37067',
      county: 'Williamson',
      phone: phone(),
      fax: phone(),
      groupFacilityAdministrator: pick(FM_ADMINS),
      territoryCode: territory.code,
      territoryShortName: territory.name,
      dateCreatedInOracle: '2011-08-18 02:47:00',
      lastUpdatedInOracle: stamp,
      lastTableRefreshDate: stamp,
    },
  }
}

// =========================================================================
// E. Karma  (flat row of licenses, dates + address block)
// =========================================================================
export function genKarma() {
  const alarm = licenseDates()
  const city = licenseDates()
  const county = licenseDates()
  const fire = licenseDates()
  const hazard = licenseDates()
  const medicaid = licenseDates()
  const parish = licenseDates()
  const state = licenseDates()
  const zone = licenseDates()
  const medicare = licenseDates()
  const clia = licenseDates()

  const row = {
    FacilityMasterID: randDigits(6),
    FacilityNo: randDigits(5),
    NumberofCertifiedStations: String(randInt(1, 20)),
    FiscalIntermediary: pick(KARMA_FISCAL_INTERMEDIARY),
    LocationType: pick(KARMA_LOCATION_TYPE),
    AddedDate: fmtDateTimeMs(pastDate(2002, 2010)),
    ModifiedDate: fmtDateTimeMs(pastDate(2018, 2023)),
    TransmittalDate: fmtDateTimeMs(pastDate(2018, 2023)),

    AlarmBusinessLicense: randDigits(10),
    AlarmBusinessLicenseStartDate: alarm.start,
    AlarmBusinessLicenseExpirationDate: alarm.exp,
    AlarmBusinessLicenseRenewalDueDate: null,

    CityBusinessLicenseNumber: randDigits(7),
    CityBusinessLicenseStartDate: city.start,
    CityBusinessLicenseExpirationDate: city.exp,
    CityBusinessLicenseRenewalDueDate: null,

    CLIALicenseNumber: `${randDigits(2)}D${randDigits(7)}`,
    CLIAStartDate: fmtDateTimeSec(pastDate(2018, 2022)),
    CLIAExpirationDate: fmtDateTimeSec(pastDate(2028, 2032)),

    CountyBusinessLicenseNumber: randDigits(7),
    CountyBusinessLicenseStartDate: county.start,
    CountyBusinessLicenseExpirationDate: county.exp,
    CountyBusinessLicenseRenewalDueDate: null,

    FireSafetyBusinessLicenseNumber: randDigits(8),
    FireSafetyBusinessLicenseStartDate: fire.start,
    FireSafetyBusinessLicenseExpirationDate: fire.exp,
    FireSafetyBusinessLicenseRenewalDueDate: null,

    HazardousWasteNumber: randDigits(8),
    HazardousWasteStartDate: hazard.start,
    HazardousWasteExpirationDate: hazard.exp,

    PrimaryMedicaidCertNumber: randDigits(8),
    MedicaidStartDate: medicaid.start,
    MedicaidExpirationDate: medicaid.exp,

    ParishBusinessLicenseNumber: randDigits(8),
    ParishBusinessLicenseStartDate: parish.start,
    ParishBusinessLicenseExpirationDate: parish.exp,
    ParishBusinessLicenseRenewalDueDate: null,

    StateBusinessLicenseNumber: randDigits(8),
    StateBusinessLicenseStartDate: state.start,
    StateBusinessLicenseExpirationDate: state.exp,
    StateLicenseRenewalDueDate: null,

    ZoneBusinessLicenseNumber: randDigits(8),
    ZoneBusinessLicenseStartDate: zone.start,
    ZoneBusinessLicenseExpirationDate: zone.exp,
    ZoneBusinessLicenseRenewalDueDate: null,

    MedicareCertNumber: `${randDigits(2)}-${randDigits(4)}`,
    MedicareStartDate: medicare.start,
    MedicareExpirationDate: medicare.exp,

    PermissionDateCreated: fmtDateTimeMs(pastDate(2006, 2010)),
    PermissionDateModified: null,
    NPI: randDigits(10),
    RegulatoryPermissionNumberDateModified: fmtDateTimeMs(pastDate(2020, 2023)),
    RegulatoryPermissionNumberDateCreated: fmtDateTimeMs(pastDate(2006, 2010)),

    Pay_ToPOBox: `${randDigits(4)} Monroe Street`,
    Pay_ToCity: 'Denver',
    Pay_ToState: 'CO',
    Pay_ToZip: '80206',
    AddressDateModified: fmtDateTimeMs(pastDate(2020, 2023)),

    NumberofIsolationStations: randInt(0, 12),
    FacilityRegulatoryName: pick(KARMA_REGULATORY_NAME),
    FacilityMasterDetailDateCreated: fmtDateTimeMs(pastDate(2006, 2010)),
    FacilityMasterDetailDateModified: fmtDateTimeMs(pastDate(2020, 2023)),
    LCCoordinatorName: pick(KARMA_LC_COORDINATOR),
    RegulatoryContactDateModified: null,
    RegulatoryContactDateCreated: null,
  }

  return {
    meta: {
      id: rand19(),
      tag: [{ display: 'KarmaLoad' }],
    },
    loadType: 'byId',
    MDM_KARMA_PUB: {
      row,
      CS: {
        CERTSRV0_SHORTDESC: pick(KARMA_CERTSRV),
        CERTSRV1_LONGDESC: pick(KARMA_CERTSRV),
        CERTSRV2_SHORTDESC: pick(KARMA_CERTSRV),
        CERTSRV3_LONGDESC: pick(KARMA_CERTSRV),
        CERTSRV4_SHORTDESC: null,
        CERTSRV5_LONGDESC: null,
        CERTSRV6_SHORTDESC: null,
        CERTSRV7_LONGDESC: null,
      },
    },
  }
}

// =========================================================================
// F. MNA (XML)
// =========================================================================
export function genMna() {
  const reqId = rand19()
  const facility = randDigits(5)
  const rcg = randDigits(5)
  const county = randDigits(5)
  return `<NS1:Envelope xmlns:NS1="http://schemas.xmlsoap.org/soap/envelope/">
	<NS1:Header>
		<NS2:Security xmlns:NS2="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" NS1:mustUnderstand="1">
			<NS2:UsernameToken>
				<NS2:Username>mdm_castiron_user</NS2:Username>
				<NS2:Password>passw0rd</NS2:Password>
			</NS2:UsernameToken>
		</NS2:Security>
	</NS1:Header>
	<NS1:Body>
		<NS3:maintainMNA xmlns:NS3="http://location.p1.mdm.dva.com/DVA_Location/port">
			<NS4:RequestControl xmlns:NS4="http://www.ibm.com/mdm/schema">
				<NS4:requestID>${reqId}</NS4:requestID>
				<NS4:DWLControl>
					<NS4:requesterName>MNA_SVC_ACE</NS4:requesterName>
					<NS4:requesterLanguage>100</NS4:requesterLanguage>
					<NS4:clientSystemName>100006</NS4:clientSystemName>
					<NS4:userRole>DV_2</NS4:userRole>
					<NS4:ControlExtensionProperty name="DOMAIN">LOCATION</NS4:ControlExtensionProperty>
					<NS4:ControlExtensionProperty name="ERROR_TYPE"/>
				</NS4:DWLControl>
			</NS4:RequestControl>
			<NS5:MNAINPUTBObj xmlns:NS5="http://www.ibm.com/mdm/schema">
				<NS5:FACILITY_NBR>${facility}</NS5:FACILITY_NBR>
				<NS5:RCG_ID>R${rcg}</NS5:RCG_ID>
				<NS5:COUNTY_FIPS>${county}</NS5:COUNTY_FIPS>
				<NS5:LATITUDE>40.671783</NS5:LATITUDE>
				<NS5:LONGITUDE>-78.250454</NS5:LONGITUDE>
				<NS5:CBSA_FIPS>11020</NS5:CBSA_FIPS>
				<NS5:CBSA_NAME>TEST PA</NS5:CBSA_NAME>
				<NS5:MSA_TYPE>Metropolitan</NS5:MSA_TYPE>
				<NS5:VSA_ID>3</NS5:VSA_ID>
				<NS5:VSA_NAME>Altoonaa PAA</NS5:VSA_NAME>
				<NS5:FMIDType>100011</NS5:FMIDType>
				<NS5:ADDRESSType>100003</NS5:ADDRESSType>
				<NS5:RCGIDType>100006</NS5:RCGIDType>
			</NS5:MNAINPUTBObj>
		</NS3:maintainMNA>
	</NS1:Body>
</NS1:Envelope>`
}

// =========================================================================
// G. NSHN (XML)
// =========================================================================
export function genNshn() {
  const reqId = rand19()
  const orgId = randDigits(5)
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soapenv:Header>
        <wsse:Security xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <wsse:UsernameToken>
                <wsse:Username>mdmadmin</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">password</wsse:Password>
            </wsse:UsernameToken>
        </wsse:Security>
    </soapenv:Header>
    <soapenv:Body>
        <maintainFacilityNHSN xmlns="http://location.p1.mdm.dva.com/DVA_Location/port">
            <RequestControl xmlns="http://www.ibm.com/mdm/schema">
                <requestID>${reqId}</requestID>
                <DWLControl>
                    <requesterName>SOAP_YOURNAME</requesterName>
                    <requesterLanguage>100</requesterLanguage>
                    <clientSystemName>100011</clientSystemName>
                    <userRole>DKC_Department</userRole>
                </DWLControl>
            </RequestControl>
            <FACILITY_NHSNBObj xmlns="http://www.ibm.com/mdm/schema">
                <ORG_ID>${orgId}</ORG_ID>
                <OID>2.16.840.1.114222.4.1.217194</OID>
                <NAME>SYNTH OLYMPIC VIEW DIALYSIS CENTER</NAME>
                <FILE_DT>2023-10-20</FILE_DT>
                <MODIFY_DT>2023-10-20</MODIFY_DT>
                <IS_DELETED>N</IS_DELETED>
                <TCRMOrganizationBObj>
                    <DisplayName>DVH-Integrated Care Center</DisplayName>
                    <PartyType>O</PartyType>
                    <CreatedDate>2023-03-10 11:43:42.722</CreatedDate>
                    <SinceDate>2023-10-13 10:19:48.0</SinceDate>
                    <ClientStatusType>100003</ClientStatusType>
                    <PartyActiveIndicator>Y</PartyActiveIndicator>
                    <LastVerifiedDate>2023-10-25 17:28:41.0</LastVerifiedDate>
                    <SourceIdentifierType>100008</SourceIdentifierType>
                    <AccessTokenValue>46616c6365gs41d5ts4gs4gd2e20363d567f890</AccessTokenValue>
                    <OrganizationType>100404</OrganizationType>
                    <TCRMOrganizationNameBObj>
                        <OrganizationName>DVH-Integrated Care Center</OrganizationName>
                        <StartDate>2023-03-10 11:43:42.727</StartDate>
                        <NameUsageType>100007</NameUsageType>
                        <LastVerifiedDate>2023-10-25 17:28:41.0</LastVerifiedDate>
                        <SourceIdentifierType>100008</SourceIdentifierType>
                        <SOrganizationName>DVH-INTEGRATED CARE CENTER</SOrganizationName>
                    </TCRMOrganizationNameBObj>
                </TCRMOrganizationBObj>
            </FACILITY_NHSNBObj>
        </maintainFacilityNHSN>
    </soapenv:Body>
</soapenv:Envelope>`
}
