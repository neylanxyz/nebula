import type { Address, Hash, WalletClient } from 'viem';
import type {
  NebulaConfig,
  DepositResult,
  WithdrawResult,
  PoolInfo,
  WithdrawOptions,
} from './types.js';
import { NEBULA_CONTRACT_ADDRESS, NEBULA_START_BLOCK } from './constants.js';
import { NebulaReader } from './contract/reader.js';
import { NebulaWriter } from './contract/writer.js';
import { fetchDeposits } from './contract/events.js';
import { createNote, encodeNote, decodeNote } from './core/note.js';
import { computeProofInputs } from './core/compute.js';
import { generateProof } from './core/proof.js';
import { getPoseidon, fieldToBytes32 } from './core/poseidon.js';

/**
 * Main facade class that orchestrates deposit and withdraw end-to-end.
 *
 * @example
 * ```ts
 * const nebula = new Nebula({ rpcUrl: 'https://rpc.sepolia.mantle.xyz' });
 *
 * // Deposit
 * const { note, txHash } = await nebula.deposit(walletClient);
 * // Save `note` — it's the only way to withdraw later
 *
 * // Withdraw
 * const result = await nebula.withdraw(note, recipientAddress, walletClient);
 * ```
 */
export class Nebula {
  private reader: NebulaReader;
  private writer: NebulaWriter;
  private rpcUrl: string;
  private contractAddress: Address;
  private startBlock: bigint;

  constructor(config: Partial<NebulaConfig> & { rpcUrl: string }) {
    this.rpcUrl = config.rpcUrl;
    this.contractAddress = config.contractAddress ?? NEBULA_CONTRACT_ADDRESS;
    this.startBlock = config.startBlock ?? NEBULA_START_BLOCK;
    this.reader = new NebulaReader(this.rpcUrl, this.contractAddress);
    this.writer = new NebulaWriter(this.rpcUrl, this.contractAddress);
  }

  /**
   * Perform a deposit into the privacy pool.
   *
   * 1. Generates a random note (secret + nullifier)
   * 2. Computes the Poseidon commitment
   * 3. Sends the deposit transaction
   * 4. Waits for confirmation to get the leafIndex
   * 5. Returns the encoded note string
   *
   * @param walletClient - Viem WalletClient with an account
   * @returns DepositResult with the note string and tx hash
   */
  async deposit(walletClient: WalletClient): Promise<DepositResult> {
    // 1. Get pool info for denomination + fee
    const { denomination, protocolFee, nextIndex } = await this.reader.getPoolInfo();
    const value = denomination + protocolFee;

    // 2. Generate note and commitment
    const { noteData, commitment } = await createNote();

    // 3. Send deposit transaction
    const txHash = await this.writer.deposit(walletClient, commitment, value);

    // 4. Wait for receipt to get actual leafIndex from event
    const client = this.reader.getClient();
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });

    // Extract leafIndex from Deposit event log
    let leafIndex = nextIndex;
    for (const log of receipt.logs) {
      if (log.topics[0] === '0xa945e51eec50ab98c161376f0db4cf2aeba3ec92755fe2fcd388bdbbb80ff196') {
        // Deposit event topic
        if (log.data && log.data.length >= 66) {
          leafIndex = parseInt(log.data.slice(2, 66), 16);
        }
      }
    }

    // 5. Encode note with actual leafIndex
    noteData.leafIndex = leafIndex;
    const note = encodeNote(noteData);

    return { note, txHash, commitment, leafIndex };
  }

  /**
   * Withdraw from the privacy pool using a note.
   *
   * 1. Fetches all deposits from chain up to the note's leafIndex
   * 2. Computes ZK proof inputs (Merkle tree + nullifier hash)
   * 3. Generates the ZK proof
   * 4. Sends the withdraw transaction
   *
   * @param note - Base64-encoded note string from deposit
   * @param recipient - Address to receive the funds
   * @param walletClient - Viem WalletClient with an account
   * @param options - Optional progress callback and abort signal
   */
  async withdraw(
    note: string,
    recipient: Address,
    walletClient: WalletClient,
    options?: WithdrawOptions,
  ): Promise<WithdrawResult> {
    // 1. Decode note to get leafIndex
    const noteData = decodeNote(note);

    // 2. Fetch deposits from chain
    const deposits = await fetchDeposits(
      this.rpcUrl,
      this.contractAddress,
      noteData.leafIndex + 1,
      {
        startBlock: this.startBlock,
        onProgress: options?.onFetchProgress,
        signal: options?.signal,
      },
    );

    // Extract commitment array (ordered by leafIndex)
    const commitments = deposits.map((d) => d.commitment);

    // 3. Compute proof inputs
    const proofInputs = await computeProofInputs(commitments, note);

    // 4. Generate ZK proof
    const { proof } = await generateProof(proofInputs);

    // 5. Send withdraw transaction
    const txHash = await this.writer.withdraw(
      walletClient,
      proof,
      proofInputs.root_bytes32 as `0x${string}`,
      proofInputs.nullifier_hash_bytes32 as `0x${string}`,
      recipient,
    );

    return { txHash };
  }

  /** Get pool information (denomination, root, next index, fees, etc.) */
  async getPoolInfo(): Promise<PoolInfo> {
    return this.reader.getPoolInfo();
  }

  /** Check if a note has already been spent */
  async isNoteSpent(note: string): Promise<boolean> {
    const noteData = decodeNote(note);
    const poseidon = await getPoseidon();
    const nullifierHash = poseidon([noteData.nullifier, 0n]);
    const nullifierHashBytes32 = fieldToBytes32(poseidon, nullifierHash);
    return this.reader.isSpent(nullifierHashBytes32);
  }

  /** Check if an address is blacklisted */
  async isBlacklisted(address: Address): Promise<boolean> {
    return this.reader.isBlacklisted(address);
  }

  /** Get the underlying reader for advanced queries */
  getReader(): NebulaReader {
    return this.reader;
  }

  /** Get the underlying writer for advanced transactions */
  getWriter(): NebulaWriter {
    return this.writer;
  }
}
