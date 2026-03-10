import { createPublicClient, http, type Address, type PublicClient } from 'viem';
import { NEBULA_POOL_ABI, VERIFIER_ABI } from '../abi.js';
import { VERIFIER_CONTRACT_ADDRESS } from '../constants.js';
import type { PoolInfo } from '@neylanxyz/nebula';
import { ContractError } from '@neylanxyz/nebula';

/** Read-only interface to the privacy pool and verifier contracts on Avalanche Fuji */
export class NebulaAvalancheReader {
  private client: PublicClient;
  private address: Address;
  private verifierAddress: Address;

  constructor(
    rpcUrl: string,
    contractAddress: Address,
    verifierAddress: Address = VERIFIER_CONTRACT_ADDRESS,
  ) {
    this.client = createPublicClient({ transport: http(rpcUrl) });
    this.address = contractAddress;
    this.verifierAddress = verifierAddress;
  }

  /** Get the public client instance (for advanced usage) */
  getClient(): PublicClient {
    return this.client;
  }

  /** Read full pool info in a single multicall */
  async getPoolInfo(): Promise<PoolInfo> {
    try {
      const [denomination, currentRoot, nextIndex, protocolFee, maxLeaves, paused] =
        await Promise.all([
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'DENOMINATION',
          }),
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'currentRoot',
          }),
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'nextIndex',
          }),
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'PROTOCOL_FEE',
          }),
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'MAX_LEAVES',
          }),
          this.client.readContract({
            address: this.address,
            abi: NEBULA_POOL_ABI,
            functionName: 'paused',
          }),
        ]);

      return {
        denomination: denomination as bigint,
        currentRoot: currentRoot as `0x${string}`,
        nextIndex: Number(nextIndex),
        protocolFee: protocolFee as bigint,
        maxLeaves: Number(maxLeaves),
        paused: paused as boolean,
      };
    } catch (error) {
      throw new ContractError(
        `Failed to read pool info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /** Check if a nullifier hash has been spent */
  async isSpent(nullifierHash: `0x${string}`): Promise<boolean> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'isSpent',
      args: [nullifierHash],
    });
    return result as boolean;
  }

  /** Check if an address is blacklisted */
  async isBlacklisted(address: Address): Promise<boolean> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'isBlacklisted',
      args: [address],
    });
    return result as boolean;
  }

  /** Get the current Merkle root */
  async getCurrentRoot(): Promise<`0x${string}`> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'currentRoot',
    });
    return result as `0x${string}`;
  }

  /** Get the next available leaf index */
  async getNextIndex(): Promise<number> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'nextIndex',
    });
    return Number(result);
  }

  /** Check if a root is known by the contract */
  async isKnownRoot(root: `0x${string}`): Promise<boolean> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'knownRoots',
      args: [root],
    });
    return result as boolean;
  }

  /** Get the denomination amount */
  async getDenomination(): Promise<bigint> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'DENOMINATION',
    });
    return result as bigint;
  }

  /** Get the protocol fee */
  async getProtocolFee(): Promise<bigint> {
    const result = await this.client.readContract({
      address: this.address,
      abi: NEBULA_POOL_ABI,
      functionName: 'PROTOCOL_FEE',
    });
    return result as bigint;
  }

  /** Verify a proof on-chain using the Verifier contract */
  async verifyProof(proof: `0x${string}`, publicInputs: `0x${string}`[]): Promise<boolean> {
    const result = await this.client.readContract({
      address: this.verifierAddress,
      abi: VERIFIER_ABI,
      functionName: 'verify',
      args: [proof, publicInputs],
    });
    return result as boolean;
  }
}
