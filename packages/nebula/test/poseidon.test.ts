import { describe, it, expect } from 'vitest';
import { getPoseidon, fieldToString, fieldToBytes32, toBytes32 } from '../src/core/poseidon.js';

describe('poseidon', () => {
  it('should return a singleton instance', async () => {
    const p1 = await getPoseidon();
    const p2 = await getPoseidon();
    expect(p1).toBe(p2);
  });

  it('should hash two zero inputs deterministically', async () => {
    const poseidon = await getPoseidon();
    const result1 = poseidon([0n, 0n]);
    const result2 = poseidon([0n, 0n]);

    const str1 = fieldToString(poseidon, result1);
    const str2 = fieldToString(poseidon, result2);

    expect(str1).toBe(str2);
    expect(str1.length).toBeGreaterThan(0);
  });

  it('should produce different hashes for different inputs', async () => {
    const poseidon = await getPoseidon();

    const h1 = fieldToString(poseidon, poseidon([1n, 2n]));
    const h2 = fieldToString(poseidon, poseidon([2n, 1n]));
    const h3 = fieldToString(poseidon, poseidon([0n, 0n]));

    expect(h1).not.toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h2).not.toBe(h3);
  });

  it('fieldToBytes32 should return a 66-char hex string', async () => {
    const poseidon = await getPoseidon();
    const result = poseidon([1n, 2n]);
    const hex = fieldToBytes32(poseidon, result);

    expect(hex).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('toBytes32 should pad correctly', () => {
    expect(toBytes32(0n)).toBe('0x' + '0'.repeat(64));
    expect(toBytes32(1n)).toBe('0x' + '0'.repeat(63) + '1');
    expect(toBytes32(255n)).toBe('0x' + '0'.repeat(62) + 'ff');
  });
});
