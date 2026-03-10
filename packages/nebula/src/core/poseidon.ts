import { buildPoseidon } from 'circomlibjs';
import type { PoseidonFn } from '../types.js';

let poseidonInstance: PoseidonFn | null = null;

/** Get or initialize the Poseidon BN254 hash function singleton */
export async function getPoseidon(): Promise<PoseidonFn> {
  if (!poseidonInstance) {
    poseidonInstance = (await buildPoseidon()) as unknown as PoseidonFn;
  }
  return poseidonInstance;
}

/** Convert a Poseidon field element to its string representation */
export function fieldToString(poseidon: PoseidonFn, x: unknown): string {
  return poseidon.F.toString(poseidon.F.e(x));
}

/** Convert a Poseidon field element to a bytes32 hex string */
export function fieldToBytes32(poseidon: PoseidonFn, x: unknown): `0x${string}` {
  const v = BigInt(poseidon.F.toObject(poseidon.F.e(x)));
  return `0x${v.toString(16).padStart(64, '0')}` as `0x${string}`;
}

/** Convert a BigInt to a bytes32 hex string */
export function toBytes32(bn: bigint): `0x${string}` {
  return `0x${bn.toString(16).padStart(64, '0')}` as `0x${string}`;
}
