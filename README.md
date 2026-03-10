# @cellar-door/attestation-core

[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

> **⚠️ Pre-release software — no formal security audit has been conducted.** This project is published for transparency, review, and community feedback. It should not be used in production systems where security guarantees are required. Report vulnerabilities to hawthornhollows@gmail.com.

Shared hash, salt, and verification logic for EXIT Protocol attestation adapters. Used internally by `@cellar-door/eas`, `@cellar-door/sign-protocol`, and `@cellar-door/erc-8004`.

## Install

```bash
npm install @cellar-door/attestation-core
```

## API

### `computeMarkerHash(marker, salt?)`

Compute a keccak256 commitment hash for an EXIT marker.

```typescript
import { computeMarkerHash } from '@cellar-door/attestation-core';

const { hash, salt } = computeMarkerHash(marker);
// hash: '0x...' (bytes32)
// salt: '0x...' (auto-generated 256-bit random salt)

// With explicit salt:
const { hash } = computeMarkerHash(marker, existingSalt);
```

### `verifyMarkerHash(marker, expectedHash, salt)`

Verify that a marker matches a previously computed hash.

```typescript
import { verifyMarkerHash } from '@cellar-door/attestation-core';

const valid = verifyMarkerHash(marker, hash, salt);
// true if recomputed hash matches expectedHash
```

### `randomSalt()`

Generate a cryptographically random 256-bit salt.

```typescript
import { randomSalt } from '@cellar-door/attestation-core';

const salt = randomSalt();
// '0x...' (32 bytes hex)
```

## Ecosystem

| Package | Language | Description |
|---------|----------|-------------|
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-door) | TypeScript | Core protocol (reference impl) |
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-python) | Python | Core protocol |
| [cellar-door-entry](https://github.com/CellarDoorExits/entry-door) | TypeScript | Arrival/entry markers |
| [@cellar-door/langchain](https://github.com/CellarDoorExits/langchain) | TypeScript | LangChain integration |
| [cellar-door-langchain](https://github.com/CellarDoorExits/cellar-door-langchain-python) | Python | LangChain integration |
| [@cellar-door/vercel-ai-sdk](https://github.com/CellarDoorExits/vercel-ai-sdk) | TypeScript | Vercel AI SDK |
| [@cellar-door/mcp-server](https://github.com/CellarDoorExits/mcp-server) | TypeScript | MCP server |
| [@cellar-door/eliza](https://github.com/CellarDoorExits/eliza-exit) | TypeScript | ElizaOS plugin |
| [@cellar-door/eas](https://github.com/CellarDoorExits/eas-adapter) | TypeScript | EAS attestation anchoring |
| [@cellar-door/erc-8004](https://github.com/CellarDoorExits/erc-8004-adapter) | TypeScript | ERC-8004 identity/reputation |
| [@cellar-door/sign-protocol](https://github.com/CellarDoorExits/sign-protocol-adapter) | TypeScript | Sign Protocol attestation |

**[Paper](https://cellar-door.dev/paper/) · [Website](https://cellar-door.dev)**

## License

Apache-2.0
