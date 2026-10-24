# SilentChat E2EE — Implementation Context and Next-Step Handoff

> Purpose: Give a VS Code coding agent enough context to inspect the current repository, understand what has and has not been implemented, and propose a safe next-step plan before changing code.
>
> **Important:** This document summarizes the state discussed through 2026-10-12. The repository is the source of truth. Verify every file, package version, API, environment variable, and behavior against the current checkout before acting.

## 1. Project context

- Project: **SilentChat**, a real-time chat application.
- The frontend is a React application built with Vite, Tailwind CSS, and DaisyUI.
- The backend uses Node.js/Express, MongoDB/Mongoose, JWT cookie authentication, and Socket.IO for existing chat functionality.
- Work has been happening on the `feature/e2ee-prototype` branch.
- The goal is to integrate end-to-end encryption (E2EE) into the existing chat application, not to build a separate demo that never connects to the product.
- The selected protocol implementation is **`@open-e2ee/signal-protocol-sdk`**. The project previously explored other approaches, including Matrix/Synapse, but the current direction is the OpenE2EE SDK and its hosted Signal Protocol Relay Sandbox.
- Do not silently switch protocol libraries or architecture. Explain any proposed change and its trade-offs first.

## 2. Current implementation status

### Confirmed from the recent work

1. A client module exists at `frontend/src/lib/e2ee/client.js` (confirm the exact path in the current checkout).
2. The client module was reviewed and uses the following concepts/APIs:
   - `createHostedSignalProtocolClient`
   - `hostedRelaySandboxIdentity`
   - an IndexedDB-backed local store (`indexedDbStore`; verify the exact imported symbol and package subpath)
   - `VITE_OPEN_E2EE_RELAY_URL`
3. The intent is to use persistent browser-local storage for identity/private key/session state rather than generating a fresh in-memory identity every time the app loads.
4. A standalone round-trip test, referred to as `testRoundTrip.js`, was created/run. It demonstrated encryption/decryption in a local test setup using a temporary Bob client backed by `inMemoryStore`. The test succeeded in the same browser context.
5. A temporary test UI component, referred to as `E2EETestPanel.jsx`, was discussed/proposed to use the persistent `getE2EEClient()` client, `client.userId`, `startRelaySubscription`, `onMessageDecrypted`, and `client.send`. **Do not assume this panel has been created, mounted, or is currently working**; inspect the repository.
6. The user said the current test was working. Treat this as a successful prototype check, not proof that production chat is end-to-end encrypted.
7. The following existing authentication files were shared/reviewed:
   - backend `User.js`
   - `auth.controller.js`
   - `auth.route.js`
   - `auth.middleware.js`
8. The existing auth routes include signup, login, logout, protected profile update, and `/check`; `protectRoute` authenticates via the JWT cookie and resolves the Mongo user. Reinspect actual files before making backend changes.
9. The SDK's profile/contact-key APIs were inspected. The SDK documentation indicates that hosted 1:1 sends require `hosted.profileKeys` and a contact profile key. The application-level profile-key/contact store and production integration were **not confirmed implemented**.
10. At the last known state, there were **no confirmed production changes to Express/Socket.IO message delivery or persistence** that made the normal SilentChat conversation flow E2EE end to end.

### Version warning

Conversation notes contain both SDK `10.1.0` investigation and newer SDK `11.0.x` documentation. The latest direction was an OpenE2EE SDK v11 Sandbox prototype while preserving IndexedDB. **Inspect `frontend/package.json`, the lockfile, installed package exports, and current source code to establish the actual version.** Do not copy v10 APIs or examples into a v11 integration without checking the installed declarations and documentation.

## 3. SDK architecture and security boundaries

The SDK handles protocol operations such as session establishment, encryption/decryption, ratcheting, device/prekey handling, and delivery integration. The application still needs to provide correct local storage, authentication identity, message/UI integration, and transport/delivery behavior.

### Local storage

- Device identity, private keys, and session state must remain in device-local storage.
- The current intended browser storage is IndexedDB.
- Do not replace the persistent store with `inMemoryStore` for the real signed-in client. In-memory storage is acceptable for isolated tests only.
- Do not send private keys or plaintext to the SilentChat backend.
- Treat browser storage as device-local, not as a guarantee against malware, browser-profile compromise, or an XSS attack.

