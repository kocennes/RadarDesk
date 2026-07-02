# RadarDesk

RadarDesk is a JavaScript/TypeScript learning project that will grow into a web dashboard lab.

The long-term goal is to practice:

- JavaScript and TypeScript basics
- React + TypeScript frontend development
- Forms, tables, cards, dashboards, and maps
- API integration
- Backend deployment
- PostgreSQL with Neon
- Free-tier deployment with Firebase/Vercel + Render + Neon

## Current Scripts

```bash
npm run dev
npm run server
npm run build
npm test
npm run test:coverage
npm run server:dev
npm run server:typecheck
npm run hello
```

On Windows PowerShell, if `npm.ps1` is blocked by execution policy, use:

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run test:coverage
npm.cmd run server:dev
npm.cmd run server:typecheck
npm.cmd run hello
```

## UI-First MVP

The first RadarDesk screen is a React + TypeScript dashboard powered by mock data:

- Summary cards
- Device status list
- Device search and status filtering
- Alert list
- Alert severity filtering
- Project intake draft form
- Device discovery panel where a detected device is selected first, then named by the user for its real field role
- Camera verification panel with mock stream metadata
- Lazy-loaded Leaflet operation map with mock markers, range rings, and alert overlays

## Current Product Direction

The immediate product flow is local single-user device setup, not a full admin panel. The first screen should help a user connect or discover whatever devices they have available, select a detected camera/radar/RF device, give it a field name, and see it in the device list.

For the local-first product experience, assume the user has the full local operations package. The UI should not hide major panels because of package/module entitlements. Instead, panels should become useful as devices are connected: if no camera is connected, the camera/evidence panel can show an empty state; if a radar or RF receiver is connected, the matching data pipeline and panels should become active.

Customer, package, role, and access-group modeling can stay in the codebase for later enterprise/admin work, but it should not block or shape the first setup experience.

## Local-First Data Policy

Camera snapshots, short event clips, detection evidence, device connection settings, and operational logs should stay on the local backend machine by default. Cloud storage, external analytics, or remote sync must be opt-in later, not the default.

For event records, store metadata and a local file reference rather than embedding raw media in the database. A typical event should keep fields such as device id, local display name, timestamp, severity, event type, local snapshot path, optional clip path, and an integrity hash.

Camera and thermal events use `snapshotPath` or `clipPath` for local media evidence. Radar, RF, and other structured sensors should write the normalized event payload to a local JSON evidence file and expose only a `dataPath` plus hash in the event response.

Do not send camera frames, thermal snapshots, radar traces, or RF captures to third-party services unless the user explicitly chooses that mode and the risk is documented.

## Product And Access Model

RadarDesk should grow as a customer/project based admin panel. A customer may buy the same package as another customer, but each customer still uses only their own devices, camera feeds, alerts, stream configuration, and project data.

Important current decision: this model is not the first local product gate. In the first local setup flow, all operational modules are available and the active device connections decide what data appears. Package/module restrictions should return later when the app grows into a customer/admin sales model.

Planned model:

- Product package can decide which modules and device types are visible in the later enterprise/admin model.
- Project/site decides which real devices belong to the customer.
- Access group decides what many users, especially viewers, can access.
- Role decides what the user can do: admin, operator, viewer.
- Backend must filter API responses by the user's effective access; frontend hiding is only UX.
- In local setup mode, frontend should prefer device-driven empty/active states over hiding whole panels by `allowedModules`.

Example packages:

- `camera-thermal`: EO/IR, camera feeds, alerts, map
- `rf-monitoring`: RF nodes, RF alerts/data, map
- `radar-ops`: radar devices, radar alerts/tracks, range view
- `full-ops`: radar, RF, EO/IR, C2, and the full dashboard

## Mock API

The first backend slice is a Node.js + TypeScript + Express API that still uses safe mock data:

- `GET /health`
- `GET /api/devices`
- `GET /api/device-discovery`
- `GET /api/alerts`
- `GET /api/projects`
- `GET /api/camera-feeds`
- `GET /api/sensor-events`
- `GET /api/incidents`
- `GET /api/access`
- `POST /api/devices/register`
- `POST /api/camera-feeds/:id/snapshot`
- `POST /api/sensor-events/ingest`
- `POST /api/projects`

Run it locally with:

```bash
npm run server:dev
```

The default API URL is `http://localhost:4000`. Render health checks should use `/health`.

## Device Discovery And Naming

Device records should not be hard-coded as fixed field labels such as north, south, front, or back. The intended flow is:

1. Backend exposes detected devices from a controlled discovery source.
2. User selects the detected device.
3. User writes the field name, such as `Giris Kamera`, `Arka Bahce Kamera`, or `Kuzeyi Izleyen Radar`.
4. Backend registers the device using that user-provided display name after validation and access checks.

