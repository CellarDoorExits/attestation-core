/**
 * @cellar-door/attestation-core
 *
 * Shared attestation primitives for EXIT Protocol adapters.
 * Provides marker hashing, salt generation, and core types used
 * by EAS, Sign Protocol, and ERC-8004 adapters.
 *
 * @packageDocumentation
 */

export {
  computeMarkerHash,
  verifyMarkerHash,
  computeArrivalHash,
  verifyArrivalHash,
  randomSalt,
  MARKER_HASH_DOMAIN,
  ARRIVAL_HASH_DOMAIN,
} from './hash.js';

export type {
  ExitMarkerLike,
  ArrivalMarkerLike,
  MarkerHashResult,
  ExitType,
  ExitStatus,
} from './types.js';