### Hosted Relay Sandbox identity

- `hostedRelaySandboxIdentity(storage)` is for the SDK's Sandbox environment.
- It uses device-local state to supply the Sandbox identity assertion.
- This is a prototype/development identity path, **not a production authentication integration**.
- In production, the hosted SDK expects a `getIdentityAssertion` integration that returns a short-lived assertion for the authenticated SilentChat user, using the identity provider flow documented by the SDK.
- Never assume a caller-supplied `userId` alone securely authenticates a relay account.
- Do not expose secrets in `VITE_*` environment variables. The relay URL may be public configuration; credentials and signing secrets must not be put in frontend environment variables.

### Relay and profile keys

- The SDK package contains client code/contracts; the hosted relay service is a separate component.
- Per the SDK docs reviewed, hosted sealed 1:1 sending requires `hosted.profileKeys` and a profile key for the recipient contact.
- The SDK expects an application-provided way to obtain the current user's profile key and persist/manage contact profile state.
- The app's profile/contact-key persistence and authenticated identity mapping still need to be verified/designed.
- Do not invent imports for undocumented/internal package paths. Use only public exports from the installed package.
- Keep post-quantum policy defaults intact unless there is an explicit, documented product/security decision to change them.

## 4. Existing SilentChat chat integration

The existing app already has a chat UI and state layer. Recent review included these frontend files (confirm current paths/names):

- `ChatContainer.jsx`
- `MessageInput.jsx`
- `useAuthStore.js`
- `useChatStore.js`

These were inspected to understand the integration points, but the ordinary send/receive path was not yet confirmed replaced by the E2EE flow.

The target architecture should distinguish the following:

1. **Plaintext at sender:** message text is entered locally.
2. **Encryption:** the sender's SDK client encrypts for the intended recipient(s).
3. **Transport:** only encrypted envelopes/ciphertext plus the minimum required routing/delivery metadata leave the sender's device.
4. **Server/relay:** authenticates delivery and routes/stores ciphertext; it must not receive plaintext or private protocol keys.
5. **Recipient:** SDK receives and decrypts locally; only then should plaintext be displayed and, if required, persisted locally.
6. **UI/state:** existing chat UI should display the decrypted message while retaining compatibility with legacy messages according to an explicit migration policy.

Do not claim E2EE just because a test can encrypt and decrypt a string in one tab. A real integration must demonstrate two distinct authenticated users/devices communicating through the actual delivery path, with the backend unable to read the message body.

## 5. Known gaps / unverified items

Treat all of the following as open until verified in the repository:

- [ ] Exact installed SDK version and matching public API.
- [ ] Exact current exports/imports of the IndexedDB store.
- [ ] A single persistent E2EE client lifecycle per authenticated user/device.
- [ ] Safe initialization, cleanup, logout behavior, and account switching.
- [ ] Authenticated mapping from SilentChat user identity to the hosted Relay identity.
- [ ] Production identity assertion flow; Sandbox identity is not production-ready.
- [ ] `hosted.profileKeys`, own profile key lifecycle, and persistent contact profile-key state.
- [ ] Relay registration and incoming subscription lifecycle.
- [ ] Correct callback/hook registration before incoming delivery starts.
- [ ] Idempotent persistence of incoming decrypted messages and handling of duplicate delivery.
- [ ] Integration of encrypted send/receive into `MessageInput`, `ChatContainer`, and chat state.
- [ ] How Socket.IO and existing MongoDB message storage will interact with E2EE. Do not assume the current server path is compatible; inspect it.
- [ ] Legacy plaintext message handling and a deliberate rollout/migration strategy.
- [ ] Errors/retries/offline behavior, duplicate delivery, and reconnect behavior.
- [ ] Multiple tabs/devices, key rotation, recovery, and identity verification UX.
- [ ] Automated tests proving the backend never receives plaintext.
- [ ] Security review before describing the feature as production-grade.

## 6. Recommended next steps — plan before coding

The agent should first inspect the repository and then present a concrete implementation plan. Do not immediately make broad code changes.

### Phase A — Repository audit