Real network discovery must be added carefully. Do not run broad or random network scans from the app. Use an explicitly configured and approved IP range, protocol, timeout, and environment mode before probing real devices.

The first real-device step is controlled config discovery, not active scanning. When `DEVICE_DISCOVERY_SOURCE=config`, the backend reads `DEVICE_DISCOVERY_JSON`, validates each entry against the allowed device/profile/capability model, filters by effective access, and returns only safe metadata from `/api/device-discovery`. Secrets, stream URLs, credentials, and low-level protocol details must stay out of this response.

Connected device lifecycle:

- A registered device should represent an active local connection or configured local source.
- The user must be able to disconnect a registered device without deleting historical local evidence.
- After disconnect, the backend should stop ingesting or generating new events for that device.
- The user must also be able to delete a registered device from the active device list when replacing it with another physical device.
- Device deletion removes the registered-device entry, but it must not purge old evidence or incident history unless a separate evidence cleanup action is explicitly added later.
- The same physical device should be reconnectable later from discovery/config without a fragile manual cleanup step.
- Reconnect should allow keeping the old display name or entering a new field name.

## Device Profiles And Analysis Pipelines

The user can freely choose the device display name, but the device type, product profile, and analysis capabilities must come from backend discovery/configuration. A user may name a device `Arka Bahce`, but they should not be able to turn a camera into a radar or RF receiver from the UI.

Initial device profiles:

- `thermal-camera`: thermal snapshots/stream, motion or heat-signature events, local evidence snapshots.
- `visible-camera`: visible snapshots/stream, motion/object events, local evidence snapshots.
- `radar`: track, range, bearing, speed, zone-crossing, and approach events.
- `rf-receiver`: frequency, signal level, band activity, unknown signal, and duration events.
- `c2`: command/control and combined device state, not a primary sensor analysis source.

Analysis should be selected by device profile:

- Camera/thermal pipeline reads frame or snapshot data, detects motion/objects/thermal changes, stores local evidence, and creates an alert.
- Radar pipeline reads structured track data, evaluates range/zone/speed rules, and creates an alert with track metadata.
- RF pipeline reads signal/frequency data, evaluates band/anomaly rules, and creates an alert with signal metadata.

Real incoming data should be normalized at the backend boundary into typed events before the frontend sees it.

## Real Product Research Direction

Recent product research points RadarDesk toward a multi-sensor operations model rather than a camera-only dashboard. Public C-UAS and perimeter-security products commonly combine radar, RF sensing, EO/IR cameras, and a C2/dashboard layer so operators can detect, track, visually confirm, and review evidence from one screen.

Useful public references:

- Dedrone: AI-driven C2 and multi-sensor drone defense with RF, radar, and camera integration: https://www.dedrone.com/
- DedroneTrailer: mobile layered detection with RF, PTZ camera, and radar coverage: https://www.dedrone.com/solutions/dedrone-trailer
- DroneShield fixed-site systems: modular C-UAS, RF sensing, AI, sensor fusion, and fixed-site/on-prem style deployments: https://www.droneshield.com/products-fixed-site
- L3Harris Drone Guardian: correlates radar, RF, EO/IR, acoustic, and other sensor inputs to lower operator burden: https://www.l3harris.com/all-capabilities/drone-guardian-counter-suas
- Teledyne FLIR Defense C-UAS: combines ground surveillance radar, EO/IR cameras, RF detection, and AI analytics: https://defense.flir.com/integrated-solutions/counter-uas/
- Senstar sensor fusion note: combines simultaneous inputs from different sensors for higher-fidelity security signals: https://senstar.com/security-digest/sensor-fusion-the-next-generation-of-perimeter-security/

Product implication for RadarDesk:

- `SensorEvent` remains the low-level normalized event from one source.
- `Incident` or `CorrelatedEvent` should become the higher-level operator object.
- One incident can contain camera snapshot/clip evidence, radar JSON evidence, RF JSON evidence, severity, confidence, review status, and operator notes.
- False alarm reduction should come from sensor fusion: a radar-only event, RF-only event, and camera-confirmed multi-sensor incident should not be treated as the same confidence level.
- Cloud sync can be added later, but local/on-prem evidence storage stays the default.

Initial implementation rule: derive `Incident` summaries from local `SensorEvent` records before adding a database table. The first correlation can group events by project/site and a short time bucket, then expose the result through `/api/incidents` for the frontend incident panel. Incident review status and short operator notes can be stored as a local backend overlay until a real database is introduced.

False alarm handling starts with three confirmation levels:

