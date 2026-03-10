import { keccak256, encodeAbiParameters, toHex, type Hex } from 'viem';
import type { ExitMarkerLike, ArrivalMarkerLike, MarkerHashResult } from './types.js';

/**
 * Domain separator for marker hash commitments.
 * Prevents cross-protocol hash collisions.
 */
export const MARKER_HASH_DOMAIN = 'EXIT_PROTOCOL_DEPARTURE_v1';

/**
 * Generate a cryptographically random 256-bit salt.
 *
 * Prefers Web Crypto API (browsers + Node 19+), falls back to node:crypto.
 */
export function randomSalt(): Hex {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    return toHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));
  }
  // Node 18 requires importing crypto; try require as sync fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('node:crypto') as typeof import('node:crypto');
    return toHex(new Uint8Array(nodeCrypto.randomBytes(32)));
  } catch {
    // No secure random source available — refuse to generate weak salts
    throw new Error(
      'No cryptographically secure random source available. ' +
      'Use Node.js >= 18 or a browser with Web Crypto API.'
    );
  }
}

/**
 * Normalize a marker timestamp to a unix epoch in seconds (as bigint).
 */
function normalizeTimestamp(ts: string | number): bigint {
  if (typeof ts === 'string') {
    return BigInt(Math.floor(new Date(ts).getTime() / 1000));
  }
  // If the number looks like milliseconds (> year 2100 in seconds), convert
  if (ts > 4_102_444_800) {
    return BigInt(Math.floor(ts / 1000));
  }
  return BigInt(Math.floor(ts));
}

/**
 * Compute a keccak256 commitment hash of a departure marker with mandatory salt.
 *
 * Uses ABI encoding (not string concatenation) to prevent delimiter collision
 * attacks where field values containing separators produce identical hashes.
 *
 * The salt prevents rainbow-table attacks against known marker fields.
 * If no salt is provided, a cryptographically random 256-bit salt is generated.
 *
 * ⚠️ **Store the salt** — you need it to verify the hash later.
 */
export function computeMarkerHash(
  marker: ExitMarkerLike,
  salt?: Hex | string,
): MarkerHashResult {
  const actualSalt = (salt ?? randomSalt()) as Hex;

  const encoded = encodeAbiParameters(
    [
      { type: 'string' },  // domain separator
      { type: 'string' },  // exitId
      { type: 'string' },  // subject
      { type: 'string' },  // origin
      { type: 'string' },  // exitType
      { type: 'uint256' }, // timestamp
      { type: 'bytes32' }, // salt
    ],
    [
      MARKER_HASH_DOMAIN,
      marker.id,
      marker.subject,
      marker.origin,
      marker.exitType,
      normalizeTimestamp(marker.timestamp),
      actualSalt as `0x${string}`,
    ],
  );

  return {
    hash: keccak256(encoded),
    salt: actualSalt as Hex,
  };
}

/**
 * Verify a marker hash against a marker and salt.
 *
 * Returns true if recomputing the hash with the given salt produces
 * the expected hash. Use this to confirm an on-chain commitment
 * corresponds to a specific departure marker.
 */
export function verifyMarkerHash(
  marker: ExitMarkerLike,
  expectedHash: Hex,
  salt: Hex | string,
): boolean {
  const { hash } = computeMarkerHash(marker, salt as Hex);
  return hash === expectedHash;
}

// ═══════════════════════════════════════════
// ARRIVAL Marker Hashing
// ═══════════════════════════════════════════

/**
 * Domain separator for arrival marker hash commitments.
 */
export const ARRIVAL_HASH_DOMAIN = 'EXIT_PROTOCOL_ARRIVAL_v1';

/**
 * Compute a keccak256 commitment hash of an arrival marker with mandatory salt.
 *
 * Uses ABI encoding (not string concatenation) to prevent delimiter collision
 * attacks. The salt prevents rainbow-table attacks against known marker fields.
 *
 * ⚠️ **Store the salt** — you need it to verify the hash later.
 */
export function computeArrivalHash(
  marker: ArrivalMarkerLike,
  salt?: Hex | string,
): MarkerHashResult {
  const actualSalt = (salt ?? randomSalt()) as Hex;

  const encoded = encodeAbiParameters(
    [
      { type: 'string' },  // domain separator
      { type: 'string' },  // arrivalId
      { type: 'string' },  // subject
      { type: 'string' },  // destination
      { type: 'uint256' }, // timestamp
      { type: 'string' },  // departureRef
      { type: 'bytes32' }, // salt
    ],
    [
      ARRIVAL_HASH_DOMAIN,
      marker.id,
      marker.subject,
      marker.destination,
      normalizeTimestamp(marker.timestamp),
      marker.departureRef,
      actualSalt as `0x${string}`,
    ],
  );

  return {
    hash: keccak256(encoded),
    salt: actualSalt as Hex,
  };
}

/**
 * Verify an arrival marker hash against a marker and salt.
 */
export function verifyArrivalHash(
  marker: ArrivalMarkerLike,
  expectedHash: Hex,
  salt: Hex | string,
): boolean {
  const { hash } = computeArrivalHash(marker, salt as Hex);
  return hash === expectedHash;
}
