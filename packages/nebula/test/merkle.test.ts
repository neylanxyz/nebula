import { describe, it, expect } from 'vitest';
import { buildZeroes, insertLeaf, buildMerklePathForLeaf } from '../src/core/merkle.js';
import { getPoseidon, fieldToString } from '../src/core/poseidon.js';
import { TREE_DEPTH } from '../src/constants.js';

describe('merkle', () => {
  describe('buildZeroes', () => {
    it('should build TREE_DEPTH zero nodes', async () => {
      const poseidon = await getPoseidon();
      const zeroes = buildZeroes(poseidon);

      expect(zeroes.length).toBe(TREE_DEPTH);
      // Each level should be hash of previous level with itself
      for (let i = 1; i < TREE_DEPTH; i++) {
        const expected = poseidon([zeroes[i - 1], zeroes[i - 1]]);
        expect(fieldToString(poseidon, zeroes[i])).toBe(
          fieldToString(poseidon, expected),
        );
      }
    });
  });

  describe('insertLeaf', () => {
    it('should return root, merklePath, and merkleIndices', async () => {
      const poseidon = await getPoseidon();
      const zeroes = buildZeroes(poseidon);
      const filledSubtrees = [...zeroes];

      const result = insertLeaf(poseidon, 42n, 0, zeroes, filledSubtrees);

      expect(result.root).toBeDefined();
      expect(result.merklePath).toHaveLength(TREE_DEPTH);
      expect(result.merkleIndices).toHaveLength(TREE_DEPTH);
    });

    it('should produce different roots for different leaves', async () => {
      const poseidon = await getPoseidon();

      const zeroes1 = buildZeroes(poseidon);
      const filled1 = [...zeroes1];
      const r1 = insertLeaf(poseidon, 1n, 0, zeroes1, filled1);

      const zeroes2 = buildZeroes(poseidon);
      const filled2 = [...zeroes2];
      const r2 = insertLeaf(poseidon, 2n, 0, zeroes2, filled2);

      expect(fieldToString(poseidon, r1.root)).not.toBe(
        fieldToString(poseidon, r2.root),
      );
    });

    it('merkle indices for leaf 0 should all be 0 (left)', async () => {
      const poseidon = await getPoseidon();
      const zeroes = buildZeroes(poseidon);
      const filledSubtrees = [...zeroes];

      const result = insertLeaf(poseidon, 99n, 0, zeroes, filledSubtrees);
      expect(result.merkleIndices.every((i) => i === 0)).toBe(true);
    });

    it('merkle indices for leaf 1 should start with 1 then 0s', async () => {
      const poseidon = await getPoseidon();
      const zeroes = buildZeroes(poseidon);
      const filledSubtrees = [...zeroes];

      // Insert leaf 0 first
      insertLeaf(poseidon, 100n, 0, zeroes, filledSubtrees);
      // Then leaf 1
      const result = insertLeaf(poseidon, 200n, 1, zeroes, filledSubtrees);

      expect(result.merkleIndices[0]).toBe(1);
      expect(result.merkleIndices.slice(1).every((i) => i === 0)).toBe(true);
    });
  });

  describe('buildMerklePathForLeaf', () => {
    it('should build tree from commitments and return path for target leaf', async () => {
      const poseidon = await getPoseidon();

      // Create some fake commitments (just hex-encoded numbers)
      const commitments = [
        '0x' + '0'.repeat(63) + '1',
        '0x' + '0'.repeat(63) + '2',
        '0x' + '0'.repeat(63) + '3',
      ];

      const result = buildMerklePathForLeaf(poseidon, commitments, 2);

      expect(result.root).toBeDefined();
      expect(result.merklePath).toHaveLength(TREE_DEPTH);
      expect(result.merkleIndices).toHaveLength(TREE_DEPTH);
    });
  });
});
