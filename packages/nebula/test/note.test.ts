import { describe, it, expect } from 'vitest';
import { createNote, encodeNote, decodeNote } from '../src/core/note.js';
import type { NoteData } from '../src/types.js';

describe('note', () => {
  describe('encodeNote / decodeNote roundtrip', () => {
    it('should encode and decode back to the same values', () => {
      const noteData: NoteData = {
        secret: 123456789012345678901234567890n,
        nullifier: 987654321098765432109876543210n,
        leafIndex: 42,
      };

      const encoded = encodeNote(noteData);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decodeNote(encoded);
      expect(decoded.secret).toBe(noteData.secret);
      expect(decoded.nullifier).toBe(noteData.nullifier);
      expect(decoded.leafIndex).toBe(noteData.leafIndex);
    });

    it('should produce a base64 string', () => {
      const noteData: NoteData = {
        secret: 1n,
        nullifier: 2n,
        leafIndex: 0,
      };

      const encoded = encodeNote(noteData);
      // Base64 should only contain valid characters
      expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
  });

  describe('decodeNote error handling', () => {
    it('should throw InvalidNoteError for garbage input', () => {
      expect(() => decodeNote('not-valid-base64!!!')).toThrow('Invalid');
    });

    it('should throw for empty string', () => {
      expect(() => decodeNote('')).toThrow();
    });
  });

  describe('createNote', () => {
    it('should create a note with random secret and nullifier', async () => {
      const { noteData, commitment } = await createNote();

      expect(noteData.secret).toBeTypeOf('bigint');
      expect(noteData.nullifier).toBeTypeOf('bigint');
      expect(noteData.secret).not.toBe(0n);
      expect(noteData.nullifier).not.toBe(0n);
      expect(noteData.secret).not.toBe(noteData.nullifier);
      expect(commitment).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it('should create unique notes on each call', async () => {
      const note1 = await createNote();
      const note2 = await createNote();

      expect(note1.noteData.secret).not.toBe(note2.noteData.secret);
      expect(note1.commitment).not.toBe(note2.commitment);
    });
  });
});
