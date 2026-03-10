import type { Hex } from 'viem';

// ═══════════════════════════════════════════
// EXIT Marker Core Types
// ═══════════════════════════════════════════

export type ExitType = 'voluntary' | 'forced' | 'emergency' | 'keyCompromise' | 'platform_shutdown' | 'directed' | 'constructive' | 'acquisition';
export type ExitStatus = 'good_standing' | 'disputed' | 'unverified';

/**
 * Minimal EXIT marker interface shared across all adapters.
 *
 * Each adapter may extend this with adapter-specific fields, but all
 * hash/commitment operations only require these fields.
 */
export interface ExitMarkerLike {
  id: string;
  subject: string;
  origin: string;
  timestamp: string | number;
  exitType: ExitType;
  status?: ExitStatus;
  selfAttested?: boolean;
  lineageHash?: string;
}

// ═══════════════════════════════════════════
// ARRIVAL Marker Core Types
// ═══════════════════════════════════════════

/**
 * Minimal ARRIVAL marker interface shared across all adapters.
 */
export interface ArrivalMarkerLike {
  id: string;
  subject: string;
  destination: string;
  timestamp: string | number;
  departureRef: string;
}

/**
 * Result of computing a marker commitment hash.
 *
 * ⚠️ Store the salt — you need it to verify the hash later.
 * Treat the salt with the same care as a private key.
 */
export interface MarkerHashResult {
  hash: Hex;
  salt: Hex;
}
