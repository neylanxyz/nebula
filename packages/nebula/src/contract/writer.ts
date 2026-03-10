import {
  type Address,
  type Hash,
  type WalletClient,
  type PublicClient,
  createPublicClient,
  http,
} from 'viem';
import { simulateContract, writeContract } from 'viem/actions';
import { NEBULA_POOL_ABI } from '../abi.js';
import { ContractError } from '../errors.js';

/**
 * Stateless writer for the privacy pool contract.
 * Receives a WalletClient per method call — no stored wallet state.
 */
export class NebulaWriter {
  private publicClient: PublicClient;
  private address: Address;

  constructor(rpcUrl: string, contractAddress: Address) {
    this.publicClient = createPublicClient({ transport: http(rpcUrl) });
    this.address = contractAddress;
  }

  /**
   * Submit a deposit transaction.
   * @returns Transaction hash
   */
  async deposit(
    walletClient: WalletClient,
    commitment: `0x${string}`,
    value: bigint,
  ): Promise<Hash> {
    const account = walletClient.account;
    if (!account) throw new ContractError('WalletClient has no account');

    try {
      const { request } = await simulateContract(this.publicClient, {
        address: this.address,
        abi: NEBULA_POOL_ABI,
        functionName: 'deposit',
        args: [commitment],
        value,
        account: account.address,
      });

      return await writeContract(walletClient, request);
    } catch (error) {
      throw new ContractError(
        `Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Submit a withdraw transaction.
   * @returns Transaction hash
   */
  async withdraw(
    walletClient: WalletClient,
    proof: `0x${string}`,
    root: `0x${string}`,
    nullifierHash: `0x${string}`,
    recipient: Address,
  ): Promise<Hash> {
    const account = walletClient.account;
    if (!account) throw new ContractError('WalletClient has no account');

    try {
      const { request } = await simulateContract(this.publicClient, {
        address: this.address,
        abi: NEBULA_POOL_ABI,
        functionName: 'withdraw',
        args: [proof, root, nullifierHash, recipient],
        account: account.address,
      });

      return await writeContract(walletClient, request);
    } catch (error) {
      throw new ContractError(
        `Withdraw failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
