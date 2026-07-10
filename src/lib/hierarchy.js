// -------------------------------------------------------------------------
// Combined Rollup Hierarchy (OPER & SG&A)
// Reconstructed EXACTLY from combined_rollup_hierarchy.html so that Org
// Assignment and Facility Hierarchy only ever emit real nodes from the tree.
//
//   Small Palmer ─ Group ─ Division ─ Region
//
//   Palmer   OPER = PS014            SG&A = PS015     (SMALL PALMER ORION)
//   Group    OPER = GV{g}01          SG&A = GV{g}02
//   Division OPER = D{g}{d}01        SG&A = D{g}{d}02
//   Region        = R{g}{d}0{r}      (shared id across both trees)
// -------------------------------------------------------------------------

export const HIER_GROUPS = [
  { name: 'PINNACLE', divisions: ['Pacific', 'Sierra', 'Desert', 'Redwood', 'Coastal'] },
  { name: 'MERIDIAN', divisions: ['Heartland', 'Great Lakes', 'Prairie', 'Midwest', 'Central'] },
  { name: 'ALLIANCE', divisions: ['Atlantic', 'New England', 'Blue Ridge', 'Carolina', 'Emerald'] },
  { name: 'CREST', divisions: ['Gulf Coast', 'Sunbelt', 'Lone Star', 'Delta', 'Bayou'] },
  { name: 'VANGUARD', divisions: ['Keystone', 'Empire', 'Liberty', 'Capital', 'Northern'] },
]

const PALMER_BASE = 'SMALL PALMER ORION'

// local rng (kept here to avoid a circular import with generators.js)
function ri(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function palmerId(type) {
  return type === 'OPER' ? 'PS014' : 'PS015'
}
function groupId(gIdx, type) {
  return `GV${gIdx + 1}${type === 'OPER' ? '01' : '02'}`
}
function divisionId(gIdx, dIdx, type) {
  return `D${gIdx + 1}${dIdx + 1}${type === 'OPER' ? '01' : '02'}`
}
function regionId(gIdx, dIdx, rIdx) {
  return `R${gIdx + 1}${dIdx + 1}0${rIdx + 1}`
}

// "<BASE> : <QUALIFIER>"  — qualifier is 'OPER' | 'SG&A' | 'ALL'
export function qualify(base, qualifier) {
  return `${base} : ${qualifier}`
}

// Parent id = same prefix, numeric portion − 2, width preserved (CRITICAL rule).
export function minusTwoId(id) {
  const m = String(id).match(/^([A-Za-z]+)(\d+)$/)
  if (!m) return id
  const [, prefix, digits] = m
  const num = parseInt(digits, 10) - 2
  return `${prefix}${String(num).padStart(digits.length, '0')}`
}

// A single consistent Palmer→Group→Division→Region chain for one tree type.
export function randomChain(type) {
  const gIdx = ri(0, HIER_GROUPS.length - 1)
  const grp = HIER_GROUPS[gIdx]
  const dIdx = ri(0, grp.divisions.length - 1)
  const rIdx = ri(0, 4)
  const divName = grp.divisions[dIdx]
  return {
    palmer: { id: palmerId(type), base: PALMER_BASE },
    group: { id: groupId(gIdx, type), base: grp.name },
    division: { id: divisionId(gIdx, dIdx, type), base: `${divName} Division` },
    region: { id: regionId(gIdx, dIdx, rIdx), base: `${divName} Region 0${rIdx + 1}` },
  }
}

// Every node at a given level across BOTH trees (for Org Assignment).
export function nodesForLevel(level) {
  const out = []
  for (const type of ['OPER', 'SG&A']) {
    if (level === 'Palmer') {
      out.push({ id: palmerId(type), name: qualify(PALMER_BASE, type) })
    }
    HIER_GROUPS.forEach((grp, gIdx) => {
      if (level === 'Group') {
        out.push({ id: groupId(gIdx, type), name: qualify(grp.name, type) })
      }
      grp.divisions.forEach((dName, dIdx) => {
        if (level === 'Division') {
          out.push({ id: divisionId(gIdx, dIdx, type), name: qualify(`${dName} Division`, type) })
        }
        if (level === 'Region') {
          for (let r = 0; r < 5; r++) {
            out.push({
              id: regionId(gIdx, dIdx, r),
              name: qualify(`${dName} Region 0${r + 1}`, type),
            })
          }
        }
      })
    })
  }
  return out
}

export function randomNodeForLevel(level) {
  const nodes = nodesForLevel(level)
  return nodes[ri(0, nodes.length - 1)]
}
