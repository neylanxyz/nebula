import { toHex } from 'viem';
import type { ProofInputs, GeneratedProof } from '../types.js';
import { ProofGenerationError } from '../errors.js';

/**
 * Generate a ZK proof from the given proof inputs.
 *
 * Requires the Noir/ACVM/Barretenberg peer dependencies to be installed.
 * The WASM modules are initialized lazily on first call.
 */
export async function generateProof(proofInputs: ProofInputs): Promise<GeneratedProof> {
  try {
    // Dynamic imports — these are peer dependencies
    const [{ Noir }, { Barretenberg, UltraHonkBackend }] = await Promise.all([
      import('@noir-lang/noir_js'),
      import('@aztec/bb.js'),
    ]);

    // Load circuit artifact
    const circuitData = await loadCircuit();
    // Cast to CompiledCircuit — JSON shape matches but TS can't verify literal types
    type CompiledCircuit = ConstructorParameters<typeof Noir>[0];
    const circuit = circuitData as CompiledCircuit;

    // Prepare circuit inputs (only what the circuit expects)
    const input = {
      secret: proofInputs.secret,
      nullifier: proofInputs.nullifier,
      nullifier_hash: proofInputs.nullifier_hash,
      root: proofInputs.root,
      merkle_path: proofInputs.merkle_path,
      merkle_indices: proofInputs.merkle_indices,
    };

    // Initialize Noir and backend
    const noir = new Noir(circuit);
    await Barretenberg.new({ threads: 1 });
    const backend = new UltraHonkBackend(circuit.bytecode);

    // Generate witness
    const { witness } = await noir.execute(input);

    // Generate proof with keccak for on-chain verification
    const proof = await backend.generateProof(witness, { keccakZK: true });

    // Verify locally before returning
    const isValid = await backend.verifyProof(proof, { keccakZK: true });
    if (!isValid) {
      throw new ProofGenerationError('Generated proof failed local verification');
    }

    return {
      proof: toHex(proof.proof),
      publicInputs: proof.publicInputs,
    };
  } catch (error) {
    if (error instanceof ProofGenerationError) throw error;
    throw new ProofGenerationError(
      error instanceof Error ? error.message : 'Unknown error during proof generation',
    );
  }
}

/** Load the compiled circuit JSON artifact */
async function loadCircuit() {
  // Use dynamic import to load the JSON circuit
  // The circuit file is bundled with the package
  try {
    const circuitModule = await import('../circuit/nebula.json', { with: { type: 'json' } });
    return circuitModule.default ?? circuitModule;
  } catch {
    // Fallback: try without import attributes for older bundlers
    const circuitModule = await import('../circuit/nebula.json');
    return circuitModule.default ?? circuitModule;
  }
}
