import type { ProofInputs } from '../types.js';
import { CommitmentMismatchError, InsufficientDepositsError } from '../errors.js';
import { getPoseidon, fieldToString, fieldToBytes32 } from './poseidon.js';
import { buildMerklePathForLeaf } from './merkle.js';
import { decodeNote } from './note.js';

/**
 * Compute all inputs required for ZK proof generation.
 *
 * Takes an array of on-chain commitment hex strings (ordered by leafIndex)
 * and a base64-encoded note, then:
 *   1. Decodes the note (secret, nullifier, leafIndex)
 *   2. Validates the commitment matches on-chain data
 *   3. Builds the Merkle tree up to leafIndex
 *   4. Returns formatted ProofInputs
 */
export async function computeProofInputs(
  commitments: string[],
  encodedNote: string,
): Promise<ProofInputs> {
  const poseidon = await getPoseidon();

  // 1. Decode note
  const { secret, nullifier, leafIndex } = decodeNote(encodedNote);

  // 2. Validate
  if (!commitments || commitments.length === 0) {
    throw new InsufficientDepositsError(0, leafIndex + 1);
  }

  if (leafIndex >= commitments.length) {
    throw new InsufficientDepositsError(commitments.length, leafIndex + 1);
  }

  // 3. Verify commitment matches on-chain
  const userCommitment = poseidon([secret, nullifier]);
  const userCommitmentHex = fieldToBytes32(poseidon, userCommitment);

  if (userCommitmentHex.toLowerCase() !== commitments[leafIndex].toLowerCase()) {
    throw new CommitmentMismatchError(
      leafIndex,
      commitments[leafIndex],
      userCommitmentHex,
    );
  }

  // 4. Build Merkle tree and get path
  const { root, merklePath, merkleIndices } = buildMerklePathForLeaf(
    poseidon,
    commitments,
    leafIndex,
  );

  // 5. Compute nullifier hash
  const nullifierHash = poseidon([nullifier, 0n]);

  // 6. Format proof inputs
  return {
    secret: fieldToString(poseidon, secret),
    nullifier: fieldToString(poseidon, nullifier),
    nullifier_hash: fieldToString(poseidon, nullifierHash),
    nullifier_hash_bytes32: fieldToBytes32(poseidon, nullifierHash),
    merkle_path: merklePath.map((v) => fieldToString(poseidon, v)),
    merkle_indices: merkleIndices,
    root: fieldToString(poseidon, root),
    root_bytes32: fieldToBytes32(poseidon, root),
    leafIndex,
  };
}
