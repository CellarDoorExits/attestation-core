# Extraction Notes — @cellar-door/attestation-core

## What Was Extracted

Shared attestation primitives duplicated across three EXIT Protocol adapters were consolidated into this core package.

### Functions

| Function | Description | Found In |
|---|---|---|
| `computeMarkerHash()` | keccak256 commitment hash with domain separator, ABI encoding, and salt | All 3 adapters |
| `verifyMarkerHash()` | Recompute-and-compare verification | sign-protocol-adapter |
| `randomSalt()` | 256-bit cryptographic random salt generation | sign-protocol-adapter, erc-8004-adapter |

### Types

| Type | Description | Found In |
|---|---|---|
| `ExitMarkerLike` | Minimal marker interface for hash operations | All 3 adapters |
| `MarkerHashResult` | `{ hash: Hex, salt: Hex }` | sign-protocol-adapter |
| `ExitType` | `'voluntary' \| 'involuntary' \| 'emergency'` | All 3 adapters |
| `ExitStatus` | `'good_standing' \| 'suspended' \| 'terminated' \| 'disputed'` | eas-adapter, sign-protocol-adapter |

### Constants

| Constant | Description |
|---|---|
| `MARKER_HASH_DOMAIN` | `'EXIT_PROTOCOL_DEPARTURE_v1'` — domain separator for hash commitments |

## Source Adapter Differences

The three adapters had divergent implementations that this core package normalizes:

### 1. EAS Adapter (`eas-adapter/src/codec.ts`)
- Used **ethers.js** (`keccak256`, `toUtf8Bytes`)
- `computeExitHash()` used **string concatenation** (`join(',')`) — weak against delimiter collision
- No salt support, no `verifyMarkerHash`
- `ExitMarkerLike` included `status`, `selfAttested`, `lineageHash`

### 2. Sign Protocol Adapter (`sign-protocol-adapter/src/attest.ts`)
- Used **viem** (`keccak256`, `encodeAbiParameters`, `toHex`)
- `computeMarkerHash()` used **ABI encoding** with domain separator — the most robust approach
- Domain: `EXIT_PROTOCOL_SIGN_DEPARTURE_v1`
- Had `randomSalt()`, `verifyMarkerHash()`, `blindIndexingValue()`
- `ExitMarkerLike` included `status`, `selfAttested`, `lineageHash`

### 3. ERC-8004 Adapter (`erc-8004-adapter-new/src/reputation.ts`)
- Used **ethers.js** (`keccak256`, `AbiCoder`)
- `computeMarkerHash()` used **ABI encoding** but with different domain (`'ExitDeparture'`) and different parameter order
- Inline salt generation (no reusable `randomSalt`)
- `ExitMarkerLike` had no `status` field
- Timestamp handling: divided by 1000 even for numeric input (bug if already seconds)

## Design Decisions

1. **viem chosen over ethers.js** — 2 of 3 adapters' target usage is viem-based; viem is tree-shakeable and lighter
2. **ABI encoding** (not string concat) — prevents delimiter collision attacks
3. **Unified domain separator** — `EXIT_PROTOCOL_DEPARTURE_v1` (new canonical value; each adapter had its own)
4. **`status` is optional** on `ExitMarkerLike` — ERC-8004 adapter doesn't use it, and it's not needed for hashing
5. **Timestamp normalization** — handles ISO strings, unix seconds, and unix milliseconds (>4.1B threshold)
6. **`blindIndexingValue()`** was NOT extracted — it's Sign Protocol-specific (tied to SP's indexing model)

## Migration Path

To migrate each adapter, replace local hash/type code with:

```typescript
import {
  computeMarkerHash,
  verifyMarkerHash,
  randomSalt,
  type ExitMarkerLike,
  type MarkerHashResult,
  type ExitType,
  type ExitStatus,
} from '@cellar-door/attestation-core';
```

**Breaking change note:** The domain separator and encoding differ from each adapter's current implementation. Existing on-chain hashes will NOT match hashes produced by this core package. Migration should:
1. Use the core package for **new** attestations only
2. Keep adapter-specific hash functions for **verifying existing** on-chain data
3. Or: plan a schema version bump / migration event

## Test Coverage

14 tests covering:
- Salt generation (format, uniqueness)
- Hash determinism, sensitivity to inputs
- Auto-salt generation
- Timestamp normalization (ISO, seconds, milliseconds)
- Verify roundtrip (positive and negative cases)
