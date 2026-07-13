# MDM Location Data Generator

A modern, browser-based React application designed to accelerate Quality Assurance for DaVita's Location Master Data Management (MDM) system. This single-page application enables QA engineers to dynamically generate, customize, and execute synthetic JSON and XML/SOAP payloads across multiple test environments. Built for end-to-end pipeline visibility, the tool allows users to post payloads and immediately validate downstream data flow by querying Kafka preprocess/event queues and performing direct EUID lookups.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Production build](#production-build)
- [The interface](#the-interface)
- [Step-by-step: reproduce a result](#step-by-step-reproduce-a-result)
- [Domain reference](#domain-reference)
- [Environments](#environments)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Features

- **7 MDM Sources** — Legal Entity, Org Assignment, Facility Hierarchy, Facility
  Master, Karma, MNA, and NSHN, each with realistic synthetic field values.
- **Editable payloads** — every generated JSON/XML payload is shown in an editable
  panel so you can tweak fields before posting.
- **One-click POST** — send the payload to the selected environment and inspect the
  raw server response.
- **Uniqueness pre-validation** — Legal Entity and Facility Hierarchy loop through
  candidate IDs and run a DB2 check until they find one that does not already exist.
- **ID inheritance** — the Legal Entity ID and Facility Hierarchy Facility ID are
  persisted in-session and automatically reused by the Facility Master payload.
- **Queue validation** — query the `preprocess` and `events` Kafka topics and confirm
  a generated EUID appears in the returned records.
- **End-to-end run** — a single button that generates → posts → extracts the EUID →
  queries both queues and reports each step.
- **Environment switching** — flip between `dev` / `qa` / `uat`; every target URL
  updates instantly.

## Tech stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | React 18                            |
| Build tool | Vite 5                              |
| Styling    | Tailwind CSS 3 (dark theme)         |
| Language   | JavaScript (ES modules, `.jsx`)     |

## Prerequisites

- **Node.js 18 or later** (LTS 20+ recommended) and **npm** (bundled with Node).
  Check with:
  ```bash
  node -v
  npm -v
  ```
- **Network access to the DaVita MDM environments.** Generating payloads works
  anywhere, but posting them and querying the queues requires the machine running the
  app to reach the `dev` / `qa` / `uat` MDM back ends (e.g. on the corporate network
  or VPN).

---

## Quick start

```bash
# 1. Clone the repository
git clone https://github.com/CT-Hackcelerate/MDM-Location-Test-Data-Generator.git
cd MDM-Location-Test-Data-Generator

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser. The dev server hot-reloads on
every file change.


## The interface

The screen is a three-column workspace with a header showing the active environment.

### Left — Data Generator Control
Configure what to build:
- **Environment** — `dev`, `qa`, or `uat`. Switching it re-points every target URL.
- **Domain** — pick one of the seven MDM domains.
- **Sub-option** — a per-domain toggle (e.g. Legal Entity → *Domestic / International*,
  Org Assignment → *Palmer / Division / Group / Region*).
- **Prefix** *(Facility Master only)* — drives which lifecycle dates are populated
  (`ACQ-`, `CLSD-`, `DNVO-`, etc.).
- **Endpoint URL (target)** — read-only preview of the URL the payload will be posted to.
- **Persisted State** — shows the currently stored Legal Entity ID and Hierarchy
  Facility ID that Facility Master will inherit.

### Middle — Generated Payload
- **Generate** — builds the payload for the current domain/options.
- **Editable text area** — review and edit the JSON/XML before sending.
- **Copy to Clipboard** — copy the payload.
- **Run Payload** — POST it to the selected environment.
- **Server Response** — the raw status and body returned by the back end.

### Right — Data Validation Control
- **Run End to End** — automated generate → post → extract EUID → query both queues.
- **Preprocess Queue** — `GET .../mdm.facilities.preprocess/count/10`; optionally match an EUID.
- **Event Queue** — `GET .../mdm.facilities.events/count/2`; optionally match an EUID.
- **Query Location By EUID** — `GET /Location/IS01/getLocationDetailsByEUID?EUID=…`.

---

## Step-by-step: reproduce a result

The following walkthrough posts a **Legal Entity** record and confirms it in the
queues. The same pattern applies to every domain.

1. **Start the app** — run `npm run dev` and open http://localhost:5173.
2. **Choose the environment** — in the left column, select `dev` (or `qa` / `uat`).
   The environment badge in the header and the target URL update accordingly.
3. **Select the domain** — click **Legal Entity**.
4. **Set the sub-option** — choose **Domestic** or **International** (this changes the
   tax number and line-of-business values).
5. **Generate the payload** — in the middle column click **Generate Legal Entity
   Payload**. The app:
   - picks a random 6-digit Legal Entity ID,
   - runs a DB2 uniqueness check and retries until the ID is unused,
   - stores that ID under **Persisted State** (left column),
   - renders the JSON in the editable panel.
6. **(Optional) Edit** — adjust any field directly in the text area.
7. **Post it** — click **Run Payload**. The response status and body appear in the
   **Server Response** panel below. Note the **EUID** returned in the response.
8. **Validate in the queues** — in the right column:
   - paste the EUID into **Preprocess Queue** and click **Query Queue** — a green
     banner confirms `Matched EUID … in queue payload ✓` if the record was picked up,
   - repeat for the **Event Queue**.
9. **Look up the location** — paste the EUID into **Query Location By EUID** and click
   **Get Location** to fetch the fully processed record.

### Shortcut: one-click end-to-end

Instead of steps 5–8, click **Run End to End** in the right column. It performs all of
the above automatically and prints a 4-step log:

```
[1/4] Generating Legal Entity payload…
[2/4] Posting payload…
      POST → 200 OK
      Extracted EUID: 123456
[3/4] Querying preprocess queue…
      preprocess → 200 (EUID matched ✓)
[4/4] Querying event queue…
      events → 200 (EUID matched ✓)
Done.
```

### Chaining Legal Entity → Facility Master

Facility Master reuses IDs from earlier steps, so build them in order:

1. Generate & post a **Legal Entity** → its ID is stored.
2. Generate & post a **Facility Hierarchy** → its Facility ID is stored.
3. Select **Facility Master**, pick a **Prefix**, and generate — the payload
   automatically inherits the stored Legal Entity ID and Facility ID.

---

## Domain reference

| Domain             | Format   | Sub-option                          | Endpoint path                              | Notes                                                                 |
| ------------------ | -------- | ----------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Legal Entity       | JSON     | Domestic / International            | `/Location/IS06/legalEntityMDMProcess`     | DB2 uniqueness check on a 6-digit ID; persists the Legal Entity ID.   |
| Org Assignment     | JSON     | Palmer / Division / Group / Region  | `/Location/IS06/orgAssignment`             | Org number/name pulled from a real rollup-hierarchy node.             |
| Facility Hierarchy | JSON     | OPER / SG&A                         | `/Location/IS06/facilityHierarchy`         | DB2 uniqueness on a 5-digit ID; enforces parent = child − 2 rule.     |
| Facility Master    | JSON     | Domestic / International + Prefix   | `/Location/IS06/facilityMasterMDMProcess`  | Inherits persisted Legal Entity + Facility IDs; prefix sets dates.    |
| Karma              | JSON     | —                                   | `/Location/IS06/locationKarmaLoad`         | Flat row with 11 license/certification blocks.                        |
| MNA                | XML/SOAP | —                                   | `/MDMWSProvider/MDMService`                | SOAP envelope (`maintainMNA`).                                        |
| NSHN               | XML/SOAP | —                                   | `/MDMWSProvider/MDMService`                | SOAP envelope (`maintainFacilityNHSN`).                               |

Validation endpoints used by the right column:

| Purpose            | Endpoint                                                    |
| ------------------ | ---------------------------------------------------------- |
| Preprocess queue   | `/data/topic/mdm.facilities.preprocess/count/10`           |
| Event queue        | `/data/topic/mdm.facilities.events/count/2`                |
| Location by EUID   | `/Location/IS01/getLocationDetailsByEUID?EUID=<euid>`      |
| DB2 uniqueness     | `/Common/IS03/executeDB2Query`                             |

## Environments

Selecting `dev`, `qa`, or `uat` in the left column re-points **all** target URLs to the
corresponding MDM environment. The active environment is always shown in the header
badge, so you can confirm at a glance which back end you are posting to.

## Project structure

```
.
├── index.html                  # App entry HTML
├── vite.config.js              # Vite dev server + build config
├── tailwind.config.js          # Tailwind theme (dark palette)
├── postcss.config.js
├── package.json
└── src
    ├── main.jsx                # React bootstrap
    ├── App.jsx                 # Top-level state + generate/post/validate logic
    ├── index.css               # Tailwind layers + globals
    ├── components
    │   ├── LeftColumn.jsx      # Environment / domain / options controls
    │   ├── MiddleColumn.jsx    # Payload editor + Run + response
    │   ├── RightColumn.jsx     # E2E run + queue queries
    │   └── ui.jsx              # Shared UI primitives (Button, Field, …)
    └── lib
        ├── config.js           # Environments + per-domain endpoint catalog
        ├── api.js              # fetch helpers (POST / GET / DB2 query)
        ├── generators.js       # Per-domain synthetic payload builders
        └── hierarchy.js        # Rollup hierarchy data + parent/child rules
```

## Troubleshooting

| Symptom                                   | Likely cause / fix                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev` fails to start              | Node version too old — upgrade to Node 18+ and re-run `npm install`.               |
| Port 5173 already in use                  | Stop the other process, or run `npm run dev -- --port 5174`.                       |
| POST / queue calls fail or time out       | The MDM back end is unreachable — connect to the corporate network/VPN.            |
| DB2 check says "unreachable, unverified"  | The uniqueness endpoint could not be reached; the ID is used without verification. |
| No EUID found in the response             | The back end returned an error or an unexpected body — check the Server Response.  |
