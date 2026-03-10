import { TREE_DEPTH } from '../constants.js';
import type { PoseidonFn } from '../types.js';

export interface MerkleInsertionResult {
  root: Uint8Array;
  merklePath: Uint8Array[];
  merkleIndices: number[];
}

/** Build the zero nodes for an empty Merkle tree of TREE_DEPTH levels */
export function buildZeroes(poseidon: PoseidonFn): Uint8Array[] {
  const zeroes: Uint8Array[] = [];
  zeroes[0] = poseidon([0n, 0n]);

  for (let i = 1; i < TREE_DEPTH; i++) {
    zeroes[i] = poseidon([zeroes[i - 1], zeroes[i - 1]]);
  }
  return zeroes;
}

/**
 * Insert a leaf into the Merkle tree and return the new root + sibling path.
 *
 * Mutates `filledSubtrees` in place (mirrors on-chain logic).
 */
export function insertLeaf(
  poseidon: PoseidonFn,
  leaf: bigint,
  leafIndex: number,
  zeroes: Uint8Array[],
  filledSubtrees: Uint8Array[],
): MerkleInsertionResult {
  let currentHash: bigint | Uint8Array = leaf;
  let index = leafIndex;

  const merklePath: Uint8Array[] = [];
  const merkleIndices: number[] = [];

  for (let i = 0; i < TREE_DEPTH; i++) {
    const isRightNode = index % 2 === 1;
    let sibling: Uint8Array;

    if (!isRightNode) {
      sibling = zeroes[i];
      filledSubtrees[i] = currentHash as Uint8Array;
      currentHash = poseidon([currentHash, sibling]);
    } else {
      sibling = filledSubtrees[i];
      currentHash = poseidon([sibling, currentHash]);
    }

    merklePath.push(sibling);
    merkleIndices.push(index % 2);
    index = Math.floor(index / 2);
  }

  return { root: currentHash as Uint8Array, merklePath, merkleIndices };
}

/**
 * Build a Merkle tree from an array of commitment hex strings and return
 * the path for a specific leaf index.
 */
export function buildMerklePathForLeaf(
  poseidon: PoseidonFn,
  commitments: string[],
  targetLeafIndex: number,
): MerkleInsertionResult {
  const zeroes = buildZeroes(poseidon);
  const filledSubtrees = [...zeroes];

  let result: MerkleInsertionResult | undefined;

  for (let i = 0; i <= targetLeafIndex; i++) {
    const commitmentBigInt = BigInt(commitments[i]);
    const insertion = insertLeaf(poseidon, commitmentBigInt, i, zeroes, filledSubtrees);

    if (i === targetLeafIndex) {
      result = insertion;
    }
  }

  return result!;
}
