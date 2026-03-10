import { describe, it, expect } from 'vitest';
import { computeMarkerHash, verifyMarkerHash, randomSalt, MARKER_HASH_DOMAIN } from '../index.js';
import type { ExitMarkerLike } from '../index.js';

const SAMPLE_MARKER: ExitMarkerLike = {
  id: 'urn:exit:test:001',
  subject: 'did:key:z6MkTest123',
  origin: 'did:web:example.com',
  timestamp: '2025-01-15T12:00:00Z',
  exitType: 'voluntary',
  status: 'good_standing',
};

const FIXED_SALT = '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' as `0x${string}`;

describe('randomSalt', () => {
  it('returns a 0x-prefixed 32-byte hex string', () => {
    const salt = randomSalt();
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('generates unique salts', () => {
    const salts = new Set(Array.from({ length: 10 }, () => randomSalt()));
    expect(salts.size).toBe(10);
  });
});

describe('computeMarkerHash', () => {
  it('returns a keccak256 hash and the salt', () => {
    const result = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    expect(result.hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.salt).toBe(FIXED_SALT);
  });

  it('is deterministic with the same salt', () => {
    const a = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    const b = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    expect(a.hash).toBe(b.hash);
  });

  it('produces different hashes with different salts', () => {
    const a = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    const b = computeMarkerHash(SAMPLE_MARKER);
    expect(a.hash).not.toBe(b.hash);
  });

  it('auto-generates a salt when none provided', () => {
    const result = computeMarkerHash(SAMPLE_MARKER);
    expect(result.salt).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('produces different hashes for different markers', () => {
    const other: ExitMarkerLike = { ...SAMPLE_MARKER, id: 'urn:exit:test:002' };
    const a = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    const b = computeMarkerHash(other, FIXED_SALT);
    expect(a.hash).not.toBe(b.hash);
  });

  it('handles numeric timestamps', () => {
    const marker: ExitMarkerLike = { ...SAMPLE_MARKER, timestamp: 1705320000 };
    const result = computeMarkerHash(marker, FIXED_SALT);
    expect(result.hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('handles millisecond timestamps', () => {
    const markerMs: ExitMarkerLike = { ...SAMPLE_MARKER, timestamp: 1705320000000 };
    const markerS: ExitMarkerLike = { ...SAMPLE_MARKER, timestamp: 1705320000 };
    const a = computeMarkerHash(markerMs, FIXED_SALT);
    const b = computeMarkerHash(markerS, FIXED_SALT);
    expect(a.hash).toBe(b.hash);
  });
});

describe('verifyMarkerHash', () => {
  it('returns true for matching hash and salt', () => {
    const { hash, salt } = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    expect(verifyMarkerHash(SAMPLE_MARKER, hash, salt)).toBe(true);
  });

  it('returns false for wrong salt', () => {
    const { hash } = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    const wrongSalt = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' as `0x${string}`;
    expect(verifyMarkerHash(SAMPLE_MARKER, hash, wrongSalt)).toBe(false);
  });

  it('returns false for wrong marker', () => {
    const { hash, salt } = computeMarkerHash(SAMPLE_MARKER, FIXED_SALT);
    const other: ExitMarkerLike = { ...SAMPLE_MARKER, origin: 'did:web:other.com' };
    expect(verifyMarkerHash(other, hash, salt)).toBe(false);
  });

  it('roundtrips with auto-generated salt', () => {
    const { hash, salt } = computeMarkerHash(SAMPLE_MARKER);
    expect(verifyMarkerHash(SAMPLE_MARKER, hash, salt)).toBe(true);
  });
});

describe('MARKER_HASH_DOMAIN', () => {
  it('is a versioned domain string', () => {
    expect(MARKER_HASH_DOMAIN).toBe('EXIT_PROTOCOL_DEPARTURE_v1');
  });
});