1. Inspect `git status`, current branch, `frontend/package.json`, and lockfile. Do not overwrite uncommitted work.
2. Find and read the current E2EE client, round-trip test, any test panel, auth model/controller/routes/middleware, chat model/controller/routes/socket handlers, and frontend chat stores/components.
3. Trace the current non-E2EE send and receive paths end to end.
4. Confirm exact SDK version, storage adapter export, lifecycle API, relay APIs, hook names, and profile-key/contact-store requirements from the installed package's public exports and matching documentation.
5. Report what is implemented, what is only a test, and what is missing. Include actual file paths and avoid guessing.

### Phase B — Define the trust and identity boundary

1. Decide how the authenticated SilentChat account maps to the relay account without trusting a client-supplied identity.
2. Separate Sandbox development identity from production authentication.
3. Decide which service is responsible for encrypted-envelope transport and persistence: hosted OpenE2EE Relay or a custom authenticated relay adapter. Compare the existing Socket.IO path and do not create two competing message paths without a clear reason.
4. Decide how recipient lookup/contact profile keys are securely provisioned and persisted.
5. Specify exactly what metadata the backend can see and ensure message bodies, private keys, and plaintext never reach backend logs or database fields.

### Phase C — Integrate a minimal real 1:1 flow

1. Initialize one persistent SDK client for the currently authenticated browser user/device.
2. Register the decryption callback before starting incoming delivery, as required by SDK guidance.
3. Implement authenticated recipient/profile-key resolution using public SDK APIs.
4. Replace the normal send path with SDK encryption and relay delivery.
5. Route incoming envelopes through the SDK, decrypt locally, and update chat state with deduplication.
6. Define how message IDs, timestamps, sender/recipient IDs, delivery state, and legacy messages are represented without leaking plaintext.
7. Handle errors explicitly; never silently fall back to plaintext if encryption, key lookup, or relay delivery fails.

### Phase D — Lifecycle, persistence, and correctness

1. Ensure client initialization is concurrency-safe and not duplicated by React Strict Mode or component remounts.
2. Stop subscriptions and clean up callbacks on logout/account change/unmount as appropriate.
3. Ensure IndexedDB state is reused for the same account/device and does not accidentally cross account boundaries.
4. Make message writes idempotent and handle duplicate/out-of-order delivery, retries, and reconnects.
5. Decide whether decrypted history is stored locally, server-side as ciphertext, or both. Keep the threat model explicit.

### Phase E — Tests and security checks

At minimum, plan tests for:

- Two different users with separate persistent stores can exchange a message through the real delivery path.
- The receiving client decrypts the message; a server-side inspection sees ciphertext, not plaintext.
- Missing recipient key, invalid identity, relay failure, and decryption failure fail safely.
- Duplicate envelope delivery does not create duplicate chat messages.
- Logout/account switching does not reuse another account's client or state.
- Legacy messages follow the chosen migration policy.
- No accidental plaintext fallback or sensitive logging occurs.

Do not state that E2EE is complete until the tests establish the end-to-end trust boundary.

## 7. Instructions to the coding agent

- **Start in planning/audit mode.** First report the current state and a phased plan; wait for approval before implementing architectural changes.
- Read the existing code before proposing replacements. Preserve the project's current conventions and avoid unnecessary rewrites.
- Use the exact SDK version installed in this repository and its public exports. Do not guess APIs or use internal imports.
- Make small, reviewable changes and explain each changed file.
- Do not change unrelated chat/auth behavior.
- Do not silently downgrade protocol security settings or introduce plaintext fallback.
- Do not put credentials, private keys, decrypted message content, or identity signing secrets in logs, server storage, or frontend environment variables.
- Run the relevant lint/build/tests after each phase and report actual results, including failures.
- Clearly label assumptions and unverified behavior.
- Keep `context.md` updated when architectural decisions or implementation status change.

## 8. Initial task for the agent

**Audit the current checkout and return a concise implementation report plus a proposed next-step plan. Do not edit application code yet.**

The report must include:
1. SDK version and exact E2EE-related files found.
2. What is implemented and what tests actually prove.
3. Current normal chat send/receive path.
4. The key identity, profile-key, relay, and persistence gaps.
5. A recommended minimal vertical slice for a real two-user encrypted message.
6. Files that would need changes, in order, and the tests needed for each.
7. Any security or architectural decision that requires the project owner's approval.

Only after this report should the agent begin implementation.
