import type { NoteData } from '../types.js';
import { InvalidNoteError } from '../errors.js';
import { getPoseidon, fieldToBytes32 } from './poseidon.js';

/** Generate a random field element (31 bytes) suitable for BN254 */
function randField(): bigint {
  const bytes = new Uint8Array(31);
  globalThis.crypto.getRandomValues(bytes);

  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return BigInt('0x' + hex);
}

/**
 * Create a new note with random secret and nullifier.
 * Returns the note data and the Poseidon commitment hash.
 */
export async function createNote(): Promise<{
  noteData: NoteData;
  commitment: `0x${string}`;
}> {
  const secret = randField();
  const nullifier = randField();

  const poseidon = await getPoseidon();
  const commitmentField = poseidon([secret, nullifier]);
  const commitment = fieldToBytes32(poseidon, commitmentField);

  return {
    noteData: { secret, nullifier, leafIndex: -1 },
    commitment,
  };
}

/** Encode note data to a base64 string for storage/sharing */
export function encodeNote(data: NoteData): string {
  const obj = {
    secret: data.secret.toString(),
    nullifier: data.nullifier.toString(),
    leafIndex: data.leafIndex.toString(),
  };
  const jsonString = JSON.stringify(obj);
  // Use Buffer in Node, btoa in browser
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(jsonString, 'utf-8').toString('base64');
  }
  return btoa(jsonString);
}

/** Decode a base64-encoded note string back to NoteData */
export function decodeNote(encoded: string): NoteData {
  try {
    let jsonString: string;
    if (typeof Buffer !== 'undefined') {
      jsonString = Buffer.from(encoded, 'base64').toString('utf-8');
    } else {
      jsonString = atob(encoded);
    }
    const obj = JSON.parse(jsonString);

    return {
      secret: BigInt(obj.secret),
      nullifier: BigInt(obj.nullifier),
      leafIndex: parseInt(obj.leafIndex, 10),
    };
  } catch {
    throw new InvalidNoteError();
  }
}
