import { describe, it, expect } from 'vitest';
import { computeProofInputs } from '../src/core/compute.js';
import { createNote, encodeNote } from '../src/core/note.js';
import { getPoseidon, fieldToBytes32 } from '../src/core/poseidon.js';

describe('computeProofInputs', () => {
  it('should compute valid proof inputs from commitments and a note', async () => {
    const poseidon = await getPoseidon();

    // Create a note
    const { noteData, commitment } = await createNote();
    noteData.leafIndex = 0;
    const encodedNote = encodeNote(noteData);

    // Simulate a single-commitment tree
    const commitments = [commitment];

    const proofInputs = await computeProofInputs(commitments, encodedNote);

    expect(proofInputs.secret).toBeTruthy();
    expect(proofInputs.nullifier).toBeTruthy();
    expect(proofInputs.nullifier_hash).toBeTruthy();
    expect(proofInputs.nullifier_hash_bytes32).toMatch(/^0x[0-9a-f]{64}$/);
    expect(proofInputs.root).toBeTruthy();
    expect(proofInputs.root_bytes32).toMatch(/^0x[0-9a-f]{64}$/);
    expect(proofInputs.merkle_path).toHaveLength(20);
    expect(proofInputs.merkle_indices).toHaveLength(20);
    expect(proofInputs.leafIndex).toBe(0);
  });

  it('should throw on empty commitments', async () => {
    const { noteData } = await createNote();
    noteData.leafIndex = 0;
    const encodedNote = encodeNote(noteData);

    await expect(computeProofInputs([], encodedNote)).rejects.toThrow(
      'Insufficient deposits',
    );
  });

  it('should throw on commitment mismatch', async () => {
    const { noteData } = await createNote();
    noteData.leafIndex = 0;
    const encodedNote = encodeNote(noteData);

    // Wrong commitment at index 0
    const commitments = ['0x' + '0'.repeat(64)];

    await expect(computeProofInputs(commitments, encodedNote)).rejects.toThrow(
      'Commitment mismatch',
    );
  });

  it('should throw when leafIndex exceeds commitment count', async () => {
    const { noteData, commitment } = await createNote();
    noteData.leafIndex = 5; // but we only have 1 commitment
    const encodedNote = encodeNote(noteData);

    const commitments = [commitment];

    await expect(computeProofInputs(commitments, encodedNote)).rejects.toThrow(
      'Insufficient deposits',
    );
  });

  it('should work with multiple commitments', async () => {
    const poseidon = await getPoseidon();

    // Create 3 notes, our target is at index 2
    const notes = await Promise.all([createNote(), createNote(), createNote()]);
    const commitments = notes.map((n) => n.commitment);

    const targetNote = notes[2];
    targetNote.noteData.leafIndex = 2;
    const encodedNote = encodeNote(targetNote.noteData);

    const proofInputs = await computeProofInputs(commitments, encodedNote);

    expect(proofInputs.leafIndex).toBe(2);
    expect(proofInputs.merkle_path).toHaveLength(20);
    // First merkle index should be 0 (leaf 2 = binary 10, so first bit is 0)
    expect(proofInputs.merkle_indices[0]).toBe(0);
    // Second merkle index should be 1 (binary 10, second bit is 1)
    expect(proofInputs.merkle_indices[1]).toBe(1);
  });
});