- `single-sensor`: one sensor type produced the incident candidate; keep it open with lower confidence.
- `multi-sensor`: two or more sensor types support the same time/project bucket; raise confidence and move it to review.
- `operator-confirmed`: an operator explicitly confirms the incident after checking evidence.

## Local Sensor Events

The next backend boundary for real data is a local sensor event stream. Camera, radar, RF, and C2 inputs should be normalized into `SensorEvent` records before the frontend renders them.

Initial event examples:

- `thermal-motion`: local snapshot evidence, camera device id, severity, timestamp.
- `radar-track`: track id, range, bearing, speed, zone metadata.
- `rf-signal`: frequency, signal level, band, duration metadata.
- `device-state`: C2 or device health/status metadata.

The frontend should read these events from the backend and display them as local alerts/evidence without directly reading raw camera/radar/RF sources.

Structured radar/RF/C2 records should still create local evidence. They do not need a camera snapshot, but the backend should persist their normalized payload as JSON under `LOCAL_EVIDENCE_DIR` and attach `dataPath` to the `SensorEvent.evidence` object.

For pre-sales local testing, the frontend may expose a developer/test control that creates sample camera, radar, and RF ingest requests against `POST /api/sensor-events/ingest`. This must simulate incoming device data, not bypass the backend. Camera test events still rely on backend automatic snapshot evidence, while radar and RF test events store normalized metadata.

## Local Real Camera Testing

Before customer sales or demos, real cameras should be tested only in a controlled local/backend environment. Keep camera stream URLs, usernames, passwords, and device addresses in `.env` or hosting environment variables, never in committed source, mock data, tests, screenshots, or `VITE_` frontend variables.

Backend camera feed mode:

```bash
CAMERA_FEED_SOURCE=mock
CAMERA_FEED_SOURCE=real
```

When `CAMERA_FEED_SOURCE=real`, the backend reads `CAMERA_FEEDS_JSON`, applies the same effective access filtering, and returns only safe camera metadata from `/api/camera-feeds`. Backend-only fields such as `streamUrl` and `snapshotUrl` are stripped from API responses.

Snapshot capture should go through the backend:

- `POST /api/camera-feeds/:id/snapshot`
- `POST /api/sensor-events/ingest`
- Real mode reads the backend-only `snapshotUrl`.
- Mock mode creates local placeholder evidence.
- The response returns local evidence metadata, not the camera URL or credentials.
- In normal operation this is triggered automatically by backend ingest/analysis when a camera event arrives, not by a manual frontend button.

Local evidence is stored under `LOCAL_EVIDENCE_DIR` and must stay out of git.

## Current Verification

Last verified commands:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run server:typecheck
```

Current result: test suite, frontend build, and server typecheck pass.
Latest local run: 14 test files and 77 tests pass, frontend build passes, and server typecheck passes.
Coverage summary from the last coverage run: 98.42% statements, 95.08% branches, 95.83% functions, and 98.34% lines.

## Remaining Work

- Choose and document the frontend hosting target.
- Plan Render backend deployment settings and production CORS.
- Design the first Neon Postgres schema and migration flow.
- Add auth and role enforcement beyond the current mock admin/operator/viewer data.
- Keep refining documentation as backend and database decisions become real.

## Environment Variables

Use `.env.example` as the safe template. Backend secrets belong only in backend/runtime environment variables. `VITE_` values are public because Vite exposes them in the frontend bundle.

## Project Guides

- `AGENTS.md`: AI agent rules for this repo.
- `CLAUD.md`: Claude-style coding assistant rules.
- `docs/project-brief.md`: project goals and scope.
- `docs/ai-guides/`: frontend, security, architecture, deployment, and quality guides.

## Development Rule

For new behavior changes, update `TODO.md` and the relevant project guide or README note first, then implement the code. This keeps product decisions visible before they become implementation details.

## Sensitive Files

Local PDFs and local work notes are intentionally ignored by git:

- `docs/pdfler/`
- `docs/yeni-is-pdf-ozeti.md`

Do not push sensitive customer, project, RF/radar, defense, or internal work documents unless explicitly approved.

## Mock Data Policy

RadarDesk uses mock training records only. Do not add real customer names, real site coordinates, PDF-derived requirements, RF/radar performance details, camera stream URLs, or internal project notes to code, tests, mock data, seed data, screenshots, or deploy packages.

## Researched Next Steps

The current UI-first MVP is in place. The next practical improvements are:

- Connect the frontend to the local Express API through `VITE_API_BASE_URL` during development.
- Plan Neon Postgres tables for projects, devices, alerts, and users.
- Add auth and backend role checks before treating UI roles as permissions.
- Add customer/project/package/access-group based authorization before exposing real device or camera data.
- Prepare Render/Firebase or Render/Vercel deploy settings with production CORS.
