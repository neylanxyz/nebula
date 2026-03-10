/** Base error class for all Nebula errors */
export class NebulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NebulaError';
  }
}

/** Thrown when a note string is invalid or cannot be decoded */
export class InvalidNoteError extends NebulaError {
  constructor(message = 'Invalid or corrupted note') {
    super(message);
    this.name = 'InvalidNoteError';
  }
}

/** Thrown when ZK proof generation fails */
export class ProofGenerationError extends NebulaError {
  constructor(message = 'Failed to generate ZK proof') {
    super(message);
    this.name = 'ProofGenerationError';
  }
}

/** Thrown when commitment validation fails against on-chain data */
export class CommitmentMismatchError extends NebulaError {
  constructor(leafIndex: number, expected: string, computed: string) {
    super(
      `Commitment mismatch at leafIndex ${leafIndex}. ` +
      `Expected: ${expected}, Computed: ${computed}. ` +
      `The note may be incorrect or the deposit data is stale.`
    );
    this.name = 'CommitmentMismatchError';
  }
}

/** Thrown when a contract interaction fails */
export class ContractError extends NebulaError {
  constructor(message: string) {
    super(message);
    this.name = 'ContractError';
  }
}

/** Thrown when not enough deposits are found to build the merkle tree */
export class InsufficientDepositsError extends NebulaError {
  constructor(found: number, required: number) {
    super(
      `Insufficient deposits: found ${found}, need ${required}. ` +
      `The blockchain scan may not have reached the required block range.`
    );
    this.name = 'InsufficientDepositsError';
  }
}

/** Thrown when an operation is aborted via AbortSignal */
export class AbortedError extends NebulaError {
  constructor(message = 'Operation was aborted') {
    super(message);
    this.name = 'AbortedError';
  }
}
