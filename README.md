# MDM Location Data Generator

A dark-mode React + Vite SPA for QA testers to generate synthetic test payloads
(JSON & XML) for DaVita's Location MDM system, post them, and query Kafka queues.

## Run

```bash
cd mdm-location-data-generator
npm install
npm run dev
```

Open http://localhost:5173

## CORS / Proxy

The frontend **never** calls the `davita.com` hosts directly. All requests go to
relative `/proxy/...` paths that Vite forwards server-side (see `vite.config.js`):

| Proxy prefix          | Real target                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `/proxy/mdmace/<env>` | `https://mdmace-<env>.davita.com`                                  |
| `/proxy/kafka/<env>`  | `https://intgkafka-<env>-rest-apis.int-svcs-np.davita.com`         |
| `/proxy/soap/<env>`   | `https://mdm-<env>.davita.com:443`                                 |

`<env>` is one of `dev` / `qa` / `uat`, chosen in the left column and resolved by
the proxy `router` at request time.

## Layout

- **Left** — environment + domain + sub-toggle/prefix selection; read-only target URL.
- **Middle** — Generate → editable payload → Copy / Run POST → server response.
- **Right** — End-to-end validation, preprocess/event queue queries, location-by-EUID.

## Domains

Legal Entity, Org Assignment, Facility Hierarchy, Facility Master (with prefix date
logic), Karma (11 license blocks), MNA (XML/SOAP), NSHN (XML/SOAP). Legal Entity and
Facility Hierarchy run DB2 uniqueness pre-validation and persist their generated IDs
for Facility Master inheritance.
