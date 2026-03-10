import type { Address, Hash, WalletClient } from 'viem';
import type {
  NebulaConfig,
  DepositResult,
  WithdrawResult,
  PoolInfo,
  WithdrawOptions,
} from '@neylanxyz/nebula';
import {
  createNote,
  encodeNote,
  decodeNote,
  computeProofInputs,
  generateProof,
  getPoseidon,
  fieldToBytes32,
} from '@neylanxyz/nebula';
import { NEBULA_CONTRACT_ADDRESS, NEBULA_START_BLOCK, VERIFIER_CONTRACT_ADDRESS } from './constants.js';
import { NebulaAvalancheReader } from './contract/reader.js';
import { NebulaAvalancheWriter } from './contract/writer.js';
import { fetchDeposits } from './contract/events.js';

export interface NebulaAvalancheConfig extends Partial<NebulaConfig> {
  rpcUrl: string;
  verifierAddress?: Address;
  /** URL of the Ponder indexer. When set, deposits are fetched from the indexer instead of scanning on-chain logs (avoids eth_getLogs rate limits). */
  indexerUrl?: string;
}

/**
 * Main facade class for Nebula on Avalanche Fuji testnet.
 *
 * @example
 * ```ts
 * const nebula = new NebulaAvalanche({ rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc' });
 *
 * // Deposit
 * const { note, txHash } = await nebula.deposit(walletClient);
 *
 * // Withdraw
 * const result = await nebula.withdraw(note, recipientAddress, walletClient);
 * ```
 */
export class NebulaAvalanche {
  private reader: NebulaAvalancheReader;
  private writer: NebulaAvalancheWriter;
  private rpcUrl: string;
  private contractAddress: Address;
  private startBlock: bigint;
  private indexerUrl?: string;

  constructor(config: NebulaAvalancheConfig) {
    this.rpcUrl = config.rpcUrl;
    this.contractAddress = config.contractAddress ?? NEBULA_CONTRACT_ADDRESS;
    this.startBlock = config.startBlock ?? NEBULA_START_BLOCK;
    this.indexerUrl = config.indexerUrl;
    const verifierAddress = config.verifierAddress ?? VERIFIER_CONTRACT_ADDRESS;
    this.reader = new NebulaAvalancheReader(this.rpcUrl, this.contractAddress, verifierAddress);
    this.writer = new NebulaAvalancheWriter(this.rpcUrl, this.contractAddress);
  }

  /**
   * Perform a deposit into the privacy pool.
   *
   * 1. Generates a random note (secret + nullifier)
   * 2. Computes the Poseidon commitment
   * 3. Sends the deposit transaction
   * 4. Waits for confirmation to get the leafIndex
   * 5. Returns the encoded note string
   */
  async deposit(walletClient: WalletClient): Promise<DepositResult> {
    const { denomination, protocolFee, nextIndex } = await this.reader.getPoolInfo();
    const value = denomination + protocolFee;

    const { noteData, commitment } = await createNote();

    const txHash = await this.writer.deposit(walletClient, commitment, value);

    const client = this.reader.getClient();
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });

    let leafIndex = nextIndex;
    for (const log of receipt.logs) {
      // keccak256("Deposit(bytes32,uint32)") — topic0 emitido pelo NebulaPrivatePool
      if (log.topics[0] === '0x84fc9eb8cd0a782a1d1734fbeed616bd0ef775f8b9bd437636b62d634fe4baf3') {
        if (log.data && log.data.length >= 66) {
          leafIndex = parseInt(log.data.slice(2, 66), 16);
        }
      }
    }

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
   */
  async withdraw(
    note: string,
    recipient: Address,
    walletClient: WalletClient,
    options?: WithdrawOptions,
  ): Promise<WithdrawResult> {
    const noteData = decodeNote(note);

    // Fetch all deposits from indexer (no targetCount limit when using indexer)
    const allDeposits = await fetchDeposits(
      this.rpcUrl,
      this.contractAddress,
      Number.MAX_SAFE_INTEGER,
      {
        startBlock: this.startBlock,
        onProgress: options?.onFetchProgress,
        signal: options?.signal,
        indexerUrl: this.indexerUrl,
      },
    );

    // Auto-correct leafIndex: find the actual index of this note's commitment.
    // Notes generated before the topic fix may have leafIndex=0 incorrectly.
    const poseidon = await getPoseidon();
    const commitmentBigInt = poseidon([noteData.secret, noteData.nullifier]);
    const commitmentHex = fieldToBytes32(poseidon, commitmentBigInt).toLowerCase();

    const match = allDeposits.find(
      (d) => d.commitment.toLowerCase() === commitmentHex,
    );
    console.log('[nebula-avalanche] withdraw debug:', {
      noteLeafIndex: noteData.leafIndex,
      commitmentHex,
      allDepositsCount: allDeposits.length,
      matchFound: !!match,
      matchLeafIndex: match?.leafIndex,
    });
    if (match && match.leafIndex !== noteData.leafIndex) {
      noteData.leafIndex = match.leafIndex;
      note = encodeNote(noteData);
    }

    const deposits = allDeposits.filter((d) => d.leafIndex <= noteData.leafIndex);
    const commitments = deposits.map((d) => d.commitment);

    const proofInputs = await computeProofInputs(commitments, note);

    const { proof } = await generateProof(proofInputs);

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

  /** Verify a proof on-chain using the Verifier contract */
  async verifyProof(proof: `0x${string}`, publicInputs: `0x${string}`[]): Promise<boolean> {
    return this.reader.verifyProof(proof, publicInputs);
  }

  /** Get the underlying reader for advanced queries */
  getReader(): NebulaAvalancheReader {
    return this.reader;
  }

  /** Get the underlying writer for advanced transactions */
  getWriter(): NebulaAvalancheWriter {
    return this.writer;
  }
}
