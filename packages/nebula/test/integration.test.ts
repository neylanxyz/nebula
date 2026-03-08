import { describe, it, expect } from 'vitest';
import {
  Nebula,
  createNote,
  encodeNote,
  decodeNote,
  computeProofInputs,
  getPoseidon,
  fieldToBytes32,
  buildZeroes,
  insertLeaf,
  TREE_DEPTH,
  NEBULA_CONTRACT_ADDRESS,
  NEBULA_POOL_ABI,
  NebulaError,
  InvalidNoteError,
} from '../src/index.js';

describe('integration: barrel exports', () => {
  it('should export all public types and classes', () => {
    expect(Nebula).toBeDefined();
    expect(createNote).toBeDefined();
    expect(encodeNote).toBeDefined();
    expect(decodeNote).toBeDefined();
    expect(computeProofInputs).toBeDefined();
    expect(getPoseidon).toBeDefined();
    expect(fieldToBytes32).toBeDefined();
    expect(buildZeroes).toBeDefined();
    expect(insertLeaf).toBeDefined();
    expect(TREE_DEPTH).toBe(20);
    expect(NEBULA_CONTRACT_ADDRESS).toMatch(/^0x/);
    expect(NEBULA_POOL_ABI).toBeInstanceOf(Array);
    expect(NebulaError).toBeDefined();
    expect(InvalidNoteError).toBeDefined();
  });
});

describe('integration: full note lifecycle (no chain)', () => {
  it('should create, encode, decode, and compute proof inputs', async () => {
    // 1. Create note
    const { noteData, commitment } = await createNote();
    expect(noteData.secret).toBeTypeOf('bigint');
    expect(commitment).toMatch(/^0x[0-9a-f]{64}$/);

    // 2. Assign leafIndex and encode
    noteData.leafIndex = 0;
    const note = encodeNote(noteData);
    expect(typeof note).toBe('string');

    // 3. Decode
    const decoded = decodeNote(note);
    expect(decoded.secret).toBe(noteData.secret);
    expect(decoded.nullifier).toBe(noteData.nullifier);
    expect(decoded.leafIndex).toBe(0);

    // 4. Compute proof inputs with the commitment
    const proofInputs = await computeProofInputs([commitment], note);

    expect(proofInputs.secret).toBeTruthy();
    expect(proofInputs.root_bytes32).toMatch(/^0x[0-9a-f]{64}$/);
    expect(proofInputs.nullifier_hash_bytes32).toMatch(/^0x[0-9a-f]{64}$/);
    expect(proofInputs.merkle_path).toHaveLength(20);
  });
});

describe('integration: Nebula class instantiation', () => {
  it('should create a Nebula instance with defaults', () => {
    const nebula = new Nebula({ rpcUrl: 'https://rpc.sepolia.mantle.xyz' });
    expect(nebula).toBeInstanceOf(Nebula);
    expect(nebula.getReader()).toBeDefined();
    expect(nebula.getWriter()).toBeDefined();
  });

  it('should accept custom contract address', () => {
    const nebula = new Nebula({
      rpcUrl: 'https://rpc.sepolia.mantle.xyz',
      contractAddress: '0x1234567890123456789012345678901234567890',
    });
    expect(nebula).toBeInstanceOf(Nebula);
  });
});
